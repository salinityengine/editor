import {
    FOLDER_FLOATERS,
    FOLDER_MENU,
    FOLDER_TYPES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Signals } from '../config/Signals.js';

import { AddAssetCommand } from '../commands/Commands.js';
import { AssetPanel } from '../gui/AssetPanel.js';

/**
 * Script Library
 */
class Codex extends SUEY.Floater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}codex.svg`;
        super('codex', null, { icon, color: '#090B11' });
        const self = this;
        Advice.attach(this.button, 'floater/codex');

        /******************** TITLED PANEL */

        const libPanel = new SUEY.Titled({ title: 'Codex' });
        this.add(libPanel);

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');

        /***** 'Add' Asset *****/
        const addButton = new SUEY.Button().addClass('suey-borderless-button');
        addButton.setAttribute('tooltip', 'Add Asset');
        addButton.add(new SUEY.ShadowBox(`${FOLDER_MENU}add.svg`).addClass('suey-complement-colorize'));

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
        libPanel.tabTitle.add(buttonRow);

        /******************** PANELS */

        this.blocks = {};

        // No Category
        const unknown = 'unknown';
        this.blocks[unknown] = new AssetPanel({ type: 'script', category: unknown, title: 'General', icon: `${FOLDER_TYPES}script/general.svg`, view: 'list' });
        libPanel.add(this.blocks[unknown]);

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
        libPanel.addToSelf(searchDiv);

        /***** SIGNALS */

        function focusAsset(type, asset) {
            if (!asset || !asset.uuid) return;
            if (type === 'script') {
                const category = asset.category ?? unknown;
                const panel = self.blocks[category];
                if (panel) {
                    editor.selectFloater('scripts');
                    panel.setExpanded();
                    const assetBox = document.getElementById(asset.uuid);
                    if (assetBox) setTimeout(() => { assetBox.focus(); assetBox.click(); }, 0);
                }
            }
        }

        function processScripts(type) {
            if (type !== 'script') return;
            const scripts = SALT.AssetManager.library('script');
            for (const script of scripts) {
                const category = String(script.category).toLowerCase();
                if (!category) continue;

                if (!self.blocks[category]) {
                    let icon = '';
                    switch (category) {
                        case 'camera': icon = `${FOLDER_TYPES}scripts/camera.svg`; break;
                        case 'control': icon = `${FOLDER_TYPES}scripts/control.svg`; break;
                        case 'entity': icon = `${FOLDER_TYPES}scripts/entity.svg`; break;

                        //
                        // ADDITIONAL CUSTOM CATEGORY ICONS HERE
                        //
                    }
                    const title = SUEY.Strings.capitalize(category);
                    self.blocks[category] = new AssetPanel({ type: 'script', category, title, icon, view: 'list' });
                    self.add(self.blocks[category]);
                }
            }

            // Add Icons
            for (const category in self.blocks) {
                const panel = self.blocks[category];
                panel.buildPanel(false /* clear? */);
                panel.applySearch(self.getSearchTerm());
            }
        }

        function assetChanged(type, script) {
            if (type !== 'script') return;
            if (!script || !script.isScript) {
                processScripts(type);
            } else {
                const category = script.category ?? unknown;
                const panel = self.blocks[category];
                if (panel) {
                    panel.updateItem(type, script);
                    panel.applySearch(self.getSearchTerm());
                } else {
                    processScripts(type);
                }
            }
        }

        function projectLoaded() {
            processScripts('script');
        }

        Signals.connect(this, 'assetSelect', focusAsset);
        Signals.connect(this, 'assetAdded', processScripts);
        Signals.connect(this, 'assetRemoved', processScripts);
        Signals.connect(this, 'assetChanged', assetChanged);
        Signals.connect(this, 'projectLoaded', projectLoaded);

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

export { Codex };
