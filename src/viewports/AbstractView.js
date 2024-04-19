import {
    EDITOR_MODES,
    MOUSE_MODES,
    MOUSE_STATES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class AbstractView extends SUEY.Div {

    /** Set from EDITOR_MODES */
    mode() { return 'abstract'; }

    /** Allowed floaters */
    floaterFamily() {
        const floaters = [
            'advisor',
            'player',
            'game',
            'notepad',
            'history',
            'settings',
        ];
        return floaters;
    }

    /** World edit type */
    worldType() { return 'None'; }

    constructor() {
        super();
        this.setClass('salt-viewport');
        this.setStyle('display', 'none');               // important! needed for initial editor.setMode()

        this.toolbar = null;                            // to be added to editor.toolbar.middle
        this.selected = [];                             // selection can differ from editor
        this.worlds = [];                               // open worlds
    }

    /******************** ACTIVATION ********************/

    /** These functions run when editor.setMode() is switched to/from a Viewport */

    activate() {

    }

    deactivate() {

    }

    /******************** CLIPBOARD / EDIT ********************/

    cut() {
        console.warn(`${this.constructor.name}.cut(): Method must be reimplemented from AbstractView`);
    }

    paste() {
        console.warn(`${this.constructor.name}.paste(): Method must be reimplemented from AbstractView`);
    }

    duplicate(key) {
        console.warn(`${this.constructor.name}.duplicate(): Method must be reimplemented from AbstractView`);
    }

    delete() {
        console.warn(`${this.constructor.name}.delete(): Method must be reimplemented from AbstractView`);
    }

    selectAll() {
        console.warn(`${this.constructor.name}.selectAll(): Method must be reimplemented from AbstractView`);
    }

    selectNone() {
        console.warn(`${this.constructor.name}.selectNone(): Method must be reimplemented from AbstractView`);
    }

    /******************** VIEW ********************/

    cameraFocus() {
        console.warn(`${this.constructor.name}.cameraFocus(): Method must be reimplemented from AbstractView`);
    }

    cameraReset() {
        console.warn(`${this.constructor.name}.cameraReset(): Method must be reimplemented from AbstractView`);
    }

    gridSize() {
        console.warn(`${this.constructor.name}.gridSize(): Method must be reimplemented from AbstractView`);
        return 0;
    }

    /******************** WORLDS ********************/

    //
    // TODO: Support multiple worlds
    //

    getWorld() {
        if (this.worlds.length > 0) return this.worlds[0];
    }

    setWorld(world) {
        if (!world || !world.isWorld || world.type !== this.worldType()) return;
        this.worlds[0] = world;
    }

}

export { AbstractView };
