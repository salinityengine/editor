import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';

class ConfiguredShrinker extends SUEY.Shrinkable {

    constructor({
        text = '',
        icon = '',
        arrow = 'left',
        border = true
    } = {}) {
        super({ text, icon, arrow, border });

        const expanded = Boolean(Config.getKey(`blocks/expanded/${this.constructor.name}`));
        this.setExpanded(expanded, false /* event? */);
    }

    setExpanded(expand = true, dispatchEvent = true) {
        super.setExpanded(expand, dispatchEvent);
        Config.setKey(`blocks/expanded/${this.constructor.name}`, !!this.isExpanded);
    }

}

export { ConfiguredShrinker };
