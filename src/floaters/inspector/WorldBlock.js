import {
    FOLDER_FLOATERS,
    FOLDER_TOOLBAR,
    FOLDER_TYPES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { AssetInput } from './properties/inputs/AssetInput.js';
import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { PropertyGroup } from '../../gui/PropertyGroup.js';
import { Signals } from '../../config/Signals.js';

import { SetEntityValueCommand } from '../../commands/CommandList.js';

class WorldBlock extends SUEY.Div {

    constructor(entity) {
        super();

        /******************** BACKGROUND */

        const backgroundBlock = new PropertyGroup({
            title: 'Background',
            icon: `${FOLDER_FLOATERS}inspector/world/background.svg`,
            arrow: 'right',
            border: true,
        });
        backgroundBlock.setLeftPropertyWidth('50%');
        this.add(backgroundBlock);

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
        backgroundBlock.addRow('Style', backgroundStyle);

        // Background Color
        const backgroundColor = new SUEY.Color();
        backgroundColor.on('change', () => { updateBackground(); });
        const bgColorRow = backgroundBlock.addRow('Color', backgroundColor);

        // Background Texture
        const uuid = (entity.background && !entity.background.isColor) ? entity.background : null;
        const bgTextureRow = AssetInput.build(backgroundBlock, 'Texture', 'texture', uuid, updateBackground);

        function updateBackground(value) {
            const style = backgroundStyle.getValue();
            let background = null;
            if (style === 'color') background = new THREE.Color(backgroundColor.getValue());
            if (style === 'texture') background = value ?? 'unknown';
            editor.execute(new SetEntityValueCommand(entity, 'background', background));
        }

        /******************** NODES */

        const nodeGroup = new PropertyGroup({
            title: 'Node',
            icon: `${FOLDER_TOOLBAR}graph-nodes.svg`,
            arrow: 'right',
            border: true,
        });
        nodeGroup.setLeftPropertyWidth('50%');
        if (Config.getKey('promode') === true) {
            this.add(nodeGroup);
        }

        // X Pos
        const nodeX = new SUEY.NumberBox(0).setStep(25).setNudge(5);
        nodeX.on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'position', new SALT.Vector2(nodeX.getValue(), entity.position.y)));
        });
        nodeGroup.addRow('X', nodeX);

        // Y Pos
        const nodeY = new SUEY.NumberBox(0).setStep(25).setNudge(5);
        nodeY.on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'position', new SALT.Vector2(entity.position.x, nodeY.getValue())));
        });
        nodeGroup.addRow('Y', nodeY);

        /***** UPDATE *****/

        function updateUI() {
            // Background
            const backType = backgroundStyle.getValue();
            bgColorRow.setStyle('display', (backType === 'color') ? '' : 'none');
            bgTextureRow.setStyle('display', (backType === 'texture') ? '' : 'none');
            // Node
            nodeX.setValue(entity.position.x);
            nodeY.setValue(entity.position.y);
        }

        /***** SIGNALS *****/

        function entityChangeCallback(changedEntity) {
            if (!changedEntity || !changedEntity.isEntity) return;
            if (changedEntity.uuid === entity.uuid) updateUI();
        };

        Signals.connect(this, 'entityChanged', entityChangeCallback);

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

        // Init
        updateUI();

    } // end ctor

}

export { WorldBlock };
