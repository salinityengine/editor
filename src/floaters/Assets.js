import {
    FOLDER_FLOATERS,
    FOLDER_MENU,
    FOLDER_TYPES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { AssetBlock } from '../gui/AssetBlock.js';
import { EnhancedFloater } from '../gui/EnhancedFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Signals } from '../config/Signals.js';

import { AddAssetCommand } from '../commands/Commands.js';

/**
 * Access to items in the AssetManager
 */
class Assets extends EnhancedFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}assets.svg`;
        super('assets', null, { icon });
        const self = this;
        Advice.attach(this.button, 'floater/assets');

        /******************** TITLED PANEL */

        const assetPanel = new SUEY.Titled({ title: 'Assets' });
        this.add(assetPanel);

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');

        /***** 'Add' Asset *****/
        const addButton = new SUEY.Button().addClass('suey-borderless-button');
        addButton.setAttribute('tooltip', 'Add Asset');
        addButton.add(new SUEY.ShadowBox(`${FOLDER_MENU}add.svg`).addClass('suey-complement-colorize'));

        // 'Add' Menu
        const assetMenu = new SUEY.Menu();

        // 'Cube Texture'
        const cubeIcon = `${FOLDER_TYPES}asset/cube-texture.svg`;
        const addCubeMenuItem = new SUEY.MenuItem('Cube Texture', cubeIcon);
        addCubeMenuItem.onSelect(() => {
            const texture = new THREE.CubeTexture();
            texture.name = 'Cube Texture';
            editor.execute(new AddAssetCommand(texture));
        });
        assetMenu.add(addCubeMenuItem);

        // 'Palette'
        const paletteIcon = `${FOLDER_TYPES}asset/palette.svg`;
        const addPaletteMenuItem = new SUEY.MenuItem('Palette', paletteIcon);
        addPaletteMenuItem.onSelect(() => {
            const palette = new SALT.Palette();
            palette.name = 'Palette';
            editor.execute(new AddAssetCommand(palette));
        });
        assetMenu.add(addPaletteMenuItem);

        // Append Children
        addButton.attachMenu(assetMenu);
        buttonRow.add(addButton, new SUEY.FlexSpacer());
        assetPanel.tabTitle.add(buttonRow);

        /******************** BLOCKS */

        this.blocks = {};

        this.blocks['geometry'] = new AssetBlock({ type: 'geometry', title: 'Geometry', icon: `${FOLDER_TYPES}asset/geometry.svg` });
        this.blocks['material'] = new AssetBlock({ type: 'material', title: 'Material', icon: `${FOLDER_TYPES}asset/material.svg` });
        this.blocks['palette'] = new AssetBlock({ type: 'palette', title: 'Palette', icon: `${FOLDER_TYPES}asset/palette.svg` });
        this.blocks['shape'] = new AssetBlock({ type: 'shape', title: 'Shape', icon: `${FOLDER_TYPES}asset/shape.svg` });
        this.blocks['texture'] = new AssetBlock({ type: 'texture', title: 'Texture', icon: `${FOLDER_TYPES}asset/texture.svg` });

        // Add Blocks
        for (const type in this.blocks) {
            const block = this.blocks[type];
            assetPanel.add(block);
        }

        // Add Search Bar
        const searchDiv = new SUEY.Div().addClass('salt-search-holder');
        const searchIcon = new SUEY.ShadowBox(`${FOLDER_MENU}search.svg`).addClass('salt-search-icon');
        const searchBox = new SUEY.TextBox('').addClass('salt-search-box');
        searchBox.dom.placeholder = Language.getKey('gui/search/box');
        searchBox.setValue(this.getSearchTerm());
        searchBox.on('input', () => {
            self.setSearchTerm(searchBox.getValue());
            self.searchBlocks();
        });
        searchDiv.add(searchBox, searchIcon);
        assetPanel.addToSelf(searchDiv);

        /***** SIGNALS *****/

        function focusAsset(type, asset) {
            if (!asset || !asset.uuid) return;
            const block = self.blocks[type];
            if (block) {
                editor.selectFloater('assets');
                block.setExpanded();
                const assetBox = document.getElementById(asset.uuid);
                if (assetBox) setTimeout(() => { assetBox.focus(); assetBox.click(); }, 0);
            }
        }

        function processAssets(type) {
            const block = self.blocks[type];
            if (block) {
                block.buildBlock(false /* clear? */);
                block.applySearch(self.getSearchTerm());
            }
        }

        function assetChanged(type, asset) {
            const block = self.blocks[type];
            if (block) {
                block.updateItem(type, asset);
                block.applySearch(self.getSearchTerm());
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
            const block = this.blocks[category];
            block.applySearch(this.getSearchTerm());
        }
    }

}

export { Assets };
