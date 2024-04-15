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

import { SettingsGeneralBlock } from './settings/SettingsGeneralBlock.js';
import { View2DGridBlock } from './settings/View2DGridBlock.js';
import { WorldGridBlock } from './settings/WorldGridBlock.js';

/**
 * Editor Settings
 */
class Settings extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}settings.svg`;
        super('settings', { icon, color: '#C04145', shrink: '75%' });
        const self = this;
        Advice.attach(this.button, 'floater/settings');

        /******************** TITLED PANEL */

        const settingsPanel = new SUEY.Titled({ title: 'Settings' });
        this.add(settingsPanel);

        /** Builds Inspector */
        function build() {
            settingsPanel.clearContents();

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
            settingsPanel.add(...blocks);
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'promodeChanged', build);

        /***** INIT *****/

        build();

    } // end ctor

}

export { Settings };
