import * as SUEY from 'gui';

import { Config } from '../config/Config.js';

class EnhancedFloater extends SUEY.Floater {

    constructor(id = 'unknown', content, options = {}) {
        super(id, content, options);
        const self = this;

        // Remember where Floater was installed (see Layout.js)
        this.on('destroy', () => {
            const dock = self.dock;
            if (dock) {
                const key = `floater/initial/${self.id}`;
                const value = {};
                if (dock.hasClass('suey-window')) {
                    value.init = 'center';
                    value.size = dock.dom.style.width;
                    value.size2 = dock.dom.style.height;
                    value.startLeft = dock.dom.style.left;
                    value.startTop = dock.dom.style.top;
                    // value.initialWidth = dock.initialWidth;
                    // value.initialHeight = dock.initialHeight;
                } else if (dock.hasClass('suey-tabbed')) {
                    const docker = SUEY.Dom.parentElementWithClass(dock, 'suey-docker');
                    if (docker) {
                        const rect = docker.dom.getBoundingClientRect();
                        value.init = docker.initialSide;
                        value.side = docker.dockSide;
                        value.size = (value.init === 'left' || value.init === 'right') ? rect.width : rect.height;
                        value.size2 = (value.side === 'left' || value.side === 'right') ? rect.width : rect.height;
                    }
                }
                Config.setKey(key, value);
            }
        });

    } // end ctor

}

export { EnhancedFloater };
