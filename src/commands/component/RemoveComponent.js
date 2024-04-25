import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class RemoveComponentCommand extends Command {

    constructor(entity, component) {
        super();

        // Cancel?
        if (!entity) return this.cancel(`AddComponentCommand: No entity provided`);
        if (!component) return this.cancel(`AddComponentCommand: No component provided`);

        // Properties
        this.entity = entity;
        this.componentType = component.type;
        this.component = component;
        this.data = component.toJSON();
        this.wasAdded = false;

        // Brief
        this.brief = `Remove Component: ${component.type}`;
    }

    purge() {
        if (!this.wasAdded && typeof this.component.dispose === 'function') {
            this.component.dispose();
        }
    }

    execute() {
        this.entity.removeComponent(this.component);
        this.wasAdded = false;
        Signals.dispatch('componentChanged', this.component);
    }

    undo() {
        this.entity.attachComponent(this.component);
        this.wasAdded = true;
        Signals.dispatch('componentChanged', this.component);
    }

}

export { RemoveComponentCommand };
