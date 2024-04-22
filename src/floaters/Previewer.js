import {
    FOLDER_FLOATERS,
    FOLDER_TYPES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { ScriptPreview } from './previewer/ScriptPreview.js';

/**
 * Object Previewer
 */
class Previewer extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}previewer.svg`;
        super('previewer', { icon, color: '#FD8469', shrink: '92%' });
        const self = this;
        Advice.attach(this.button, 'floater/previewer');

        /******************** BUILD */

        // Private
        let item = undefined;

        /**
         * Builds (or rebuilds) the object previewer
         * @param {any} from - The uuid object or array of objects to build from. Pass 'rebuild' to recreate with existing object.
         */
        function build(from = undefined) {
            // Process 'from'
            if (from !== 'rebuild') {
                // TEMP: Only process first entity
                if (Array.isArray(from)) from = (from.length === 0) ? undefined : from[0];

                // Don't rebuild an entity that is already displayed
                if (from && item && item.isEntity && item.uuid === from.uuid) return;

                // Save Current Item
                item = from;
            }

            // Process Item
            const blocks = [];
            let titleName = 'Previewer';

            // ITEM: None
            if (item == undefined) {
                const emptyText = new SUEY.Row().add(new SUEY.Text('No Selection'));
                emptyText.setStyle('justifyContent', 'center', 'padding', '1em var(--border-small)');
                blocks.push(emptyText);

            // ITEM: Palette
            } else if (item.isPalette) {
                // blocks.push(new SUEY.Floater('palette', { icon: `${FOLDER_FLOATERS}asset/palette.svg`, color: '#a0a0a0', shrink: true }).add(new PaletteTab(item)));

            // ITEM: Script
            } else if (item.isScript) {
                titleName = 'Script';
                blocks.push(new ScriptPreview(item));

            // ITEM: Unknown
            } else {
                const unknownText = new SUEY.Row().add(new SUEY.Text(`Unknown Item: '${(typeof item === 'object') ? item.name : item}'`));
                unknownText.setStyle('justifyContent', 'center', 'padding', '1em var(--border-small)');
                blocks.push(unknownText);
            }

            // Delete existing Blocks
            self.clearContents();

            // Set Title
            self.setTitle(titleName);

            // Add Blocks
            self.add(...blocks);
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'promodeChanged', () => build('rebuild'));
        Signals.connect(this, 'settingsRefreshed', () => build('rebuild'));
        Signals.connect(this, 'projectLoaded', () => build(undefined));

        //
        // TODO
        //
        // Signals.connect(this, 'assetAdded', (type, asset) => { });
        // Signals.connect(this, 'assetChanged', (type, asset) => { });
        // Signals.connect(this, 'assetRemoved', (type, asset) => { });

        Signals.connect(this, 'assetSelect', (type, asset) => build(asset));

        /***** INIT *****/

        build(null, false /* highlight? */);
    }

}

export { Previewer };
