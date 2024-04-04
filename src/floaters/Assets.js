import {
    FOLDER_FLOATERS,
    FOLDER_MENU,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

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
        addButton.add(new SUEY.ShadowBox(`${FOLDER_MENU}add.svg`).addClass('suey-complement-colorize'));

        // 'Add' Menu
        const assetMenu = new SUEY.Menu();

        // 'Cube Texture'
        const cubeIcon = `${FOLDER_FLOATERS}asset/cube-texture.svg`;
        const addCubeMenuItem = new SUEY.MenuItem('Cube Texture', cubeIcon);
        addCubeMenuItem.onSelect(() => {
            const texture = new THREE.CubeTexture();
            texture.name = 'Cube Texture';
            editor.execute(new AddAssetCommand(texture));
        });
        assetMenu.add(addCubeMenuItem);

        // 'Palette'
        const paletteIcon = `${FOLDER_FLOATERS}asset/palette.svg`;
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

        this.blocks = {};

        this.blocks['geometry'] = new AssetPanel({ type: 'geometry', title: Language.getKey('assets/types/geometry'), icon: `${FOLDER_FLOATERS}asset/geometry.svg` });
        this.blocks['material'] = new AssetPanel({ type: 'material', title: Language.getKey('assets/types/material'), icon: `${FOLDER_FLOATERS}asset/material.svg` });
        this.blocks['palette'] = new AssetPanel({ type: 'palette', title: Language.getKey('assets/types/palette'), icon: `${FOLDER_FLOATERS}asset/palette.svg` });
        this.blocks['shape'] = new AssetPanel({ type: 'shape', title: Language.getKey('assets/types/shape'), icon: `${FOLDER_FLOATERS}asset/shape.svg` });
        this.blocks['texture'] = new AssetPanel({ type: 'texture', title: Language.getKey('assets/types/texture'), icon: `${FOLDER_FLOATERS}asset/texture.svg` });

        // Add Panels
        for (const type in this.blocks) {
            const panel = this.blocks[type];
            this.add(panel);
        }

        // Add Search Bar
        const searchDiv = new SUEY.Div().addClass('salt-search-holder');
        const searchIcon = new SUEY.ShadowBox(`${FOLDER_MENU}search.svg`).addClass('salt-search-icon');
        const searchBox = new SUEY.TextBox('').addClass('salt-search-box');
        searchBox.dom.placeholder = Language.getKey('explorer/search');
        searchBox.setValue(this.getSearchTerm());
        searchBox.on('input', () => {
            self.setSearchTerm(searchBox.getValue());
            self.searchBlocks();
        });
        searchDiv.add(searchBox, searchIcon);
        this.addToSelf(searchDiv);

        /***** SIGNALS *****/

        function focusAsset(type, asset) {
            if (!asset || !asset.uuid) return;
            const panel = self.blocks[type];
            if (panel) {
                editor.selectFloater('assets');
                panel.setExpanded();
                const assetBox = document.getElementById(asset.uuid);
                if (assetBox) setTimeout(() => { assetBox.focus(); assetBox.click(); }, 0);
            }
        }

        function processAssets(type) {
            const panel = self.blocks[type];
            if (panel) {
                panel.buildPanel(false /* clear? */);
                panel.applySearch(self.getSearchTerm());
            }
        }

        function assetChanged(type, asset) {
            const panel = self.blocks[type];
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

        // Inititate search term
        this.searchBlocks();

    } // end ctor

    /******************** SEARCH */

    getSearchTerm() {
        const searchTerm = Config.getKey(`search/${this.constructor.name}`) ?? '';
        return String(searchTerm).toLowerCase();
    }

    setSearchTerm(term) {
        Config.setKey(`search/${this.constructor.name}`, String(term));
    }

    searchBlocks() {
        for (const category in this.blocks) {
            const panel = this.blocks[category];
            panel.applySearch(this.getSearchTerm());
        }
    }

}

export { Assets };
