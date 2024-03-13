import * as SALT from 'engine';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class AddAssetCommand extends Command {

    constructor(asset) {
        super();

        this.type = 'AddAssetCommand';

        this.assetType = SALT.AssetManager.checkType(asset);
        this.name = `Add ${SALT.Strings.capitalize(this.assetType)}`;
        if (asset.name && asset.name !== '') this.name += `: ${asset.name}`;

        this.asset = asset;
        this.wasAdded = false;

        // Cancel if no uuid
        if (!asset.uuid) {
            this.valid = false;
            console.warn(`AddAssetCommand: Asset has no uuid, asset is as follows:`);
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
        if (!SALT.AssetManager.getAsset(this.asset.uuid)) {
            SALT.AssetManager.addAsset(this.asset);
            this.wasAdded = true;
            if (SALT.MESH_REBUILD_TYPES.indexOf(this.assetType) !== -1) {
                this.editor.project.traverseWorlds((child) => child.rebuildComponents());
            }
            Signals.dispatch('assetAdded', this.assetType, this.asset);
            Signals.dispatch('assetSelect', this.assetType, this.asset);
            Signals.dispatch('inspectorBuild');
            Signals.dispatch('previewerBuild');
        }
    }

    undo() {
        if (this.wasAdded) {
            SALT.AssetManager.removeAsset(this.asset, false /* dispose */);
            this.wasAdded = false;
            if (SALT.MESH_REBUILD_TYPES.indexOf(this.assetType) !== -1) {
                this.editor.project.traverseWorlds((child) => child.rebuildComponents());
            }
            Signals.dispatch('assetRemoved', this.assetType, this.asset);
            Signals.dispatch('inspectorBuild');
            Signals.dispatch('previewerBuild');
        }
    }

}

export { AddAssetCommand };
