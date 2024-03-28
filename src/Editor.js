import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from './config/Advice.js';
import { Clipboard } from './config/Clipboard.js';
import { Config } from './config/Config.js';
import { History } from './config/History.js';
import { Language } from './config/Language.js';
import { Loader } from './config/Loader.js';
import { Signals } from './config/Signals.js';

import { EditorToolbar } from './toolbars/EditorToolbar.js';
import { InfoBox } from './gui/InfoBox.js';

import { Advisor } from './floaters/Advisor.js';
import { Coder } from './floaters/Coder.js';
import { Inspector } from './floaters/Inspector.js';
import { Library } from './floaters/Library.js';
import { Outliner } from './floaters/Outliner.js';
import { Player } from './floaters/Player.js';
import { Resources } from './floaters/Resources.js';
import { Shaper } from './floaters/Shaper.js';
import { Things } from './floaters/Things.js';

import { View2D } from './viewports/View2D.js';
import { View3D } from './viewports/View3D.js';
import { ViewUI } from './viewports/ViewUI.js';
import { Worlds } from './viewports/Worlds.js';

import { loadDemoProject } from './Demo.js';

class Editor extends SUEY.Div {

    constructor() {
        super();
        const self = this;
        this.addClass('salt-editor').selectable(false);
        this.addClass('salt-disable-animations');
        document.body.appendChild(this.dom);

        /********** GLOBAL */

        // Adds 'editor' to global before children are loaded
        window.editor = this;

        /********** ACTIVE PROJECT */

        this.project = new SALT.Project();                      // SALT.Project that has the Editor's attention

        /********** MODULES */

        this.clipboard = new Clipboard();                       // Copy / Paste Clipboard
        this.history = new History();                           // Undo / Redo History
        this.loader = new Loader();                             // File Loader
        // this.storage = new Storage();                        // TODO: Storage / Autosave

        /********** PROPERTIES */

        // Elements
        this.toolbar = null;                                    // Toolbar
        this.docker = null;                                     // Docker
        this.infoBox = null;                                    // Popup Information

        // Viewports
        this.view2d = null;                                     // Scene Editor 2D
        this.view3d = null;                                     // Scene Editor 3D
        this.viewui = null;                                     // UI Editor
        this.worlds = null;                                     // World Graph

        // Input
        this.keyStates = {                                      // Track modifier keys
            'alt': false,
            'control': false,
            'meta': false,
            'shift': false,
            'space': false,
        };
        this.modifierKey = false;                               // True when currently a modifier key pressed

        // Misc
        this.dragInfo = undefined;                              // Stores data for 'dragenter' events
        this.selected = [];                                     // Current Selection
        this.wantsScreenshot = false;                           // Creates Screenshot (without helpers in shot)

        /********** EVENTS */

        document.addEventListener('keydown', (event) => editorKeyDown(self, event));
        document.addEventListener('keyup', (event) => editorKeyUp(self, event));

        /********** ELEMENTS */

        this.add(this.toolbar = new EditorToolbar());
        this.add(this.docker = new SUEY.Docker());
        this.add(this.infoBox = new InfoBox());

        this.add(this.view2d = new View2D());
        this.add(this.view3d = new View3D());
        this.add(this.viewui = new ViewUI());
        this.add(this.worlds = new Worlds());

        // TODO: Add Docks / Floaters
        //
        const dockLeft = this.docker.addDock(SUEY.DOCK_SIDES.LEFT, '20%');
        const tabby1 = dockLeft.enableTabs();
        tabby1.addTab(new Advisor());
        tabby1.selectFirst();

        /********** SIGNALS */

        // // TODO: Tab Priority
        // this.on('tab-changed', (event) => {
        //     const tabName = event.value;
        //     if (tabName) self.setTabPriority(tabName);
        // });

        // Project Loaded
        Signals.connect(this, 'projectLoaded', function() {
            if (self.history) self.history.clear();     // clear history
            Signals.dispatch('inspectorBuild');         // clear inspector
            Signals.dispatch('sceneGraphChanged');      // rebuild outliner
            Signals.dispatch('cameraReset');            // reset camera
        });

        // Settings Refreshed
        Signals.connect(this, 'settingsRefreshed', function() {
            Signals.dispatch('gridChanged');
            Signals.dispatch('mouseModeChanged', Config.getKey('scene/viewport/mode'));
            Signals.dispatch('transformModeChanged', Config.getKey('scene/controls/mode'));
            Signals.dispatch('inspectorBuild', 'rebuild');
        });

        // Entity Changed
        Signals.connect(this, 'entityChanged', function(entity) {
            if (!entity || !entity.isEntity) return;
            const activeStageUUID = self.viewport.world.activeStage().uuid;
            const stage = entity.parentStage();
            const world = entity.parentWorld();
            if (stage && world && (stage.uuid === activeStageUUID || world.uuid === activeStageUUID)) {
                if (entity.isLight || entity.isStage || entity.isWorld) self.viewport.updateSky();
                if (entity.isCamera || entity.isLight) self.viewport.rebuildHelpers();
                self.viewport.rebuildColliders();
            }
        });

        /********** INIT */

        this.setMode(Config.getKey('settings/editorMode'));                     // set editor mode
        this.refreshSettings();                                                 // also selects none
        setTimeout(() => self.removeClass('salt-disable-animations'), 1000);    // allow button animations

        /********** DEMO */

        setTimeout(() => {
            // loadDemoProject(self.project);
            // self.view2d.world = self.project.activeWorld();
            // self.view2d.stage = self.view2d.world.activeStage();
            Signals.dispatch('projectLoaded');
        }, 100);

    } // end ctor

    // // TODO: Save Dock Sizes
    // changeWidth(width) {
    //     width = super.changeWidth(width);
    //     if (width != null) Config.setKey(`resizeX/${this.name}`, (width / SUEY.Css.guiScale()).toFixed(3));
    // }
    // changeHeight(height) {
    //     height = super.changeHeight(height);
    //     if (height != null) Config.setKey(`resizeY/${this.name}`, (height / SUEY.Css.guiScale()).toFixed(3));
    // }

    /******************** MODE ********************/

    setMode(mode) {
        //
        // TODO: Hide Docks (Floaters / Docker / Tabbed / Window)
        //

        // Hide Viewports
        this.view2d.hide();
        this.view3d.hide();
        this.viewui.hide();
        this.worlds.hide();

        // Switch Mode
        switch (mode) {
            case EDITOR.MODES.UI_EDITOR:
                this.viewui.display();
                break;
            case EDITOR.MODES.SCENE_EDITOR_2D:
                this.view2d.display();
                break;
            case EDITOR.MODES.SCENE_EDITOR_3D:
                this.view3d.display()
                break;
            case EDITOR.MODES.SOUND_EDITOR:
                break;
            case EDITOR.MODES.WORLD_GRAPH:
            default:
                this.worlds.display();
                this.worlds.zoomTo();
                mode = EDITOR.MODES.WORLD_GRAPH;
        }
        Config.setKey('settings/editorMode', mode);

        //
        // TODO: Rebuild Inspector if on 'settings'
        //

        // Dispatch Signals
        Signals.dispatch('windowResize'); // refresh sizes
        Signals.dispatch('editorModeChanged', mode);
    }

    mode() {
        return Config.getKey('settings/editorMode');
    }

    modeElement() {
        switch (this.mode()) {
            case EDITOR.MODES.UI_EDITOR:        return undefined;
            case EDITOR.MODES.SCENE_EDITOR_2D:  return this.view2d;
            case EDITOR.MODES.SCENE_EDITOR_3D:  return this.view3d;
            case EDITOR.MODES.SOUND_EDITOR:     return undefined;
            case EDITOR.MODES.WORLD_GRAPH:      return this.worlds;
        }
    }

    /******************** CLIPBOARD / EDIT ********************/

    copy(selection) {
        selection = selection ?? this.selected;
        this.clipboard.copy(selection);
        Signals.dispatch('clipboardChanged');
    }

    cut() {
        this.copy();
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.cut === 'function') view.cut();
    }

    paste() {
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.paste === 'function') view.paste();
    }

    duplicate(key) {
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.duplicate === 'function') view.duplicate(key);
    }

    delete() {
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.delete === 'function') view.delete();
    }

    /** NOTE: Runs through Undo/Redo History */
    selectAll() {
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.selectAll === 'function') view.selectAll();
    }

    /** NOTE: Runs through Undo/Redo History */
    selectNone() {
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.selectNone === 'function') view.selectNone();
    }

    /******************** UNDO HISTORY ********************/

    execute(cmd) {
        if (this.history) this.history.execute(cmd);
    }

    undo() {
        if (this.history) this.history.undo();
    }

    redo() {
        if (this.history) this.history.redo();
    }

    /******************** SELECTION ********************/

    /**
     * NOTE: Does NOT run through Undo/Redo History
     * Emits 'selectionChanged' signal upon new seleciton
     */
    selectEntities(/* entity, entity array, or any number of entites to select */) {
        const entities = Array.isArray(arguments[0]) ? arguments[0] : [ ...arguments ];

        // Verify items are valid for selection
        const filtered = [];
        for (const entity of entities) {
            if (!entity || !entity.isEntity) continue;
            filtered.push(entity);
        }

        // New selection same as current selection? Refresh Inspector (but don't refresh view transformGroup)
        if (SALT.EntityUtils.compareArrayOfEntities(this.selected, filtered)) {
            if (this.selected.length > 0) {
                Signals.dispatch('inspectorBuild', this.selected[0]);
                return;
            }
        }

        // Update selection array
        this.selected = [ ...filtered ];

        console.log('Editor.selectEntities', this.selected.length);

        // Selection change signal
        Signals.dispatch('selectionChanged');
    }

    /******************** GUI ********************/

    /** Settings were changed, refresh app (color, font size, etc.), dispatch signals */
    refreshSettings() {
        // Font Size Update
        this.fontSizeChange(Config.getKey('scheme/fontSize'));

        // Color Scheme
        this.setSchemeBackground(Config.getKey('scheme/background'));
        const schemeColor = Config.getKey('scheme/iconColor');
        const schemeTint = Config.getKey('scheme/backgroundTint');
        const schemeSaturation = Config.getKey('scheme/backgroundSaturation');
        this.setSchemeColor(schemeColor, schemeTint, schemeSaturation);

        // Transparency
        const panelAlpha = Math.max(Math.min(parseFloat(Config.getKey('scheme/panelTransparency')), 1.0), 0.0);
        SUEY.Css.setVariable('--panel-transparency', panelAlpha);

        // Refresh Docks
        this.resetDockSizes();

        // Dispatch Refreshed Signal
        Signals.dispatch('settingsRefreshed');
    }

    resetDockSizes() {
        //
        // TODO
        //
        // self.changeWidth(parseFloat(Config.getKey(`resizeX/${self.name}`)) * SUEY.Css.guiScale());
        // self.changeHeight(parseFloat(Config.getKey(`resizeY/${self.name}`)) * SUEY.Css.guiScale());
    }

    fontSizeChange(fontSize) {
        if (fontSize === 'up' || fontSize === 'increase') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            fontSize = Math.min(EDITOR.FONT_SIZE_MAX, SUEY.Css.fontSize() + addSize);
        } else if (fontSize === 'down' || fontSize === 'decrease') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            addSize = Math.floor((SUEY.Css.fontSize() - addSize + 10.0) / 10.0);
            fontSize = Math.max(EDITOR.FONT_SIZE_MIN, SUEY.Css.fontSize() - addSize);
        } else {
            fontSize = parseInt(fontSize);
        }
        fontSize = SALT.Maths.clamp(fontSize, EDITOR.FONT_SIZE_MIN, EDITOR.FONT_SIZE_MAX);
        Config.setKey('scheme/fontSize', SUEY.Css.toPx(fontSize));
        SUEY.Css.setVariable('--font-size', SUEY.Css.toPx(fontSize));
        Signals.dispatch('fontSizeChanged');
    }

    cycleSchemeBackground() {
        let background = parseInt(Config.getKey('scheme/background'), 10);
        if (background == SUEY.BACKGROUNDS.DARK) background = SUEY.BACKGROUNDS.MID;
        else if (background == SUEY.BACKGROUNDS.MID) background = SUEY.BACKGROUNDS.LIGHT;
        else background = SUEY.BACKGROUNDS.DARK;
        this.setSchemeBackground(background);
    }

    setSchemeBackground(background = SUEY.BACKGROUNDS.DARK, updateSettings = true) {
        if (updateSettings) {
            Config.setKey('scheme/background', background);
        }
        SUEY.ColorScheme.changeBackground(background);
        Signals.dispatch('schemeChanged');
    }

    setSchemeColor(color = SUEY.THEMES.CLASSIC, tint = 0.0, saturation = 0.0, updateSettings = true) {
        if (updateSettings) {
            Config.setKey('scheme/iconColor', color);
            Config.setKey('scheme/backgroundTint', tint);
            Config.setKey('scheme/backgroundSaturation', saturation);
        }
        SUEY.ColorScheme.changeColor(color, tint, saturation);
        Signals.dispatch('schemeChanged');
    }

    /******************** INTERACTIVE ********************/

    requestScreenshot() {
        const player = this.getFloaterByID('player', false /* build? */);
        if (player && (player.isPlaying && !player.isPaused)) {
            player.requestScreenshot();
        } else {
            this.wantsScreenshot = true;
        }
    }

    /******************** KEYBOARD ********************/

    checkKeyState(/* any number of comma separated EDITOR.KEYS */) {
        let keyDown = false;
        for (const key of arguments) {
            keyDown = keyDown || this.keyStates[key];
        }
        return keyDown;
    }

    isOnlyModifierKey(key) {
        let keyCount = 0;
        Object.keys(this.keyStates).forEach((modifier) => {
            if (this.keyStates[modifier]) keyCount++;
        });
        return (keyCount === 1 && this.keyStates[key]);
    }

    noModifiers() {
        return this.modifierKey === false;
    }

    updateModifiers(event) {
        if (!event) return;
        this.setKeyState(EDITOR.KEYS.ALT, event.altKey);
        this.setKeyState(EDITOR.KEYS.CONTROL, event.ctrlKey);
        this.setKeyState(EDITOR.KEYS.META, event.metaKey);
        this.setKeyState(EDITOR.KEYS.SHIFT, event.shiftKey);
    }

    setKeyState(key, keyDown) {
        this.keyStates[key] = keyDown;
        this.modifierKey =
            this.keyStates[EDITOR.KEYS.ALT] ||
            this.keyStates[EDITOR.KEYS.CONTROL] ||
            this.keyStates[EDITOR.KEYS.META] ||
            this.keyStates[EDITOR.KEYS.SHIFT] ||
            this.keyStates[EDITOR.KEYS.SPACE];
    }

    /******************** FLOATERS ********************/

    getFloaterByID(tabID, build = false) {
        let floater = super.getFloaterByID(tabID);
        if (!floater && build) {
            //
            // TODO: Build missing floater, then add & select
            //

            this.add(new Coder());
            this.add(new Player());
            this.add(new Shaper());
            // new Advisor();
            // new Inspector();
            // new Library();
            // new Outliner();      // new SUEY.Floater('outliner', this.outliner, { icon: `${EDITOR.FOLDER_TYPES}outliner.svg` });
            // new Resources();     // new SUEY.Floater('assets', this.assets, { icon: `${EDITOR.FOLDER_TYPES}asset.svg` });
            // new Things();        // new SUEY.Floater('prefabs', this.prefabs, { icon: `${EDITOR.FOLDER_TYPES}prefab.svg` });
            // this.addTab(...);

        }
        return floater;
    }

    /** If Floater is present in Editor, ensures parent Dock Tab is active */
    selectFloater(tabID = '') {
        if (tabID && tabID.isElement) tabID = tabID.id;
        const floater = this.getFloaterByID(tabID);
        if (floater && floater.dock) floater.dock.selectTab(tabID);
    }

    /** Display temporary, centered tooltip */
    showInfo(info) {
        if (this.infoBox) this.infoBox.popupInfo(info);
        return this;
    }

    // // TODO: Select Last Known Tab
    // selectLastKnownTab() {
    //     let tabArray = Config.getKey(`tabs/${this.name}`);
    //     if (!Array.isArray(tabArray)) tabArray = [];
    //     for (const tabName of tabArray) {
    //         if (this.selectTab(tabName) === true) return;
    //     }
    //     if (this.selectTab(this.defaultTab) === true) return;
    //     this.selectFirst();
    // }

    // TODO: Set Tab Prioriy
    // setTabPriority(tabName) {
    //     // Get existing tab array from settings
    //     let tabArray = Config.getKey(`tabs/${this.name}`);
    //     if (!Array.isArray(tabArray)) tabArray = [];
    //     // Remove existing tab location if found, then set at front
    //     const tabIndex = tabArray.indexOf(tabName);
    //     if (tabIndex !== -1) tabArray.splice(tabIndex, 1);
    //     tabArray.unshift(tabName);
    //     // Update settings
    //     Config.setKey(`tabs/${this.name}`, tabArray);
    // }

}

// Export Constants
export * from './constants.js';

// Export as Singleton
const editor = new Editor();
export { editor };

/******************** INTERNAL ********************/

function editorKeyDown(editor, event) {
    // Ignore Key Events While Playing
    const player = editor.getFloaterByID('player', false /* build? */);
    if (player && player.isPlaying) return;

    // Modifier Keys
    editor.updateModifiers(event);
    switch (event.key) {
        case ' ': /* Space */
            editor.setKeyState(EDITOR.KEYS.SPACE, true);
            break;
    }

    // Cut, Copy, Paste
    if (event.ctrlKey || event.metaKey) {
        if (event.key === 'c' || event.key === 'v' || event.key === 'x') {
            switch (event.key) {
                case 'c':
                    const text = window.getSelection().toString();
                    if (text && typeof text === 'string' && text !== '') { return /* default copy */; }
                    event.stopPropagation();
                    event.preventDefault();
                    editor.copy();
                    return;
                case 'v':
                    event.stopPropagation();
                    event.preventDefault();
                    editor.paste();
                    return;
                case 'x':
                    event.stopPropagation();
                    event.preventDefault();
                    editor.cut();
                    return;
            }
        }
    }

    // Keys
    switch (event.key) {
        case 'a':
        case 'w':
        case 's':
        case 'd':
            event.stopPropagation();
            event.preventDefault();

            // Select All
            if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
                editor.selectAll();
                break;
            }

            // Duplicate
            editor.duplicate(event.key);
            break;

        case 'Backspace':
        case 'Delete':
            event.stopPropagation();
            event.preventDefault();
            editor.delete();
            break;

        // Select None
        case 'Escape':
            event.stopPropagation();
            event.preventDefault();
            // Check for Clear Selection
            const text = window.getSelection().toString();
            if (text && typeof text === 'string' && text !== '') { return window.clearSelection(); }
            // Select None
            editor.selectNone();
            break;

        // Fullscreen
        case 'Enter':
            if (event.altKey || event.ctrlKey || event.metaKey) {
                event.stopPropagation();
                event.preventDefault();
                SALT.System.fullscreen();
            }
            break;

        // Undo / Redo
        case 'z':
            if (event.ctrlKey || event.metaKey) {
                if (editor.checkKeyState(EDITOR.KEYS.SHIFT)) {
                    event.stopPropagation();
                    event.preventDefault();
                    editor.redo();
                } else {
                    event.stopPropagation();
                    event.preventDefault();
                    editor.undo();
                }
            }
            break;

        // Snap to Grid
        case 'g':
            Config.setKey('scene/grid/snap', (!Config.getKey('scene/grid/snap')));
            Signals.dispatch('gridChanged');
            break;

        // Camera Focus on Object
        case Config.getKey('shortcuts/focus'):
            Signals.dispatch('cameraFocus');
            break;

        // Reset camera
        case 'r':
            Signals.dispatch('cameraReset');
            break;

        // Play Game
        case Config.getKey('shortcuts/play'):
            const player = editor.getFloaterByID('player', true /* build? */);
            player.start();
            break;

        // Increase / Decrease Font (Gui) Sizing
        case '-': editor.fontSizeChange('down'); break;
        case '=': editor.fontSizeChange('up'); break;

        // Reset all settings
        case Config.getKey('shortcuts/reset'): /* F9 */
            //
            // TODO: Persistent Tabs / Docks, Save Tabs
            //
            // Example:
            //      const tabs = {};
            //      tabs['inspector'] = inspector.selectedID;

            // Clear Config
            Config.clear();

            //
            // TODO: Persistent Tabs / Docks, Restore
            //
            // Example:
            //      Config.setKey(`tabs/Inspector`, [ tabs['inspector'] ]);

            // Refresh GUI
            editor.refreshSettings();
            break;
    }
}

function editorKeyUp(editor, event) {
    // Ignore Key Events While Playing
    const player = editor.getFloaterByID('player', false /* build? */);
    if (player && player.isPlaying) return;

    // Modifier Keys
    editor.updateModifiers(event);
    switch (event.key) {
        case ' ': /* Space */
            editor.setKeyState(EDITOR.KEYS.SPACE, false);
            break;
    }

    // Color Schemes
    switch (event.key) {
        case '~': editor.cycleSchemeBackground(); break;
        case '!': editor.setSchemeColor(SUEY.THEMES.CLASSIC,    0.00); break;
        case '@': editor.setSchemeColor(SUEY.THEMES.FLAMINGO,   0.10); break;
        case '#': editor.setSchemeColor(SUEY.THEMES.NAVY,       0.20); break;
        case '$': editor.setSchemeColor(SUEY.THEMES.GRAPE,      0.15); break;
        case '%': editor.setSchemeColor(SUEY.THEMES.RUST,       0.20); break;
        case '^': editor.setSchemeColor(SUEY.THEMES.CARROT,     0.20); break;
        case '&': editor.setSchemeColor(SUEY.THEMES.COFFEE,     0.20); break;
        case '*': editor.setSchemeColor(SUEY.THEMES.GOLDEN,     0.15); break;
        case '(': editor.setSchemeColor(SUEY.THEMES.EMERALD,    0.10); break;
        case ')': editor.setSchemeColor(SUEY.Iris.randomHex(),  0.10); break;
    }

}
