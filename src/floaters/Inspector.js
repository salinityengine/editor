import {
    EDITOR_MODES,
    COMPONENT_ICONS,
    FOLDER_FLOATERS,
    FOLDER_TYPES,
    MOUSE_STATES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { EntityBlock } from './inspector/EntityBlock.js';
import { StageBlock } from './inspector/StageBlock.js';
import { TransformBlock } from './inspector/TransformBlock.js';
import { WorldBlock } from './inspector/WorldBlock.js';

// import { ComponentTab } from './inspector/ComponentTab.js';
// import { PaletteTab } from './inspector/PaletteTab.js';
// import { TextureTab } from './inspector/TextureTab.js';

/**
 * Object Inspector
 */
class Inspector extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}inspector.svg`;
        super('inspector', { icon, color: '#0055CC' });
        const self = this;
        Advice.attach(this.button, 'floater/inspector');

        /******************** BUILD */

        // Private
        let item = undefined;

        /**
         * Builds (or rebuilds) the object inspector
         * @param {any} from - The uuid object or array of objects to build from. Pass 'rebuild' to recreate with existing object.
         */
        function build(from = undefined) {
            // Process 'from'
            if (from !== 'rebuild') {
                // TEMP: Only process first entity
                if (Array.isArray(from)) from = (from.length === 0) ? undefined : from[0];

                // Don't rebuild a thing that is already displayed
                if (from && item && item.isThing && item.uuid === from.uuid) return;

                // Save Current Item
                item = from;
            }

            // Process Item
            const blocks = [];
            let titleName = 'Inspector';

            // ITEM: None
            if (item == undefined) {
                const emptyText = new SUEY.Row().add(new SUEY.Text('No Selection'));
                emptyText.setStyle('justifyContent', 'center', 'padding', '1em var(--border-small)');
                blocks.push(emptyText);

            // ITEM: Palette
            } else if (item.isPalette) {
                // blocks.push(new SUEY.Floater('palette', { icon: `${FOLDER_FLOATERS}asset/palette.svg`, color: '#a0a0a0', shrink: true }).add(new PaletteTab(item)));

            // ITEM: Texture
            } else if (item.isTexture) {
                // let icon = `${FOLDER_FLOATERS}asset/texture.svg`;
                // if (item.isCubeTexture) icon = `${FOLDER_FLOATERS}asset/cube-texture.svg`;
                // blocks.push(new SUEY.Floater('texture', { icon, color: '#C9C1B6', shadow: false, shrink: true }).add(new TextureTab(item)));

            // ITEM: Entity
            } else if (item.isEntity) {
                const entity = item;

                // Entity Tab
                blocks.push(new EntityBlock(entity));

                // World, Stage
                if (entity.isWorld) blocks.push(new WorldBlock(entity));
                else if (entity.isStage) blocks.push(new StageBlock(entity));
                else blocks.push(new TransformBlock(entity));

                // // Camera
                // if (entity.isCamera) this.add(new CameraProperties(entity));

                // // Component Tabs
                // const components = entity.components;
                // if (components && components.length > 0) {
                //     // Gather types
                //     const typesWanted = [];
                //     for (const component of components) {
                //         const compType = String(component.type ?? 'unknown').toLowerCase();
                //         if (!typesWanted.includes(compType)) typesWanted.push(compType);
                //     }

                //     // Add alphabetically
                //     typesWanted.sort();
                //     for (const compType of typesWanted) {
                //         const ComponentClass = SALT.ComponentManager.registered(compType);
                //         if (!ComponentClass) continue;
                //         const icon = COMPONENT_ICONS[compType] ?? ComponentClass.config.icon ?? '';
                //         const color = ComponentClass.config.color;
                //         blocks.push(new SUEY.Floater(compType, { icon, color, shrink: true }).add(new ComponentTab(entity, compType)));
                //     }
                // }

            // ITEM: Unknown
            } else {
                const unknownText = new SUEY.Row().add(new SUEY.Text(`Unknown Item: '${(typeof item === 'object') ? item.name : item}'`));
                unknownText.setStyle('justifyContent', 'center', 'padding', '1em var(--border-small)');
                blocks.push(unknownText);
            }

            // Delete existing Blocks
            self.clearContents();

            // Set Title
            self.setTitle(titleName);

            // Add Blocks
            self.add(...blocks);
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'promodeChanged', () => build('rebuild'));
        Signals.connect(this, 'settingsRefreshed', () => build('rebuild'));
        Signals.connect(this, 'projectLoaded', () => build(undefined));

        Signals.connect(this, 'entityChanged', (entity) => {
            //
            // TODO: Update entity
            //
        });

        Signals.connect(this, 'selectionChanged', () => {
            // Don't rebuild while dragging new object into scene
            if (editor.dragInfo) return;

            // Don't rebuild inspector during rubberband mode
            const viewport = editor.viewport();
            if (viewport && viewport.mode() === EDITOR_MODES.WORLD_3D && viewport.mouseState === MOUSE_STATES.SELECTING) return;

            // Build with Selection
            build(editor.selected);
        });

        /***** INIT *****/

        build(null, false /* highlight? */);
    }

}

export { Inspector };
