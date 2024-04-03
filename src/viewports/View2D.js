import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { editor } from 'editor';

import { View2DToolbar } from '../toolbars/View2DToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
import { SelectCommand } from '../commands/Commands.js';

class View2D extends SUEY.Div {

    floaterFamily() {
        return [ 'advisor', 'codex', 'inspector' ];
    }

    viewportType() {
        return EDITOR.MODES.SCENE_EDITOR_2D;
    }

    constructor() {
        super();
        const self = this;
        this.addClass('salt-viewport', 'suey-unselectable');

        /******************** TOOLBAR */

        // this.add(new View2DToolbar(this));

        /******************** PROPERTIES */

        // Forward Function Declarations
        this.addSprites = function() {};                        // Adds sprites to empty entities

        // Gui
        this.width = Math.max(2, this.getWidth());              // Width of dom element
        this.height = Math.max(2, this.getHeight());            // Height of dom element

        // Containers
        this.selected = [];                                     // Objects selected (can differ slightly from editor)

        // Objects
        this.camera = null;
        this.cameraMode = undefined;

        // Controls
        this.rubberBandBox = null;

        // Input
        this.mouseMode = EDITOR.MOUSE_MODES.SELECT;             // Left mouse button mode
        this.mouseState = EDITOR.MOUSE_STATES.NONE;             // Current mouse state
        this.mouseIsDown = false;                               // True when mouse down
        this.mouseDownButton = -1;                              // Tracks button on last mouse down
        this.startSelection = [];                               // Stores starting selection when mouse down with shift/ctrl
        this.dragStarted = false;                               // True when mouse has moved enough to start 'dragging'
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
        // Store dimensions
        this.width = Math.max(2, this.getWidth() * window.devicePixelRatio);
        this.height = Math.max(2, this.getHeight() * window.devicePixelRatio);
    }

    /******************** CLIPBOARD / EDIT ********************/

    cut() {
        // SceneUtils.deleteSelection('Cut' /* commandName */);
    }

    paste() {
        // SceneUtils.duplicateSelection(null, editor.clipboard.items, true /* force copy */, 'Paste');
    }

    duplicate(key) {
        // SceneUtils.duplicateSelection(key);
    }

    delete() {
        // SceneUtils.deleteSelection();
    }

    selectAll() {
        // const activeEntities = this.world.activeStage().getEntities(false /* includeStages */);
        // editor.execute(new SelectCommand(activeEntities, editor.selected));
    }

    selectNone() {
        editor.execute(new SelectCommand([], editor.selected));
    }

}

export { View2D };
