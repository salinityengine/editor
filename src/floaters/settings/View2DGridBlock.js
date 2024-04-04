import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SUEY from 'gui';
import { ConfiguredShrinker } from '../../gui/ConfiguredShrinker.js';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

class View2DGridBlock extends ConfiguredShrinker {

    constructor() {
        const icon = `${FOLDER_FLOATERS}settings/grid.svg`; // color: '#333333'
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

        // props.addHeader(Language.getKey('inspector/grid/style'), `${FOLDER_FLOATERS}settings/grid/style.svg`);
        // props.addHeader(Language.getKey('inspector/grid/visibility'), `${FOLDER_FLOATERS}settings/grid/visibility.svg`);

        // Show Grid
        const showGrid = new SUEY.Checkbox().on('change', () => {
            Config.setKey('scene2d/grid/show', (!Config.getKey('scene2d/grid/show')));
            Signals.dispatch('gridChanged');
        });
        const showGridShortcut = new SUEY.MenuShortcut(); // `N`);
        props.addRow(Language.getKey('inspector/grid/showCanvas'), showGrid, new SUEY.FlexSpacer(), showGridShortcut);

        // Grid Size
        const gridSizeBox = new SUEY.NumberBox();
        gridSizeBox.setPrecision(3).setRange(0.00, 100).setStep(0.01);
        gridSizeBox.on('change', () => {
            Config.setKey('scene2d/grid/sizeX', gridSizeBox.getValue());
            Signals.dispatch('gridChanged');
        });
        props.addRow(Language.getKey('inspector/grid/size'), gridSizeBox);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('scene/grid/snap'));
            gridSizeBox.setValue(Config.getKey('scene2d/grid/sizeX'));
            showGrid.setValue(Config.getKey('scene2d/grid/show'));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'gridChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { View2DGridBlock };
