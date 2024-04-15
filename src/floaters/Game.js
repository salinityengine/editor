import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { GameAppBlock } from './game/GameAppBlock.js';
import { GameInfoBlock } from './game/GameInfoBlock.js';

/**
 * Game Settings
 */
class Game extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}game.svg`;
        super('game', { icon, color: '#773399' });
        const self = this;
        Advice.attach(this.button, 'floater/game');

        // Create Blocks
        const blocks = [];
        blocks.push(new GameAppBlock());
        blocks.push(new GameInfoBlock());

        // Add Blocks
        this.add(...blocks);

    } // end ctor

}

export { Game };
