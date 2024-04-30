import * as SALT from 'engine';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class ChangeComponentCommand extends Command {

    constructor(component, newData = {}, optionalOldData = undefined) {
        super();

        // Cancel?
        if (!entity) return this.cancel(`AddComponentCommand: No entity provided`);

        // Properties
        this.entity = component.entity;
        this.componentType = component.type;
        this.componentIndex = this.entity.getComponentsWithProperties('type', this.componentType).indexOf(component);
        this.updatable = true;

        // Sanitize data
        this.newData = {};
        SALT.ComponentManager.sanitizeData(component.type, newData);
        for (let key in newData) this.newData[key] = newData[key];
        this.oldData = {};
        if (!optionalOldData) optionalOldData = component.toJSON();
        for (let key in optionalOldData) this.oldData[key] = optionalOldData[key];

        // Brief
        this.brief = `Change Component: ${component.type}`;
    }

    purge() {
        this.newData = null;
        this.oldData = null;
    }

    execute() {
        const component = this.entity.getComponentsWithProperties('type', this.componentType)[this.componentIndex];
        component.detach();
        component.init(this.newData);
        component.attach();
        Signals.dispatch('componentChanged', component);
    }

    undo() {
        const component = this.entity.getComponentsWithProperties('type', this.componentType)[this.componentIndex];
        component.detach();
        component.init(this.oldData);
        component.attach();
        Signals.dispatch('componentChanged', component);
    }

    update(command) {
        this.newData = {};
        SALT.ComponentManager.sanitizeData(this.componentType, command.newData);
        for (const key in command.newData) this.newData[key] = command.newData[key];
    }

}

export { ChangeComponentCommand };
