import * as SALT from 'engine';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class ChangeComponentCommand extends Command {

    constructor(component, newData = {}, optionalOldData = undefined) {
        super();
        this.type = 'ChangeComponentCommand';
        this.brief = `Change Component: ${component.type}`;
        this.updatable = true;

        this.entity = component.entity;
        this.componentType = component.type;
        this.componentIndex = this.entity.getComponentsWithProperties('type', this.componentType).indexOf(component);

        // Sanitize data
        this.newData = {};
        SALT.ComponentManager.sanitizeData(component.type, newData);
        for (let key in newData) this.newData[key] = newData[key];

        this.oldData = {};
        if (!optionalOldData) optionalOldData = component.toJSON();
        for (let key in optionalOldData) this.oldData[key] = optionalOldData[key];
    }

    purge() {
        this.newData = null;
        this.oldData = null;
    }

    execute() {
        // Get Component by Type / Index
        const component = this.entity.getComponentsWithProperties('type', this.componentType)[this.componentIndex];

        // Update Component
        component.detach();
        component.init(this.newData);
        component.attach();

        // Signals
        Signals.dispatch('componentChanged', component);
    }

    redo() {
        this.execute();
        Signals.dispatch('inspectorRefresh');
    }

    undo() {
        // Get Component by Type / Index
        const component = this.entity.getComponentsWithProperties('type', this.componentType)[this.componentIndex];

        // Update Component
        component.detach();
        component.init(this.oldData);
        component.attach();

        // Signals
        Signals.dispatch('componentChanged', component);
        Signals.dispatch('inspectorRefresh');
    }

    update(command) {
        this.newData = {};
        SALT.ComponentManager.sanitizeData(this.componentType, command.newData);
        for (const key in command.newData) this.newData[key] = command.newData[key];
    }

}

export { ChangeComponentCommand };
