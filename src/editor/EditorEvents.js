import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Config } from './config/Config.js';

let _eventsAdded = false;

class EditorEvents {

    static addEvents() {
        if (!_eventsAdded) {
            // NOTE: These events are called BEFORE Viewport keydown/keyup events
            document.addEventListener('keydown', editorKeyDown);
            document.addEventListener('keyup', editorKeyUp);
        }
        _eventsAdded = true;
    }

}

export { EditorEvents };

/******************** INTERNAL ********************/

function editorKeyDown(event) {
    // Ignore Key Events While Playing
    if (editor.player && editor.player.isPlaying) return;

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
                ONE.System.fullscreen();
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
            switch (editor.mode()) {
                case EDITOR.MODES.UI_EDITOR:
                    break;
                case EDITOR.MODES.SCENE_EDITOR_2D:
                    break;
                case EDITOR.MODES.SCENE_EDITOR_3D:
                    Config.setKey('scene/grid/snap', (!Config.getKey('scene/grid/snap')));
                    break;
                case EDITOR.MODES.SOUND_EDITOR:
                    break;
                case EDITOR.MODES.WORLD_GRAPH:
                    Config.setKey('graph/grid/snap', (!Config.getKey('graph/grid/snap')));
                    break;
            }
            signals.gridChanged.dispatch();
            break;

        // Camera Focus on Object
        case Config.getKey('shortcuts/focus'):
            signals.cameraFocus.dispatch();
            break;

        // Reset camera
        case 'r':
            signals.cameraReset.dispatch();
            break;

        // Play Game
        case Config.getKey('shortcuts/play'):
            signals.startPlayer.dispatch();
            break;

        // Increase / Decrease Font (Gui) Sizing
        case '-': editor.fontSizeChange('down'); break;
        case '=': editor.fontSizeChange('up'); break;

        // Reset all settings
        case Config.getKey('shortcuts/reset'): /* F9 */
            // Persistent Tabs
            const tabs = {};
            if (editor) {
                if (editor.explorer) tabs['explorer'] = editor.explorer.currentId();
                if (editor.inspector) tabs['inspector'] = editor.inspector.currentId();
            }

            // Clear Config
            Config.clear();

            // Persistent Tabs
            if (tabs['explorer']) Config.setKey(`tabs/Explorer`, [ tabs['explorer'] ]);
            if (tabs['inspector']) Config.setKey(`tabs/Inspector`, [ tabs['inspector'] ]);

            // Refresh GUI
            signals.refreshSettings.dispatch();
            break;
    }
}

function editorKeyUp(event) {

    // Ignore Key Events While Playing
    if (editor.player && editor.player.isPlaying) return;

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
