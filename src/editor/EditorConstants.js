// Modes
export const MODES = {
    SCENE_EDITOR_2D:    'edit2d',
    SCENE_EDITOR_3D:    'edit3d',
    SOUND_EDITOR:       'sound',
    UI_EDITOR:          'ui',
    WORLD_GRAPH:        'world',
}

// Colors
export const THEMES = {
    CLASSIC:            0x00b4af,               // (  0, 180, 175)      classic (aqua)
    STEEL:              0x00c8c3,               // (  0, 200, 195)      light aqua (fully unsaturated)
    NAVY:               0x1a48cf,               // ( 26,  72, 207)      violet blue (navy)
    GRAPE:              0x960ef4,               // (150,  14, 244)      electric violet (purple)
    FLAMINGO:           0xff13ed,               // (255,  19, 237)      fuchsia (hot pink)
    RUST:               0xaf1c19,               // (175,  28,  25)      carnelian (dark red)
    CARROT:             0xfe7700,               // (254, 119,   0)      burnt orange
    COFFEE:             0xb16f1b,               // (177, 111,  27)      copper (brown)
    GOLDEN:             0xd1d855,               // (209, 216,  85)      faded yellow
    EMERALD:            0x1aca22,               // ( 26, 202,  34)      lime green (emerald)
    RANDOM:             -1,
};

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
export const FOLDER_ASSETS =    './files/assets/';
export const FOLDER_CURSORS =   './files/cursors/';
export const FOLDER_LOGO =      './files/logo/';

// Editor Images
export const FOLDER_GROUPS =    './files/editor/groups/';
export const FOLDER_INSPECTOR = './files/editor/inspector/';
export const FOLDER_MENU =      './files/editor/menu/';
export const FOLDER_TOOLBAR =   './files/editor/toolbar/';
export const FOLDER_TYPES =     './files/editor/types/';

// Component Icons
export const COMPONENT_ICONS = {
    // Entity3D
    'geometry':     `${FOLDER_TYPES}component/geometry.svg`,        // rgb(255, 113, 0)
    'material':     `${FOLDER_TYPES}component/material.svg`,        // rgb(165, 243, 0)
    'mesh':         `${FOLDER_TYPES}component/mesh.svg`,            // #F7DB63
    'rigidbody':    `${FOLDER_TYPES}component/rigidbody.svg`,       // #1365C2
    'script':       `${FOLDER_TYPES}component/script.svg`,          // #6E6FFD
    'sprite':       `${FOLDER_TYPES}component/sprite.svg`,          // #5978F2
    'test':         `${FOLDER_TYPES}component/test.svg`,            // rgb(128, 128, 128)
    // World3D
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
