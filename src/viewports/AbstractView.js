import {
    EDITOR_MODES,
    MOUSE_MODES,
    MOUSE_STATES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class AbstractView extends SUEY.Div {

    /** Set from EDITOR_MODES */
    mode() { return 'abstract'; }

    /** Allowed Floaters */
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

    constructor() {
        super();
        const self = this;
        this.setClass('salt-viewport');
        this.setStyle('display', 'none');               // important! needed for initial editor.setMode()

        this.isActive = false;

        this.toolbar = null;                            // to be added to editor.toolbar.middle
        this.selected = [];                             // selection can differ from editor
        this.worlds = [];                               // open worlds

        /***** SIGNALS */

        Signals.connect(this, 'projectLoaded', () => {
            self.setWorld(null);
            self.cameraReset(false /* animater? */);
        });
    }

    activate() {
        if (this.isActive !== true) {
            this.display();
            this.isActive = true;
        }
    }

    deactivate() {
        if (this.isActive) {
            this.hide();
            this.isActive = false;
        }
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

    cameraReset(animate = true) {
        console.warn(`${this.constructor.name}.cameraReset(): Method must be reimplemented from AbstractView`);
    }

    gridSize() {
        console.warn(`${this.constructor.name}.gridSize(): Method must be reimplemented from AbstractView`);
        return 0;
    }

    /******************** WORLDS ********************/

    getWorld() {
        //
        // TODO: Support multiple worlds
        //
        if (this.worlds.length > 0) return this.worlds[0];
    }

    setWorld(world) {
        if (world && world.isWorld && world.type === this.mode()) {
            this.worlds[0] = world;
        } else {
            this.worlds[0] = undefined;
        }
    }

}

export { AbstractView };
