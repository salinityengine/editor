import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetAssetCopyCommand extends Command {

    constructor(asset, attributeName, newValue, updatable = true) {
        super();

        this.type = 'SetAssetCopyCommand';
        this.name = `Set Asset Value: ${attributeName}`;
        this.updatable = updatable;

        if (!asset || typeof newValue.copy !== 'function') {
            this.valid = false;
            return;
        }

        this.asset = asset;
        this.assetType = SALT.AssetManager.checkType(asset);
        this.attributeName = attributeName;
        this.oldValue = new newValue.constructor().copy(asset[attributeName]);
        this.newValue = new newValue.constructor().copy(newValue);
    }

    execute() {
        this.asset[this.attributeName].copy(this.newValue);
        Signals.dispatch('assetChanged', this.assetType, this.asset);
    }

    redo() {
        this.execute();
        Signals.dispatch('inspectorBuild', this.asset);
    }

    undo() {
        this.asset[this.attributeName].copy(this.oldValue);
        Signals.dispatch('assetChanged', this.assetType, this.asset);
    }

    update(cmd) {
        this.newValue.copy(cmd.newValue);
    }

}

export { SetAssetCopyCommand };
