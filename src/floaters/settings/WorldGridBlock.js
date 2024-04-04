
import * as EDITOR from 'editor';
import * as SUEY from 'gui';
import { ConfiguredShrinker } from '../../gui/ConfiguredShrinker.js';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

class WorldGridBlock extends ConfiguredShrinker {

    constructor() {
        const icon = `${EDITOR.FOLDER_FLOATERS}settings/grid.svg`; // color: '#333333'
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

        // props.addHeader(Language.getKey('inspector/grid/style'), `${EDITOR.FOLDER_FLOATERS}settings/grid/style.svg`);

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
        props.addRow(Language.getKey('inspector/graph/line'), lineDrop);

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
        props.addRow(Language.getKey('inspector/graph/grid'), gridDrop);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('scene/grid/snap'));
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
