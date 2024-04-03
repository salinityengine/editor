import { editor } from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class AddEntityCommand extends Command {

    constructor(entity, parent = undefined, index = -1, maintainWorldTransform = false) {
        super();

        this.type = 'AddEntityCommand';
        this.name = `Add Entity: ${entity.name}`;

        // Cancel if no Entity
        if (!entity) {
            this.valid = false;
            return;
        }

        this.entity = entity;
        this.parent = parent ?? editor.world.activeStage() ?? editor.world;
        this.index = (index === undefined || index === null) ? -1 : index;
        this.maintainWorldTransform = maintainWorldTransform;

        this.project = editor.project;

        this.wasAdded = false;
    }

    purge() {
        if (!this.wasAdded && this.entity && typeof this.entity.dispose === 'function') {
            this.entity.dispose();
        }
    }

    execute() {
        if (this.entity.isWorld) {
            this.project.addWorld(this.entity);
            Signals.dispatch('entityChanged', this.entity);
        } else {
            this.parent.addEntity(this.entity, this.index, this.maintainWorldTransform);
            Signals.dispatch('entityChanged', this.entity);
            Signals.dispatch('entityChanged', this.parent);
        }

        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = true;
    }

    undo() {
        if (this.entity.isWorld) {
            this.project.removeWorld(this.entity);
            Signals.dispatch('entityChanged', this.entity);
        } else {
            this.parent.removeEntity(this.entity);
            Signals.dispatch('entityChanged', this.entity);
            Signals.dispatch('entityChanged', this.parent);
        }

        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = false;
    }

}

export { AddEntityCommand };
