import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class PositionWorldCommand extends Command {

    constructor(world, newX = 0, newY = 0) {
        super();

        this.type = 'PositionWorldCommand';
        this.name = 'Change World Position';
        this.world = world;

        if (!world || !world.isWorld) {
            this.valid = false;
            return;
        }

        this.newX = parseFloat(newX);
        this.newY = parseFloat(newY);
        this.oldX = world.xPos;
        this.oldY = world.yPos;
    }

    execute() {
        this.world.xPos = this.newX;
        this.world.yPos = this.newY;
        Signals.dispatch('transformsChanged', [ this.world ]);
    }

    undo() {
        this.world.xPos = this.oldX;
        this.world.yPos = this.oldY;
        Signals.dispatch('transformsChanged', [ this.world ]);
    }

    update(command) {
        this.newX = command.newX;
        this.newY = command.newY;
    }

}

export { PositionWorldCommand };
