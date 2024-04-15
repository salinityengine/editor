import {
    FOLDER_FLOATERS,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

/**
 * Undo / Redo History
 */
class History extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}history.svg`;
        super('history', { icon, color: '#BF4044', shadow: false, shrink: 0.75 });
        Advice.attach(this.button, 'floater/history');

        /***** HEADER BUTTONS *****/

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');

        // 'History Clear' Button
        const historyClear = new SUEY.Button().addClass('suey-borderless-button').onPress(() => {
            editor.commands.clear();
        });
        historyClear.setAttribute('tooltip', 'Clear History');
        historyClear.add(new SUEY.ShadowBox(`${FOLDER_FLOATERS}history/clear.svg`));

        // Add Buttons
        buttonRow.add(new SUEY.FlexSpacer(), historyClear);
        this.tabTitle.add(buttonRow);

        /***** TREELIST *****/

        const props = new SUEY.PropertyList();
        this.add(props);

        const treeList = new SUEY.TreeList();
        props.add(treeList);

        // Key Down / Pointer Click
        let ignoreObjectSelectedSignal = false;
        treeList.on('change', () => {
            ignoreObjectSelectedSignal = true;
            editor.commands.goToState(parseInt(treeList.getValue()));
            treeList.setValue(editor.commands.undos.length);
            ignoreObjectSelectedSignal = false;
        });

        /***** UPDATE *****/

        function buildUI() {
            // Start Item
            const startOption = document.createElement('div');
            startOption.style.paddingLeft = '0.75em';
            startOption.value = 0;
            startOption.textContent = `0 - Start`;

            const options = [ startOption ];

            // Undo Items
            for (let i = 0; i < editor.commands.undos.length; i++) {
                const object = editor.commands.undos[i];
                const option = document.createElement('div');
                option.style.paddingLeft = '0.75em';
                option.value = object.id;
                option.textContent = `${i + 1} - ` + object.name;
                options.push(option);
            }

            const undoLength = editor.commands.undos.length;

            // Redo Items
            for (let i = editor.commands.redos.length - 1; i >= 0; i--) {
                const object = editor.commands.redos[i];
                const option = document.createElement('div');
                option.style.paddingLeft = '0.75em';
                option.value = object.id;
                option.textContent = `${(editor.commands.redos.length - i + undoLength)} - ` + object.name;
                option.style.opacity = 0.3;
                options.push(option);
            }

            // Set Items, Value
            treeList.setOptions(options);
            treeList.setValue(editor.commands.undos.length, true);
        };

        function updateUI() {
            let optionNumber = 1;

            // Undo Items
            for (let i = 0; i < editor.commands.undos.length; i++) {
                const object = editor.commands.undos[i];
                const option = treeList.options[optionNumber];
                option.textContent = `${i + 1} - ` + object.name;
                option.style.opacity = 1.0;
                optionNumber++;
            }

            const undoLength = editor.commands.undos.length;

            // Redo Items
            for (let i = editor.commands.redos.length - 1; i >= 0; i--) {
                const object = editor.commands.redos[i];
                const option = treeList.options[optionNumber];
                option.textContent = `${(editor.commands.redos.length - i + undoLength)} - ` + object.name;
                option.style.opacity = 0.3;
                optionNumber++;
            }

            if (ignoreObjectSelectedSignal !== true) {
                treeList.setValue(editor.commands.undos.length, true);
            }
        }

        /***** SIGNALS *****/

        let lastHistorySize = editor.commands.undos.length + editor.commands.redos.length;

        Signals.connect(this, 'historyChanged', function() {
            let thisHistorySize = editor.commands.undos.length + editor.commands.redos.length;
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

export { History };
