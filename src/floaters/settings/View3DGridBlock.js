import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

class View3DGridBlock extends SUEY.Shrinkable {

    constructor() {
        const icon = `${EDITOR.FOLDER_INSPECTOR}settings/grid.svg`; // color: '#333333'
        super({ text: Language.getKey('inspector/grid/title'), icon, arrow: 'right', border: true });

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** SNAP *****/

        // Snap to Grid
        const snapGrid = new SUEY.Checkbox().on('change', () => {
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
        gridSizeBox.on('change', () => {
            Config.setKey('scene3d/grid/translateSize', gridSizeBox.getValue());
            Signals.dispatch('gridChanged');
        });
        props.addRow(Language.getKey('inspector/grid/minisize'), gridSizeBox);

        // Grid Multiplier
        const gridMultiSlider = new SUEY.Slider();

        let gridTimeout = null; /* timeout to limit firing */
        gridMultiSlider.on('input', () => {
            clearTimeout(gridTimeout);
            gridTimeout = setTimeout(() => {
                if (gridMultiSlider && gridMultiSlider.dom && gridMultiBox && gridMultiBox.dom) {
                    Config.setKey('scene3d/grid/canvasMultiplier', gridMultiSlider.getValue());
                    Signals.dispatch('gridChanged');
                }
            }, 5);
        });

        const gridMultiBox = new SUEY.NumberBox().addClass('suey-property-tiny-row');
        gridMultiBox.on('change', () => {
            Config.setKey('scene3d/grid/canvasMultiplier', gridMultiBox.getValue());
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
        const showGrid = new SUEY.Checkbox().on('change', () => {
            Config.setKey('scene3d/grid/showCanvas', (!Config.getKey('scene3d/grid/showCanvas')));
            Signals.dispatch('gridChanged');
        });
        const showGridShortcut = new SUEY.MenuShortcut(`N`);
        props.addRow(Language.getKey('inspector/grid/showCanvas'), showGrid, new SUEY.FlexSpacer(), showGridShortcut);

        // Mini Grid
        const miniGrid = new SUEY.Checkbox().on('change', () => {
            Config.setKey('scene3d/grid/showInfinite', (!Config.getKey('scene3d/grid/showInfinite')));
            Signals.dispatch('gridChanged');
        });
        const showMiniShortcut = new SUEY.MenuShortcut(`M`);
        props.addRow(Language.getKey('inspector/grid/showInfinite'), miniGrid, new SUEY.FlexSpacer(), showMiniShortcut);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('scene/grid/snap'));
            gridSizeBox.setValue(Config.getKey('scene3d/grid/translateSize'));
            showGrid.setValue(Config.getKey('scene3d/grid/showCanvas'));
            miniGrid.setValue(Config.getKey('scene3d/grid/showInfinite'));
            gridMultiSlider.setValue(Config.getKey('scene3d/grid/canvasMultiplier'));
            gridMultiBox.setValue(Config.getKey('scene3d/grid/canvasMultiplier'));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'gridChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { View3DGridBlock };
