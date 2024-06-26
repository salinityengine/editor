import {
    FOLDER_FLOATERS,
    FOLDER_TYPES,
    WIDGET_SPACING,
} from 'constants';
import * as SALT from 'salt';
import * as SUEY from 'suey';
import { PropertyGroup } from '../../gui/PropertyGroup.js';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

import { SetEntityValueCommand } from '../../commands/CommandList.js';

class EntityBlock extends PropertyGroup {

    static entityTypeName(entity) {
        if (entity.isWorld) return 'World';
        else if (entity.isStage) return 'Stage';
        else if (entity.isPrefab) return 'Prefab';
        else if (entity.isLight) return String(entity.type).replace('Light', '');
        else if (entity.isCamera) return String(entity.type).replace('Camera', '');
        else if (entity.isEntity) return 'Entity';
        else console.warn(`EntityBlock.entityTypeName(): Unknown entity type.`);
        return 'Unknown';
    }

    constructor(entity) {
        let icon = `${FOLDER_TYPES}entity/entity.svg`; /* color = '#D8007F'; */
        let shrink = false;
        let radius = 0;
        if (entity.isWorld) { icon = `${FOLDER_TYPES}entity/world.svg`; shrink = 0.9; }
        else if (entity.isStage) { icon = `${FOLDER_TYPES}entity/stage.svg`; radius = '0.4em'; /* color = '#333355'; */ }

        // 'prefab'; icon = `${FOLDER_TYPES}entity/prefab.svg`;
        // 'camera'; icon = `${FOLDER_TYPES}entity/camera.svg`; color = '#4B4886';
        // 'light'; icon = `${FOLDER_TYPES}entity/light.svg`;   color = '#222222';

        super({
            title: EntityBlock.entityTypeName(entity),
            icon,
            arrow: 'left',
            border: true,
            shrink,
            radius,
            leftPropertyWidth: '30%',
            defaultExpanded: true,
        });

        // // Style 'Prefab'
        // if (entity.isPrefab) {
        //     this.tabTitle.setStyle('background-image', 'linear-gradient(to bottom, rgba(var(--triadic1), 0.75), rgba(var(--triadic1), 0.5))');
        // }

        /********** HEADER BUTTONS */

        // const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');
        // buttonRow.add(new SUEY.FlexSpacer());
        // buttonRow.add(new EntitySettingsButton(entity));
        // buttonRow.add(new AddComponentButton(entity));
        // this.tabTitle.add(buttonRow);

        /********** PROPERTY BOXES */

        // NAME
        const entityName = new SUEY.TextBox().on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'name', entityName.getValue()));
        });
        this.addRow(Language.getKey('inspector/entity/name'), entityName);

        // UUID
        const entityUUID = new SUEY.TextBox().setDisabled(true);
        // // 'New' UUID Button
        // const entityUUIDNew = new SUEY.Button('NEW').setStyle('marginLeft', WIDGET_SPACING).onPress(() => {
        //     entityUUID.setValue(SALT.MathUtils.randomUUID());
        //     editor.execute(new SetUUIDCommand(entity, entityUUID.getValue()));
        // });
        // // 'Copy' UUID Button
        const entityUUIDCopy = new SUEY.Button('Copy').onPress(() => {
            navigator.clipboard.writeText(entity.uuid).then(
                function() { /* success */ },
                function(err) { console.error('EntityProperties.copy(): Could not copy text to clipboard - ', err); }
            );
        });
        entityUUIDCopy.setStyle('marginLeft', WIDGET_SPACING)
        entityUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            this.addRow('UUID', entityUUID, entityUUIDCopy);
        }

        /***** UPDATE *****/

        function updateUI() {
            entityName.setValue(entity.name);
            entityUUID.setValue(entity.uuid);
        }

        /***** SIGNALS *****/

        function entityChangeCallback(changedEntity) {
            if (!changedEntity || !changedEntity.isEntity) return;
            if (changedEntity.uuid === entity.uuid) updateUI();
        };

        Signals.connect(this, 'entityChanged', entityChangeCallback);

        /***** INIT *****/

        updateUI();

        if (entity.locked) this.disableInputs();

    }

}

export { EntityBlock };
