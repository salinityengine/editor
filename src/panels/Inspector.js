import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

// import { ComponentTab } from './inspector/ComponentTab.js';
// import { EntityTab } from './inspector/EntityTab.js';
// import { PaletteTab } from './inspector/PaletteTab.js';
// import { TextureTab } from './inspector/TextureTab.js';

import { SettingsGeneralTab } from './inspector/SettingsGeneralTab.js';
import { SettingsHistoryTab } from './inspector/SettingsHistoryTab.js';

import { ProjectGeneralTab } from './inspector/ProjectGeneralTab.js';
import { ProjectInfoTab } from './inspector/ProjectInfoTab.js';

import { Scene3DGridTab } from './inspector/Scene3DGridTab.js';
// import { SceneViewTab } from './inspector/SceneViewTab.js';
// import { SceneThreeTab } from './inspector/SceneThreeTab.js';

import { WorldGridTab } from './inspector/WorldGridTab.js';

/**
 * Object Inspector
 */
class Inspector extends SUEY.Floater {

    constructor({
        style = SUEY.PANEL_STYLES.FANCY,
        startWidth = null,
        startHeight = null,
        minWidth = 0,
        maxWidth = Infinity,
        minHeight = 0,
        maxHeight = Infinity,
    } = {}) {
        super({ style, displayEmpty: false, startWidth, startHeight, minWidth, maxWidth, minHeight, maxHeight });
        const self = this;
        this.id = 'Inspector';
        this.setTabSide(SUEY.TAB_SIDES.LEFT);

        // Flags
        this.isEmpty = true;

        // Internal
        let _item = undefined;

        /** Builds Inspector */
        function build(buildFrom = undefined) {

            // Process new 'buildFrom' item
            if (buildFrom !== 'rebuild') {

                // Check for toolbar button second click (for buttons 'Settings', 'Project', etc.)
                if (buildFrom) {
                    let doubleSelect = false;
                    doubleSelect = doubleSelect || (buildFrom === 'settings' && _item === 'settings');
                    doubleSelect = doubleSelect || (buildFrom === 'history' && _item === 'history');
                    doubleSelect = doubleSelect || (buildFrom === 'project' && _item === 'project');
                    if (doubleSelect) {
                        _item = undefined;
                        setTimeout(() => Signals.dispatch('selectionChanged'), 0);
                        return;
                    }
                }

                // Some items (settings, history, project) are slightly persistent on Entity selection
                if (!buildFrom || buildFrom.isEntity) {
                    if (_item === 'settings') {
                        if (self.selectedID === 'three') return;
                    }
                    if (_item === 'history') {
                        return;
                    }
                    if (_item === 'project') {
                        if (self.selectedID === 'info') return;
                    }
                }

                // Don't rebuild an entity that is already displayed
                if (buildFrom && _item && _item.isEntity && buildFrom.isEntity && _item.uuid === buildFrom.uuid) {
                    return;
                }

                // Don't show "Built In" prefabs
                if (buildFrom && buildFrom.isBuiltIn) buildFrom = undefined;

                // Save Current Item
                _item = buildFrom;
            }

            // // Delete existing Tabs
            // //
            // // TODO: clearBlocks()
            //
            // OLD: self.clearTabs();
            //
            self.isEmpty = false;

            const tabs = [];
            // SETTINGS
            if (_item === 'settings') {
                tabs.push(new SUEY.Floater('settings', new SettingsGeneralTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/general.svg`, color: '#C04145', shrink: true }));

                if (editor.mode() === EDITOR.MODES.SCENE_EDITOR_3D) {
                    tabs.push(new SUEY.Floater('view', new SceneViewTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/view.svg`, color: '#ffffff', shadow: false }));
                    tabs.push(new SUEY.Floater('grid', new Scene3DGridTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/grid.svg`, color: '#333333' }));
                    tabs.push(new SUEY.Floater('three', new SceneThreeTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/three.svg`, color: '#019EF4', shadow: false, shrink: true }));
                } else if (editor.mode() === EDITOR.MODES.WORLD_GRAPH) {
                    tabs.push(new SUEY.Floater('grid', new WorldGridTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/grid.svg`, color: '#333333' }));
                }

            // HISTORY
            } else if (_item === 'history') {
                tabs.push(new SUEY.Floater('history', new SettingsHistoryTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/history.svg`, color: '#BF4044', shadow: false, shrink: 0.75 }));

            // PROJECT
            } else if (_item === 'project') {
                tabs.push(new SUEY.Floater('project', new ProjectGeneralTab(), { icon: `${EDITOR.FOLDER_TYPES}project/general.svg`, color: '#773399' }));
                tabs.push(new SUEY.Floater('info', new ProjectInfoTab(), { icon: `${EDITOR.FOLDER_TYPES}project/info.svg`, color: '#66C7FF', shrink: true }));

            // PALETTE
            } else if (_item && _item.isPalette) {
                tabs.push(new SUEY.Floater('palette', new PaletteTab(_item), { icon: `${EDITOR.FOLDER_TYPES}asset/palette.svg`, color: '#a0a0a0', shrink: true }));

            // TEXTURE
            } else if (_item && _item.isTexture) {
                let icon = `${EDITOR.FOLDER_TYPES}asset/texture.svg`;
                if (_item.isCubeTexture) icon = `${EDITOR.FOLDER_TYPES}asset/cube-texture.svg`;
                tabs.push(new SUEY.Floater('texture', new TextureTab(_item), { icon, color: '#C9C1B6', shadow: false, shrink: true }));

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
                tabs.push(new SUEY.Floater(tabType, new EntityTab(entity), { icon, color, shrink, shadow }));

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
                        tabs.push(new SUEY.Floater(compType, new ComponentTab(entity, compType), { icon, color, shrink: true }));
                    }
                }

            // NO SELECTION (buildFrom === undefined)
            } else {
                const empty = new SUEY.Div();
                const emptyTitle = new SUEY.Div('Inspector').addClass('suey-tab-title');
                const emptyText = new SUEY.Row().add(new SUEY.Text('No Selection'));
                emptyText.setStyle('justifyContent', 'center');
                emptyText.setStyle('paddingTop', '1em').setStyle('paddingBottom', '1em');
                empty.add(emptyTitle, emptyText);
                tabs.push(new SUEY.Floater('inspector', empty, { icon: `${EDITOR.FOLDER_TYPES}inspector.svg` }));

                self.isEmpty = true;
            }

            // Add Tabs
            self.addTab(...tabs);

            // Show / Hide
            if (self.isEmpty) {
                self.setStyle('display', 'none');
            } else {
                self.setStyle('display', ''); // (!Config.getKey(`panels/show${self.name}`))? 'none' : '');
            }

            // Select Last Known Tab (stored ranked in Config.js)
            self.selectLastKnownTab();

            // Dispatch Signals
            Signals.dispatch('inspectorChanged');
        }

        /** Rebuilds on 'new selection' */
        function rebuild() {
            // // 'viewport' Mode?
            // if (editor.mode() === EDITOR.MODES.SCENE_EDITOR_3D) {
            //     // Don't rebuild inspector during rubberband mode
            //     if (editor.view2d.mouseState === EDITOR.MOUSE_STATES.SELECTING) return;
            // }

            // Don't rebuild while dragging new object into scene
            if (editor.dragInfo) return;

            // Rebuild with selected entity
            const entity = (editor.selected.length === 0) ? undefined : editor.selected[0];
            Signals.dispatch('inspectorBuild', entity);
        }

        // Close Button
        SUEY.Interaction.addCloseButton(this, SUEY.CLOSE_SIDES.RIGHT);

        /***** EVENTS *****/

        this.on('hidden', () => {
            _item = undefined;
            setTimeout(() => Signals.dispatch('inspectorBuild'), 0);
        });

        /***** SIGNALS *****/

        Signals.connect(this, 'inspectorBuild', function(from) {
            build(from);
        });

        Signals.connect(this, 'promodeChanged', function() {
            build('rebuild');
        });

        Signals.connect(this, 'selectionChanged', rebuild);

        /***** GETTERS *****/

        this.currentItem = function() { return _item; };

    } // end ctor

}

export { Inspector };
