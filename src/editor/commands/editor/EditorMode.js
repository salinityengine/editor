import { Command } from '../Command.js';
import { Config } from '../../config/Config.js';

class EditorModeCommand extends Command {

    constructor(mode) {
        super();

        this.type = 'EditorModeCommand';
        this.name = 'Change Editor Mode';

        this.newMode = mode;
        this.oldMode = Config.getKey('settings/editorMode');
    }

    execute() {
        signals.editorMode.dispatch(this.newMode);
    }

    undo() {
        signals.editorMode.dispatch(this.oldMode);
    }

}

export { EditorModeCommand };
