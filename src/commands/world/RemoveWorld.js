import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class RemoveWorldCommand extends Command {

    constructor(world) {
        super();

        // Cancel if 'world' is not valid
        if (!world || !world.isWorld) {
            this.valid = false;
            return;
        }

        // Cancel if 'world' is not in Project
        const checkWorld = editor.project.getWorldByUUID(world.uuid);
        if (!checkWorld || !checkWorld.isWorld) {
            this.valid = false;
            return;
        }

        this.type = 'RemoveWorldCommand';
        this.name = `Remove World: ${world.name}`;
        this.world = world;

        this.wasAdded = false;
    }

    purge() {
        if (!this.wasAdded && this.world && this.world.dispose) {
            this.world.dispose();
        }
    }

    execute() {
        editor.project.removeWorld(this.world)
        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = false;
    }

    undo() {
        editor.project.addWorld(this.world)
        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = true;
    }

}

export { RemoveWorldCommand };
