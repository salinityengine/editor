import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class SetAssetValueCommand extends Command {

    constructor(asset, attributeName, newValue, updatable = true) {
        super();

        // Cancel?
        if (!asset || !asset.uuid) return this.cancel(`SetAssetValueCommand: Missing or invalid asset provided`);

        // Properties
        this.asset = asset;
        this.assetType = SALT.AssetManager.checkType(asset);
        this.attributeName = attributeName;
        this.oldValue = structuredClone(asset[attributeName]);
        this.newValue = structuredClone(newValue);
        this.updatable = updatable;

        // Brief
        this.setBrief(asset, attributeName, newValue);
    }

    setBrief(asset, attributeName, newValue) {
        const assetName = (attributeName === 'name') ? newValue : asset.name;
        const name = (typeof assetName === 'string' && assetName !== '') ? ` ("${assetName}")` : '';
        this.brief = `Set ${SUEY.Strings.capitalize(this.assetType)}${name} Value: '${attributeName}'`;
    }

    execute() {
        setAttributeValue(this.asset, this.attributeName, this.newValue);
        Signals.dispatch('assetChanged', this.assetType, this.asset);
    }

    undo() {
        setAttributeValue(this.asset, this.attributeName, this.oldValue);
        Signals.dispatch('assetChanged', this.assetType, this.asset);
    }

    update(cmd) {
        this.newValue = structuredClone(cmd.newValue);
        if (this.attributeName === 'name') this.setBrief(this.asset, this.attributeName, this.newValue);
    }

}

export { SetAssetValueCommand };

/******************** INTERNAL ********************/

function setAttributeValue(object, attribute, value) {
    if (typeof object !== 'object') return;
    if (object[attribute] && typeof object[attribute].copy === 'function') {
        object[attribute].copy(value);
    } else {
        object[attribute] = structuredClone(value);
    }
}
