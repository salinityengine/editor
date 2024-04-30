import * as CONSTANTS from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from './config/Advice.js';
import { Clipboard } from './config/Clipboard.js';
import { Commands } from './config/Commands.js';
import { Config } from './config/Config.js';
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

class Editor extends SUEY.MainWindow {

    constructor() {
        super();
        this.addClass('salt-editor', 'suey-unselectable', 'salt-disable-transitions');
        document.body.appendChild(this.dom);
    }

    /******************** INITIALIZE ********************/

    init() {
        const editor = this;

        /********** ACTIVE PROJECT */

        editor.project = new SALT.Project();                    // SALT.Project loaded into editor

        /********** ADD-ONS */

        editor.commands = new Commands();                       // undo / redo history
        editor.clipboard = new Clipboard();                     // copy / paste clipboard
        // editor.storage = new Storage();                      // TODO: storage / autosave

        /********** PROPERTIES */

        // Elements
        editor.infoBox = null;                                  // popup information
        editor.toolbar = null;                                  // main toolbar

        // Viewports
        editor.viewports = [];                                  // collection of viewports

        // Input
        editor.keyStates = {                                    // track modifier keys
            'alt': false,
            'control': false,
            'meta': false,
            'shift': false,
            'space': false,
        };
        editor.modifierKey = false;                             // true when any modifier key is pressed

        // Misc
        editor.dragInfo = undefined;                            // stores data for 'dragenter' events
        editor.selected = [];                                   // current selection
        editor.wantsScreenshot = false;                         // creates screenshot

        /********** ELEMENTS */

        // Gui
        editor.add(editor.toolbar = new EditorToolbar(editor));
        editor.add(editor.infoBox = new InfoBox());

        // Viewports
        editor.viewports.push(new View2D());
        editor.viewports.push(new View3D());
        editor.viewports.push(new ViewUI());
        editor.viewports.push(new Worlds());
        editor.add(...editor.viewports);

        /********** EVENTS */

        function onKeyDown(event)   { editorKeyDown(editor, event); }
        function onKeyUp(event)     { editorKeyUp(editor, event); }
        function onDragOver(event)  { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; /* mouse cursor */ }
        function onDrop(event)      { event.preventDefault(); }
        function onVisibilityChange(event) { if (document.visibilityState === 'hidden') { Layout.save(); } }

        function addDocumentEvent(eventName, callback) {
            document.addEventListener(eventName, callback);
            editor.on('destroy', () => { document.removeEventListener(eventName, callback); });
        }

        addDocumentEvent('keydown', onKeyDown);
        addDocumentEvent('keyup', onKeyUp);
        addDocumentEvent('dragover', onDragOver);                   // keeps drag from outside app opening in new tab
        addDocumentEvent('drop', onDrop);                           // keeps drag from outside app opening in new tab
        addDocumentEvent('visibilitychange', onVisibilityChange);   // i.e. 'pagehide' / 'beforeunload'

        /********** SIGNALS */

        Signals.connect(this, 'changeEditorMode', this.setMode.bind(this));

        /********** INIT */

        editor.setMode(Config.getKey('editor/mode'));                               // set editor mode
        editor.refreshSettings();                                                   // also selects none
        setTimeout(() => editor.removeClass('salt-disable-transitions'), 500);      // allow css transitions
        setTimeout(() => editor.loadProject(null, true /* demo? */), 100);          // load demo project

    } // end ctor

    /******************** PROJECT ********************/

    loadProject(json, demo = false) {
        let loaded = false;
        if (demo) {
            this.selectEntities(/* none */);
            // loadDemoProject(this.project);
            loaded = true;
        } else if (json) {
            this.selectEntities(/* none */);
            this.project.fromJSON(json, true /* loadAssets? */);
            loaded = true;
        }

        if (loaded) {
            Signals.dispatch('sceneGraphChanged');                  // rebuild outliner
            Signals.dispatch('projectLoaded');                      // alert floaters
        }
    }

    /******************** MODE ********************/

    setMode(mode) {
        // Save Floater Layout
        const currentViewport = this.viewport();
        if (currentViewport) Layout.save();

        // Remove Mode Toolbar
        const middle = this.toolbar.middle;
        middle.detach(...middle.children);

        // Hide Viewports
        let newViewport = undefined;
        for (const viewport of this.viewports) {
            if (!newViewport && viewport.mode() === mode) {
                newViewport = viewport;
                this.toolbar.middle.add(...viewport.toolbar.buttons);
                viewport.activate();
            } else {
                viewport.deactivate();
            }
        }
        Config.setKey('editor/mode', mode);

        // Load Floaters
        Layout.load();

        // Dispatch Signals
        Signals.dispatch('editorModeChanged', mode);
    }

    mode() {
        return Config.getKey('editor/mode');
    }

    viewport(worldType) {
        // Find by World Type
        if (worldType && worldType.isWorld) worldType = worldType.type;
        if (worldType) {
            for (const viewport of this.viewports) {
                if (viewport.mode() === worldType) return viewport;
            }
        // Active Viewport
        } else {
            const currentMode = this.mode();
            for (const viewport of this.viewports) {
                if (viewport.mode() === currentMode && viewport.isDisplayed()) return viewport;
            }
        }
    }

    /******************** CLIPBOARD / EDIT ********************/

    copy(selection) {
        selection = selection ?? this.selected;
        this.clipboard.copy(selection);
        Signals.dispatch('clipboardChanged');
    }

    /**
     * The following functions are meant to run through Undo/Redo Commands
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

    /******************** UNDO / REDO ********************/

    execute(cmd) {
        this.commands.execute(cmd);
    }

    undo() {
        this.commands.undo();
    }

    redo() {
        this.commands.redo();
    }

    /******************** SELECTION ********************/

    /**
     * This function is *** NOT *** meant to run through Undo/Redo Commands
     * Emits 'selectionChanged' signal upon new selection
     */
    selectEntities(...entities) {
        if (entities.length > 0 && Array.isArray(entities[0])) entities = entities[0];

        // Verify items are valid for selection
        const filtered = [];
        for (const entity of entities) {
            if (!entity || !entity.isEntity) continue;
            filtered.push(entity);
        }

        // New selection same as current selection?
        if (SALT.Arrays.compareEntityArrays(this.selected, filtered)) return;

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
        // // DEBUG: Output color scheme colors
        // console.log(SUEY.ColorScheme.toString());
        Signals.dispatch('schemeChanged');
    }

    /******************** INTERACTIVE ********************/

    requestScreenshot() {
        const player = Layout.findFloater('player');
        if (player && player.isPlaying && !player.isPaused) {
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

}

// Export as Singleton
const editor = new Editor();
export default editor;

/******************** INTERNAL: KEYBOARD ********************/

function editorIgnoreKey(event) {
    // // DEBUG: See active element
    // if (event.type === 'keydown') {
    //     console.log(document.activeElement, document.activeElement.toString());
    // }

    // IGNORE: While Playing
    const player = Layout.findFloater('player');
    if (player && player.isPlaying) {
        Layout.selectFloater(player);
        return true;
    }

    // IGNORE: Focused HTMLElement contains specific attribute
    const focused = document.activeElement;
    if (focused && focused instanceof HTMLElement) {
        if (focused.getAttribute('contenteditable')) return true;       // text field
        if (focused instanceof HTMLButtonElement) return true;          // button
        if (focused instanceof HTMLInputElement) return true;           // input
        if (focused instanceof HTMLBodyElement) return false;           // viewport
    }

    // DON'T IGNORE
    return false;
}

function editorKeyDown(editor, event) {
    // Ignore?
    if (editorIgnoreKey(event)) return;

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

        // Reset Camera
        case 'r':
            editor.viewport()?.cameraReset();
            break;

        // Play Game
        case Config.getKey('shortcuts/play'):
            const player = Layout.selectFloater('player', true /* build? */);
            player.start();
            break;

        // Increase / Decrease Font (Gui) Sizing
        case '-': editor.fontSizeChange('down'); break;
        case '=': editor.fontSizeChange('up'); break;

        // Reset all settings
        case Config.getKey('shortcuts/reset'): /* F9 */
            editor.clearFloaters();                             // clear docks / windows
            Config.clear();                                     // then clear Config.js
            editor.refreshSettings();                           // refresh gui elements
            Layout.default();                                   // load default docks
            break;

        // Return here to allow event to propagate
        default: return;
    }

    // Key was captured, stop event from propagating
    event.stopPropagation();
    event.preventDefault();
}

function editorKeyUp(editor, event) {
    // Ignore?
    if (editorIgnoreKey(event)) return;

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
