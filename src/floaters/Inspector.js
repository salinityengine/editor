import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { editor } from 'editor';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

// import { ComponentTab } from './inspector/ComponentTab.js';
// import { EntityTab } from './inspector/EntityTab.js';
// import { PaletteTab } from './inspector/PaletteTab.js';
// import { TextureTab } from './inspector/TextureTab.js';

/**
 * Object Inspector
 */
class Inspector extends SUEY.Floater {

    constructor() {
        const icon = `${EDITOR.FOLDER_FLOATERS}inspector.svg`;
        super('inspector', null, { icon, color: '#0055CC' });
        const self = this;
        Advice.attach(this.button, 'floater/inspector');

        // Flags
        this.isEmpty = true;

        // Internal
        let _item = undefined;

        /** Builds Inspector */
        function build(buildFrom = undefined) {

            // Process new 'buildFrom' item
            if (buildFrom !== 'rebuild') {

                // Don't rebuild an entity that is already displayed
                if (buildFrom && _item && _item.isEntity && buildFrom.isEntity && _item.uuid === buildFrom.uuid) {
                    return;
                }

                // Don't show "Built In" prefabs
                if (buildFrom && buildFrom.isBuiltIn) buildFrom = undefined;

                // Save Current Item
                _item = buildFrom;
            }

            // Delete existing Blocks
            self.clearContents();
            self.isEmpty = false;

            const blocks = [];
            let titleName = _item;

            // PALETTE
            if (_item && _item.isPalette) {
                blocks.push(new SUEY.Floater('palette', new PaletteTab(_item), { icon: `${EDITOR.FOLDER_FLOATERS}asset/palette.svg`, color: '#a0a0a0', shrink: true }));

            // TEXTURE
            } else if (_item && _item.isTexture) {
                let icon = `${EDITOR.FOLDER_FLOATERS}asset/texture.svg`;
                if (_item.isCubeTexture) icon = `${EDITOR.FOLDER_FLOATERS}asset/cube-texture.svg`;
                blocks.push(new SUEY.Floater('texture', new TextureTab(_item), { icon, color: '#C9C1B6', shadow: false, shrink: true }));

            // ENTITY
            } else if (_item && _item.isEntity) {
                const entity = _item;

                let icon, color, shrink, shadow, tabType;
                if (entity.isPrefab) { tabType = 'prefab'; icon = `${EDITOR.FOLDER_TYPES}entity/prefab.svg`; shrink = true; }
                else if (entity.isWorld) { tabType = 'world'; icon = `${EDITOR.FOLDER_TYPES}entity/world.svg`; }
                else if (entity.isStage) { tabType = 'stage'; icon = `${EDITOR.FOLDER_TYPES}entity/stage.svg`; color = '#333355'; }
                else if (entity.isCamera) { tabType = 'camera'; icon = `${EDITOR.FOLDER_TYPES}entity/camera.svg`; color = '#4B4886'; shrink = true; }
                else if (entity.isLight) { tabType = 'light'; icon = `${EDITOR.FOLDER_TYPES}entity/light.svg`; color = '#222222'; shrink = true; }
                else { /* isEntity */ tabType = 'entity'; icon = `${EDITOR.FOLDER_TYPES}entity/entity.svg`; color = '#D8007F'; shrink = true; }

                // Entity Tab
                blocks.push(new SUEY.Floater(tabType, new EntityTab(entity), { icon, color, shrink, shadow }));

                // Component Tabs
                const components = entity.components;
                if (components && components.length > 0) {
                    // Gather types
                    const typesWanted = [];
                    for (const component of components) {
                        const compType = String(component.type ?? 'unknown').toLowerCase();
                        if (!typesWanted.includes(compType)) typesWanted.push(compType);
                    }

                    // Add alphabetically
                    typesWanted.sort();
                    for (const compType of typesWanted) {
                        const ComponentClass = SALT.ComponentManager.registered(compType);
                        if (!ComponentClass) continue;
                        const icon = EDITOR.COMPSALTNT_ICONS[compType] ?? ComponentClass.config.icon ?? '';
                        const color = ComponentClass.config.color;
                        blocks.push(new SUEY.Floater(compType, new ComponentTab(entity, compType), { icon, color, shrink: true }));
                    }
                }

            // NO SELECTION (buildFrom === undefined)
            } else {
                titleName = 'Inspector';
                const emptyText = new SUEY.Row().add(new SUEY.Text('No Selection'));
                emptyText.setStyle('justifyContent', 'center');
                emptyText.setStyle('paddingTop', '1em').setStyle('paddingBottom', '1em');
                blocks.push(emptyText);
                self.isEmpty = true;
            }

            // Title
            const inspectorTitle = new SUEY.Div(SUEY.Strings.capitalize(titleName)).addClass('suey-tab-title');
            if (self.dock && self.dock.hasClass('suey-window')) inspectorTitle.addClass('suey-hidden');
            self.add(inspectorTitle);

            // Add Blocks
            self.add(...blocks);

            // Dispatch Signals
            Signals.dispatch('inspectorChanged');
        }

        /** Rebuilds on 'new selection' */
        function rebuild() {
            // // 'viewport' Mode?
            // if (editor.mode() === EDITOR.MODES.SCENE_EDITOR_3D) {
            //     // Don't rebuild inspector during rubberband mode
            //     if (mouseState === EDITOR.MOUSE_STATES.SELECTING) return;
            // }

            // Don't rebuild while dragging new object into scene
            if (editor.dragInfo) return;

            // Rebuild with selected entity
            const entity = (editor.selected.length === 0) ? undefined : editor.selected[0];
            Signals.dispatch('inspectorBuild', entity);
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'inspectorBuild', function(from) {
            if (self.dock) self.dock.selectTab(self.id);
            build(from);
        });

        Signals.connect(this, 'promodeChanged', function() {
            build('rebuild');
        });

        Signals.connect(this, 'selectionChanged', rebuild);

        /***** GETTERS *****/

        this.currentItem = function() { return _item; };

        /***** INIT *****/

        build();

    } // end ctor

}

export { Inspector };
