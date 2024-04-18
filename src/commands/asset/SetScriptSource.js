import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetScriptSourceCommand extends Command {

    constructor(script, newSource, newErrors) {
        super();
        this.type = 'SetScriptSourceCommand';
        this.brief = `Set Script Source`;
        this.updatable = true;

        this.script = script;

        this.oldSource = (script !== undefined) ? script.source : undefined;
        this.newSource = newSource;

        this.oldErrors = (script !== undefined) ? script.errors : false;
        this.newErrors = newErrors;
    }

    execute() {
        this.script.source = this.newSource;
        this.script.errors = this.newErrors;
        Signals.dispatch('assetChanged', 'script', this.script);
    }

    undo() {
        this.script.source = this.oldSource;
        this.script.errors = this.oldErrors;
        Signals.dispatch('assetChanged', 'script', this.script);
    }

    update(cmd) {
        this.newSource = cmd.newSource;
        this.newErrors = cmd.newErrors;
    }

}

export { SetScriptSourceCommand };
