import { Config } from './Config.js';
import { Signals } from './Signals.js';

const _values = {

    /********** ENGLISH **********/

    en: {

        // Default
        'advisor':                          { title: 'Advisor', html: `` },

        // Floaters
        'floater/advisor':                  { title: 'Advisor', html: `Shows helpful tips and information.` },
        'floater/assets':                   { title: 'Assets', html: `Collection of assets for use in your project.` },
        'floater/codex':                    { title: 'Codex', html: `Collection of scripts for use in your project.` },
        'floater/game':                     { title: 'Game', html: `Game settings viewer.` },
        'floater/history':                  { title: 'History', html: `Undo / redo history log.`},
        'floater/inspector':                { title: 'Inspector', html: `View and edit properties and settings.`},
        'floater/library':                  { title: 'Library', html: `Prefab collection.`},
        'floater/notepad':                  { title: 'Notepad', html: `Scratchpad to keep project notes and ideas.`},
        'floater/outliner':                 { title: 'Outliner', html: `Displays interactive scene hierarchy.` },
        'floater/player':                   { title: 'Player', html: `Play game in it's current state.` },
        'floater/previewer':                { title: 'Previewer', html: `Preview assets and scripts.`},
        'floater/scripter':                 { title: 'Scripter', html: `Script viewer and editor.` },
        'floater/settings':                 { title: 'Settings', html: `Editor settings viewer.`},

        // Game
        'game/app':                         { title: 'App Settings', html: `` },
        'game/app/name':                    { title: 'App Name', html: `` },
        'game/app/orientation':             { title: 'Orientation', html: `App is to be displayed in 'Portrait' or 'Landscape' mode?` },
        'game/threshold':                   { title: 'Threshold', html: `Distance thresholds are used for loading additional Entities (via Stages) and removing Entities that are out of view.` },
        'game/threshold/preload':           { title: 'Preload', html: `Stages will be loaded this far ahead of camera target. Value in world units, -1 to disable.` },
        'game/threshold/unload':            { title: 'Unload', html: `Entities will be removed when camera target is this far past an Entity. Value in world units, -1 to disable.` },

        // History
        'history':                          { title: 'History', html: `List of undo / redo actions taken in editor.` },

        // Settings
        'settings':                         { title: 'Editor Settings', html: `` },
        'settings/general':                 { title: 'General Settings', html: `` },
        'settings/general/language':        { title: 'Language', html: `Preferred language for editor text.` },
        'settings/general/promode':         { title: 'Pro Mode', html: `When enabled, extra settings and functionality are available.` },
        'settings/style':                   { title: 'Style Settings', html: `` },
        'settings/style/theme':             { title: 'Theme', html: `'Dark', 'Mid', or 'Light'` },
        'settings/style/color':             { title: 'Color', html: `Base gui color.` },
        'settings/style/textsize':          { title: 'Text Size', html: `Base font size used throughout editor.` },
        'settings/style/opacity':           { title: 'Opacity', html: `Background opacity of editor panels.` },
        'settings/reset':                   { title: 'Reset', html: `Resets all settings to default values.` },

        // Toolbar, Modes
        'toolbar/eye':                      { title: 'Main Menu', html: `` },
        'toolbar/mode/world':               { title: 'World Graph', html: `Editor mode for interconnecting Worlds and UI Screens.` },
        'toolbar/mode/scene2d':             { title: 'Scene Editor 2D', html: `Editor mode for editing 2D Worlds, Stages, Entities.` },
        'toolbar/mode/scene3d':             { title: 'Scene Editor 3D', html: `Editor mode for editing 3D Worlds, Stages, Entities.` },
        'toolbar/mode/sceneui':             { title: 'UI Editor', html: `Editor mode for editing UI Screens.` },

        // Toolbar, Nodes
        'toolbar/worlds/add':               { title: 'Add Node', html: `Menu for adding Worlds.` },

        // Toolbar, Mouse Modes
        'toolbar/mouse/select':             { title: 'Select Mode', html: `Pointer mode prioritizing rubberband selection.` },
        'toolbar/mouse/look':               { title: 'Look Mode', html: `Pointer mode prioritizing camera rotation.` },
        'toolbar/mouse/move':               { title: 'Move Mode', html: `Pointer mode prioritizing camera panning.` },
        'toolbar/mouse/zoom':               { title: 'Zoom Mode', html: `Pointer mode prioritizing camera zoom.` },

        // Toolbar, Transform Modes
        'toolbar/transform/none':           { title: 'No Tool', html: `Selection controls for selecting and dragging Entities.` },
        'toolbar/transform/translate':      { title: 'Translate Tool', html: `Selection controls for moving Entities.` },
        'toolbar/transform/rotate':         { title: 'Rotate Tool', html: `Selection controls for rotating Entities.` },
        'toolbar/transform/scale':          { title: 'Scale Tool', html: `Selection controls for resizing Entities.` },
        'toolbar/transform/rect':           { title: 'Rect Tool', html: `Selection controls for resizing Entities.` },
        'toolbar/transform/snap':           { title: 'Snap Tool', html: `Selection controls for snapping Entities at shared edges.` },
        'toolbar/transform/paint':          { title: 'Paint Tool', html: `Selection controls for painting Entities surfaces.` },

        // Toolbar, Focus
        'toolbar/focus/onto':               { title: 'Focus On', html: `Center camera on selection, or on active Stage if no selection.` },
        'toolbar/focus/reset':              { title: 'Reset View', html: `Resets camera target to origin (0, 0, 0).` },
        'toolbar/worlds/reset':             { title: 'Reset View', html: `Centers camera on selection, or on all Nodes if no selection.` },

        // Toolbar, Layer
        'toolbar/layer/arrange':            { title: 'Arrange', html: `Menu for moving object forward / backward through the z-order.` },
        'toolbar/layer/transform':          { title: 'Transform', html: `Menu for altering the transform of an object.` },

        // Toolbar, Views
        'toolbar/scene/views':              { title: 'Toggle Views', html: `Quick menu for toggling view options.` },

        // Toolbar, Grid
        'toolbar/grid/top':                 { title: 'Grid on Top?', html: `Show grid on top of objects?` },
        'toolbar/grid/resize':              { title: 'Resize to Grid?', html: `When rotation matches grid angle, resize tool will snap corners to grid.` },
        'toolbar/grid/snap':                { title: 'Snap to Grid?', html: `During tranlation, should objects snap to align with grid?` },

        // Toolbar, Settings
        'toolbar/play':                     { title: 'Play Game', html: `Play game in it's current state.` },
        'toolbar/notepad':                  { title: 'Notepad', html: `Scratchpad to keep project notes and ideas.`},
        'toolbar/game':                     { title: 'Game Settings', html: `Various settings for current game.` },
        'toolbar/history':                  { title: 'History', html: `List of undo / redo actions taken in editor.` },
        'toolbar/settings':                 { title: 'Editor Settings', html: `Various settings for the Salinity Editor.` },
    },

};

class Advice {

    /** Assigns an 'Element' or 'HTMLElement' to the Advisor on pointer enter */
    static attach(element, title /* or key */ = '', html = '') {
        if (!element) return;
        const advice = Advice.getKey(title);
        title = advice.title ?? title;
        html = advice.html ?? html;
        if (element.isElement) {
            element.on('pointerenter', () => { Signals.dispatch('advisorInfo', title, html); });
            element.on('pointerleave', () => { Signals.dispatch('advisorInfo'); });
        } else if (element instanceof HTMLElement) {
            console.warn(`Advice.attach(): Attaching HTMLElement, prefer SueyElement`);
            element.addEventListener('pointerenter', () => { Signals.dispatch('advisorInfo', title, html); });
            element.addEventListener('pointerleave', () => { Signals.dispatch('advisorInfo'); });
        }
    }

    static getKey(key) {
        let language = Config.getKey('editor/language');
        if (!(language in _values)) language = 'en';
        const advice = _values[language][key] ?? {};
        return (typeof advice === 'object') ? advice : {};
    }

}

export { Advice };
