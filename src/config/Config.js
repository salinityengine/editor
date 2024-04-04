import { THEMES } from 'gui';

const DEFAULT_SETTINGS = {
    'promode':                                  false,              // Enhanced menu and inspector

    /***** FLOATERS */

    'floater/initial/advisor':                  { init: 'left',     side: 'bottom',     size: '18em', size2: '10em' },
    'floater/initial/codex':                    { init: 'left',     side: 'left',       size: '18em' },
    'floater/initial/history':                  { init: 'right',    side: 'right',      size: '22em' },
    'floater/initial/inspector':                { init: 'right',    side: 'right',      size: '22em' },
    'floater/initial/outliner':                 { init: 'left',     side: 'left',       size: '18em' },
    'floater/initial/player':                   { init: 'center' },
    'floater/initial/project':                  { init: 'right',    side: 'right',      size: '22em' },
    'floater/initial/settings':                 { init: 'right',    side: 'right',      size: '22em' },

    /***** EDITOR *****/

    'settings/editorMode':                      'edit2d',           // Editor mode
    'settings/language':                        'en',               // Current editor labeling language (Language.js)

    'scheme/iconColor':                         THEMES.CLASSIC,     // Color scheme icon color
    'scheme/background':                        0,                  // Color scheme background
    'scheme/backgroundTint':                    0.0,                // Color scheme tint percentage
    'scheme/backgroundSaturation':              0.0,                // Color scheme saturation
    'scheme/fontSize':                          '14px',             // Font / Gui size, originally 14px
    'scheme/panelTransparency':                 0.85,               // Panel transparency

    /***** RENDERER *****/

    'renderer/antialias':                       false,              // Anti aliasing on/off in the editor

    'renderer/screen/name':                     'Default',          // Target output name
    'renderer/screen/width':                    1000,               // Target output width
    'renderer/screen/height':                   500,                // Target output height
    'renderer/screen/pixelRatio':               1,                  // Target output pixel ratio

    /***** COMMON EDITOR */

    'scene/grid/snap':                          true,               // Use grid ON / OFF

    /***** SCENE 2D EDITOR *****/

    'scene2d/grid/show':                        true,               // Show grid in Scene Editor 2D?
    'scene2d/grid/sizeX':                       10,                 // Grid size X
    'scene2d/grid/sizeY':                       10,                 // Grid size Y

    /***** SCENE 3D EDITOR *****/

    'scene3d/grid/showCanvas':                  true,               // Show main canvas grid?
    'scene3d/grid/showInfinite':                true,               // Show momentary infinite grid when dragging?
    'scene3d/grid/canvasMultiplier':            10,                 // Major size multiplier for checkerboard grid
    'scene3d/grid/translateSize':               0.10,               // Grid size for translate, rect tools
    'scene3d/grid/rotateSize':                  15.0,               // Rotation snap in angle degrees
    'scene3d/grid/scaleSize':                   0.1,                // Scale snap in percentange (i.e. 0.1 = 10%)

    'paint/color':                              0xff0000,           // Brush color
    'paint/size':                               0.1,                // Brush size

    'snap/tolerance':                           0.3,                // Snap if within distance
    'snap/offset':                              0,                  // Offset object by this additional distance
    'snap/upVector':                            'y',                // Up Vector

    /***** SCENE UI EDITOR */


    /***** WORLD GRAPH *****/

    'world/curve':                              'curve',            // Line type
    'world/grid/style':                         'lines',            // Grid type

    /***** UNCATORIGIZED *****/

    'scene/viewport/mode':                      'select',           // Current state of Viewport.mouseMode
    'scene/controls/mode':                      'none',             // Current state of TransformControls.mode
    'scene/focus/zoom':                         true,               // Zoom to selection on focus?

    'scene/transform/aspectLock':               true,               // Aspect ratio locked in 'scale' row

    'scene/camera/mode':                        'perspective',      // Viewport camera mode
    'scene/camera/locked':                      false,              // Viewport camera locked?

    'scene/gizmo':                              'SPHERE',           // Gizmo type to display

    'scene/render/mode':                        'standard',         // Render mode
    'scene/render/bounds':                      false,              // Show scene boundaries?
    'scene/render/colliders':                   false,              // Show physics colliders?
    'scene/render/joints':                      false,              // Show physics joints?
    'scene/render/origin':                      true,               // Show origin cross?

    'scene/select/allModes':                    true,               // Allow selection in all mouse modes?
    'scene/select/showHelpers':                 true,               // Show wireframe helpers (lights, cam, etc)?
    'scene/select/showWireframe':               false,              // Show wireframe of selected objects?
    'scene/select/xrayDrag':                    true,               // Show object start position as xray during drag?

    /***** SHORTCUT KEYS *****/

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
        const mode = Config.getKey('settings/editorMode');
        localStorage.clear();
        if (mode) Config.setKey('settings/editorMode', mode); /* preserve editor mode */
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
