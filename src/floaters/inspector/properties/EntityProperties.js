import {
    WIDGET_SPACING,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../../../config/Config.js';
import { Language } from '../../../config/Language.js';
import { SetValueCommand } from '../../../commands/Commands.js';

class EntityProperties extends SUEY.PropertyList {

    constructor(entity) {
        super('30%');

        /******************** GENERAL */

        // NAME
        const entityName = new SUEY.TextBox().on('change', () => {
            editor.execute(new SetValueCommand(entity, 'name', entityName.getValue()));
        });
        this.addRow(Language.getKey('inspector/entity/name'), entityName);

        // Don't allow changes to Helper Object names
        if (entity.userData.flagHelper) entityName.setDisabled(true);

        // ID
        // const entityID = new SUEY.Text().selectable(false);
        // this.addRow('ID', entityID);

        // UUID
        const entityUUID = new SUEY.TextBox().setDisabled(true);
        // // 'New' UUID Button
        // const entityUUIDNew = new SUEY.Button('NEW').setStyle('marginLeft', WIDGET_SPACING).onPress(() => {
        //     entityUUID.setValue(SALT.Maths.uuid());
        //     editor.execute(new SetUUIDCommand(entity, entityUUID.getValue()));
        // });
        // // 'Copy' UUID Button
        const entityUUIDCopy = new SUEY.Button('Copy').onPress(() => {
            navigator.clipboard.writeText(entity.uuid).then(
                function() { /* success */ },
                function(err) { console.error('Async: Could not copy text: ', err);
            });
        });
        entityUUIDCopy.setStyle('marginLeft', WIDGET_SPACING)
        entityUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            this.addRow('UUID', entityUUID, entityUUIDCopy);
        }

        /***** UPDATE *****/

        function updateUI() {
            entityName.setValue(entity.name);
            // entityID.setTextContent(entity.id);
            entityUUID.setValue(entity.uuid);
        }

        /***** SIGNALS *****/

        function entityChangeCallback(changedEntity) {
            if (!changedEntity || !changedEntity.isEntity) return;
            if (changedEntity.uuid === entity.uuid) updateUI();
        };

        signals.entityChanged.add(entityChangeCallback);

        /***** DESTROY *****/

        this.on('destroy', () => {
            signals.entityChanged.remove(entityChangeCallback);
        });

        /***** INIT *****/

        updateUI();

        if (entity.locked) this.disableInputs();

    } // end ctor

}

export { EntityProperties };
