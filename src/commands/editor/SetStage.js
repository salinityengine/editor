import { Command } from '../Command.js';

class SetStageCommand extends Command {

    constructor(stage, world) {
        super();

        this.type = 'SetStageCommand';
        this.name = 'Set Stage';

        const viewWorld = editor.viewport.world;

        this.newWorld = undefined;
        this.newStage = undefined;
        this.oldWorld = undefined;
        this.oldStage = undefined;

        if (world === undefined) {
            world = (stage && stage.isStage && stage.parent) ? stage.parent : viewWorld;
        }

        this.newStage = (stage && stage.isStage) ? stage.uuid : null;
        this.newWorld = (world && world.isWorld) ? world.uuid : null;

        if (viewWorld && viewWorld.isWorld) {
            this.oldStage = viewWorld.activeStage().uuid;
            this.oldWorld = viewWorld.uuid;
        }
    }

    setWorld(worldUUID, stageUUID) {
        // Set World
        const world = editor.project.getWorldByUUID(worldUUID);
        editor.viewport.world = world;

        // Set Stage
        if (world && world.isWorld) {
            const stage = world.getStageByUUID(stageUUID);
            editor.viewport.stage = stage;
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
