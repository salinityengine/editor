import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetAssetValueCommand extends Command {

    constructor(asset, attributeName, newValue, updatable = true) {
        super();
        this.type = 'SetAssetValueCommand';
        this.brief = `Set Asset Value: ${attributeName}`;
        this.updatable = updatable;

        if (!asset) {
            this.valid = false;
            return;
        } else {
            this.asset = asset;
            this.assetType = SALT.AssetManager.checkType(asset);
            this.attributeName = attributeName;
            this.oldValue = asset[attributeName];
            this.newValue = newValue;
        }
    }

    execute() {
        this.asset[this.attributeName] = this.newValue;
        Signals.dispatch('assetChanged', this.assetType, this.asset);
    }

    redo() {
        this.execute();
        Signals.dispatch('inspectorBuild', this.asset);
    }

    undo() {
        this.asset[this.attributeName] = this.oldValue;
        Signals.dispatch('assetChanged', this.assetType, this.asset);
    }

    update(cmd) {
        this.newValue = cmd.newValue;
    }

}

export { SetAssetValueCommand };
