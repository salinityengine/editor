import {
    FOLDER_FLOATERS,
} from 'constants';
import editor from 'editor';
import * as SUEY from 'suey';
import { SmartShrinker } from '../../gui/SmartShrinker.js';

import { Advice } from '../../config/Advice.js';
import { Config } from '../../config/Config.js';
import { Signals } from '../../config/Signals.js';

class GameAppBlock extends SmartShrinker {

    constructor() {
        const icon = `${FOLDER_FLOATERS}game/app.svg`;
        super({ title: 'App', icon, arrow: 'right', border: true });
        Advice.attach(this.titleDiv, 'game/app');

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** APP *****/

        // Name
        const projectName = new SUEY.TextBox().on('change', () => {
            editor.project.name = projectName.getValue();
        });
        const nameRow = props.addRow('Name', projectName);
        Advice.attach(nameRow, 'game/app/name');

        // Orientation
        const orientOptions = {
            portrait: 'Portrait',
            landscape: 'Landscape',
        };
        const orientSelect = new SUEY.Dropdown();
        orientSelect.overflowMenu = SUEY.OVERFLOW.LEFT;
        orientSelect.setOptions(orientOptions);
        orientSelect.on('change', () => {
            editor.project.settings.orientation = orientSelect.getValue();
        });
        const orientRow = props.addRow('Orientation', orientSelect);
        Advice.attach(orientRow, 'game/app/orientation');

        /***** THRESHOLD *****/

        const thresholdHeader = props.addHeader('Threshold', `${FOLDER_FLOATERS}game/threshold.svg`);
        Advice.attach(thresholdHeader, 'game/threshold');

        // Preload
        const preload = new SUEY.NumberBox().setPrecision(3).setStep(0.1);
        preload.on('change', () => {
            editor.project.settings.preload = preload.getValue();
        });
        const preloadRow = props.addRow('Preload', preload);
        Advice.attach(preloadRow, 'game/threshold/preload');

        // Unload
        const unload = new SUEY.NumberBox().setPrecision(3).setStep(0.1);
        unload.on('change', () => {
            editor.project.settings.unload = unload.getValue();
        });
        const unloadRow = props.addRow('Unload', unload);
        Advice.attach(unloadRow, 'game/threshold/unload');

        /***** UPDATE *****/

        function updateUI() {
            projectName.setValue(editor.project.name);
            orientSelect.setValue(editor.project.settings.orientation);
            preload.setValue(editor.project.settings.preload);
            unload.setValue(editor.project.settings.unload);
        }

        /***** SIGNALS *****/

        // Signals.connect(this, 'projectChanged' or similar ???, updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { GameAppBlock };
