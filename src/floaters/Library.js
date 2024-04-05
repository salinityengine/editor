import {
    FOLDER_MENU,
    FOLDER_TYPES,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';

import { AssetBlock } from '../gui/AssetBlock.js';

/**
 * Objects / Items / Prefabs
 */
class Library extends SUEY.Titled {

    constructor() {
        super({ title: 'Library' });
        const self = this;

        /******************** BLOCKS */

        this.blocks = {};

        // 'Entity' Category (user defined)
        const general = 'unknown';
        this.blocks[general] = new AssetBlock({ type: 'prefab', category: general, title: 'General', icon: `${FOLDER_TYPES}prefabs/general.svg` });
        this.add(this.blocks[general]);

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

export { Library };
