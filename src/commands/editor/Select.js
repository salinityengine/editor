import * as SALT from 'salt';
import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

/** Select on 'execute' or 'undo' */
class SelectCommand extends Command {

    constructor(newSelection = [], oldSelection = []) {
        super();

        // Cancel?
        if (SALT.ArrayUtils.compareThingArrays(newSelection, oldSelection)) return this.cancel();

        // Properties
        this.newSelection = Array.isArray(newSelection) ? [ ...newSelection ] : [ newSelection ];
        this.oldSelection = Array.isArray(oldSelection) ? [ ...oldSelection ] : [ oldSelection ];

        // Brief
        if (this.newSelection.length === 0) {
            this.brief = 'Select None';
        } else if (this.newSelection.length === 1) {
            const thing = this.newSelection[0];
            this.brief = `Select ${thing.type}: "${thing.name}"`;
        } else {
            this.brief = 'Select Things';
        }
    }

    purge() {
        Signals.dispatch('selectionChanged');
    }

    execute() {
        editor.selectThings(this.newSelection);
    }

    undo() {
        editor.selectThings(this.oldSelection);
    }

}

export { SelectCommand };
