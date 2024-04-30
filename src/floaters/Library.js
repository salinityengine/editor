import {
    FOLDER_FLOATERS,
    FOLDER_MENU,
    FOLDER_TYPES,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { AssetBlock } from '../gui/AssetBlock.js';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';

/**
 * Objects / Items / Prefabs
 */
class Library extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}library.svg`;
        super('library', { icon });
        const self = this;
        Advice.attach(this.button, 'floater/library');

        /******************** BLOCKS */

        this.blocks = {};

        // 'Entity' Category (user defined)
        const general = 'unknown';
        this.blocks[general] = new AssetBlock({ type: 'prefab', category: general, title: 'General', icon: `${FOLDER_TYPES}prefab/general.svg` });
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
        this.addToSelf(new SUEY.FlexSpacer(), searchDiv);

        /***** INIT *****/

        // Inititate search term
        this.searchBlocks();

    } // end ctor

    /******************** SEARCH */

    getSearchTerm() {
        return Config.getKey(`search/${this.constructor.name}`) ?? '';
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
