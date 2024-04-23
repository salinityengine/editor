import * as SUEY from 'gui';

// Editor Modes
export const EDITOR_MODES = {
    SOUND_EDITOR:       'Sounds',
    WORLD_GRAPH:        'Worlds',
    WORLD_2D:           'World2D',
    WORLD_3D:           'World3D',
    WORLD_UI:           'WorldUI',
}

// Keyboard Keys
export const KEYS = {
    ALT:                'alt',
    CONTROL:            'control',
    META:               'meta',                 // Command Key (MacOS) / Windows Key
    SHIFT:              'shift',
    SPACE:              'space',
};

// Engine
export const BASE_MOVE = 0.1;                   // Step distance when not specified
export const EMPTY_BOX_SIZE = 1;                // Size of empty entity selection box / transformGroup box

// Gui
export const BRUSH_SIZE_MIN = 0.01;             // Minimum triangle paint brush size
export const BRUSH_SIZE_MAX = 1.0;              // Maximum triangle paint brush size
export const MOUSE_DOUBLE_CLICK = 450;          // Time (in milliseconds) click is considered a double click
export const MOUSE_WAS_MOVED = 5.0;             // Pixel distance mouse can move before no longer considered click
export const MOUSE_TIMEOUT = 700;               // Time (in milliseconds) after which we ignore mouse down event
export const TIMEOUT_INFOBOX = 500;             // Time (in milliseconds) before InfoBox starts to fade away

// Styling
export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 30;
export const WIDGET_SPACING = '0.14286em';      // Space between input widgets in Inspector
export const PREVIEW_WIDTH = 1024;
export const PREVIEW_HEIGHT = 512;

// Assets
export const FOLDER_ASSETS =        './files/assets/';
export const FOLDER_CURSORS =       './files/cursors/';
export const FOLDER_IMAGES =        './files/images/';
export const FOLDER_LOGO =          './files/logo/';

// Editor Images
export const FOLDER_FLOATERS =      './files/images/floaters/'
export const FOLDER_MENU =          './files/images/menu/';
export const FOLDER_TOOLBAR =       './files/images/toolbar/';
export const FOLDER_TYPES =         './files/images/types/';

// Component Icons
export const COMPONENT_ICONS = {
    // Entity
    'geometry':     `${FOLDER_TYPES}component/geometry.svg`,        // rgb(255, 113, 0)
    'material':     `${FOLDER_TYPES}component/material.svg`,        // rgb(165, 243, 0)
    'mesh':         `${FOLDER_TYPES}component/mesh.svg`,            // #F7DB63
    'rigidbody':    `${FOLDER_TYPES}component/rigidbody.svg`,       // #1365C2
    'script':       `${FOLDER_TYPES}component/script.svg`,          // #6E6FFD
    'sprite':       `${FOLDER_TYPES}component/sprite.svg`,          // #5978F2
    'test':         `${FOLDER_TYPES}component/test.svg`,            // rgb(128, 128, 128)
    // World
    'physics':      `${FOLDER_TYPES}component/physics.svg`,         // #202020
    'post':         `${FOLDER_TYPES}component/post.svg`,            // rgb(32, 32, 32)
}

// Cursors
export const CURSORS = {
    DEFAULT:        `default`,
    LOOK:           `url(${FOLDER_CURSORS}eyeball.png) 16 16, move`,

    PAN:            `grab`,
    PANNING:        `grabbing`,

    ROTATE:         `url(${FOLDER_CURSORS}rotate.png) 16 16, auto`,
    ROTATE_3D:      `url(${FOLDER_CURSORS}rotate3d.png) 16 16, auto`,

    SCALE:          `url(${FOLDER_CURSORS}scale.png) 16 16, move`,
    SCALE_3D:       `url(${FOLDER_CURSORS}scale3d.png) 16 16, move`,
    SCALE_000:      `url(${FOLDER_CURSORS}scale-000.png) 16 16, ns-resize`,
    SCALE_022:      `url(${FOLDER_CURSORS}scale-022.png) 16 16, nesw-resize`,
    SCALE_045:      `url(${FOLDER_CURSORS}scale-045.png) 16 16, nesw-resize`,
    SCALE_067:      `url(${FOLDER_CURSORS}scale-067.png) 16 16, nesw-resize`,
    SCALE_090:      `url(${FOLDER_CURSORS}scale-090.png) 16 16, ew-resize`,
    SCALE_112:      `url(${FOLDER_CURSORS}scale-112.png) 16 16, nwse-resize`,
    SCALE_135:      `url(${FOLDER_CURSORS}scale-135.png) 16 16, nwse-resize`,
    SCALE_157:      `url(${FOLDER_CURSORS}scale-157.png) 16 16, nwse-resize`,

    TRANSLATE:      `url(${FOLDER_CURSORS}translate.png) 16 16, move`,
    TRANSLATE_3D:   `url(${FOLDER_CURSORS}translate3d.png) 16 16, move`,
    TRANSLATE_000:  `url(${FOLDER_CURSORS}translate-000.png) 16 16, ns-resize`,
    TRANSLATE_022:  `url(${FOLDER_CURSORS}translate-022.png) 16 16, nesw-resize`,
    TRANSLATE_045:  `url(${FOLDER_CURSORS}translate-045.png) 16 16, nesw-resize`,
    TRANSLATE_067:  `url(${FOLDER_CURSORS}translate-067.png) 16 16, nesw-resize`,
    TRANSLATE_090:  `url(${FOLDER_CURSORS}translate-090.png) 16 16, ew-resize`,
    TRANSLATE_112:  `url(${FOLDER_CURSORS}translate-112.png) 16 16, nwse-resize`,
    TRANSLATE_135:  `url(${FOLDER_CURSORS}translate-135.png) 16 16, nwse-resize`,
    TRANSLATE_157:  `url(${FOLDER_CURSORS}translate-157.png) 16 16, nwse-resize`,

    ZOOM:           `url(${FOLDER_CURSORS}magnify.png) 16 16, zoom-in`,
}

// https://www.ios-resolution.com
// https://en.wikipedia.org/wiki/Graphics_display_resolution

export const SCREEN_RATIOS = [
    { name: 'Default',          width: 1000,    height: 500,    pixelRatio: 1 },
    { name: 'iPhone 14',        width: 844,     height: 390,    pixelRatio: 3 },
    { name: 'iPad 10th gen',    width: 1180,    height: 820,    pixelRatio: 2 },
    { name: 'Monitor (HDTV)',   width: 1920,    height: 1080,   pixelRatio: 1 },
    { name: 'Monitor (SVGA)',   width: 800,     height: 600,    pixelRatio: 1 },
];

/******************** VIEW */

export const MOUSE_MODES = {
    SELECT:             'select',
    MOVE:               'move',
    ZOOM:               'zoom',
};

export const MOUSE_STATES = {
    NONE:               'none',
    CLICKING:           'clicking',
    DOLLY:              'zooming',
    PANNING:            'panning',
    ROTATING:           'rotating',
    SELECTING:          'selecting',
    TRANSFORMING:       'transforming',
    DRAGGING:           'dragging',
    PAINTING:           'painting',
};

export const COLORS = {
    BACKGROUND:             SUEY.TRAIT.BACKGROUND_DARK,
    GRID_INFINITE:          SUEY.TRAIT.ICON_LIGHT,
    OUTLINE_VISIBLE:        SUEY.TRAIT.ICON,
    OUTLINE_HIDDEN:         SUEY.TRAIT.TRIADIC1,
    SELECTION:              SUEY.TRAIT.ICON_LIGHT,
    TRANSFORM_CROSS:        SUEY.TRAIT.HIGHLIGHT,
    TRANSFORM_HIGHLIGHT:    SUEY.TRAIT.ICON,
    WIREFRAME:              SUEY.TRAIT.HIGHLIGHT,
    X_COLOR:                SUEY.TRAIT.TRIADIC1,
    Y_COLOR:                SUEY.TRAIT.TRIADIC2,
    Z_COLOR:                SUEY.TRAIT.COMPLEMENT,
};
