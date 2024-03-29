import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Signals } from '../../config/Signals.js';

class SettingsHistoryTab extends SUEY.Titled {

    constructor() {
        super({ title: 'History' });

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** HEADER BUTTONS *****/

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');

        // 'History Clear' Button
        const historyClear = new SUEY.Button().addClass('suey-borderless-button').onClick(() => {
            editor.history.clear();
        });
        historyClear.dom.setAttribute('tooltip', 'Clear History');
        historyClear.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_INSPECTOR}settings/history/clear.svg`));

        // Add Buttons
        buttonRow.add(new SUEY.FlexSpacer(), historyClear);
        this.tabTitle.add(buttonRow);

        /***** TREELIST *****/

        const treeList = new SUEY.TreeList();

        // Key Down / Pointer Click
        let ignoreObjectSelectedSignal = false;
        treeList.on('change', () => {
            ignoreObjectSelectedSignal = true;
            editor.history.goToState(parseInt(treeList.getValue()));
            treeList.setValue(editor.history.undos.length);
            ignoreObjectSelectedSignal = false;
        });

        props.add(treeList);

        /***** UPDATE *****/

        function buildUI() {
            // Start Item
            const startOption = document.createElement('div');
            startOption.style.paddingLeft = '0.75em';
            startOption.value = 0;
            startOption.textContent = `0 - Start`;

            const options = [ startOption ];

            // Undo Items
            for (let i = 0; i < editor.history.undos.length; i++) {
                const object = editor.history.undos[i];
                const option = document.createElement('div');
                option.style.paddingLeft = '0.75em';
                option.value = object.id;
                option.textContent = `${i + 1} - ` + object.name;
                options.push(option);
            }

            const undoLength = editor.history.undos.length;

            // Redo Items
            for (let i = editor.history.redos.length - 1; i >= 0; i--) {
                const object = editor.history.redos[i];
                const option = document.createElement('div');
                option.style.paddingLeft = '0.75em';
                option.value = object.id;
                option.textContent = `${(editor.history.redos.length - i + undoLength)} - ` + object.name;
                option.style.opacity = 0.3;
                options.push(option);
            }

            // Set Items, Value
            treeList.setOptions(options);
            treeList.setValue(editor.history.undos.length, true);
        };

        function updateUI() {
            let optionNumber = 1;

            // Undo Items
            for (let i = 0; i < editor.history.undos.length; i++) {
                const object = editor.history.undos[i];
                const option = treeList.options[optionNumber];
                option.textContent = `${i + 1} - ` + object.name;
                option.style.opacity = 1.0;
                optionNumber++;
            }

            const undoLength = editor.history.undos.length;

            // Redo Items
            for (let i = editor.history.redos.length - 1; i >= 0; i--) {
                const object = editor.history.redos[i];
                const option = treeList.options[optionNumber];
                option.textContent = `${(editor.history.redos.length - i + undoLength)} - ` + object.name;
                option.style.opacity = 0.3;
                optionNumber++;
            }

            if (ignoreObjectSelectedSignal !== true) {
                treeList.setValue(editor.history.undos.length, true);
            }
        }

        /***** SIGNALS *****/

        let lastHistorySize = editor.history.undos.length + editor.history.redos.length;

        Signals.connect(this, 'historyChanged', function() {
            let thisHistorySize = editor.history.undos.length + editor.history.redos.length;
            if (lastHistorySize === thisHistorySize) {
                updateUI();
            } else {
                buildUI();
                lastHistorySize = thisHistorySize;
            }
        });

        /***** INIT *****/

        buildUI();
        setTimeout(() => treeList.dom.focus(), 100);

    } // end ctor

}

export { SettingsHistoryTab };
