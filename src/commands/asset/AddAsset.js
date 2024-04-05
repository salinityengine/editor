import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class AddAssetCommand extends Command {

    constructor(asset) {
        super();

        this.type = 'AddAssetCommand';

        this.assetType = SALT.AssetManager.checkType(asset);
        this.name = `Add ${SUEY.Strings.capitalize(this.assetType)}`;
        if (asset.name && asset.name !== '') this.name += `: ${asset.name}`;

        this.asset = asset;
        this.wasAdded = false;

        // Cancel if no uuid
        if (!asset.uuid) {
            this.valid = false;
            console.warn(`AddAssetCommand.constructor(): Asset has no uuid, asset is as follows:`);
            console.log(asset);
        }
    }

    invalid() {
        this.purge();
    }

    purge() {
        if (!this.wasAdded && this.asset && typeof this.asset.dispose === 'function') this.asset.dispose();
    }

    execute() {
        if (!SALT.AssetManager.get(this.asset.uuid)) {
            SALT.AssetManager.add(this.asset);
            this.wasAdded = true;
            Signals.dispatch('assetAdded', this.assetType, this.asset);
            Signals.dispatch('assetSelect', this.assetType, this.asset);
            Signals.dispatch('inspectorClear');
        }
    }

    undo() {
        if (this.wasAdded) {
            SALT.AssetManager.remove(this.asset, false /* dispose */);
            this.wasAdded = false;
            Signals.dispatch('assetRemoved', this.assetType, this.asset);
            Signals.dispatch('inspectorClear');
        }
    }

}

export { AddAssetCommand };
