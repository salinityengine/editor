import * as SALT from 'engine';
import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

/** Select on 'execute' or 'undo' */
class SelectCommand extends Command {

    constructor(entityArray = [], oldSelectionArray = []) {
        super();
        this.type = 'SelectCommand';

        // Properties
        this.newSelection = Array.isArray(entityArray) ? [...entityArray] : [ entityArray ];
        this.oldSelection = Array.isArray(oldSelectionArray) ? [...oldSelectionArray] : [ oldSelectionArray ];

        // Command Brief
        this.brief = 'Select Entities';
        if (this.newSelection.length === 0) {
            this.brief = 'Select None';
        } else if (this.newSelection.length === 1) {
            const entity = this.newSelection[0];
            this.brief = `Select ${entity.type}: ${entity.name}`;
        }

        // Cancel command if no change to selection
        if (SALT.Arrays.compareEntityArrays(entityArray, oldSelectionArray)) {
            this.valid = false;
        }
    }

    invalid() {
        Signals.dispatch('selectionChanged');
    }

    execute() {
        editor.selectEntities(this.newSelection);
    }

    undo() {
        editor.selectEntities(this.oldSelection);
    }

}

export { SelectCommand };
