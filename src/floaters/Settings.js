import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { SettingsGeneralBlock } from './inspector/SettingsGeneralBlock.js';

import { View2DGridBlock } from './inspector/View2DGridBlock.js';

import { WorldGridTab } from './inspectorOLD/WorldGridTab.js';

/**
 * Settings Viewer
 */
class Settings extends SUEY.Floater {

    constructor() {
        const icon = `${EDITOR.FOLDER_TYPES}settings.svg`;
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

            // Blocks
            const blocks = [];
            blocks.push(new SettingsGeneralBlock());
            if (editor.mode() === EDITOR.MODES.SCENE_EDITOR_2D) {
                blocks.push(new View2DGridBlock());

            } else if (editor.mode() === EDITOR.MODES.SCENE_EDITOR_3D) {
                blocks.push(new SUEY.Floater('view', new SceneViewTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/view.svg`, color: '#ffffff', shadow: false }));
                blocks.push(new Scene3DGridBlock());
                blocks.push(new SUEY.Floater('three', new SceneThreeTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/three.svg`, color: '#019EF4', shadow: false, shrink: true }));
            } else if (editor.mode() === EDITOR.MODES.WORLD_GRAPH) {
                blocks.push(new SUEY.Floater('grid', new WorldGridTab(), { icon: `${EDITOR.FOLDER_TYPES}setting/grid.svg`, color: '#333333' }));
            }
            self.add(...blocks);
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'promodeChanged', build);

        /***** INIT *****/

        build();

    } // end ctor

}

export { Settings };
