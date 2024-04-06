import {
    WIDGET_SPACING,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../../config/Config.js';
import { Signals } from '../../config/Signals.js';

import { SetAssetValueCommand } from '../../commands/Commands.js';

class ScriptPreview extends SUEY.Scrollable {

    constructor(script) {
        super();

        // Property Box
        const props = new SUEY.PropertyList('30%');
        this.add(props);

        // Name
        const nameTextBox = new SUEY.TextBox().on('change', () => {
            editor.execute(new SetAssetValueCommand(script, 'name', nameTextBox.getValue()));
        });
        props.addRow('Name', nameTextBox);

        // UUID
        const scriptUUID = new SUEY.TextBox().setDisabled(true);

        // 'Copy' UUID Button
        const scriptUUIDCopy = new SUEY.Button('Copy').onPress(() => {
            navigator.clipboard.writeText(script.uuid).then(
                function() { /* success */ },
                function(err) { console.error('ScriptPreview.copy(): Could not copy text to clipboard - ', err); }
            );
        });
        scriptUUIDCopy.setStyle('marginLeft', WIDGET_SPACING)
        scriptUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            props.addRow('UUID', scriptUUID, scriptUUIDCopy);
        }

        // Edit
        const scriptEdit = new SUEY.Button('Edit Script').onPress(() => {
            Signals.dispatch('editScript', script);
        });
        props.addRow('Edit', scriptEdit);

        /***** UPDATE *****/

        function updateUI() {
            nameTextBox.setValue(script.name);
            scriptUUID.setValue(script.uuid);
        }

        /***** SIGNALS *****/

        function assetChangedCallback(type, asset) {
            if (!type || !asset || type !== 'script') return;
            if (asset.uuid === script.uuid) updateUI();
        }

        Signals.connect(this, 'assetChanged', assetChangedCallback);

        /***** INIT *****/

        updateUI();
    }

}

export { ScriptPreview };
