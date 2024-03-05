import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from '../../config/Advice.js';
import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';

class ProjectGeneralTab extends SUEY.Titled {

    constructor() {
        super({ title: Language.getKey('inspector/project/title') });
        Advice.attach(this.tabTitle, 'project');

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        // Name
        const projectName = new SUEY.TextBox().onChange(() => {
            editor.project.name = projectName.getValue();
        });
        const nameRow = props.addRow(Language.getKey('inspector/project/name'), projectName);
        Advice.attach(nameRow, 'project/name');

        /***** APP *****/

        const appHeader = props.addHeader('App', `${EDITOR.FOLDER_INSPECTOR}project/app.svg`);
        Advice.attach(appHeader, 'project/app');

        // Orientation
        const orientOptions = {
            portrait: 'Portrait',
            landscape: 'Landscape',
        };
        const orientSelect = new SUEY.Dropdown();
        orientSelect.overflowMenu = SUEY.OVERFLOW.LEFT;
        orientSelect.setOptions(orientOptions);
        orientSelect.onChange(() => {
            editor.project.settings.orientation = orientSelect.getValue();
        });
        const orientRow = props.addRow('Orientation', orientSelect);
        Advice.attach(orientRow, 'project/app/orientation');

        /***** THRESHOLD *****/

        const thresholdHeader = props.addHeader('Threshold', `${EDITOR.FOLDER_INSPECTOR}project/threshold.svg`);
        Advice.attach(thresholdHeader, 'project/threshold');

        // Preload
        const preload = new SUEY.NumberBox().setPrecision(3).setStep(0.1);
        preload.onChange(() => {
            editor.project.settings.preload = preload.getValue();
        });
        const preloadRow = props.addRow('Preload', preload);
        Advice.attach(preloadRow, 'project/threshold/preload');

        // Unload
        const unload = new SUEY.NumberBox().setPrecision(3).setStep(0.1);
        unload.onChange(() => {
            editor.project.settings.unload = unload.getValue();
        });
        const unloadRow = props.addRow('Unload', unload);
        Advice.attach(unloadRow, 'project/threshold/unload');

        /***** UPDATE *****/

        function updateUI() {
            projectName.setValue(editor.project.name);
            orientSelect.setValue(editor.project.settings.orientation);
            preload.setValue(editor.project.settings.preload);
            unload.setValue(editor.project.settings.unload);
        }

        /***** SIGNALS *****/

        signals.inspectorUpdate.add(updateUI);

        this.dom.addEventListener('destroy', function() {
            signals.inspectorUpdate.remove(updateUI);
        }, { once: true });

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { ProjectGeneralTab };
