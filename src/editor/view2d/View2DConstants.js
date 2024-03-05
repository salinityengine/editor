import * as SUEY from 'gui';

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

export const STYLING = {
    EDGE_GLOW:          4.5,        // Amount of glow in OutlinePass
    GRID_SIZE:          2.2,        // How far out to render momentary InfiniteGrid
    RECT_BOX_WIDTH:     2.5,        // Thickness of line around transformMode() === 'rect'
}
