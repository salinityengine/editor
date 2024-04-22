import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetEntityValueCommand extends Command {

    constructor(entity, attributeName, newValue, recursive = false) {
        super();

        // Properties
        this.entity = entity;
        this.attributeName = attributeName;
        this.oldValue = (entity !== undefined) ? entity[attributeName] : undefined;
        this.newValue = newValue;
        this.recursive = recursive;
        this.updatable = true;

        // Brief
        this.brief = `Set Entity Value: ${attributeName}`;
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
        Signals.dispatch('sceneGraphChanged');
    }

    undo() {
        this.setValue(this.oldValue);
        Signals.dispatch('entityChanged', this.entity);
        Signals.dispatch('sceneGraphChanged');
    }

    update(cmd) {
        this.newValue = cmd.newValue;
    }

}

export { SetEntityValueCommand };

/******************** INTERNAL ********************/

function setAttributeValue(object, attribute, value) {
    if (typeof object !== 'object') return;
    if (object[attribute] && typeof object[attribute].copy === 'function') {
        object[attribute].copy(value);
    } else {
        object[attribute] = value;
    }
}
