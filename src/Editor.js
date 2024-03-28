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

import { editorKeyDown, editorKeyUp } from './EditorEvents.js';
import { EditorToolbar } from './EditorToolbar.js';
import { InfoBox } from './gui/InfoBox.js';

import { Advisor } from './panels/Advisor.js';
import { Coder } from './panels/Coder.js';
import { Inspector } from './panels/Inspector.js';
import { Library } from './panels/Library.js';
import { Outliner } from './panels/Outliner.js';
import { Player } from './panels/Player.js';
import { Resources } from './panels/Resources.js';
import { Shaper } from './panels/Shaper.js';
import { Things } from './panels/Things.js';

import { View2D } from './view2d/View2D.js';
import { View3D } from './view3d/View3D.js';
import { ViewUI } from './viewui/ViewUI.js';
import { Worlds } from './worlds/Worlds.js';

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

        // Mode Panels
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

        /********** PANELS */

        // Mode Panels
        this.add(this.view2d = new View2D());
        this.add(this.view3d = new View3D());
        this.add(this.viewui = new ViewUI());
        this.add(this.worlds = new Worlds());

        /***** DOCKING PANELS */

        //
        // TODO: Add Panels
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
        // TODO: Hide Docks (Floater / Docker / Tabbed / Window)
        //

        // Hide Editor Panels
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
        Signals.dispatch('windowResize'); // refresh panel sizes
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

    /** DOES run through Undo/Redo History */
    selectAll() {
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.selectAll === 'function') view.selectAll();
    }

    /** DOES run through Undo/Redo History */
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
     * DOES NOT run through Undo/Redo History
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
        const player = this.getPanelByID('player', false /* build? */);
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

    /******************** PANELS ********************/

    getPanelByID(tabID, build = false) {
        let panel = super.getPanelByID(tabID);
        if (!panel && build) {
            //
            // TODO: Build missing panel, then add & select
            //

            this.add(new Coder());
            this.add(new Player());
            this.add(new Shaper());
            // new Advisor();
            // new Inspector();
            // new Library();       // new SUEY.Floater('scripts', this.scripts, { icon: `${EDITOR.FOLDER_TYPES}script.svg`, color: '#090B11' });
            // new Outliner();      // new SUEY.Floater('outliner', this.outliner, { icon: `${EDITOR.FOLDER_TYPES}outliner.svg` });
            // new Resources();     // new SUEY.Floater('assets', this.assets, { icon: `${EDITOR.FOLDER_TYPES}asset.svg` });
            // new Things();        // new SUEY.Floater('prefabs', this.prefabs, { icon: `${EDITOR.FOLDER_TYPES}prefab.svg` });
            // this.addTab(...);

        }
        return panel;
    }

    /** If tab (floater panel) is present in Editor, ensures tab is active */
    selectPanel(tabID = '') {
        if (tabID && tabID.isElement) tabID = tabID.id;
        const panel = this.getPanelByID(tabID);
        if (panel && panel.dock) panel.dock.selectTab(tabID);
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
export * from './EditorConstants.js';

// Export as Singleton
const editor = new Editor();
export { editor };
