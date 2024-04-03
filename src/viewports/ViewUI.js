import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { editor } from 'editor';

import { ViewUIToolbar } from '../toolbars/ViewUIToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
import { SelectCommand } from '../commands/Commands.js';

class ViewUI extends SUEY.Div {

    floaterFamily() {
        return [ 'advisor', 'codex', 'inspector' ];
    }

    viewportType() {
        return EDITOR.MODES.UI_EDITOR;
    }

    constructor() {
        super();
        const self = this;
        this.setClass('salt-viewport', 'suey-unselectable');

        // Toolbar
        this.toolbar = new ViewUIToolbar(this);

        /********** PROPERTIES */

        // Gui
        this.width = Math.max(2, this.getWidth());              // Width of dom element
        this.height = Math.max(2, this.getHeight());            // Height of dom element

        // Containers
        this.selected = [];                                     // Objects selected (can differ slightly from editor)

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

export { ViewUI };
