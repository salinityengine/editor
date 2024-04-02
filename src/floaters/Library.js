import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Signals } from '../config/Signals.js';

import { AddAssetCommand } from '../commands/Commands.js';
import { AssetPanel } from '../gui/AssetPanel.js';

/**
 * Scripts
 */
class Library extends SUEY.Floater {

    constructor() {
        const icon = `${EDITOR.FOLDER_TYPES}script.svg`;
        super('library', null, { icon, color: '#090B11' });
        const self = this;
        Advice.attach(this.button, 'floater/library');

        /******************** TITLED PANEL */

        const libPanel = new SUEY.Titled({ title: 'Library' });
        this.add(libPanel);

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');

        /***** 'Add' Asset *****/
        const addButton = new SUEY.Button().addClass('suey-borderless-button');
        addButton.setAttribute('tooltip', 'Add Asset');
        addButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}add.svg`).addClass('suey-complement-colorize'));

        // 'Add' Menu
        const assetMenu = new SUEY.Menu();

        // 'Script'
        const scriptIcon = `${EDITOR.FOLDER_TYPES}asset/script.svg`;
        const addScriptMenuItem = new SUEY.MenuItem(Language.getKey('assets/types/script'), scriptIcon);
        addScriptMenuItem.onSelect(() => {
            const script = new SALT.Script();
            script.name = `${Language.getKey('assets/types/script')}`;
            editor.execute(new AddAssetCommand(script));
        });
        assetMenu.add(addScriptMenuItem);

        // 'Variables'
        const variableIcon = `${EDITOR.FOLDER_TYPES}asset/script.svg`;
        const addVariableMenuItem = new SUEY.MenuItem(Language.getKey('assets/types/script/variables'), variableIcon);
        addVariableMenuItem.onSelect(() => {
            const script = new SALT.Script(SALT.SCRIPT_FORMAT.JAVASCRIPT, true /* variables? */);
            script.name = `${Language.getKey('assets/types/script/variables')}`;
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
        this.blocks[unknown] = new AssetPanel({ type: 'script', category: unknown, title: 'General', icon: `${EDITOR.FOLDER_COLLECTIONS}scripts/general.svg`, view: 'list' });
        libPanel.add(this.blocks[unknown]);

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
                        case 'camera': icon = `${EDITOR.FOLDER_COLLECTIONS}scripts/camera.svg`; break;
                        case 'control': icon = `${EDITOR.FOLDER_COLLECTIONS}scripts/control.svg`; break;
                        case 'entity': icon = `${EDITOR.FOLDER_COLLECTIONS}scripts/entity.svg`; break;

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

        // Inititate panel's search term
        this.searchPanels();

    } // end ctor

    /******************** SEARCH */

    getSearchTerm() { return Config.getKey('search/scripts').toLowerCase(); }
    setSearchTerm(term) { Config.setKey('search/scripts', String(term)); }

    searchPanels() {
        for (const category in this.blocks) {
            const panel = this.blocks[category];
            panel.applySearch(this.getSearchTerm());
        }
    }

}

export { Library };
