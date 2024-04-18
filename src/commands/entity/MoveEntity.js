import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class MoveEntityCommand extends Command {

    constructor(entity, newParent, newBefore) {
        super();
        this.type = 'MoveEntityCommand';
        this.brief = 'Move Entity';

        this.entity = entity;
        this.oldParent = (entity && entity.isEntity3D) ? entity.parent : undefined;
        this.oldIndex = (this.oldParent !== undefined) ? this.oldParent.children.indexOf(this.entity) : undefined;
        this.newParent = newParent;

        if (newBefore !== undefined) {
            this.newIndex = (newParent !== undefined) ? newParent.children.indexOf(newBefore) : undefined;
        } else {
            this.newIndex = (newParent !== undefined) ? newParent.children.length : undefined;
        }

        if (this.oldParent === this.newParent && this.newIndex > this.oldIndex) {
            this.newIndex--;
        }
        this.newBefore = newBefore;
    }

    moveEntity(parent, index) {
        const currentSelection = [...editor.selected];
        editor.selectEntities(/* none */);

        this.entity.changeParent(parent, index);
        Signals.dispatch('entityChanged', this.entity);
        if (this.oldParent) Signals.dispatch('entityChanged', this.oldParent);
        if (this.newParent) Signals.dispatch('entityChanged', this.newParent);
        Signals.dispatch('sceneGraphChanged');

        editor.selectEntities(currentSelection);
    }

    execute() {
        this.moveEntity(this.newParent, this.newIndex);
    }

    undo() {
        this.moveEntity(this.oldParent, this.oldIndex);
    }

}

export { MoveEntityCommand };
