import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';

class SmartShrinker extends SUEY.Shrinkable {

    constructor({
        title = '',
        icon = '',
        arrow = 'left',
        border = true,
        defaultExpanded = false,
    } = {}) {
        super({ title, icon, arrow, border });

        let expanded = Config.getKey(`blocks/expanded/${this.constructor.name}`);
        if (defaultExpanded && expanded == null) expanded = true;
        this.setExpanded(!!expanded, false /* event? */);
    }

    setExpanded(expand = true, dispatchEvent = true) {
        super.setExpanded(expand, dispatchEvent);
        Config.setKey(`blocks/expanded/${this.constructor.name}`, !!this.isExpanded);
    }

}

export { SmartShrinker };
