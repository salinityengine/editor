
import {
    FOLDER_FLOATERS,
} from 'constants';
import * as SUEY from 'suey';
import { PropertyGroup } from '../../gui/PropertyGroup.js';

import { Config } from '../../config/Config.js';
import { Signals } from '../../config/Signals.js';

class WorldGridBlock extends PropertyGroup {

    constructor() {
        const icon = `${FOLDER_FLOATERS}settings/grid.svg`; // color: '#333333'
        super({ title: 'Grid', icon, arrow: 'right', border: true });

        /***** SNAP *****/

        // Snap to Grid
        const snapGrid = new SUEY.Checkbox().on('change', () => {
            Config.setKey('viewport/grid/snap', (!Config.getKey('viewport/grid/snap')));
            Signals.dispatch('gridChanged');
        });
        const snapShortcut = new SUEY.MenuShortcut(`G`);
        this.addRow('Snap to Grid', snapGrid, new SUEY.FlexSpacer(), snapShortcut);

        /***** STYLE *****/

        // this.addHeader('Style', `${FOLDER_FLOATERS}settings/grid/style.svg`);

        // Line Style
        const lineDrop = new SUEY.Dropdown();
        lineDrop.overflowMenu = SUEY.OVERFLOW.LEFT;
        lineDrop.setOptions({
            curve:      'Curved',
            zigzag:     'Sharp',
            straight:   'Straight',
        });
        lineDrop.on('change', () => {
            Config.setKey('world/curve', lineDrop.getValue());
            Signals.dispatch('gridChanged');
        });
        this.addRow('Line Type', lineDrop);

        // Grid Style
        const gridDrop = new SUEY.Dropdown();
        gridDrop.overflowMenu = SUEY.OVERFLOW.LEFT;
        gridDrop.setOptions({
            lines:  'Lines',
            dots:   'Dots',
        });
        gridDrop.on('change', () => {
            Config.setKey('world/grid/style', gridDrop.getValue());
            Signals.dispatch('gridChanged');
        });
        this.addRow('Grid Style', gridDrop);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('viewport/grid/snap'));
            lineDrop.setValue(Config.getKey('world/curve'));
            gridDrop.setValue(Config.getKey('world/grid/style'));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'gridChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { WorldGridBlock };
