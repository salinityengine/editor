import {
    EDITOR_MODES,
    FOLDER_FLOATERS,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

/**
 * Note Scratchpad
 */
class Notepad extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}notepad.svg`;
        super('notepad', { icon, color: '#FEC24D' });
        const self = this;
        Advice.attach(this.button, 'floater/notepad');

        //
        // TODO
        //

    } // end ctor

}

export { Notepad };
