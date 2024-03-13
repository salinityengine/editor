import * as SALT from 'engine';
import { Command } from '../Command.js';

class RemoveAssetCommand extends Command {

    constructor(asset) {
        super();

        this.type = 'RemoveAssetCommand';

        this.assetType = SALT.AssetManager.checkType(asset);
        this.name = `Remove ${SALT.Strings.capitalize(this.assetType)}`;
        if (asset.name && asset.name !== '') this.name += `: ${asset.name}`;

        this.asset = asset;
        this.wasRemoved = false;

        // Cancel if no uuid
        if (!asset.uuid) {
            this.valid = false;
            console.warn(`RemoveAssetCommand: Asset has no uuid, asset is as follows:`);
            console.log(asset);
        }
    }

    purge() {
        if (this.wasRemoved && this.asset && typeof this.asset.dispose === 'function') this.asset.dispose();
    }

    execute() {
        if (SALT.AssetManager.getAsset(this.asset.uuid)) {
            SALT.AssetManager.removeAsset(this.asset, false /* dispose */);
            this.wasRemoved = true;
            if (SALT.MESH_REBUILD_TYPES.indexOf(this.assetType) !== -1) {
                editor.project.traverseWorlds((child) => child.rebuildComponents());
            }
            signals.assetRemoved.dispatch(this.assetType, this.asset);
            signals.inspectorBuild.dispatch();
            signals.previewerBuild.dispatch();
        }
    }

    undo() {
        if (this.wasRemoved) {
            SALT.AssetManager.addAsset(this.asset);
            this.wasRemoved = false;
            if (SALT.MESH_REBUILD_TYPES.indexOf(this.assetType) !== -1) {
                editor.project.traverseWorlds((child) => child.rebuildComponents());
            }
            signals.assetAdded.dispatch(this.assetType, this.asset);
            signals.assetSelect.dispatch(this.assetType, this.asset);
            signals.inspectorBuild.dispatch();
            signals.previewerBuild.dispatch();
        }
    }

}

export { RemoveAssetCommand };
