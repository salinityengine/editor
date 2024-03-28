import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';

import { AssetPanel } from '../gui/AssetPanel.js';

/**
 * Objects / Items / Prefabs
 */
class Things extends SUEY.Titled {

    constructor() {
        super({ title: 'Prefabs' });
        const self = this;

        /******************** PANELS */

        this.panels = {};

        // 'Entity' Category (user defined)
        const general = 'unknown';
        this.panels[general] = new AssetPanel({ type: 'prefab', category: general, title: 'General', icon: `${EDITOR.FOLDER_COLLECTIONS}prefabs/general.svg` });
        this.add(this.panels[general]);

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

        /***** INIT *****/

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

export { Things };
