import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { editor } from 'editor';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class AbstractView extends SUEY.Panel {

    floaterFamily() {
        return [ 'advisor', 'inspector' ];
    }

    viewportType() {
        // return EDITOR.MODES...
        return 'abstract';
    }

    constructor() {
        super();
        const self = this;
        this.setClass('salt-viewport');
        this.addClass('suey-unselectable');

        /******************** TOOLBAR */

        // this.add(new Toolbar(this));

        /******************** PROPERTIES */

        // Containers
        this.selected = [];                                     // Objects selected (can differ slightly from editor)
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
        // editor.execute(new SelectCommand([], editor.selected));
    }

}

export { AbstractView };
