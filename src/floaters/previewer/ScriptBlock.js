import * as ONE from 'onsight';
import * as OSUI from 'osui';
import * as EDITOR from 'editor';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { SetAssetValueCommand } from '../../commands/Commands.js';

class ScriptBlock extends OSUI.Titled {

    constructor(script) {
        super({ title: 'Script' });

        // Property Box
        const props = new OSUI.PropertyList('30%');
        this.add(props);

        // Name
        const nameTextBox = new OSUI.TextBox().onChange(() => {
            editor.execute(new SetAssetValueCommand(script, 'name', nameTextBox.getValue()));
        });
        props.addRow('Name', nameTextBox);

        // UUID
        const scriptUUID = new OSUI.TextBox().setDisabled(true);

        // 'Copy' UUID Button
        const scriptUUIDCopy = new OSUI.Button('Copy').onClick(() => {
            navigator.clipboard.writeText(script.uuid).then(
                function() { /* success */ },
                function(err) { console.error('Async: Could not copy text: ', err);
            });
        });
        scriptUUIDCopy.setStyle('marginLeft', EDITOR.WIDGET_SPACING)
        scriptUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            props.addRow('UUID', scriptUUID, scriptUUIDCopy);
        }

        // Edit
        const scriptEdit = new OSUI.Button(`Edit ${Language.getKey('assets/types/script')}`).onClick(() => {
            signals.editScript.dispatch(script);
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

        signals.assetChanged.add(assetChangedCallback);

        this.dom.addEventListener('destroy', function() {
            signals.assetChanged.remove(assetChangedCallback);
        }, { once: true });

        /***** INIT *****/

        updateUI();
    }

}

export { ScriptBlock };
