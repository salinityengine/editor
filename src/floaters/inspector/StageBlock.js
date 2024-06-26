import {
    FOLDER_FLOATERS,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { PropertyGroup } from '../../gui/PropertyGroup.js';
import { Signals } from '../../config/Signals.js';

import { SetEntityValueCommand } from '../../commands/CommandList.js';

class StageBlock extends SUEY.Div {

    constructor(entity) {
        super();
        this.addClass('salt-property-panel');

        /******************** GENERAL */

        const displayGroup = new PropertyGroup({
            title: 'Display',
            icon: `${FOLDER_FLOATERS}inspector/stage/flag.svg`,
            arrow: 'left',
            border: true,
        });
        displayGroup.setLeftPropertyWidth('30%');
        this.add(displayGroup);

        // Enabled
        const stageEnabled = new SUEY.Checkbox();
        stageEnabled.on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'enabled', stageEnabled.getValue()));
        });
        displayGroup.addRow('Enabled', stageEnabled);

        // Start
        const stageStart = new SUEY.NumberBox(0).setStep(1).setNudge(0.1).setMin(0);
        stageStart.on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'start', stageStart.getValue()));
        });
        displayGroup.addRow('Start', stageStart);

        // Finish
        const stageFinish = new SUEY.NumberBox(0).setStep(1).setNudge(0.1).setMin(-1);
        stageFinish.on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'finish', stageFinish.getValue()));
        });
        displayGroup.addRow('Finish', stageFinish);

        /***** UPDATE *****/

        function updateUI() {
            stageEnabled.setValue(entity.enabled);
            stageStart.setValue(entity.start);
            stageFinish.setValue(entity.finish);
        }

        /***** SIGNALS *****/

        function entityChangeCallback(changedEntity) {
            if (!changedEntity || !changedEntity.isEntity) return;
            if (changedEntity.uuid === entity.uuid) updateUI();
        };

        Signals.connect(this, 'entityChanged', entityChangeCallback);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { StageBlock };
