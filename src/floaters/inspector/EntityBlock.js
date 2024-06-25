import {
    FOLDER_FLOATERS,
    FOLDER_TYPES,
} from 'constants';
import * as SALT from 'salt';
import * as SUEY from 'suey';
import { SmartShrinker } from '../../gui/SmartShrinker.js';

import { CameraProperties } from './properties/CameraProperties.js';
import { ComponentProperties } from './properties/ComponentProperties.js';
import { EntityProperties } from './properties/EntityProperties.js';
import { EntityTransformProperties } from './properties/EntityTransformProperties.js';
import { StageProperties } from './properties/StageProperties.js';
import { WorldProperties } from './properties/WorldProperties.js';

import { AddComponentButton } from './buttons/AddComponentButton.js';
import { EntitySettingsButton } from './buttons/EntitySettingsButton.js';
import { PropertyGroup } from '../../gui/PropertyGroup.js';

class EntityBlock extends SmartShrinker {

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
        const icon = `${FOLDER_TYPES}entity/entity.svg`; // color = '#D8007F'
        super({
            title: EntityBlock.entityTypeName(entity),
            icon, arrow: 'right', border: true,
            defaultExpanded: true,
        });

        // Style 'Prefab'
        if (entity.isPrefab) {
            this.tabTitle.setStyle('background-image', 'linear-gradient(to bottom, rgba(var(--triadic1), 0.75), rgba(var(--triadic1), 0.5))');
        }

        /********** HEADER BUTTONS */

        // const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');
        // buttonRow.add(new SUEY.FlexSpacer());
        // buttonRow.add(new EntitySettingsButton(entity));
        // buttonRow.add(new AddComponentButton(entity));
        // this.tabTitle.add(buttonRow);

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

export { EntityBlock };
