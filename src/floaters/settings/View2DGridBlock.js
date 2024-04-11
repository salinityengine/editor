import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SUEY from 'gui';
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
        const gridSizeBox = new SUEY.NumberBox();
        gridSizeBox.setPrecision(3).setRange(0.00, 100).setStep(0.01);
        gridSizeBox.on('change', () => {
            Config.setKey('view2d/grid/sizeX', gridSizeBox.getValue());
            Signals.dispatch('gridChanged');
        });
        props.addRow('Grid Size', gridSizeBox);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('viewport/grid/snap'));
            gridSizeBox.setValue(Config.getKey('view2d/grid/sizeX'));
            showGrid.setValue(Config.getKey('view2d/grid/show'));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'gridChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { View2DGridBlock };
