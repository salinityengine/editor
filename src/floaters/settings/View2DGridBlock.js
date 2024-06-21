import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SUEY from 'suey';
import { SmartShrinker } from '../../gui/SmartShrinker.js';

import { Config } from '../../config/Config.js';
import { Signals } from '../../config/Signals.js';

class View2DGridBlock extends SmartShrinker {

    constructor() {
        const icon = `${FOLDER_FLOATERS}settings/grid.svg`; // color: '#333333'
        super({ title: 'Grid', icon, arrow: 'right', border: true });

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** SNAP *****/

        // Snap to Grid
        const snapGrid = new SUEY.Checkbox().on('change', () => {
            Config.setKey('viewport/grid/snap', (!Config.getKey('viewport/grid/snap')));
            Signals.dispatch('gridChanged');
        });
        const snapShortcut = new SUEY.MenuShortcut(`G`);
        props.addRow('Snap to Grid', snapGrid, new SUEY.FlexSpacer(), snapShortcut);

        /***** STYLE *****/

        // props.addHeader('Style', `${FOLDER_FLOATERS}settings/grid/style.svg`);
        // props.addHeader('Visibility', `${FOLDER_FLOATERS}settings/grid/visibility.svg`);

        // Show Grid
        const showGrid = new SUEY.Checkbox().on('change', () => {
            Config.setKey('view2d/grid/show', (!Config.getKey('view2d/grid/show')));
            Signals.dispatch('gridChanged');
        });
        const showGridShortcut = new SUEY.MenuShortcut(); // `N`);
        props.addRow('Show Grid', showGrid, new SUEY.FlexSpacer(), showGridShortcut);

        // Grid Size
        const gridSizeX = new SUEY.NumberBox();
        gridSizeX.setPrecision(3).setRange(0, 100).setStep(5);
        gridSizeX.on('change', () => {
            Config.setKey('view2d/grid/sizeX', gridSizeX.getValue());
            Signals.dispatch('gridChanged');
        });
        const gridSizeY = new SUEY.NumberBox();
        gridSizeY.setPrecision(3).setRange(0, 100).setStep(5);
        gridSizeY.on('change', () => {
            Config.setKey('view2d/grid/sizeY', gridSizeY.getValue());
            Signals.dispatch('gridChanged');
        });
        gridSizeX.setStyle('color', 'rgb(var(--triadic1))');
        gridSizeY.setStyle('color', 'rgb(var(--triadic2))');
        props.addRow('Grid Size', gridSizeX, gridSizeY);

        // Grid Scale
        const gridScaleX = new SUEY.SliderBox();
        gridScaleX.setPrecision(1).setRange(0, 5).setStep(0.2);
        gridScaleX.on('change', () => {
            Config.setKey('view2d/grid/scaleX', gridScaleX.getValue());
            Signals.dispatch('gridChanged');
        });
        const gridScaleY = new SUEY.SliderBox();
        gridScaleY.setPrecision(1).setRange(0, 5).setStep(0.2);
        gridScaleY.on('change', () => {
            Config.setKey('view2d/grid/scaleY', gridScaleY.getValue());
            Signals.dispatch('gridChanged');
        });
        props.addRow('Grid Scale X', gridScaleX);
        props.addRow('Grid Scale Y', gridScaleY);

        // Grid Scale
        const gridRotate = new SUEY.SliderBox(0);
        gridRotate.setPrecision(1).setRange(0, 360).setStep(5).setUnit('°');
        function updateGridRotation() {
            Config.setKey('view2d/grid/rotate', gridRotate.getValue());
            Signals.dispatch('gridChanged');
        }
        gridRotate.on('change', updateGridRotation);
        props.addRow('Grid Rotation', gridRotate);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('viewport/grid/snap'));
            showGrid.setValue(Config.getKey('view2d/grid/show'));
            gridSizeX.setValue(Config.getKey('view2d/grid/sizeX'));
            gridSizeY.setValue(Config.getKey('view2d/grid/sizeY'));
            gridScaleX.setValue(Config.getKey('view2d/grid/scaleX'));
            gridScaleY.setValue(Config.getKey('view2d/grid/scaleY'));
            gridRotate.setValue(Config.getKey('view2d/grid/rotate'));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'gridChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { View2DGridBlock };
