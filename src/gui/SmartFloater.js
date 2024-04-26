import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Layout } from '../config/Layout.js';

class SmartFloater extends SUEY.Floater {

    constructor(id = 'unknown', options = {}) {
        super(id, options);
        const self = this;

        // Remember where Floater was installed (see Layout.js)
        this.on('destroy', () => {
            const dock = self.dock;
            if (!dock) return;
            const key = self.id;
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
            Layout.setPosition(key, value);
        });

        // Remember Scroller Position
        this.on('destroy', () => {
            if (self.id == null || self.id == '') return;
            const scroller = (self.scroller && self.scroller.dom) ? self.scroller.dom : self.scroller;
            if (!scroller) return;
            Config.setKey(`floater/scroller/${self.id}`, scroller.scrollTop);
        });
        this.on('hidden', () => {
            if (self.id == null || self.id == '') return;
            const scroller = (self.scroller && self.scroller.dom) ? self.scroller.dom : self.scroller;
            if (!scroller) return;
            Config.setKey(`floater/scroller/${self.id}`, scroller.scrollTop);
        });
        this.on('displayed', () => {
            if (self.id == null || self.id == '') return;
            const scroller = (self.scroller && self.scroller.dom) ? self.scroller.dom : self.scroller;
            if (!scroller) return;
            const scrollTop = parseFloat(Config.getKey(`floater/scroller/${self.id}`));
            if (!isNaN(scrollTop) && isFinite(scrollTop)) scroller.scrollTop = scrollTop;
        });

    } // end ctor

}

export { SmartFloater };
