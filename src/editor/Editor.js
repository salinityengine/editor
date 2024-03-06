import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from './config/Advice.js';
import { Clipboard } from './config/Clipboard.js';
import { Config } from './config/Config.js';
import { History } from './config/History.js';
import { Language } from './config/Language.js';
// import { Loader } from './config/Loader.js';

import { EditorEvents } from './EditorEvents.js';
import { EditorToolbar } from './EditorToolbar.js';

import { Advisor } from './panels/Advisor.js';
// import { Explorer } from './panels/Explorer.js';
import { InfoBox } from './panels/InfoBox.js';
import { Inspector } from './panels/Inspector.js';
// import { Player } from './panels/Player.js';
// import { Previewer } from './panels/Previewer.js';
// import { Scripter } from './panels/Scripter.js';
// import { Shaper } from './panels/Shaper.js';
import { View2D } from './view2d/View2D.js';
// import { Worlds } from './worlds/Worlds.js';

// import { loadDemoProject3D } from './Demo.js';

class Editor extends SUEY.Docker {

    constructor() {
        super();
        this.addClass('one-editor').selectable(false);

        // Init Dom
        document.body.appendChild(this.dom);
        this.fontSizeUpdate();

        /********** GLOBAL */

        // Adds 'editor' to global before children are loaded
        window.editor = this;

        /********** ACTIVE PROJECT */

        this.project = new SALT.Project();                      // SALT.Project that has the Editor's attention

        /********** MODULES */

        this.clipboard = new Clipboard();                       // Copy / Paste Clipboard
        this.history = new History();                           // Undo / Redo History
        // this.loader = new Loader();                          // File Loader
        // this.storage = new Storage();                        // TODO: Storage / Autosave

        /********** PROPERTIES */

        // References
        this.view2d = null;                                     // 2D Scene Editor
        this.worlds = null;                                     // World Graph

        this.advisor = null;                                    // Advisor
        this.explorer = null;                                   // Explorer (Outliner / Assets / Prefabs)
        this.inspector = null;                                  // Object Inspector
        this.player = null;                                     // Game Player
        this.previewer = null;                                  // Asset Previewer
        this.scripter = null;                                   // Script Editor

        // Misc
        this.dragInfo = undefined;                              // Stores data for 'dragenter' events
        this.selected = [];                                     // Current Selection
        this.wantsScreenshot = false;                           // Creates Screenshot (without helpers in shot)

        // Input
        this.keyStates = {                                      // Track modifier keys
            'alt': false,
            'control': false,
            'meta': false,
            'shift': false,
            'space': false,
        };
        this.modifierKey = false;                               // True when currently a modifier key pressed

        /********** LOAD EVENTS */

        EditorEvents.addEvents();

        /********** LOAD PANELS */

        this.add(new EditorToolbar());
        this.add(new InfoBox());

        // Scene Editor, 2D
        this.view2d = new View2D();
        this.add(this.view2d);

        // // World Graph
        // this.worlds = new Worlds();
        // this.add(this.worlds);

        /*****/

        // // Script Editor
        // this.scripter = new Scripter();
        // this.add(this.scripter);

        // // Game Player
        // this.player = new Player();
        // this.add(this.player);

        // // Shape Editor
        // this.shaper = new Shaper();
        // this.add(this.shaper);

        // // Docking Panels
        this.advisor = new Advisor({ startWidth: 245, minWidth: 70, startHeight: 147 });
        // this.explorer = new Explorer({ startWidth: 245, minWidth: 70 });
        this.inspector = new Inspector({ startWidth: 300, minWidth: 190 });
        // this.previewer = new Previewer({ startWidth: 300, minWidth: 190 });

        this.addDockPanel(this.advisor, SUEY.CORNERS.BOTTOM_LEFT);
        // this.addDockPanel(this.explorer, SUEY.CORNERS.TOP_LEFT);
        this.addDockPanel(this.inspector, SUEY.CORNERS.TOP_RIGHT);
        // this.addDockPanel(this.previewer, SUEY.CORNERS.BOTTOM_RIGHT);

        // Watch Bottom Left Size
        const botLeft = this.getCorner(SUEY.CORNERS.BOTTOM_LEFT);
        const topLeft = this.getCorner(SUEY.CORNERS.TOP_LEFT);
        function resizeTopLeftDocks() {
            let totalHeight = 0;
            for (const child of botLeft.children) totalHeight += child.getHeight();
            topLeft.setStyle('bottom', `${parseFloat(SUEY.Css.toEm(totalHeight)) - 0.175}em`);
        }
        botLeft.dom.addEventListener('resized', resizeTopLeftDocks);
        signals.refreshWindows.add(resizeTopLeftDocks);
        signals.windowResize.add(resizeTopLeftDocks);

        /********** INIT SIGNALS */

        // Add Editor Signal Callbacks
        signals.addSignalCallbacks();

        // Dispatch Initial Signals
        signals.refreshSettings.dispatch(); /* also selects none */
        signals.editorMode.dispatch(Config.getKey('settings/editorMode'));

        // Enable Button Animations
        setTimeout(() => document.body.classList.remove('preload'), 2000);

        /********** DEMO */

        setTimeout(() => {
            // loadDemoProject3D(editor.project);
            // editor.view2d.world = editor.project.activeWorld();
            // editor.view2d.stage = editor.view2d.world.activeStage();
            signals.projectLoaded.dispatch();
        }, 100);

    } // end ctor

    /******************** MODE ********************/

    mode() {
        return Config.getKey('settings/editorMode');
    }

    modeElement() {
        switch (this.mode()) {
            case EDITOR.MODES.UI_EDITOR:        return undefined;
            case EDITOR.MODES.SCENE_EDITOR_2D:  return this.view2d;
            case EDITOR.MODES.SCENE_EDITOR_3D:  return undefined;
            case EDITOR.MODES.SOUND_EDITOR:     return undefined;
            case EDITOR.MODES.WORLD_GRAPH:      return this.worlds;
        }
    }

    /******************** CLIPBOARD / EDIT ********************/

    copy(selection) {
        selection = selection ?? this.selected;
        this.clipboard.copy(selection);
        signals.clipboardChanged.dispatch();
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

    /* DOES run through Undo/Redo History */
    selectAll() {
        const view = this.modeElement();
        if (!view || view.isHidden()) return;
        if (typeof view.selectAll === 'function') view.selectAll();
    }

    /* DOES run through Undo/Redo History */
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
        const entities = Array.isArray(arguments[0]) ? arguments[0] : [...arguments];

        // Verify items are valid for selection
        const filtered = [];
        for (const entity of entities) {
            if (!entity || !entity.isEntity) continue;
            filtered.push(entity);
        }

        // New selection same as current selection? Refresh Inspector (but don't refresh view transformGroup)
        if (SALT.EntityUtils.compareArrayOfEntities(this.selected, filtered)) {
            if (editor.selected.length > 0) {
                signals.inspectorBuild.dispatch(editor.selected[0]);
                return;
            }
        }

        // Update selection array
        this.selected = [...filtered];

        // Selection change signal
        signals.selectionChanged.dispatch();
    }

    /******************** GUI ********************/

    fontSizeChange(direction = 'up') {
        let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
        if (direction === 'down' || direction === 'decrease') {
            addSize = Math.floor((SUEY.Css.fontSize() - addSize + 10.0) / 10.0);
            addSize *= -1;
        }
        let fontSize = Math.min(EDITOR.FONT_SIZE_MAX, SUEY.Css.fontSize() + addSize);
        fontSize = SALT.Maths.clamp(fontSize, EDITOR.FONT_SIZE_MIN, EDITOR.FONT_SIZE_MAX);
        Config.setKey('scheme/fontSize', SUEY.Css.toPx(fontSize));
        SUEY.Css.setVariable('--font-size', SUEY.Css.toPx(fontSize));
        signals.fontSizeChanged.dispatch();
    }

    fontSizeUpdate() {
        let fontSize = parseInt(Config.getKey('scheme/fontSize'));
        fontSize = SALT.Maths.clamp(fontSize, EDITOR.FONT_SIZE_MIN, EDITOR.FONT_SIZE_MAX);
        Config.setKey('scheme/fontSize', SUEY.Css.toPx(fontSize));
        SUEY.Css.setVariable('--font-size', SUEY.Css.toPx(fontSize));
        signals.fontSizeChanged.dispatch();
    }

    cycleSchemeBackground() {
        let background = parseInt(Config.getKey('scheme/background'), 10);
        if (background == SUEY.BACKGROUNDS.DARK) {
            background = SUEY.BACKGROUNDS.MID;
        } else if (background == SUEY.BACKGROUNDS.MID) {
            background = SUEY.BACKGROUNDS.LIGHT;
        } else {
            background = SUEY.BACKGROUNDS.DARK;
        }
        this.setSchemeBackground(background);
    }

    setSchemeBackground(background = SUEY.BACKGROUNDS.DARK, updateSettings = true) {
        if (updateSettings) {
            Config.setKey('scheme/background', background);
        }
        SUEY.ColorScheme.changeBackground(background);
        signals.schemeChanged.dispatch();
    }

    setSchemeColor(color = SUEY.THEMES.CLASSIC, tint = 0.0, saturation = 0.0, updateSettings = true) {
        if (updateSettings) {
            Config.setKey('scheme/iconColor', color);
            Config.setKey('scheme/backgroundTint', tint);
            Config.setKey('scheme/backgroundSaturation', saturation);
        }
        SUEY.ColorScheme.changeColor(color, tint, saturation);
        signals.schemeChanged.dispatch();
    }

    /******************** INTERACTIVE ********************/

    requestScreenshot() {
        if (editor.player && (editor.player.isPlaying && (editor.player.isPaused != true))) {
            editor.player.requestScreenshot();
        } else {
            editor.wantsScreenshot = true;
        }
    }

    checkKeyState(/* any number of comma seperated EDITOR.KEYS */) {
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

}

export { Editor };
