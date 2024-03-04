import * as SALT from 'engine';
import { Command } from './Command.js';

class MultiCmdsCommand extends Command {

    constructor(commands = [], name = undefined, onExecute, onUndo) {
        super();

        this.type = 'MultiCmdsCommand';
        this.name = name ?? 'Multiple Changes';

        // Check cmds are 'valid'
        const cmds = [];
        for (const command of commands) {
            if (command.type === 'SelectCommand') command.valid = true; /* all 'Select' commands valid in MultiCmdsCommand */
            if (command.valid) {
                cmds.push(command);
            } else {
                command.invalid();
            }
        }

        // On Execute Callbacks
        this.onExecute = onExecute;
        this.onUndo = onUndo;

        // If only one command, return that command instead
        if (cmds.length === 0) {
            this.valid = false;
            return;
        } else if (cmds.length === 1 && !onExecute && !onUndo) {
            return cmds[0];
        } else {
            this.commands = cmds;
        }
    }

    purge() {
        for (const command of this.commands) command.purge();
    }

    execute() {
        this.process('execute');
        if (typeof this.onExecute === 'function') this.onExecute();
    }

    undo() {
        this.process('undo');
        if (typeof this.onUndo === 'function') this.onUndo();
    }

    process(type = 'execute') {
        // Disable All Change Signals
        signals.entityChanged.active = false;
        signals.transformsChanged.active = false;
        signals.sceneGraphChanged.active = false;

        // Changed Entity Lists
        const commandTypes = {};
        const entitiesChanged = [];
        const transformsChanged = [];

        function addToChangedArray(changedArray, entity) {
            if (!entity || !entity.isEntity3D || !Array.isArray(changedArray)) return;
            if (SALT.EntityUtils.containsEntity(changedArray, entity) === false) changedArray.push(entity);
        }

        // Execute Commands
        for (let i = 0; i < this.commands.length; i++) {
            // Forwards, or backwards?
            const index = (type === 'execute') ? i : (this.commands.length - 1) - i;
            const command = this.commands[index];

            // Get Type
            if (commandTypes[command.type] === undefined) commandTypes[command.type] = command.type;

            // Perform Command Action
            if (type === 'execute') command.execute();
            if (type === 'undo') command.undo();

            // Collect list of entities that have been changed
            switch (command.type) {
                case 'SetPositionCommand':
                case 'SetRotationCommand':
                case 'SetScaleCommand':
                    addToChangedArray(transformsChanged, command.entity);
                    break;
                case 'AddEntityCommand':
                case 'RemoveEntityCommand':
                    addToChangedArray(entitiesChanged, command.entity);
                    addToChangedArray(entitiesChanged, command.parent);
                    break;
                case 'MoveEntityCommand':
                    addToChangedArray(entitiesChanged, command.entity);
                    addToChangedArray(entitiesChanged, command.oldParent);
                    addToChangedArray(entitiesChanged, command.newParent);
                    break;
                case 'CallbackEntityCommand':
                case 'SetCopyCommand':
                case 'SetUUIDCommand':
                case 'SetValueCommand':
                    addToChangedArray(entitiesChanged, command.entity);
                    break;
            }
        }

        // // Entity Changed Signal
        signals.entityChanged.active = true;
        for (const entity of entitiesChanged) {
            signals.entityChanged.dispatch(entity);
        }

        // Transforms Changed Signal
        signals.transformsChanged.active = true;
        signals.transformsChanged.dispatch(transformsChanged);

        // Scene Graph Signal
        signals.sceneGraphChanged.active = true;
        signals.sceneGraphChanged.dispatch();

        // // DEBUG: Show command types in this MultiCmd
        // console.group(`MultiCmdsCommand Execute, Qty: ${this.commands.length}`);
        // for (const cmdType in commandTypes) console.log(`Command Type: ${commandTypes[cmdType]}`);
        // console.groupEnd();
        // //
    }

}

export { MultiCmdsCommand };
