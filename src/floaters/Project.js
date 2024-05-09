import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SALT from 'salt';
import * as SUEY from 'suey';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { ProjectAppBlock } from './project/ProjectAppBlock.js';
import { ProjectInfoBlock } from './project/ProjectInfoBlock.js';

/**
 * Project Settings
 */
class Project extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}project.svg`;
        super('project', { icon, color: '#773399' });
        const self = this;
        Advice.attach(this.button, 'floater/project');

        // Create Blocks
        const blocks = [];
        blocks.push(new ProjectAppBlock());
        blocks.push(new ProjectInfoBlock());

        // Add Blocks
        this.add(...blocks);

    } // end ctor

}

export { Project };
