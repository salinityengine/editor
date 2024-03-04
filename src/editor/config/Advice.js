import { Config } from './Config.js';

const _values = {

    /********** ENGLISH **********/

    en: {

        // Advisor
        'advisor':                          { title: 'Advisor', html: `` },

        // Project
        'project':                          { title: 'Project Settings', html: `` },
        'project/name':                     { title: 'Project Name', html: `` },
        'project/app':                      { title: 'App Settings', html: `` },
        'project/app/orientation':          { title: 'Orientation', html: `App is to be displayed in 'Portrait' or 'Landscape' mode?` },
        'project/threshold':                { title: 'Threshold', html: `Distance thresholds are used for loading additional Entities (via Stages) and removing Entities that are out of view.` },
        'project/threshold/preload':        { title: 'Preload', html: `Stages will be loaded this far ahead of camera target. Value in world units, -1 to disable.` },
        'project/threshold/unload':         { title: 'Unload', html: `Entities will be removed when camera target is this far past an Entity. Value in world units, -1 to disable.` },

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

        // Toolbar
        'toolbar/eye':                      { title: 'Main Menu', html: `` },
        'toolbar/scene':                    { title: 'Scene Editor', html: `Editor mode for editing Entities, Stages, and Worlds.` },
        'toolbar/world':                    { title: 'World Graph', html: `Editor mode for interconnecting Worlds and UI Screens.` },
        'toolbar/ui':                       { title: 'UI Editor', html: `Editor mode for editing UI Screens.` },

        'toolbar/viewport/select':          { title: 'Select Mode', html: `Pointer mode prioritizing rubberband selection.` },
        'toolbar/viewport/look':            { title: 'Look Mode', html: `Pointer mode prioritizing camera rotation.` },
        'toolbar/viewport/move':            { title: 'Move Mode', html: `Pointer mode prioritizing camera panning.` },
        'toolbar/viewport/zoom':            { title: 'Zoom Mode', html: `Pointer mode prioritizing camera zoom.` },
        'toolbar/viewport/none':            { title: 'No Tool', html: `Selection controls for selecting and dragging Entities.` },
        'toolbar/viewport/translate':       { title: 'Translate Tool', html: `Selection controls for moving Entities.` },
        'toolbar/viewport/rotate':          { title: 'Rotate Tool', html: `Selection controls for rotating Entities.` },
        'toolbar/viewport/scale':           { title: 'Scale Tool', html: `Selection controls for resizing Entities.` },
        'toolbar/viewport/rect':            { title: 'Rect Tool', html: `Selection controls for resizing Entities.` },
        'toolbar/viewport/snap':            { title: 'Snap Tool', html: `Selection controls for snapping Entities at shared edges.` },
        'toolbar/viewport/paint':           { title: 'Paint Tool', html: `Selection controls for painting Entities surfaces.` },
        'toolbar/viewport/focus':           { title: 'Focus On', html: `Center camera on selection, or on active Stage if no selection.` },
        'toolbar/viewport/reset':           { title: 'Reset', html: `Resets camera target to origin (0, 0, 0).` },
        'toolbar/viewport/toggle':          { title: 'Toggle Views', html: `Quick menu for toggling view options.` },
        'toolbar/viewport/play':            { title: 'Play Game', html: `Start game preview using the current active World.` },

        'toolbar/worlds/add':               { title: 'Add Node', html: `Menu for adding Worlds.` },
        'toolbar/worlds/snap':              { title: 'Snap to Grid', html: `Toggle snap to grid setting.` },
        'toolbar/worlds/reset':             { title: 'Reset View', html: `Centers camera on selection, or on all Nodes if no selection.` },

        'toolbar/project':                  { title: 'Project Settings', html: `` },
        'toolbar/history':                  { title: 'History', html: `List of undo / redo actions taken in editor.` },
        'toolbar/settings':                 { title: 'Editor Settings', html: `` },
    },

};

class Advice {

    /** Attaches an OSUI.Element or HTMLElement to the Advisor signals */
    static attach(element, title /* or key */ = '', html = '') {
        if (!element || !signals || !signals.advisorInfo) return;
        const advice = Advice.getKey(title);
        title = advice.title ?? title;
        html = advice.html ?? html;
        if (element.isElement) {
            element.onPointerEnter(() => { signals.advisorInfo.dispatch(title, html); });
        } else if (element instanceof HTMLElement) {
            element.addEventListener('pointerenter', () => { signals.advisorInfo.dispatch(title, html); });
        }
    }

    /** Assigns an OSUI.Element or HTMLElement to the Advisor on pointer leave */
    static clear(element) {
        if (!element || !signals || !signals.advisorInfo) return;
        if (element.isElement) {
            element.onPointerLeave(() => { signals.advisorInfo.dispatch(); });
        } else if (element instanceof HTMLElement) {
            element.addEventListener('pointerleave', () => { signals.advisorInfo.dispatch(); });
        }
    }

    static getKey(key) {
        let language = Config.getKey('settings/language');
        if (!(language in _values)) language = 'en';
        const advice = _values[language][key] ?? {};
        return (typeof advice === 'object') ? advice : {};
    }

}

export { Advice };
