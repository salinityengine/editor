import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class RemoveEntityCommand extends Command {

    constructor(entity) {
        super();

        // Cancel?
        if (!entity) return this.cancel(`RemoveEntityCommand: No entity provided`);
        if (!entity.parent && !entity.isWorld) return this.cancel(`RemoveEntityCommand: Entity has no parent`);

        // Properties
        this.entity = entity;
        this.parent = entity.parent;
        this.index = -1;
        this.project = editor.project;
        this.wasAdded = false;

        // Brief
        this.brief = `Remove Entity: "${entity.name}"`;
    }

    purge() {
        if (!this.wasAdded && this.entity && typeof this.entity.dispose === 'function') {
            this.entity.dispose();
        }
    }

    execute() {
        if (this.entity.isWorld) {
            this.project.removeWorld(this.entity);
        } else {
            this.index = this.parent.children.indexOf(this.entity);
            this.parent.removeEntity(this.entity);
            Signals.dispatch('entityChanged', this.entity);
            Signals.dispatch('entityChanged', this.parent);
        }

        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = false;
    }

    undo() {
        if (this.entity.isWorld) {
            this.project.addWorld(this.entity);
        } else {
            this.parent.addEntity(this.entity, this.index);
            Signals.dispatch('entityChanged', this.entity);
            Signals.dispatch('entityChanged', this.parent);
        }

        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = true;
    }

}

export { RemoveEntityCommand };
