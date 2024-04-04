import {
    EDITOR_MODES,
    FOLDER_FLOATERS,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { SettingsGeneralBlock } from './settings/SettingsGeneralBlock.js';
import { View2DGridBlock } from './settings/View2DGridBlock.js';
import { WorldGridBlock } from './settings/WorldGridBlock.js';

/**
 * Editor Settings
 */
class Settings extends SUEY.Floater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}settings.svg`;
        super('settings', null, { icon, color: '#C04145', shrink: true });
        const self = this;
        Advice.attach(this.button, 'floater/settings');

        /** Builds Inspector */
        function build() {
            self.clearContents();

            // Title
            const inspectorTitle = new SUEY.Div('Settings').addClass('suey-tab-title');
            if (self.dock && self.dock.hasClass('suey-window')) inspectorTitle.addClass('suey-hidden');
            self.add(inspectorTitle);

            // Create Blocks
            const blocks = [];
            blocks.push(new SettingsGeneralBlock());
            if (editor.mode() === EDITOR_MODES.SCENE_EDITOR_2D) {
                blocks.push(new View2DGridBlock());
            } else if (editor.mode() === EDITOR_MODES.SCENE_EDITOR_3D) {
                // EMPTY
            } else if (editor.mode() === EDITOR_MODES.WORLD_GRAPH) {
                blocks.push(new WorldGridBlock());
            }

            // Add Blocks
            self.add(...blocks);
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'promodeChanged', build);

        /***** INIT *****/

        build();

    } // end ctor

}

export { Settings };
