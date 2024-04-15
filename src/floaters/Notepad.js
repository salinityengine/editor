import {
    EDITOR_MODES,
    FOLDER_FLOATERS,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
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
        super('notepad', null, { icon, color: '#FEC24D' });
        const self = this;
        Advice.attach(this.button, 'floater/notepad');

        /******************** TITLED PANEL */

        const notepadPanel = new SUEY.Titled({ title: 'Notepad' });
        this.add(notepadPanel);

        /******************** SCRATCHPAD */

        //
        // TODO
        //

    } // end ctor

}

export { Notepad };
