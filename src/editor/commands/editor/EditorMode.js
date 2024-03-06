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
        editor.setMode(this.newMode);
    }

    undo() {
        editor.setMode(this.oldMode);
    }

}

export { EditorModeCommand };
