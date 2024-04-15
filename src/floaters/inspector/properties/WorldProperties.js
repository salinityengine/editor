import {
    FOLDER_FLOATERS,
    FOLDER_TOOLBAR,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AssetInput } from './inputs/AssetInput.js';
import { Config } from '../../../config/Config.js';
import { Language } from '../../../config/Language.js';
import { PropertyGroup } from '../../../gui/PropertyGroup.js';

import { SetValueCommand } from '../../../commands/CommandList.js';

class WorldProperties extends SUEY.Div {

    constructor(entity) {
        super();
        this.addClass('salt-property-panel');

        /******************** BACKGROUND */

        const backgroundGroup = new PropertyGroup({ title: 'Background', icon: `${FOLDER_FLOATERS}inspector/world/background.svg` });
        backgroundGroup.setLeftPropertyWidth('50%');
        this.add(backgroundGroup);

        // Background Type
        const backgroundOptions = {
            none: 'None',
            color: 'Color',
            texture: 'Texture',
        };
        const backgroundStyle = new SUEY.Dropdown();
        backgroundStyle.overflowMenu = SUEY.OVERFLOW.LEFT;
        backgroundStyle.setOptions(backgroundOptions);
        backgroundStyle.on('change', () => { updateBackground(); });
        backgroundGroup.addRow('Style', backgroundStyle);

        // Background Color
        const backgroundColor = new SUEY.Color();
        backgroundColor.on('change', () => { updateBackground(); });
        const bgColorRow = backgroundGroup.addRow('Color', backgroundColor);

        // Background Texture
        const uuid = (entity.background && !entity.background.isColor) ? entity.background : null;
        const bgTextureRow = AssetInput.build(backgroundGroup, 'Texture', 'texture', uuid, updateBackground);

        function updateBackground(value) {
            const style = backgroundStyle.getValue();
            let background = null;
            if (style === 'color') background = new THREE.Color(backgroundColor.getValue());
            if (style === 'texture') background = value ?? 'unknown';
            editor.execute(new SetValueCommand(entity, 'background', background));
        }

        /******************** FOG */

        const fogGroup = new PropertyGroup({ title: 'Fog', icon: `${FOLDER_FLOATERS}inspector/world/fog.svg` });
        fogGroup.setLeftPropertyWidth('50%');
        this.add(fogGroup);

        // Fog Type
        const fogOptions = {
            none: 'None',
            standard: 'Standard',
            exponential: 'Exponential',
        };
        const fogStyle = new SUEY.Dropdown();
        fogStyle.overflowMenu = SUEY.OVERFLOW.LEFT;
        fogStyle.setOptions(fogOptions);
        fogStyle.on('change', () => { updateFog(); });
        fogGroup.addRow('Style', fogStyle);

        // Fog Color
        const fogColor = new SUEY.Color();
        fogColor.on('change', () => { updateFog(); });
        const fogColorRow = fogGroup.addRow('Color', fogColor);

        // Fog Near
        const fogNear = new SUEY.NumberBox(1);
        fogNear.setPrecision(2).setStep(10);
        fogNear.on('change', () => { updateFog(); });
        const fogNearRow = fogGroup.addRow('Near', fogNear);

        // Fog Far
        const fogFar = new SUEY.NumberBox(1000);
        fogFar.setPrecision(2).setStep(10);
        fogFar.on('change', () => { updateFog(); });
        const fogFarRow = fogGroup.addRow('Far', fogFar);

        // Fog Density
        const fogDensity = new SUEY.NumberBox();
        fogDensity.setMin(0).setMax(1).setPrecision(5).setStep(0.00025).setNudge(0.00025);
        fogDensity.setValue(0.00025);
        fogDensity.on('change', () => { updateFog(); });
        const fogDensityRow = fogGroup.addRow('Density', fogDensity);

        function updateFog() {
            const style = fogStyle.getValue();
            let fog = null;
            if (style === 'standard') fog = new THREE.Fog(new THREE.Color(fogColor.getValue()), fogNear.getValue(), fogFar.getValue());
            if (style === 'exponential') fog = new THREE.FogExp2(new THREE.Color(fogColor.getValue()), fogDensity.getValue());
            editor.execute(new SetValueCommand(entity, 'fog', fog));
        }

        /******************** NODES */

        const nodeGroup = new PropertyGroup({ title: 'Node', icon: `${FOLDER_TOOLBAR}graph-nodes.svg` });
        nodeGroup.setLeftPropertyWidth('50%');
        if (Config.getKey('promode') === true) {
            this.add(nodeGroup);
        }

        // X Pos
        const nodeX = new SUEY.NumberBox(0).setStep(25).setNudge(5);
        nodeX.on('change', () => {
            editor.execute(new SetValueCommand(entity, 'xPos', nodeX.getValue()));
        });
        nodeGroup.addRow('X', nodeX);

        // Y Pos
        const nodeY = new SUEY.NumberBox(0).setStep(25).setNudge(5);
        nodeY.on('change', () => {
            editor.execute(new SetValueCommand(entity, 'yPos', nodeY.getValue()));
        });
        nodeGroup.addRow('Y', nodeY);

        /***** UPDATE *****/

        function updateUI() {
            // Background
            const backType = backgroundStyle.getValue();
            bgColorRow.setStyle('display', (backType === 'color') ? '' : 'none');
            bgTextureRow.setStyle('display', (backType === 'texture') ? '' : 'none');
            // Fog
            const fogType = fogStyle.getValue();
            fogColorRow.setStyle('display', (fogType !== 'none') ? '' : 'none');
            fogNearRow.setStyle('display', (fogType === 'standard') ? '' : 'none');
            fogFarRow.setStyle('display', (fogType === 'standard') ? '' : 'none');
            fogDensityRow.setStyle('display', (fogType === 'exponential') ? '' : 'none');
            // Node
            nodeX.setValue(entity.xPos);
            nodeY.setValue(entity.yPos);
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

        // Background
        if (entity.background) {
            if (entity.background.isColor) {
                backgroundStyle.setValue('color');
                backgroundColor.setValue(entity.background.getHex());
            } else {
                backgroundStyle.setValue('texture');
            }
        } else {
            backgroundStyle.setValue('none');
        }

        // Fog
        if (entity.fog) {
            if (entity.fog.isFog) {
                fogStyle.setValue('standard');
                fogNear.setValue(entity.fog.near);
                fogFar.setValue(entity.fog.far);
            }
            if (entity.fog.isFogExp2) {
                fogStyle.setValue('exponential');
                fogDensity.setValue(entity.fog.density);
            }
            fogColor.setValue(entity.fog.color.getHex());
        } else {
            fogStyle.setValue('none');
        }

        // Init
        updateUI();

    } // end ctor

}

export { WorldProperties };
