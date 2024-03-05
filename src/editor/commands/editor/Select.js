import * as SALT from 'engine';
import { Command } from '../Command.js';

/** Select on 'execute' or 'undo' */
class SelectCommand extends Command {

    constructor(entityArray = [], oldSelectionArray = []) {
        super();
        this.type = 'SelectCommand';

        // Properties
        this.newSelection = Array.isArray(entityArray) ? [...entityArray] : [ entityArray ];
        this.oldSelection = Array.isArray(oldSelectionArray) ? [...oldSelectionArray] : [ oldSelectionArray ];

        // Command Naming
        this.name = 'Select Entities';
        if (this.newSelection.length === 0) {
            this.name = 'Select None';
        } else if (this.newSelection.length === 1) {
            const entity = this.newSelection[0];
            this.name = `Select ${entity.type}: ${entity.name}`;
        }

        // // Cancel command if no change to selection
        // if (SALT.EntityUtils.compareArrayOfEntities(entityArray, oldSelectionArray)) {
        //     this.valid = false;
        // }
    }

    invalid() {
        signals.selectionChanged.dispatch();
    }

    execute() {
        editor.selectEntities(this.newSelection);
    }

    undo() {
        editor.selectEntities(this.oldSelection);
    }

}

export { SelectCommand };
