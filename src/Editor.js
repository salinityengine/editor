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
import { Explorer } from './panels/Explorer.js';
import { Inspector } from './panels/Inspector.js';
import { Player } from './panels/Player.js';
import { Scripter } from './panels/Scripter.js';
import { Shaper } from './panels/Shaper.js';
import { View2D } from './view2d/View2D.js';
import { View3D } from './view3d/View3D.js';
import { ViewUI } from './viewui/ViewUI.js';
import { Worlds } from './worlds/Worlds.js';

import { loadDemoProject } from './Demo.js';

class Editor extends SUEY.Docker2 {

    constructor() {
        super();
        const self = this;
        this.addClass('salt-editor').selectable(false);
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

        // Mode Panels
        this.view2d = null;                                     // Scene Editor 2D
        this.view3d = null;                                     // Scene Editor 3D
        this.viewui = null;                                     // UI Editor
        this.worlds = null;                                     // World Graph

        // Floating Panels
        this.player = null;                                     // Game Player
        this.scripter = null;                                   // Script Editor
        this.shaper = null;                                     // Shape Editor

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

        /********** EVENTS */

        document.addEventListener('keydown', (event) => { editorKeyDown(self, event); });
        document.addEventListener('keyup', (event) => { editorKeyUp(self, event); });

        /********** ELEMENTS */

        // Toolbar
        this.add(new EditorToolbar());

        // InfoBox
        this.infoBox = new InfoBox();
        this.add(this.infoBox);

        /********** PANELS */

        // Mode Panels
        this.add(this.view2d = new View2D());
        this.add(this.view3d = new View3D());
        this.add(this.viewui = new ViewUI());
        this.add(this.worlds = new Worlds());

        // Floating Panels
        this.add(this.scripter = new Scripter());
        this.add(this.player = new Player());
        this.add(this.shaper = new Shaper());

        /***** DOCKING PANELS */

        this.addDockPanel(new Advisor({ startWidth: 245, minWidth: 70, startHeight: 147 }), SUEY.CORNERS.BOTTOM_LEFT);
        this.addDockPanel(new Explorer({ startWidth: 245, minWidth: 70 }), SUEY.CORNERS.TOP_LEFT);
        this.addDockPanel(new Inspector({ startWidth: 300, minWidth: 190 }), SUEY.CORNERS.TOP_RIGHT);

        /********** SIGNALS */

        // Watch Bottom Left Size
        const botLeft = this.getCorner(SUEY.CORNERS.BOTTOM_LEFT);
        const topLeft = this.getCorner(SUEY.CORNERS.TOP_LEFT);
        function resizeTopLeftDocks() {
            let totalHeight = 0;
            for (const child of botLeft.children) totalHeight += child.getHeight();
            topLeft.setStyle('bottom', `${parseFloat(SUEY.Css.toEm(totalHeight)) - 0.175}em`);
        }
        botLeft.dom.addEventListener('resized', resizeTopLeftDocks);
        Signals.connect(this, 'refreshWindows', resizeTopLeftDocks);
        Signals.connect(this, 'windowResize', resizeTopLeftDocks);

        // Project Loaded
        Signals.connect(this, 'projectLoaded', function() {
            if (self.history) self.history.clear();

            // Clear Inspector
            Signals.dispatch('inspectorBuild');

            // Rebuild Outliner
            Signals.dispatch('sceneGraphChanged');

            // Reset Camera / Lights
            Signals.dispatch('cameraReset');
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

        // Setup Look / Mode
        this.refreshSettings(); // also selects none
        this.setMode(Config.getKey('settings/editorMode'));

        // Enable Button Animations
        setTimeout(() => document.body.classList.remove('preload'), 1000);

        /********** DEMO */

        setTimeout(() => {
            // loadDemoProject(self.project);
            // self.view2d.world = self.project.activeWorld();
            // self.view2d.stage = self.view2d.world.activeStage();
            Signals.dispatch('projectLoaded');
        }, 100);

    } // end ctor

    /******************** MODE ********************/

    setMode(mode) {
        // Close (Hide) Windows
        const windows = document.querySelectorAll('.suey-window');
        for (const window of windows) {
            window.classList.remove('suey-active-window');
            window.style.display = 'none';
            window.dispatchEvent(new Event('hidden'));
        }

        //
        // TODO: Hide Panels
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
        const entities = Array.isArray(arguments[0]) ? arguments[0] : [...arguments];

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
        this.selected = [...filtered];

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

        // Grids
        Signals.dispatch('gridChanged');

        // Tabs
        this.traverse((child) => {
            if (child.isElement && child.hasClass('suey-tabbed')) {
                child.selectLastKnownTab();
            }
        }, false /* applyToSelf */);

        // Mouse Modes
        Signals.dispatch('mouseModeChanged', Config.getKey('scene/viewport/mode'));
        Signals.dispatch('transformModeChanged', Config.getKey('scene/controls/mode'));

        // Rebuild Inspector / Preview from Existing Items
        Signals.dispatch('inspectorBuild', 'rebuild');
        Signals.dispatch('promodeChanged');

        // Refresh Docks
        Signals.dispatch('refreshWindows');
        Signals.dispatch('settingsRefreshed');
    }

    fontSizeChange(fontSize) {
        if (fontSize === 'up' || fontSize === 'increase') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            fontSize = Math.min(EDITOR.FONT_SIZE_MAX, SUEY.Css.fontSize() + addSize);
        } else if (fontSize === 'down' || fontSize === 'decrease') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            addSize = Math.floor((SUEY.Css.fontSize() - addSize + 10.0) / 10.0);
            fontSize = Math.min(EDITOR.FONT_SIZE_MAX, SUEY.Css.fontSize() - addSize);
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
        if (this.player && (this.player.isPlaying && (this.player.isPaused != true))) {
            this.player.requestScreenshot();
        } else {
            this.wantsScreenshot = true;
        }
    }

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

    /** If tab is present in Editor, ensures tab is active */
    selectTab(tabId = '') {
        //
        // TODO: Find and select tab
        //
        // Example
        //  Tabbed.selectTab('assets');
        //
    }

    /** Display temporary, centered tooltip */
    showInfo(info) {
        if (this.infoBox) this.infoBox.popupInfo(info);
        return this;
    }

}

// Export Constants
export * from './EditorConstants.js';

// Export as Singleton
const editor = new Editor();
export { editor };
