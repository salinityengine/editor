import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class RemoveAssetCommand extends Command {

    constructor(asset) {
        super();

        // Cancel?
        if (!asset || !asset.uuid) return this.cancel(`RemoveAssetCommand: Missing or invalid asset provided`);

        // Properties
        this.asset = asset;
        this.assetType = asset.type.toLowerCase();
        this.wasRemoved = false;

        // Brief
        this.brief = `Remove ${SUEY.Strings.capitalize(this.assetType)}`;
        if (asset.name && asset.name !== '') this.brief += `: "${asset.name}"`;
    }

    purge() {
        if (this.wasRemoved && this.asset && typeof this.asset.dispose === 'function') {
            this.asset.dispose();
        }
    }

    execute() {
        if (SALT.AssetManager.get(this.asset.uuid)) {
            SALT.AssetManager.remove(this.asset, false /* dispose */);
            this.wasRemoved = true;
            Signals.dispatch('assetRemoved', this.assetType, this.asset);
        }
    }

    undo() {
        if (this.wasRemoved) {
            SALT.AssetManager.add(this.asset);
            this.wasRemoved = false;
            Signals.dispatch('assetAdded', this.assetType, this.asset);
        }
    }

}

export { RemoveAssetCommand };
