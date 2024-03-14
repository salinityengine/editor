import * as SUEY from 'gui';
import { Signals } from './Signals.js';

class History extends SUEY.Div {

    constructor() {
        super();
        const self = this;

        // Properties
        this.undos = [];
        this.redos = [];
        this.lastCmdTime = new Date();
        this.isDisabled = false;

        // Signals
        Signals.connect(this, 'playerStateChanged', function(state) {
            if (state === 'start') self.isDisabled = true;
            if (state === 'stop') self.isDisabled = false;
        });
    }

    /** Executes new command onto stack, clears old redo history */
    execute(cmd) {
        if (cmd.valid !== true) {
            cmd.invalid();
            return;
        }

        const lastCmd = this.undos[this.undos.length - 1];
        const timeDifference = new Date().getTime() - this.lastCmdTime.getTime();

        const isUpdatableCmd = lastCmd && lastCmd.updatable && cmd.updatable &&
            lastCmd.asset === cmd.asset &&
            lastCmd.component === cmd.component &&
            lastCmd.componentType === cmd.componentType &&
            lastCmd.componentIndex === cmd.componentIndex &&
            lastCmd.entity === cmd.entity &&
            lastCmd.type === cmd.type &&
            lastCmd.script === cmd.script &&
            lastCmd.attributeName === cmd.attributeName;

        let updateOnly = false;
        if (isUpdatableCmd) {
            updateOnly = updateOnly || cmd.type === 'ChangeComponentCommand';
            updateOnly = updateOnly || cmd.type === 'SetScriptSourceCommand';
            updateOnly = updateOnly || timeDifference < 500;
        }

        // Update Command
        if (updateOnly) {
            lastCmd.update(cmd);
            cmd = lastCmd;

        // Command is not updatable, add to history
        } else {
            this.undos.push(cmd);
            cmd.id = this.undos.length;
        }

        cmd.name = cmd.name;
        cmd.execute();
        cmd.inMemory = true;

        // Save last time this command was executed
        this.lastCmdTime = new Date();

        // Clearing all the redo-commands
        this.clearRedos();

        // Signal
        Signals.dispatch('historyChanged', cmd);
    }

    undo() {
        if (this.isDisabled) {
            alert('Undo/Redo disabled while scene is playing.');
            return;
        }

        Signals.toggle('inspectorBuild', editor.inspector.currentItem() !== 'settings' /* leave 'settings' */);

        let cmd = undefined;
        if (this.undos.length > 0) {
            cmd = this.undos.pop();
        }
        if (cmd !== undefined) {
            cmd.undo();
            this.redos.push(cmd);
            Signals.dispatch('historyChanged', cmd);
        }

        Signals.toggle('inspectorBuild', true);

        return cmd;
    }

    redo() {
        if (this.isDisabled) {
            alert('Undo/Redo disabled while scene is playing.');
            return;
        }

        Signals.toggle('inspectorBuild', editor.inspector.currentItem() !== 'settings' /* leave 'settings' */);

        let cmd = undefined;
        if (this.redos.length > 0) {
            cmd = this.redos.pop();
        }

        if (cmd !== undefined) {
            cmd.redo(); /* base class calls command.execute(), can be overridden */
            this.undos.push(cmd);
            Signals.dispatch('historyChanged', cmd);
        }

        Signals.toggle('inspectorBuild', true);

        return cmd;
    }

    goToState(id) {
        if (this.isDisabled) {
            alert('Undo/Redo disabled while scene is playing.');
            return;
        }

        Signals.toggle('sceneGraphChanged', false);
        Signals.toggle('historyChanged', false);

        let cmd = this.undos.length > 0 ? this.undos[this.undos.length - 1] : undefined;
        if (cmd === undefined || id > cmd.id) {
            cmd = this.redo();
            while (cmd !== undefined && id > cmd.id) {
                cmd = this.redo();
            }
        } else {
            while (true) {
                cmd = this.undos[this.undos.length - 1];
                if (cmd === undefined || id === cmd.id) break;
                this.undo();
            }
        }

        Signals.toggle('sceneGraphChanged', true);
        Signals.toggle('historyChanged', true);

        Signals.dispatch('sceneGraphChanged');
        Signals.dispatch('historyChanged', cmd);
    }

    clear() {
        this.clearUndos();
        this.clearRedos();
        Signals.dispatch('historyChanged');
    };

    clearUndos() {
        for (const undo of this.undos) undo.purge();
        this.undos = [];
    }

    clearRedos() {
        for (const redo of this.redos) redo.purge();
        this.redos = [];
    }

}

export { History };
