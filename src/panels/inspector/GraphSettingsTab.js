
import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

class GraphSettingsTab extends SUEY.Titled {

    constructor() {
        super({ title: Language.getKey('inspector/graph/title') });

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** SNAP *****/

        props.addHeader(Language.getKey('inspector/grid/magnet'), `${EDITOR.FOLDER_INSPECTOR}settings/grid/snap.svg`);

        // Snap to Grid
        const snapGrid = new SUEY.Checkbox().onChange(() => {
            Config.setKey('graph/grid/snap', (!Config.getKey('graph/grid/snap')));
            Signals.dispatch('gridChanged');
        });
        const snapShortcut = new SUEY.MenuShortcut(`G`);
        props.addRow(Language.getKey('inspector/grid/snap'), snapGrid, new SUEY.FlexSpacer(), snapShortcut);

        /***** STYLE *****/

        props.addHeader(Language.getKey('inspector/grid/style'), `${EDITOR.FOLDER_INSPECTOR}settings/grid/style.svg`);

        // Line Style
        const lineDrop = new SUEY.Dropdown();
        lineDrop.overflowMenu = SUEY.OVERFLOW.LEFT;
        lineDrop.setOptions({
            curve:      'Curved',
            zigzag:     'Sharp',
            straight:   'Straight',
        });
        lineDrop.onChange(() => {
            Config.setKey('graph/curve', lineDrop.getValue());
            if (editor && editor.worlds) {
                editor.worlds.curveType = Config.getKey('graph/curve');
                editor.worlds.drawLines();
            }
        });
        props.addRow(Language.getKey('inspector/graph/line'), lineDrop);

        // Grid Style
        const gridDrop = new SUEY.Dropdown();
        gridDrop.overflowMenu = SUEY.OVERFLOW.LEFT;
        gridDrop.setOptions({
            lines:  'Lines',
            dots:   'Dots',
        });
        gridDrop.onChange(() => {
            Config.setKey('graph/grid/style', gridDrop.getValue());
            if (editor && editor.worlds) editor.worlds.changeGridType(Config.getKey('graph/grid/style'));
        });
        props.addRow(Language.getKey('inspector/graph/grid'), gridDrop);

        /***** UPDATE *****/

        function updateUI() {
            snapGrid.setValue(Config.getKey('graph/grid/snap'));
            lineDrop.setValue(Config.getKey('graph/curve'));
            gridDrop.setValue(Config.getKey('graph/grid/style'));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'gridChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { GraphSettingsTab };
