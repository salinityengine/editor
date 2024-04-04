import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { editor } from 'editor';

import { AddAssetCommand } from '../commands/Commands.js';
import { AssetPanel } from '../gui/AssetPanel.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Signals } from '../config/Signals.js';

/**
 * Access to items in the AssetManager
 */
class Assets extends SUEY.Titled {

    constructor() {
        super({ title: 'Assets' });
        const self = this;

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');

        /***** 'Add' Asset *****/
        const addButton = new SUEY.Button().addClass('suey-borderless-button');
        addButton.setAttribute('tooltip', 'Add Asset');
        addButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}add.svg`).addClass('suey-complement-colorize'));

        // 'Add' Menu
        const assetMenu = new SUEY.Menu();

        // 'Cube Texture'
        const cubeIcon = `${EDITOR.FOLDER_FLOATERS}asset/cube-texture.svg`;
        const addCubeMenuItem = new SUEY.MenuItem('Cube Texture', cubeIcon);
        addCubeMenuItem.onSelect(() => {
            const texture = new THREE.CubeTexture();
            texture.name = 'Cube Texture';
            editor.execute(new AddAssetCommand(texture));
        });
        assetMenu.add(addCubeMenuItem);

        // 'Palette'
        const paletteIcon = `${EDITOR.FOLDER_FLOATERS}asset/palette.svg`;
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

        this.panels['geometry'] = new AssetPanel({ type: 'geometry', title: Language.getKey('assets/types/geometry'), icon: `${EDITOR.FOLDER_FLOATERS}asset/geometry.svg` });
        this.panels['material'] = new AssetPanel({ type: 'material', title: Language.getKey('assets/types/material'), icon: `${EDITOR.FOLDER_FLOATERS}asset/material.svg` });
        this.panels['palette'] = new AssetPanel({ type: 'palette', title: Language.getKey('assets/types/palette'), icon: `${EDITOR.FOLDER_FLOATERS}asset/palette.svg` });
        this.panels['shape'] = new AssetPanel({ type: 'shape', title: Language.getKey('assets/types/shape'), icon: `${EDITOR.FOLDER_FLOATERS}asset/shape.svg` });
        this.panels['texture'] = new AssetPanel({ type: 'texture', title: Language.getKey('assets/types/texture'), icon: `${EDITOR.FOLDER_FLOATERS}asset/texture.svg` });

        // Add Panels
        for (let type in this.panels) {
            const panel = this.panels[type];
            this.add(panel);
        }

        // Add Search Bar
        const searchDiv = new SUEY.Div().addClass('salt-search-holder');
        const searchIcon = new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}search.svg`).addClass('salt-search-icon');
        const searchBox = new SUEY.TextBox('').addClass('salt-search-box');
        searchBox.dom.placeholder = Language.getKey('explorer/search');
        searchBox.setValue(this.getSearchTerm());
        searchBox.on('input', () => {
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
                editor.selectFloater('assets');
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

        Signals.connect(this, 'assetSelect', focusAsset);
        Signals.connect(this, 'assetAdded', processAssets);
        Signals.connect(this, 'assetRemoved', processAssets);
        Signals.connect(this, 'assetChanged', assetChanged);

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

export { Assets };
