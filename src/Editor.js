import * as CONSTANTS from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from './config/Advice.js';
import { Clipboard } from './config/Clipboard.js';
import { Config } from './config/Config.js';
import { History } from './config/History.js';
import { Language } from './config/Language.js';
import { Layout } from './config/Layout.js';
import { Signals } from './config/Signals.js';

import { EditorToolbar } from './toolbars/EditorToolbar.js';
import { InfoBox } from './gui/InfoBox.js';

import { View2D } from './viewports/View2D.js';
import { View3D } from './viewports/View3D.js';
import { ViewUI } from './viewports/ViewUI.js';
import { Worlds } from './viewports/Worlds.js';

import { loadDemoProject } from './Demo.js';

class Editor extends SUEY.Div {

    constructor() {
        super();
        this.setClass('salt-editor', 'suey-unselectable', 'salt-disable-animations');
        document.body.appendChild(this.dom);
    }

    init() {
        const self = this;

        /********** ACTIVE PROJECT */

        this.project = new SALT.Project();                      // SALT.Project that has the Editor's attention

        /********** MODULES */

        this.clipboard = new Clipboard();                       // Copy / Paste Clipboard
        this.history = new History();                           // Undo / Redo History
        // this.storage = new Storage();                        // TODO: Storage / Autosave

        /********** PROPERTIES */

        // Elements
        this.docker = null;                                     // Docker
        this.infoBox = null;                                    // Popup Information
        this.toolbar = null;                                    // Toolbar

        // Viewports
        this.viewports = [];                                    // Viewports

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

        /********** ELEMENTS */

        // Gui
        this.add(this.toolbar = new EditorToolbar(this));
        this.add(this.infoBox = new InfoBox());

        // Viewports
        this.viewports.push(new View2D());
        this.viewports.push(new View3D());
        this.viewports.push(new ViewUI());
        this.viewports.push(new Worlds());
        this.add(...this.viewports);

        // Docks
        this.add(this.docker = new SUEY.Docker());

        /********** EVENTS */

        function onKeyDown(event) { editorKeyDown(self, event); }
        function onKeyUp(event) { editorKeyUp(self, event); }
        function onVisibilityChange(event) {
            if (document.visibilityState === 'hidden' /* or 'visible' */) {
                Layout.save(self.docker, self.viewport());
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('visibilitychange', onVisibilityChange);

        this.on('destroy', () => {
            document.removeEventListener('keydown');
            document.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        });

        /********** SIGNALS */

        // Project Loaded
        Signals.connect(this, 'projectLoaded', function() {
            //
            // TODO: Editor World / Stage
            //
            // editor.world = editor.project.activeWorld();
            // editor.stage = editor.world.activeStage();

            if (self.history) self.history.clear();     // clear history
            Signals.dispatch('inspectorClear');         // clear inspector
            Signals.dispatch('sceneGraphChanged');      // rebuild outliner
            self.viewport()?.cameraReset();             // reset camera
        });

        // Settings Refreshed
        Signals.connect(this, 'settingsRefreshed', function() {
            Signals.dispatch('gridChanged');
            Signals.dispatch('mouseModeChanged', Config.getKey('viewport/mouse/mode'));
            Signals.dispatch('transformModeChanged', Config.getKey('viewport/controls/mode'));
            Signals.dispatch('inspectorRefresh');
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

        this.setMode(Config.getKey('editor/mode'));                             // set editor mode
        this.refreshSettings();                                                 // also selects none
        setTimeout(() => self.removeClass('salt-disable-animations'), 1000);    // allow button animations

        /********** DEMO */

        setTimeout(() => {
            // self.selectEntities(/* none */);
            // loadDemoProject(self.project);
            // self.view2d.world = self.project.activeWorld();
            // self.view2d.stage = self.view2d.world.activeStage();
            Signals.dispatch('projectLoaded');
        }, 100);

    } // end ctor

    /******************** MODE ********************/

    setMode(mode) {
        // Save Floater Layout
        const currentViewport = this.viewport();
        if (currentViewport) Layout.save(this.docker, currentViewport);

        // Remove Mode Toolbar
        this.toolbar.middle.detachChildren();

        // Hide Viewports
        let newViewport = undefined;
        for (const viewport of this.viewports) {
            if (!newViewport && viewport.viewportMode() === mode) {
                newViewport = viewport;
                this.toolbar.middle.add(...viewport.toolbar.buttons);
                viewport.display();
                viewport.activate();
            } else {
                viewport.hide();
                viewport.deactivate();
            }
        }
        Config.setKey('editor/mode', mode);

        // Load Floaters
        Layout.load(this.docker, newViewport);

        // Dispatch Signals
        Signals.dispatch('editorModeChanged', mode);
    }

    mode() {
        return Config.getKey('editor/mode');
    }

    viewport() {
        const currentMode = this.mode();
        for (const viewport of this.viewports) {
            if (viewport.viewportMode() === currentMode && viewport.isDisplayed()) return viewport;
        }
    }

    /******************** CLIPBOARD / EDIT ********************/

    copy(selection) {
        selection = selection ?? this.selected;
        this.clipboard.copy(selection);
        Signals.dispatch('clipboardChanged');
    }

    /**
     * Following functions are meant to run through Undo/Redo History Commands
     */
    cut() {
        this.copy();
        this.viewport()?.cut();
    }

    paste() {
        this.viewport()?.paste();
    }

    duplicate(key) {
        this.viewport()?.duplicate(key);
    }

    delete() {
        this.viewport()?.delete();
    }

    selectAll() {
        this.viewport()?.selectAll();
    }

    selectNone() {
        this.viewport()?.selectNone();
    }

    /******************** UNDO HISTORY ********************/

    execute(cmd) {
        this.history?.execute(cmd);
    }

    undo() {
        this.history?.undo();
    }

    redo() {
        this.history?.redo();
    }

    /******************** SELECTION ********************/

    /**
     * This function is *** NOT *** meant to run through Undo/Redo History Commands
     * Emits 'selectionChanged' signal upon new selection
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
                Signals.dispatch('inspectorBuild', this.selected);
                return;
            }
        }

        // Update selection array
        this.selected = [ ...filtered ];

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
        const schemeColor = Config.getKey('scheme/color');
        const schemeTint = Config.getKey('scheme/tint');
        const schemeSaturation = Config.getKey('scheme/saturation');
        this.setSchemeColor(schemeColor, schemeTint, schemeSaturation);

        // Transparency
        const panelAlpha = Math.max(Math.min(parseFloat(Config.getKey('scheme/transparency')), 1.0), 0.0);
        SUEY.Css.setVariable('--panel-transparency', panelAlpha);

        // Dispatch Refreshed Signal
        Signals.dispatch('settingsRefreshed');
    }

    fontSizeChange(fontSize) {
        if (fontSize === 'up' || fontSize === 'increase') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            fontSize = Math.min(CONSTANTS.FONT_SIZE_MAX, SUEY.Css.fontSize() + addSize);
        } else if (fontSize === 'down' || fontSize === 'decrease') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            addSize = Math.floor((SUEY.Css.fontSize() - addSize + 10.0) / 10.0);
            fontSize = Math.max(CONSTANTS.FONT_SIZE_MIN, SUEY.Css.fontSize() - addSize);
        } else {
            fontSize = parseInt(fontSize);
        }
        fontSize = SALT.Maths.clamp(fontSize, CONSTANTS.FONT_SIZE_MIN, CONSTANTS.FONT_SIZE_MAX);
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
            Config.setKey('scheme/color', color);
            Config.setKey('scheme/tint', tint);
            Config.setKey('scheme/saturation', saturation);
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

    /** Display temporary, centered tooltip */
    showInfo(info) {
        if (this.infoBox) this.infoBox.popupInfo(info);
        return this;
    }

    /******************** KEYBOARD ********************/

    checkKeyState(/* any number of comma separated CONSTANTS.KEYS */) {
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
        this.setKeyState(CONSTANTS.KEYS.ALT, event.altKey);
        this.setKeyState(CONSTANTS.KEYS.CONTROL, event.ctrlKey);
        this.setKeyState(CONSTANTS.KEYS.META, event.metaKey);
        this.setKeyState(CONSTANTS.KEYS.SHIFT, event.shiftKey);
    }

    setKeyState(key, keyDown) {
        this.keyStates[key] = keyDown;
        this.modifierKey =
            this.keyStates[CONSTANTS.KEYS.ALT] ||
            this.keyStates[CONSTANTS.KEYS.CONTROL] ||
            this.keyStates[CONSTANTS.KEYS.META] ||
            this.keyStates[CONSTANTS.KEYS.SHIFT] ||
            this.keyStates[CONSTANTS.KEYS.SPACE];
    }

    /******************** FLOATERS ********************/

    /** Returns Floater if present in Editor. Options to build if not present and ensure active.  */
    getFloaterByID(tabID, build = true, select = true) {
        let floater = this.docker.getFloaterByID(tabID);
        if (!floater && build) {
            floater = Layout.createFloater(tabID);
            if (floater) Layout.installFloater(this.docker, floater);
        }
        if (select && floater && floater.dock) floater.dock.selectTab(floater.id);
        return floater;
    }

    /** If Floater is present in Editor, ensures parent Dock Tab is active */
    selectFloater(tabID = '') {
        if (tabID && tabID.isElement) tabID = tabID.id;
        const floater = this.docker.getFloaterByID(tabID);
        if (floater && floater.dock) floater.dock.selectTab(floater.id);
    }

}

// Export as Singleton
const editor = new Editor();
export default editor;

/******************** INTERNAL ********************/

function editorKeyDown(editor, event) {
    // Ignore Key Events While Playing
    const player = editor.getFloaterByID('player', false /* build? */);
    if (player && player.isPlaying) return;

    // Modifier Keys
    editor.updateModifiers(event);
    switch (event.key) {
        case ' ': /* Space */
            editor.setKeyState(CONSTANTS.KEYS.SPACE, true);
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
                if (editor.checkKeyState(CONSTANTS.KEYS.SHIFT)) {
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
            Config.setKey('viewport/grid/snap', (!Config.getKey('viewport/grid/snap')));
            Signals.dispatch('gridChanged');
            break;

        // Camera Focus on Object
        case Config.getKey('shortcuts/focus'):
            editor.viewport()?.cameraFocus();
            break;

        // Reset camera
        case 'r':
            editor.viewport()?.cameraReset();
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
            // Clear Config
            Config.clear();

            // Refresh GUI
            editor.refreshSettings();

            // Default Docks
            setTimeout(() => Layout.default(editor.docker, editor.viewport()), 0);
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
            editor.setKeyState(CONSTANTS.KEYS.SPACE, false);
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
