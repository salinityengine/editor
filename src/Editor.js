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
        const editor = this;

        /********** ACTIVE PROJECT */

        this.project = new SALT.Project();                      // SALT.Project loaded into editor

        /********** MODULES */

        this.clipboard = new Clipboard();                       // copy / paste clipboard
        this.history = new History();                           // undo / redo history
        // this.storage = new Storage();                        // TODO: storage / autosave

        /********** PROPERTIES */

        // Elements
        this.docker = null;                                     // primary docker
        this.infoBox = null;                                    // popup information
        this.toolbar = null;                                    // main toolbar

        // Viewports
        this.viewports = [];                                    // collection of viewports

        // Input
        this.keyStates = {                                      // track modifier keys
            'alt': false,
            'control': false,
            'meta': false,
            'shift': false,
            'space': false,
        };
        this.modifierKey = false;                               // true when any modifier key is pressed

        // Misc
        this.dragInfo = undefined;                              // stores data for 'dragenter' events
        this.selected = [];                                     // current selection
        this.wantsScreenshot = false;                           // creates screenshot

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

        function onKeyDown(event) { editorKeyDown(editor, event); }
        function onKeyUp(event) { editorKeyUp(editor, event); }
        function onDragOver(event) {
            event.preventDefault();                             // keeps files dragged from outside app opening in new tab
            event.dataTransfer.dropEffect = 'copy';             // default mouse cursor for files dragged from outside app
        }
        function onDrop(event) {
            event.preventDefault();                             // keeps files dragged from outside app opening in new tab
        }
        function onVisibilityChange(event) {
            if (document.visibilityState === 'hidden' /* or 'visible' */) {
                Layout.save(editor.docker, editor.viewport());
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('dragover', onDragOver);
        document.addEventListener('drop', onDrop);
        document.addEventListener('visibilitychange', onVisibilityChange);          // i.e. 'pagehide' / 'beforeunload'

        this.on('destroy', () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('dragover', onDragOver);
            document.removeEventListener('drop', onDrop);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        });

        /********** INIT */

        this.setMode(Config.getKey('editor/mode'));                                 // set editor mode
        this.refreshSettings();                                                     // also selects none
        setTimeout(() => editor.removeClass('salt-disable-animations'), 1000);      // allow button animations
        setTimeout(() => { editor.loadProject(null, true /* demo? */); }, 100);     // load demo project

    } // end ctor

    /******************** PROJECT ********************/

    loadProject(json, demo = false) {
        const editor = this;
        function newProjectLoaded() {
            //
            // TODO: Editor World / Stage
            //
            // editor.world = editor.project.activeWorld();
            // editor.stage = editor.world.activeStage();
            //
            if (editor.history) editor.history.clear();         // clear history
            editor.viewport()?.cameraReset();                   // reset camera
            Signals.dispatch('sceneGraphChanged');              // rebuild outliner
            Signals.dispatch('projectLoaded');                  // alert floaters
        }

        if (demo) {
            this.selectEntities(/* none */);
            // loadDemoProject(this.project);
            newProjectLoaded();
        } else if (json) {
            this.selectEntities(/* none */);
            this.project.fromJSON(json, true /* loadAssets? */, /* onLoad */ () => { newProjectLoaded(); });
        }
    }

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
            if (!newViewport && viewport.mode() === mode) {
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

        // Clear Inspector / Previewer
        Signals.dispatch('inspectorClear');
        Signals.dispatch('previewerClear');

        // Dispatch Signals
        Signals.dispatch('editorModeChanged', mode);
    }

    mode() {
        return Config.getKey('editor/mode');
    }

    viewport() {
        const currentMode = this.mode();
        for (const viewport of this.viewports) {
            if (viewport.mode() === currentMode && viewport.isDisplayed()) return viewport;
        }
    }

    /******************** CLIPBOARD / EDIT ********************/

    copy(selection) {
        selection = selection ?? this.selected;
        this.clipboard.copy(selection);
        Signals.dispatch('clipboardChanged');
    }

    /**
     * The following functions are meant to run through Undo/Redo History Commands
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
        // Update Font Size
        this.fontSizeChange(Config.getKey('scheme/fontSize'));

        // Update Color Scheme
        this.setSchemeBackground(Config.getKey('scheme/background'));
        const schemeColor = Config.getKey('scheme/color');
        const schemeTint = Config.getKey('scheme/tint');
        const schemeSaturation = Config.getKey('scheme/saturation');
        this.setSchemeColor(schemeColor, schemeTint, schemeSaturation);

        // Update Transparency
        const panelAlpha = Math.max(Math.min(parseFloat(Config.getKey('scheme/transparency')), 1.0), 0.0);
        SUEY.Css.setVariable('--panel-transparency', panelAlpha);

        // Dispatch Signals
        Signals.dispatch('gridChanged');
        Signals.dispatch('mouseModeChanged', Config.getKey('viewport/mouse/mode'));
        Signals.dispatch('transformModeChanged', Config.getKey('viewport/controls/mode'));
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

/******************** INTERNAL: KEYBOARD ********************/

function editorKeyDown(editor, event) {
    // Ignore Key Events While Playing
    const player = editor.getFloaterByID('player', false /* build? */);
    if (player && player.isPlaying) return;

    // Modifier Keys
    editor.updateModifiers(event);
    if (event.key === ' ' /* space */) editor.setKeyState(CONSTANTS.KEYS.SPACE, true);

    // Keys
    switch (event.key) {
        case 'c':
        case 'v':
        case 'x':
            if (event.ctrlKey || event.metaKey) {
                if (event.key === 'c') {
                    const text = window.getSelection().toString();
                    if (text && typeof text === 'string' && text !== '') return; /* default copy */
                }
                if (event.key === 'c') editor.copy();
                if (event.key === 'v') editor.paste();
                if (event.key === 'x') editor.cut();
            }
            break;

        case 'a':
        case 'w':
        case 's':
        case 'd':
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
            editor.delete();
            break;

        // Select None
        case 'Escape':
            // Clear Browser Selection
            const text = window.getSelection().toString();
            if (text && typeof text === 'string' && text !== '') {
                const selection = window.getSelection();
                if (typeof selection.empty === 'function') selection.empty();
                if (typeof selection.removeAllRanges === 'function') selection.removeAllRanges();
                return;
            }

            // Select None
            editor.selectNone();
            break;

        // Fullscreen
        case 'Enter':
            if (event.altKey || event.ctrlKey || event.metaKey) {
                SALT.System.fullscreen();
            }
            break;

        // Undo / Redo
        case 'z':
            if (event.ctrlKey || event.metaKey) {
                const shiftKey = editor.checkKeyState(CONSTANTS.KEYS.SHIFT);
                if (shiftKey) editor.redo();
                else editor.undo();
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
            Config.clear();                                         // clear Config.js
            editor.refreshSettings();                               // refresh gui
            Layout.default(editor.docker, editor.viewport());       // default docks
            break;

        // Return here to allow event to propagate
        default: return;
    }

    // Key was captured, stop event from propagating
    event.stopPropagation();
    event.preventDefault();
}

function editorKeyUp(editor, event) {
    // Ignore Key Events While Playing
    const player = editor.getFloaterByID('player', false /* build? */);
    if (player && player.isPlaying) return;

    // Modifier Keys
    editor.updateModifiers(event);
    if (event.key === ' ' /* space */) editor.setKeyState(CONSTANTS.KEYS.SPACE, false);

    // Keys
    switch (event.key) {
        // Color Schemes
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

        // Return here to allow event to propagate
        default: return;
    }

    // Key was captured, stop event from propagating
    event.stopPropagation();
    event.preventDefault();
}
