import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AddComponentButton } from './buttons/AddComponentButton.js';
import { CameraProperties } from './properties/CameraProperties.js';
import { ComponentProperties } from './properties/ComponentProperties.js';
import { ComponentSettingsButton } from './buttons/ComponentSettingsButton.js';
import { EntitySettingsButton } from './buttons/EntitySettingsButton.js';
import { EntityTab } from './EntityTab.js';
import { PropertyGroup } from '../../gui/PropertyGroup.js';

class ComponentTab extends SUEY.Titled {

    constructor(entity, compType) {
        super({ title: EntityTab.entityTypeName(entity) });

        // Style "Prefab"
        if (entity.isPrefab) {
            this.tabTitle.setStyle('background-image', 'linear-gradient(to bottom, rgba(var(--triadic1), 0.75), rgba(var(--triadic1), 0.5))');
        }

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');
        buttonRow.add(new SUEY.FlexSpacer());

        // 'Component Settings' Button
        if (!entity.isStage) {
            buttonRow.add(new EntitySettingsButton(entity));
        }

        // 'Add Component' Button
        if (!entity.locked) {
            buttonRow.add(new AddComponentButton(entity));
        }

        // Add Button Row
        this.tabTitle.add(buttonRow);

        /******************** PROPERTY BOXES */

        const compName = SALT.Strings.capitalize(compType);
        const components = entity.getComponentsByType(compType);

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const title = compName + ((component.constructor.config.multiple) ? ` ${i + 1}` : '');
            const icon = EDITOR.COMPONENT_ICONS[compType] ?? component.constructor.config.icon ?? '';

            // PROPERTIES
            const compGroup = new PropertyGroup({ title, icon });
            compGroup.add(new ComponentProperties(component));
            this.add(compGroup);

            // EXPANDED?
            compGroup.setExpanded(component.expanded, false /* event? */)
            compGroup.on('expand', () => {
                component.expanded = compGroup.isExpanded;
            });

            // BUTTONS
            const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');
            buttonRow.add(new SUEY.FlexSpacer());
            buttonRow.add(new ComponentSettingsButton(component, entity));
            compGroup.titleDiv.add(buttonRow);
        }

    }

}

export { ComponentTab };
