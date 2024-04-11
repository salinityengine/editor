import { THEMES } from 'gui';

const DEFAULT_SETTINGS = {

    'promode':                                  false,              // Enhanced menu and inspector

    /***** Floating Panels */

    'floater/initial/advisor':                  { init: 'left',     side: 'bottom',     size: '24em', size2: '15em' },
    'floater/initial/assets':                   { init: 'left',     side: 'left',       size: '24em' },
    'floater/initial/codex':                    { init: 'left',     side: 'left',       size: '24em' },
    'floater/initial/history':                  { init: 'right',    side: 'right',      size: '30em' },
    'floater/initial/inspector':                { init: 'right',    side: 'right',      size: '30em' },
    'floater/initial/library':                  { init: 'left',     side: 'left',       size: '24em' },
    'floater/initial/outliner':                 { init: 'left',     side: 'left',       size: '24em' },
    'floater/initial/player':                   { init: 'center',   size: '60%', size2: '80%' },
    'floater/initial/previewer':                { init: 'right',    side: 'right',      size: '30em' },
    'floater/initial/project':                  { init: 'right',    side: 'right',      size: '30em' },
    'floater/initial/scripter':                 { init: 'center',   size: '60%', size2: '90%' },
    'floater/initial/settings':                 { init: 'right',    side: 'right',      size: '30em' },

    /***** Editor *****/

    'editor/mode':                              'edit2d',           // Editor mode
    'editor/language':                          'en',               // Gui interface language (Language.js)

    'scheme/color':                             THEMES.CLASSIC,     // Color scheme icon color
    'scheme/background':                        0,                  // Color scheme background
    'scheme/tint':                              0.0,                // Color scheme tint percentage
    'scheme/saturation':                        0.0,                // Color scheme saturation
    'scheme/fontSize':                          '14px',             // Font / Gui size, originally 14px
    'scheme/transparency':                      0.85,               // Panel transparency

    /***** Game Player *****/

    'player/screen/name':                       'Default',          // Target output name
    'player/screen/width':                      1000,               // Target output width
    'player/screen/height':                     500,                // Target output height
    'player/screen/pixelRatio':                 1,                  // Target output pixel ratio

    /***** Viewport */

    'viewport/mouse/mode':                      'select',           // Current state of Viewport mouse mode
    'viewport/controls/mode':                   'none',             // Current state of TransformControls mode
    'viewport/focus/zoom':                      true,               // Zoom to selection on focus?
    'viewport/transform/aspectLock':            true,               // Aspect ratio locked in 'scale' row

    'viewport/render/origin':                   true,               // Show origin cross?
    'viewport/render/bounds':                   false,              // Show scene boundaries?
    'viewport/render/colliders':                false,              // Show physics colliders?
    'viewport/render/joints':                   false,              // Show physics joints?

    'viewport/grid/snap':                       true,               // Use grid ON / OFF

    /***** 2D Viewport *****/

    'view2d/grid/ontop':                        false,              // Show grid on top of objects?
    'view2d/grid/resize':                       true,               // Resize to grid?
    'view2d/grid/show':                         true,               // Show grid in Scene Editor 2D?
    'view2d/grid/sizeX':                        10,                 // Grid size X
    'view2d/grid/sizeY':                        10,                 // Grid size Y
    'view2d/grid/rotate':                       0,                  // Grid rotation, in degrees

    /***** 3D Viewport *****/

    'view3d/render/mode':                       'standard',         // Render mode

    'view3d/camera/mode':                       'perspective',      // Viewport camera mode
    'view3d/camera/locked':                     false,              // Viewport camera locked?

    'view3d/select/allModes':                   true,               // Allow selection in all mouse modes?
    'view3d/select/showHelpers':                true,               // Show wireframe helpers (lights, cam, etc)?
    'view3d/select/showWireframe':              false,              // Show wireframe of selected objects?
    'view3d/select/xrayDrag':                   true,               // Show object start position as xray during drag?

    /***** Ui Editor */


    /***** World Graph *****/

    'world/curve':                              'curve',            // Line type
    'world/grid/style':                         'lines',            // Grid type

    /***** Keyboard Shortcuts *****/

    'shortcuts/select':                         'F1',               // Shortcut Key: Mouse Mode - 'select'
    'shortcuts/look':                           'F2',               // Shortcut Key: Mouse Mode - 'look'
    'shortcuts/move':                           'F3',               // Shortcut Key: Mouse Mode - 'move'
    'shortcuts/zoom':                           'F4',               // Shortcut Key: Mouse Mode - 'zoom'

    'shortcuts/none':                           '1',                // Shortcut Key: Transform - 'none'
    'shortcuts/translate':                      '2',                // Shortcut Key: Transform - 'translate'
    'shortcuts/rotate':                         '3',                // Shortcut Key: Transform - 'rotate'
    'shortcuts/scale':                          '4',                // Shortcut Key: Transform - 'scale'
    'shortcuts/rect':                           '5',                // Shortcut Key: Transform - 'rect'
    'shortcuts/snap':                           '6',                // Shortcut Key: Transform - 'snap'
    'shortcuts/paint':                          '7',                // Shortcut Key: Transform - 'paint'

    'shortcuts/play':                           'F5',               // Shortcut Key: Start/Stop Game Player
    'shortcuts/reset':                          'F9',               // Shortcut Key: Reset Settings

    'shortcuts/focus':                          'f',                // Shortcut Key: Focus
    'shortcuts/camera/mode':                    'c',                // Shortcut Key: Switch Camera Mode
    'shortcuts/camera/reset':                   'r',                // Shortcut Key: Reset Camera to Zero

};

class Config {

    static clear() {
        const mode = Config.getKey('editor/mode');
        localStorage.clear();
        if (mode) Config.setKey('editor/mode', mode); /* preserve editor mode */
    }

    static getKey(key) {
        const data = localStorage.getItem(key);
        const value = (data === undefined || data === null) ? DEFAULT_SETTINGS[key] : JSON.parse(data);
        return value;
    }

    /** Sets series of keys to values, pass in by key, value pair. */
    static setKey(/* key, value, key, value, etc. */) {
        for (let i = 0, l = arguments.length; i < l; i += 2) {
            localStorage.setItem(arguments[i], JSON.stringify(arguments[i + 1]));
        }
    }

    static tooltip(text, key = '') {
        let tip = `${text}`;
        if (typeof key === 'string' && key !== '') {
            key = key.replaceAll('Digit', '');
            key = key.replaceAll('Key', '');
            key = key.toUpperCase();
            tip += `&nbsp<span class='suey-disabled'>&nbsp ${key}</span>`;
        }
        return tip;
    }
}

export { Config };
