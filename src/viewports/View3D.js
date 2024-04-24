import {
    EDITOR_MODES,
    MOUSE_MODES,
    MOUSE_STATES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AbstractView } from './AbstractView.js';
import { View3DToolbar } from '../toolbars/View3DToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { SelectCommand } from '../commands/CommandList.js';

class View3D extends AbstractView {

    mode() { return EDITOR_MODES.WORLD_3D; }

    floaterFamily() {
        const floaters = [
            'assets',
            'codex',
            'inspector',
            'library',
            'outliner',
            'previewer',
            'scripter',
            'shaper',
        ];
        return [ ...super.floaterFamily(), ...floaters ];
    }

    constructor() {
        super();
        const self = this;

        // Toolbar
        this.toolbar = new View3DToolbar(this);

        /********** PROPERTIES */

        // Forward Function Declarations
        this.addSprites = function() {};                        // adds sprites to empty entities

        // Gui
        this.width = Math.max(2, this.getWidth());              // width of dom element
        this.height = Math.max(2, this.getHeight());            // height of dom element

        // Objects
        this.camera = null;
        this.cameraMode = undefined;

        // Controls
        this.rubberBandBox = null;

        // Input
        this.mouseMode = MOUSE_MODES.SELECT;                    // left mouse button mode
        this.mouseState = MOUSE_STATES.NONE;                    // current mouse state
        this.mouseIsDown = false;                               // true when mouse down
        this.mouseDownButton = -1;                              // tracks button on last mouse down
        this.startSelection = [];                               // stores starting selection when mouse down with shift/ctrl
        this.dragStarted = false;                               // true when mouse has moved enough to start 'dragging'

        /******************** SIGNALS ********************/

        // Project Loaded
        Signals.connect(this, 'projectLoaded', () => {
            self.cameraReset();
        });

    }

    /******************** FRAME ********************/

    animate() {
        const self = this;

        if (this.isDisplayed()) {
            // Start render timer
            const startTime = performance.now();

            // Render (ViewportRender.js)
            this.render();

            // End render timer, dispatch signal
            Signals.dispatch('sceneRendered', performance.now() - startTime);
        }

        // Ask for another animation frame immediately
        requestAnimationFrame(() => self.animate());
    }

    /******************** RESIZE ********************/

    resize() {
        this.width = Math.max(2, this.getWidth() * window.devicePixelRatio);
        this.height = Math.max(2, this.getHeight() * window.devicePixelRatio);
    }

}

export { View3D };
