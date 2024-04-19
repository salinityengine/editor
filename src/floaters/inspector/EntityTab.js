import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { CameraProperties } from './properties/CameraProperties.js';
import { ComponentProperties } from './properties/ComponentProperties.js';
import { EntityProperties } from './properties/EntityProperties.js';
import { EntityTransformProperties } from './properties/EntityTransformProperties.js';
import { StageProperties } from './properties/StageProperties.js';
import { WorldProperties } from './properties/WorldProperties.js';

import { AddComponentButton } from './buttons/AddComponentButton.js';
import { EntitySettingsButton } from './buttons/EntitySettingsButton.js';
import { PropertyGroup } from '../../gui/PropertyGroup.js';

class EntityTab extends SUEY.Titled {

    static entityTypeName(entity) {
        if (entity.isWorld3D) return 'World3D';
        else if (entity.isStage3D) return 'Stage3D';
        else if (entity.isPrefab) return 'Prefab';
        else if (entity.isLight3D) return String(entity.type).replace('Light', '');
        else if (entity.isCamera3D) return String(entity.type).replace('Camera', '');
        else if (entity.isEntity3D) return 'Entity3D';
        else if (entity.isEntity) return 'Entity';
        else console.warn(`EntityTab.entityTypeName(): Unknown entity type.`);
        return 'Unknown';
    }

    constructor(entity) {
        super({ title: EntityTab.entityTypeName(entity) });

        // Style 'Prefab'
        if (entity.isPrefab) {
            this.tabTitle.setStyle('background-image', 'linear-gradient(to bottom, rgba(var(--triadic1), 0.75), rgba(var(--triadic1), 0.5))');
        }

        /********** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');
        buttonRow.add(new SUEY.FlexSpacer());
        buttonRow.add(new EntitySettingsButton(entity));
        buttonRow.add(new AddComponentButton(entity));
        this.tabTitle.add(buttonRow);

        /********** PROPERTY BOXES */

        // Entity
        this.add(new EntityProperties(entity));

        // World, Stage
        if (entity.isWorld) this.add(new WorldProperties(entity));
        else if (entity.isStage) this.add(new StageProperties(entity));
        else this.add(new EntityTransformProperties(entity));

        // Camera
        if (entity.isCamera) this.add(new CameraProperties(entity));
    }

}

export { EntityTab };
