import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetStageCommand extends Command {

    constructor(worldType, stage, world) {
        super();

        // Cancel?
        const viewport = editor.viewport(worldType);
        if (!viewport) return this.cancel();

        // Properties
        this.viewport = viewport;
        this.newWorld = undefined;
        this.newStage = undefined;
        this.oldWorld = undefined;
        this.oldStage = undefined;
        const viewWorld = viewport.getWorld();
        if (world === undefined) {
            world = (stage && stage.isStage && stage.parent) ? stage.parent : viewWorld;
        }
        this.newStage = (stage && stage.isStage) ? stage.uuid : null;
        this.newWorld = (world && world.isWorld) ? world.uuid : null;
        if (viewWorld && viewWorld.isWorld) {
            this.oldStage = viewWorld.activeStage().uuid;
            this.oldWorld = viewWorld.uuid;
        }

        // Brief
        this.brief = 'Set Stage';
    }

    setWorld(worldUUID, stageUUID) {
        // Set World
        const world = editor.project.getWorldByUUID(worldUUID);

        // Set Stage
        if (world && world.isWorld) {
            this.viewport.setWorld(world);
            const stage = world.getStageByUUID(stageUUID);
            world.setActiveStage(stage);
            Signals.dispatch('stageChanged');
        }
    }

    execute() {
        this.setWorld(this.newWorld, this.newStage);
    }

    undo() {
        this.setWorld(this.oldWorld, this.oldStage);
    }

}

export { SetStageCommand };
