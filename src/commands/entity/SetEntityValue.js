import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetEntityValueCommand extends Command {

    constructor(entity, attributeName, newValue, recursive = false) {
        super();

        // Cancel?
        if (!entity) return this.cancel(`SetEntityValueCommand: No entity provided`);

        // Properties
        this.entity = entity;
        this.attributeName = attributeName;
        this.oldValue = structuredClone(entity[attributeName]);
        this.newValue = structuredClone(newValue);
        this.recursive = recursive;
        this.updatable = true;

        // Brief
        this.setBrief(entity, attributeName, newValue);
    }

    setBrief(entity, attributeName, newValue) {
        const entityName = (attributeName === 'name') ? newValue : entity.name;
        const name = (typeof entityName === 'string' && entityName !== '') ? ` ("${entityName}")` : '';
        this.brief = `Set ${SUEY.Strings.capitalize(entity.type)}${name} Value: '${attributeName}'`;
    }

    setValue(value) {
        const attribute = this.attributeName;
        if (this.recursive) {
            this.entity.traverse((child) => setAttributeValue(child, attribute, value));
        } else {
            setAttributeValue(this.entity, attribute, value);
        }
    }

    execute() {
        this.setValue(this.newValue);
        Signals.dispatch('entityChanged', this.entity);
    }

    undo() {
        this.setValue(this.oldValue);
        Signals.dispatch('entityChanged', this.entity);
    }

    update(cmd) {
        this.newValue = structuredClone(cmd.newValue);
        if (this.attributeName === 'name') this.setBrief(this.entity, this.attributeName, this.newValue);
    }

}

export { SetEntityValueCommand };

/******************** INTERNAL ********************/

function setAttributeValue(object, attribute, value) {
    if (typeof object !== 'object') return;
    if (object[attribute] && typeof object[attribute].copy === 'function') {
        object[attribute].copy(value);
    } else {
        object[attribute] = structuredClone(value);
    }
}
