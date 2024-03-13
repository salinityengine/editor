import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../../../config/Config.js';

import { ChangeComponentCommand } from '../../../commands/Commands.js';
import { addProperty } from './AddProperty.js';

class ComponentProperties extends SUEY.PropertyList {

    constructor(component) {
        super();
        const self = this;
        this.setLeftPropertyWidth(component.constructor.config.width);

        // Store component for 'addProperty' access
        this._component = component;

        /***** COMPSALTNT INFO *****/

        // Get component Class prototype
        const ComponentClass = SALT.ComponentManager.registered(component.type);
        if (ComponentClass === undefined) return;
        const schema = (ComponentClass.config) ? ComponentClass.config.schema : {};

        /***** SCHEMA PANEL *****/

        // Local Variables
        let data;

        // Data (as it was when tab was opened)
        const startData = component.toJSON() ?? {};
        delete startData['base'];

        // Initial Build
        buildPanel();

        this.onPointerLeave(() => {
            signals.advisorInfo.dispatch();
        });

        // ----- END CTOR ----- (ONLY FUNCTIONS BELOW)

        /******************** BUILDER ********************/

        function buildPanel() {

            // Verify that Editor hasn't changed selection
            const entity = component.entity;
            if (entity && entity.isEntity) {
                if (editor.inspector.currentItem() && editor.inspector.currentItem().uuid === entity.uuid) {
                    // OKAY
                } else {
                    // INSPECTOR CHANGED
                    return;
                }
            }

            // CLEAR
            self.clearContents();

            // LOAD DATA
            data = component.toJSON() ?? {};
            delete data['base'];

            // PARSE KEYS
            for (const propKey in schema) {

                // Items to Process for Schema Key
                const itemArray = Array.isArray(schema[propKey]) ? schema[propKey] : [ schema[propKey] ];

                // Loop through items in property array, if that we satisfy conditions, add property widgets
                for (const item of itemArray) {
                    // CHECK: 'promode'
                    if (item.promode && !Config.getKey('promode')) continue;

                    // CHECK: 'if' / 'not'
                    if (!SALT.ComponentManager.includeData(item, data)) continue;

                    // CHECK: 'hide'
                    if (item.hide !== undefined) {
                        let hideCondition = false;
                        for (const hideKey in item.hide) {
                            const hideArray = Array.isArray(item.hide[hideKey]) ? item.hide[hideKey] : [];
                            for (const hideIfValue of hideArray) {
                                if (data[hideKey] === hideIfValue) hideCondition = true;
                            }
                        }
                        if (hideCondition) continue;
                    }

                    /***** STILL HERE? ADD WIDGET TO INSPECTOR *****/

                    addProperty(self, data[propKey], propKey, item, updateComponent);

                    break;
                }
            }

            /***** NO PROPERTIES ADDED (schema empty?) *****/

            if (self.children && self.children.length === 0) {
                const emptyRow = new SUEY.Row().addClass('osui-property-left', 'osui-left-tab-spacing');
                const emptyText = new SUEY.Text('No Properties').setDisabled(true);
                self.add(emptyRow.add(emptyText));
            }

            /***** LOCKED? *****/

            if (entity && entity.locked) {
                self.disableInputs();
            }

        } // end buildPanel()

        /******************** REBUILD ********************/

        function updateComponent(item, key, value, forceSmall = false) {

            // Complete rebuild
            if (!forceSmall && (key === 'style' || item['rebuild'])) {

                // Keep any data from starting data that match current conditions
                const stripStart = Object.assign({}, startData);
                stripStart[key] = value;
                SALT.ComponentManager.stripData(component.type, startData, stripStart);

                // Keep any data from current data that match current conditions
                const stripCurrent = Object.assign({}, data);
                stripCurrent[key] = value;
                SALT.ComponentManager.stripData(component.type, data, stripCurrent);

                // Create 'newData' from leftover start data, current data, and new data
                const newData = {};
                for (const subKey in stripStart) newData[subKey] = stripStart[subKey];
                for (const subKey in stripCurrent) newData[subKey] = stripCurrent[subKey];
                newData[key] = value;

                // Strip variable data on 'Script' change
                if (key === 'script') {
                    newData.variables = {};
                }

                // Change Component Command
                editor.execute(new ChangeComponentCommand(component, newData, data));

                // Store current scroll position
                const parent = SUEY.Utils.parentScroller(self);
                const scrollPosition = (parent) ? parent.scrollTop : 0;

                // Delay (to allow checkbox to animate)
                const delay = (item.type === 'boolean') ? 250 : 0;

                // Timeout to rebuild 'properties'
                setTimeout(() => {
                    buildPanel();

                    // Reset Scroll Position
                    if (parent) parent.scrollTop = scrollPosition;
                }, delay);

            // Small update through Undo / Redo only
            } else {

                const newValue = structuredClone(value);
                const newData = structuredClone(data);
                newData[key] = newValue;
                editor.execute(new ChangeComponentCommand(component, newData, data));
                data[key] = newValue;

            }
        }

    } // end ctor

}

export { ComponentProperties };
