import {
    FOLDER_FLOATERS,
    FOLDER_MENU,
    FOLDER_TYPES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { AssetBlock } from '../gui/AssetBlock.js';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Layout } from '../config/Layout.js';
import { Signals } from '../config/Signals.js';

import { AddAssetCommand } from '../commands/CommandList.js';

/**
 * Script Library
 */
class Codex extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}codex.svg`;
        super('codex', { icon, color: '#090B11' });
        const self = this;
        Advice.attach(this.button, 'floater/codex');

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');

        /***** 'Add' Asset *****/
        const addButton = new SUEY.Button().addClass('suey-borderless-button');
        addButton.setAttribute('tooltip', 'Add Asset');
        addButton.add(new SUEY.ShadowBox(`${FOLDER_MENU}add.svg`).setColor('complement'));

        // 'Add' Menu
        const assetMenu = new SUEY.Menu();

        // 'Script'
        const scriptIcon = `${FOLDER_TYPES}asset/script.svg`;
        const addScriptMenuItem = new SUEY.MenuItem('Script', scriptIcon);
        addScriptMenuItem.onSelect(() => {
            const script = new SALT.Script();
            script.name = 'Script';
            editor.execute(new AddAssetCommand(script));
        });
        assetMenu.add(addScriptMenuItem);

        // 'Variables'
        const variableIcon = `${FOLDER_TYPES}asset/script.svg`;
        const addVariableMenuItem = new SUEY.MenuItem('Variables', variableIcon);
        addVariableMenuItem.onSelect(() => {
            const script = new SALT.Script(SALT.SCRIPT_FORMAT.JAVASCRIPT, true /* variables? */);
            script.name = 'Variables';
            editor.execute(new AddAssetCommand(script));
        });
        assetMenu.add(addVariableMenuItem);

        // Append Children
        addButton.attachMenu(assetMenu);
        buttonRow.add(addButton, new SUEY.FlexSpacer());
        this.tabTitle.add(buttonRow);

        /******************** BLOCKS */

        this.blocks = {};

        // No Category
        const unknown = 'unknown';
        this.blocks[unknown] = new AssetBlock({ type: 'script', category: unknown, title: 'General', icon: `${FOLDER_TYPES}script/general.svg`, view: 'list' });
        this.add(this.blocks[unknown]);

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
        this.addToSelf(searchDiv);

        /***** SIGNALS */

        function focusAsset(type, asset) {
            if (!asset || !asset.uuid) return;
            if (type === 'script') {
                const category = asset.category ?? unknown;
                const block = self.blocks[category];
                if (block) {
                    Layout.selectFloater(self);
                    block.setExpanded();
                    const assetBox = document.getElementById(asset.uuid);
                    if (assetBox) setTimeout(() => {
                        assetBox.focus();
                        assetBox.click();
                    }, 0);
                }
            }
        }

        function processAssets(type, asset, focus = false) {
            if (type !== 'script') return;
            const scripts = (asset && asset.isAsset) ? [ asset ] : SALT.AssetManager.library('script');
            // Add Categories
            const categories = [];
            for (const script of scripts) {
                const category = (script.category) ? String(script.category).toLowerCase() : undefined;
                if (!category) continue;
                if (!categories.includes(category)) categories.push(category);
                if (!self.blocks[category]) {
                    let icon = '';
                    switch (category) {
                        case 'camera': icon = `${FOLDER_TYPES}scripts/camera.svg`; break;
                        case 'control': icon = `${FOLDER_TYPES}scripts/control.svg`; break;
                        case 'entity': icon = `${FOLDER_TYPES}scripts/entity.svg`; break;
                        // ADDITIONAL CUSTOM CATEGORY ICONS HERE
                    }
                    const title = SUEY.Strings.capitalize(category);
                    self.blocks[category] = new AssetBlock({ type: 'script', category, title, icon, view: 'list' });
                    self.add(self.blocks[category]);
                }
            }
            // Process Categories
            for (const category of categories) {
                const block = self.blocks[category];
                block.buildBlock(false /* clear? */);
                block.applySearch(self.getSearchTerm());
            }
            // Focus?
            if (focus) focusAsset(type, asset);
        }

        function assetChanged(type, script) {
            if (type !== 'script') return;
            if (script && script.isScript) {
                const category = script.category ?? unknown;
                const block = self.blocks[category];
                if (block) {
                    block.updateItem('script', script);
                    block.applySearch(self.getSearchTerm());
                }
            }
        }

        Signals.connect(this, 'assetAdded', (type, asset) => processAssets(type, asset, true /* focus? */));
        Signals.connect(this, 'assetRemoved', processAssets);
        Signals.connect(this, 'assetChanged', assetChanged);
        Signals.connect(this, 'assetSelect', focusAsset);
        Signals.connect(this, 'projectLoaded', () => processAssets('script'));

        /***** INIT *****/

        // Build
        processAssets('script');

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

export { Codex };
