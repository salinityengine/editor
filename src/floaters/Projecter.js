import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { ProjectAppBlock } from './project/ProjectAppBlock.js';
import { ProjectInfoBlock } from './project/ProjectInfoBlock.js';

/**
 * Project Settings
 */
class Projecter extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}project.svg`;
        super('project', null, { icon, color: '#773399' });
        const self = this;
        Advice.attach(this.button, 'floater/project');

        /******************** TITLED PANEL */

        const projectPanel = new SUEY.Titled({ title: 'Project' });
        this.add(projectPanel);

        // Create Blocks
        const blocks = [];
        blocks.push(new ProjectAppBlock());
        blocks.push(new ProjectInfoBlock());

        // Add Blocks
        projectPanel.add(...blocks);

    } // end ctor

}

export { Projecter };
