import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AddAssetCommand } from '../../commands/Commands.js';
import { AssetPanel } from '../../gui/AssetPanel.js';
import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';

class AssetsTab extends SUEY.Titled {

    constructor() {
        super({ title: 'Assets' });
        const self = this;

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');

        /***** 'Add' Asset *****/
        const addButton = new SUEY.Button().addClass('osui-borderless-button');
        addButton.dom.setAttribute('tooltip', 'Add Asset');
        addButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}add.svg`).addClass('osui-complement-colorize'));

        // 'Add' Menu
        const assetMenu = new SUEY.Menu();

        // 'Cube Texture'
        const cubeIcon = `${EDITOR.FOLDER_TYPES}asset/cube-texture.svg`;
        const addCubeMenuItem = new SUEY.MenuItem('Cube Texture', cubeIcon);
        addCubeMenuItem.onSelect(() => {
            const texture = new THREE.CubeTexture();
            texture.name = 'Cube Texture';
            editor.execute(new AddAssetCommand(texture));
        });
        assetMenu.add(addCubeMenuItem);

        // 'Palette'
        const paletteIcon = `${EDITOR.FOLDER_TYPES}asset/palette.svg`;
        const addPaletteMenuItem = new SUEY.MenuItem(Language.getKey('assets/types/palette'), paletteIcon);
        addPaletteMenuItem.onSelect(() => {
            const palette = new SALT.Palette();
            palette.name = `${Language.getKey('assets/types/palette')}`;
            editor.execute(new AddAssetCommand(palette));
        });
        assetMenu.add(addPaletteMenuItem);

        // Append Children
        addButton.attachMenu(assetMenu);
        buttonRow.add(addButton, new SUEY.FlexSpacer());
        this.tabTitle.add(buttonRow);

        /******************** PANELS */

        this.panels = {};

        this.panels['geometry'] = new AssetPanel({ type: 'geometry', title: Language.getKey('assets/types/geometry'), icon: `${EDITOR.FOLDER_TYPES}asset/geometry.svg` });
        this.panels['material'] = new AssetPanel({ type: 'material', title: Language.getKey('assets/types/material'), icon: `${EDITOR.FOLDER_TYPES}asset/material.svg` });
        this.panels['palette'] = new AssetPanel({ type: 'palette', title: Language.getKey('assets/types/palette'), icon: `${EDITOR.FOLDER_TYPES}asset/palette.svg` });
        this.panels['shape'] = new AssetPanel({ type: 'shape', title: Language.getKey('assets/types/shape'), icon: `${EDITOR.FOLDER_TYPES}asset/shape.svg` });
        this.panels['texture'] = new AssetPanel({ type: 'texture', title: Language.getKey('assets/types/texture'), icon: `${EDITOR.FOLDER_TYPES}asset/texture.svg` });

        // Add Panels
        for (let type in this.panels) {
            const panel = this.panels[type];
            this.add(panel);
        }

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

        /***** SIGNALS *****/

        function focusAsset(type, asset) {
            if (!asset || !asset.uuid) return;
            const panel = self.panels[type];
            if (panel) {
                editor.explorer.selectTab('assets');
                panel.setExpanded();
                const assetBox = document.getElementById(asset.uuid);
                if (assetBox) setTimeout(() => { assetBox.focus(); assetBox.click(); }, 0);
            }
        }

        function processAssets(type) {
            const panel = self.panels[type];
            if (panel) {
                panel.buildPanel(false /* clear? */);
                panel.applySearch(self.getSearchTerm());
            }
        }

        function assetChanged(type, asset) {
            const panel = self.panels[type];
            if (panel) {
                panel.updateItem(type, asset);
                panel.applySearch(self.getSearchTerm());
            }
        }

        signals.assetSelect.add(focusAsset);
        signals.assetAdded.add(processAssets);
        signals.assetRemoved.add(processAssets);
        signals.assetChanged.add(assetChanged);

        this.dom.addEventListener('destroy', function() {
            signals.assetSelect.remove(focusAsset);
            signals.assetAdded.remove(processAssets);
            signals.assetRemoved.remove(processAssets);
            signals.assetChanged.remove(assetChanged);
        }, { once: true });

        /***** INIT *****/

        // Inititate panel's search term
        this.searchPanels();

    } // end ctor

    /******************** SEARCH */

    getSearchTerm() { return Config.getKey('search/assets').toLowerCase(); }
    setSearchTerm(term) { Config.setKey('search/assets', String(term)); }

    searchPanels() {
        for (let category in this.panels) {
            const panel = this.panels[category];
            panel.applySearch(this.getSearchTerm());
        }
    }

}

export { AssetsTab };
