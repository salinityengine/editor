import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';

import { AssetPanel } from '../../gui/AssetPanel.js';
import { PrefabFactory } from './prefabs/PrefabFactory.js';

class PrefabsTab extends SUEY.Titled {

    constructor() {
        super({ title: 'Prefabs' });
        const self = this;

        /******************** PANELS */

        this.panels = {};

        // 'Entity' Category (user defined)
        const general = 'unknown';
        this.panels[general] = new AssetPanel({ type: 'prefab', category: general, title: 'General', icon: `${EDITOR.FOLDER_GROUPS}prefabs/general.svg` });
        this.add(this.panels[general]);

        // Add Search Bar
        const searchDiv = new SUEY.Div().addClass('one-search-holder');
        const searchIcon = new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}search.svg`).addClass('one-search-icon');
        const searchBox = new SUEY.TextBox('').addClass('one-search-box');
        searchBox.dom.placeholder = Language.getKey('explorer/search');
        searchBox.setValue(this.getSearchTerm());
        searchBox.onInput(() => {
            self.setSearchTerm(searchBox.getValue());
            self.searchPanels();
        });
        searchDiv.add(searchBox, searchIcon);
        this.addToSelf(searchDiv);

        /***** SIGNALS */

        function focusAsset(type, asset) {
            if (!asset || !asset.uuid) return;
            if (type === 'prefab') {
                const category = asset.category ?? general;
                const panel = self.panels[category];
                if (panel) {
                    editor.explorer.selectTab('prefabs');
                    panel.setExpanded();
                    const assetBox = document.getElementById(asset.uuid);
                    if (assetBox) setTimeout(() => { assetBox.focus(); assetBox.click(); }, 0);
                }
            }
        }

        function processPrefabs(type) {
            if (type !== 'prefab') return;
            const prefabs = SALT.AssetManager.getLibrary('prefab'); /* returns all prefabs */
            for (const prefab of prefabs) {
                if (!prefab || !prefab.category) continue;
                const category = String(prefab.category).toLowerCase();
                if (!self.panels[category]) {
                    let icon = '';
                    switch (category) {
                        case 'primitive': icon = `${EDITOR.FOLDER_GROUPS}prefabs/primitive.svg`; break;
                        case 'light': icon = `${EDITOR.FOLDER_GROUPS}prefabs/light.svg`; break;
                        case 'item': icon = `${EDITOR.FOLDER_GROUPS}prefabs/item.svg`; break;
                        //
                        // ADDITIONAL CUSTOM CATEGORY ICONS HERE
                        //
                    }
                    const title = SALT.Strings.capitalize(category);
                    self.panels[category] = new AssetPanel({ type: 'prefab', category, title, icon });
                    self.add(self.panels[category]);
                }
            }

            // Add Icons
            for (const category in self.panels) {
                const panel = self.panels[category];
                panel.buildPanel(false /* clear? */);
                panel.applySearch(self.getSearchTerm());
            }
        }

        function assetChanged(type, prefab) {
            if (type !== 'prefab') return;
            if (!prefab || !prefab.isEntity) {
                processPrefabs(type);
            } else {
                const category = prefab.category ?? general;
                const panel = self.panels[category];
                if (panel) {
                    panel.updateItem(type, prefab);
                    panel.applySearch(self.getSearchTerm());
                } else {
                    processPrefabs(type);
                }
            }
        }

        function updateItem(prefab) {
            if (!prefab) return;
            if (prefab.isComponent && prefab.entity && prefab.entity.isEntity) prefab = prefab.entity;
            if (prefab.isPrefab) assetChanged('prefab', prefab);
        }

        function projectLoaded() {
            processPrefabs('prefab');
        }

        signals.assetSelect.add(focusAsset);
        signals.assetAdded.add(processPrefabs);
        signals.assetRemoved.add(processPrefabs);
        signals.assetChanged.add(assetChanged);

        signals.componentChanged.add(updateItem);
        signals.entityChanged.add(updateItem);
        signals.projectLoaded.add(projectLoaded);

        this.dom.addEventListener('destroy', function() {
            signals.assetSelect.remove(focusAsset);
            signals.assetAdded.remove(processPrefabs);
            signals.assetRemoved.remove(processPrefabs);
            signals.assetChanged.remove(assetChanged);

            signals.componentChanged.remove(updateItem);
            signals.entityChanged.remove(updateItem);
            signals.projectLoaded.remove(projectLoaded);
        }, { once: true });

        /***** INIT *****/

        // Load built in prefabs
        loadBuiltInPrefabs();

        // Inititate panel's search term
        this.searchPanels();

    } // end ctor

    /******************** SEARCH */

    getSearchTerm() { return Config.getKey('search/prefabs').toLowerCase(); }
    setSearchTerm(term) { Config.setKey('search/prefabs', String(term)); }

    searchPanels() {
        for (let category in this.panels) {
            const panel = this.panels[category];
            panel.applySearch(this.getSearchTerm());
        }
    }

}

export { PrefabsTab };

/******************** INTERNAL ********************/

function loadBuiltInPrefabs() {
    function pushPrefab(category, entity, icon) {
        entity.isBuiltIn = true;
        entity.category = category;
        entity.icon = icon;
        SALT.AssetManager.addAsset(entity);
    }

    pushPrefab('primitive', PrefabFactory.shape('box', '#338DFC'), `${EDITOR.FOLDER_TYPES}entity/primitive/box.svg`);
    pushPrefab('primitive', PrefabFactory.shape('capsule', '#13C1A4'), `${EDITOR.FOLDER_TYPES}entity/primitive/capsule.svg`);
    pushPrefab('primitive', PrefabFactory.shape('cone', '#B847FF'), `${EDITOR.FOLDER_TYPES}entity/primitive/cone.svg`);
    pushPrefab('primitive', PrefabFactory.shape('cylinder', '#DC0FBA'), `${EDITOR.FOLDER_TYPES}entity/primitive/cylinder.svg`);
    pushPrefab('primitive', PrefabFactory.shape('sphere', '#FFAD43'), `${EDITOR.FOLDER_TYPES}entity/primitive/sphere.svg`);
    pushPrefab('primitive', PrefabFactory.shape('torus', '#43D33E'), `${EDITOR.FOLDER_TYPES}entity/primitive/torus.svg`);
    pushPrefab('primitive', PrefabFactory.shape('plane', '#E94170'), `${EDITOR.FOLDER_TYPES}entity/primitive/plane.svg`);
    pushPrefab('primitive', PrefabFactory.shape('wedge', '#FFFF76'), `${EDITOR.FOLDER_TYPES}entity/primitive/wedge.svg`);

    pushPrefab('light', PrefabFactory.light('AmbientLight'), `${EDITOR.FOLDER_TYPES}entity/light/ambient.svg`);
    pushPrefab('light', PrefabFactory.light('DirectionalLight'), `${EDITOR.FOLDER_TYPES}entity/light/directional.svg`);
    pushPrefab('light', PrefabFactory.light('HemisphereLight'), `${EDITOR.FOLDER_TYPES}entity/light/hemisphere.svg`);
    pushPrefab('light', PrefabFactory.light('PointLight'), `${EDITOR.FOLDER_TYPES}entity/light/point.svg`);
    pushPrefab('light', PrefabFactory.light('SpotLight'), `${EDITOR.FOLDER_TYPES}entity/light/spot.svg`);

    pushPrefab('item', PrefabFactory.camera(/* 'perspective' */), `${EDITOR.FOLDER_TYPES}entity/camera.svg`);
    pushPrefab('item', PrefabFactory.empty(), `${EDITOR.FOLDER_TYPES}entity/item/group.svg`);

    ///// TODO
    pushPrefab('light', PrefabFactory.light('RectAreaLight'), `${EDITOR.FOLDER_TYPES}entity/light/rectangle.svg`);
    pushPrefab('item', PrefabFactory.empty(), `${EDITOR.FOLDER_TYPES}entity/item/particle.svg`);
    pushPrefab('item', PrefabFactory.empty(), `${EDITOR.FOLDER_TYPES}entity/item/speaker.svg`);
    pushPrefab('item', PrefabFactory.empty(), `${EDITOR.FOLDER_TYPES}entity/item/sprite.svg`);
    pushPrefab('item', PrefabFactory.empty(), `${EDITOR.FOLDER_TYPES}entity/item/text.svg`);
    /////

    signals.assetAdded.dispatch('prefab');
}
