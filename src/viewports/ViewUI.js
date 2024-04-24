import {
    EDITOR_MODES,
    MOUSE_MODES,
    MOUSE_STATES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AbstractView } from './AbstractView.js';
import { ViewUIToolbar } from '../toolbars/ViewUIToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { SelectCommand } from '../commands/CommandList.js';

class ViewUI extends AbstractView {

    mode() { return EDITOR_MODES.WORLD_UI; }

    floaterFamily() {
        const floaters = [
            'assets',
            'inspector',
            'library',
            'outliner',
            'previewer',
            'shaper',
        ];
        return [ ...super.floaterFamily(), ...floaters ];
    }

    constructor() {
        super();
        const self = this;

        // Toolbar
        this.toolbar = new ViewUIToolbar(this);

        // Controls
        this.rubberBandBox = null;

        // Input
        this.mouseMode = MOUSE_MODES.SELECT;                    // left mouse button mode
        this.mouseState = MOUSE_STATES.NONE;                    // current mouse state
        this.mouseIsDown = false;                               // true when mouse down
        this.mouseDownButton = -1;                              // tracks button on last mouse down
        this.startSelection = [];                               // stores starting selection when mouse down with shift/ctrl
        this.dragStarted = false;                               // true when mouse has moved enough to start 'dragging'

    }

    /******************** VIEW ********************/

    cameraFocus() {
        //
        // TODO
        //
    }

    cameraReset(animate = true) {
        //
        // TODO
        //
    }

    gridSize() {
        //
        // TODO
        //
        return 0;
    }

}

export { ViewUI };
