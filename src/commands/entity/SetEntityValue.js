import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetEntityValueCommand extends Command {

    constructor(entity, attributeName, newValue, recursive = false) {
        super();
        this.type = 'SetValueCommand';
        this.brief = `Set Entity Value: ${attributeName}`;
        this.updatable = true;
        this.recursive = recursive;

        this.entity = entity;
        this.attributeName = attributeName;
        this.oldValue = (entity !== undefined) ? entity[attributeName] : undefined;
        this.newValue = newValue;
    }

    execute() {
        if (this.recursive) {
            this.entity.traverse((child) => { child[this.attributeName] = this.newValue; });
        } else {
            this.entity[this.attributeName] = this.newValue;
        }
        Signals.dispatch('entityChanged', this.entity);
        Signals.dispatch('sceneGraphChanged');
    }

    undo() {
        if (this.recursive) {
            this.entity.traverse((child) => { child[this.attributeName] = this.oldValue; });
        } else {
            this.entity[this.attributeName] = this.oldValue;
        }
        Signals.dispatch('entityChanged', this.entity);
        Signals.dispatch('sceneGraphChanged');
    }

    update(cmd) {
        this.newValue = cmd.newValue;
    }

}

export { SetEntityValueCommand };
