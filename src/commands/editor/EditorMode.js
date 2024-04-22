import editor from 'editor';
import { Command } from '../Command.js';
import { Config } from '../../config/Config.js';

class EditorModeCommand extends Command {

    constructor(mode) {
        super();

        // Properties
        this.newMode = mode;
        this.oldMode = Config.getKey('editor/mode');

        // Brief
        this.brief = `Change Editor Mode: ${mode}`;
    }

    execute() {
        editor.setMode(this.newMode);
    }

    undo() {
        editor.setMode(this.oldMode);
    }

}

export { EditorModeCommand };
