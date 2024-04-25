import editor from 'editor';
import { Command } from '../Command.js';
import { Config } from '../../config/Config.js';
import { Signals } from '../../config/Signals.js';

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
        Signals.dispatch('changeEditorMode', this.newMode);
    }

    undo() {
        Signals.dispatch('changeEditorMode', this.oldMode);
    }

}

export { EditorModeCommand };
