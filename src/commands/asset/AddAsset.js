import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class AddAssetCommand extends Command {

    constructor(asset) {
        super();

        // Cancel?
        if (!asset || !asset.uuid) return this.cancel(`AddAssetCommand: Missing or invalid asset provided`);

        // Properties
        this.asset = asset;
        this.assetType = SALT.AssetManager.checkType(asset);
        this.wasAdded = false;

        // Brief
        this.brief = `Add ${SUEY.Strings.capitalize(this.assetType)}`;
        if (asset.name && asset.name !== '') this.brief += `: ${asset.name}`;
    }

    invalid() {
        this.purge();
    }

    purge() {
        if (!this.wasAdded && typeof this.asset.dispose === 'function') this.asset.dispose();
    }

    execute() {
        if (!SALT.AssetManager.get(this.asset.uuid)) {
            SALT.AssetManager.add(this.asset);
            this.wasAdded = true;
            Signals.dispatch('assetAdded', this.assetType, this.asset);
        }
    }

    undo() {
        if (this.wasAdded) {
            SALT.AssetManager.remove(this.asset, false /* dispose */);
            this.wasAdded = false;
            Signals.dispatch('assetRemoved', this.assetType, this.asset);
        }
    }

}

export { AddAssetCommand };
