import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

class SceneGridTab extends SUEY.Titled {

    constructor() {
        super({ title: Language.getKey('inspector/grid/title') });

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** SNAP *****/

        props.addHeader(Language.getKey('inspector/grid/magnet'), `${EDITOR.FOLDER_INSPECTOR}settings/grid/snap.svg`);

        // Snap to Grid
        const snapGrid = new SUEY.Checkbox().onChange(() => {
            Config.setKey('scene/grid/snap', (!Config.getKey('scene/grid/snap')));
            Signals.dispatch('gridChanged');
        });
        const snapShortcut = new SUEY.MenuShortcut(`G`);
        props.addRow(Language.getKey('inspector/grid/snap'), snapGrid, new SUEY.FlexSpacer(), snapShortcut);

        /***** STYLE *****/

        props.addHeader(Language.getKey('inspector/grid/style'), `${EDITOR.FOLDER_INSPECTOR}settings/grid/style.svg`);

        // Grid Size
        const gridSizeBox = new SUEY.NumberBox();
        gridSizeBox.setPrecision(3).setRange(0.00, 100).setStep(0.01);
        gridSizeBox.onChange(() => {
            Config.setKey('scene/grid/translateSize', gridSizeBox.getValue());
            Signals.dispatch('gridChanged');
        });
        props.addRow(Language.getKey('inspector/grid/size'), gridSizeBox);

        // Grid Multiplier
        const gridMultiSlider = new SUEY.Slider();

        let gridTimeout = null; /* timeout to limit firing */
        gridMultiSlider.onInput(() => {
            clearTimeout(gridTimeout);
            gridTimeout = setTimeout(() => {
                if (gridMultiSlider && gridMultiSlider.dom && gridMultiBox && gridMultiBox.dom) {
                    Config.setKey('scene/grid/canvasMultiplier', gridMultiSlider.getValue());
                    Signals.dispatch('gridChanged');
                }
            }, 5);
        });

        const gridMultiBox = new SUEY.NumberBox().addClass('osui-property-tiny-row');
        gridMultiBox.onChange(() => {
            Config.setKey('scene/grid/canvasMultiplier', gridMultiBox.getValue());
            Signals.dispatch('gridChanged');
        });

        gridMultiSlider.setPrecision(0).setRange(1, 10).setStep(1);
        gridMultiBox.setRange(1, 10).setStep(1).setPrecision(0);
        gridMultiBox.setStyle('marginLeft', EDITOR.WIDGET_SPACING)
        gridMultiBox.dom.style.setProperty('--min-width', `${2 /* digits */ + 1.5}ch`);

        props.addRow(Language.getKey('inspector/grid/multiplier'), gridMultiSlider, gridMultiBox);

        /***** VISIBILITY *****/

        props.addHeader(Language.getKey('inspector/grid/visibility'), `${EDITOR.FOLDER_INSPECTOR}settings/grid/visibility.svg`);

        // Show Grid
        const showGrid = new SUEY.Checkbox().onChange(() => {
            Config.setKey('scene/grid/showCanvas', (!Config.getKey('scene/grid/showCanvas')));
            Signals.dispatch('gridChanged');
        });
        const showGridShortcut = new SUEY.MenuShortcut(`N`);

        props.addRow(Language.getKey('inspector/grid/showCanvas'), showGrid, new SUEY.FlexSpacer(), showGridShortcut);

        // Mini Grid
        const miniGrid = new SUEY.Checkbox().onChange(() => {
            Config.setKey('scene/grid/showInfinite', (!Config.getKey('scene/grid/showInfinite')));
            Signals.dispatch('gridChanged');
        });
        const showMiniShortcut = new SUEY.MenuShortcut(`M`);
        props.addRow(Language.getKey('inspector/grid/showInfinite'), miniGrid, new SUEY.FlexSpacer(), showMiniShortcut);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('scene/grid/snap'));
            gridSizeBox.setValue(Config.getKey('scene/grid/translateSize'));
            showGrid.setValue(Config.getKey('scene/grid/showCanvas'));
            miniGrid.setValue(Config.getKey('scene/grid/showInfinite'));
            gridMultiSlider.setValue(Config.getKey('scene/grid/canvasMultiplier'));
            gridMultiBox.setValue(Config.getKey('scene/grid/canvasMultiplier'));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'gridChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { SceneGridTab };
