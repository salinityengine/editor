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

    /** Allowed floaters */
    floaterFamily() {
        const floaters = [
            'advisor',
            'player',
            'project',
            'history',
            'settings',
        ];
        return floaters;
    }

    /** Viewport's EDITOR_MODES mode */
    viewportMode() {
        return 'abstract';
    }

    constructor() {
        super();
        this.setClass('salt-viewport');
        this.setStyle('display', 'none');               // important! needed for initial editor.setMode()

        // Properties
        this.toolbar = null;                            // to be added to editor.toolbar.middle
        this.selected = [];                             // selection can differ from editor
    }

    /******************** ACTIVATION********************/

    // These functions run when editor.setMode() is switched to/from a viewport

    activate() {

    }

    deactivate() {

    }

    /******************** CLIPBOARD / EDIT ********************/

    // These are menu/keyboard edit functions to be implemented in a viewport

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
