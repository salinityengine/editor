import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { ProjectAppBlock } from './project/ProjectAppBlock.js';
import { ProjectInfoBlock } from './project/ProjectInfoBlock.js';

/**
 * Project Settings
 */
class Projecter extends SUEY.Floater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}project.svg`;
        super('project', null, { icon, color: '#773399' });
        const self = this;
        Advice.attach(this.button, 'floater/project');

        // Title
        const inspectorTitle = new SUEY.Div('Project').addClass('suey-tab-title');
        if (self.dock && self.dock.hasClass('suey-window')) inspectorTitle.addClass('suey-hidden');
        self.add(inspectorTitle);

        // Create Blocks
        const blocks = [];
        blocks.push(new ProjectAppBlock());
        blocks.push(new ProjectInfoBlock());

        // Add Blocks
        self.add(...blocks);

    } // end ctor

}

export { Projecter };
