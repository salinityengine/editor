import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class RemoveComponentCommand extends Command {

    constructor(entity, component) {
        super();
        this.type = 'RemoveComponentCommand';
        this.brief = `Remove Component: ${component.type}`;

        this.entity = entity;
        this.componentType = component.type;
        this.component = component;

        this.data = component.toJSON();

        this.wasAdded = false;
    }

    purge() {
        if (!this.wasAdded) {
            this.component.dispose();
        }
    }

    execute() {
        if (!this.entity) return;

        this.entity.removeComponent(this.component);

        this.wasAdded = false;

        Signals.dispatch('componentChanged', this.component);
        Signals.dispatch('sceneGraphChanged');
        Signals.dispatch('inspectorRefresh');
    }

    undo() {
        if (!this.entity) return;

        this.entity.attachComponent(this.component);

        this.wasAdded = true;

        Signals.dispatch('componentChanged', this.component);
        Signals.dispatch('sceneGraphChanged');
        Signals.dispatch('inspectorRefresh');
    }

}

export { RemoveComponentCommand };
