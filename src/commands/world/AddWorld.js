import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class AddWorldCommand extends Command {

    constructor(world) {
        super();

        // Cancel?
        if (!world || !world.isWorld) return this.cancel();

        // Properties
        this.world = world;
        this.wasAdded = false;

        // Brief
        this.brief = `Add World: ${world.name}`;
    }

    purge() {
        if (!this.wasAdded && this.world && this.world.dispose) {
            this.world.dispose();
        }
    }

    execute() {
        editor.project.addWorld(this.world)
        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = true;
    }

    undo() {
        editor.project.removeWorld(this.world)
        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = false;
    }

}

export { AddWorldCommand };
