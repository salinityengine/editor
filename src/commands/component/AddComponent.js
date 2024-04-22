import * as SALT from 'engine';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class AddComponentCommand extends Command {

    constructor(entity, componentType, data = {}) {
        super();

        // Properties
        this.entity = entity;
        this.componentType = componentType;
        this.components = [];
        this.data = structuredClone(data);
        this.wasAdded = false;

        // Brief
        this.brief = `Add Component: ${componentType}`;
    }

    purge() {
        if (!this.wasAdded) {
            for (const component of this.components) {
                if (typeof component.dispose === 'function') component.dispose();
            }
        }
    }

    execute() {
        if (!this.entity) return;

        // First time, store list of newly added components
        if (this.components.length === 0) {
            const existingComponents = [...this.entity.components];
            this.entity.addComponent(this.componentType, this.data, true);
            for (let i = existingComponents.length; i < this.entity.components.length; i++) {
                const component = this.entity.components[i];
                this.components.push(component);
                Signals.dispatch('componentChanged', component);
            }
        // Re-attach components
        } else {
            for (const component of this.components) {
                this.entity.attachComponent(component);
                Signals.dispatch('componentChanged', component);
            }
        }

        this.wasAdded = true;
        Signals.dispatch('sceneGraphChanged');
    }

    undo() {
        if (!this.entity) return;
        if (this.components.length === 0) return;

        // Remove components
        for (const component of this.components) {
            this.entity.removeComponent(component);
            Signals.dispatch('componentChanged', component);
        }

        this.wasAdded = false;
        Signals.dispatch('sceneGraphChanged');
    }

}

export { AddComponentCommand };
