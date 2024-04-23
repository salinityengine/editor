import {
    EDITOR_MODES,
    MOUSE_MODES,
    MOUSE_STATES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AbstractView } from './AbstractView.js';
import { View2DToolbar } from '../toolbars/View2DToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { SelectCommand } from '../commands/CommandList.js';

class View2D extends AbstractView {

    mode() { return EDITOR_MODES.WORLD_2D; }

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
        this.toolbar = new View2DToolbar(this);

        // Objects
        this.camera = null;

        // Controls
        this.rubberBandBox = null;

        // Input
        this.mouseMode = MOUSE_MODES.SELECT;                    // left mouse button mode
        this.mouseState = MOUSE_STATES.NONE;                    // current mouse state
        this.mouseIsDown = false;                               // true when mouse down
        this.mouseDownButton = -1;                              // tracks button on last mouse down
        this.startSelection = [];                               // stores starting selection when mouse down with shift/ctrl
        this.dragStarted = false;                               // true when mouse has moved enough to start 'dragging'

        /******************** EVENTS ********************/

        this.on('pointerdown', (event) => viewportPointerDown(self, event));
        this.on('pointermove', (event) => viewportPointerMove(self, event));
        this.on('pointerup', (event) => viewportPointerUp(self, event));
        this.on('keydown', (event) => viewportKeyDown(self, event));
        this.on('keyup', (event) => viewportKeyUp(self, event));

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

    /******************** VIEW ********************/

    cameraFocus() {
        //
        // TODO
        //
    }

    cameraReset() {
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

export { View2D };

/******************** INTERNAL: POINTER ********************/

function viewportPointerDown(viewport, event) {

    // Clear Preview
    if (editor.selected.length === 0) Signals.dispatch('assetSelect');

}

function viewportPointerMove(viewport, event) {

}

function viewportPointerUp(viewport, event) {

}

/******************** INTERNAL: KEYBOARD ********************/

function viewportKeyDown(viewport, event) {

}

function viewportKeyUp(viewport, event) {

}
