import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Signals } from '../../../config/Signals.js';

import { AddAssetCommand } from '../../../commands/Commands.js';
import { AddComponentCommand } from '../../../commands/Commands.js';
import { MultiCmdsCommand } from '../../../commands/Commands.js';
import { RemoveComponentCommand } from '../../../commands/Commands.js';

const _saveTypes = [
    'geometry',
    'material',
];

class ComponentSettingsButton extends SUEY.Button {

    constructor(component, entity) {
        super();

        // Setup
        this.addClass('suey-borderless-button');
        this.overflowMenu = SUEY.OVERFLOW.LEFT;
        this.setAttribute('tooltip', 'Edit Component');

        const shadowBox = new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}dots.svg`).addClass('suey-rotate-colorize');
        if (shadowBox.firstImage()) {
            if (shadowBox.firstImage().firstImage()) {
                shadowBox.firstImage().firstImage().setStyle('filter', 'brightness(1.25)');
            }
        }
        this.add(shadowBox);

        // Properties
        this.componentMenu = new SUEY.Menu();
        this.attachMenu(this.componentMenu);

        /***** MENU *****/

        // 'Copy'
        if (component && !entity.locked) {
            const copyIcon = `${EDITOR.FOLDER_MENU}main/edit/copy.svg`;
            const copyItem = new SUEY.MenuItem('Copy Component', copyIcon);
            copyItem.onSelect(() => {
                editor.copy(component);
            });
            this.componentMenu.add(copyItem);
        }

        this.componentMenu.newCategory();

        // 'Move Up/Down'
        function moveComponent(entity, component, direction = 'up') {
            if (!component || !component.isComponent) return;
            const positions = [];
            for (let i = 0; i < entity.components.length; i++) {
                if (entity.components[i].type === component.type) positions.push(i);
            }
            const index = entity.components.indexOf(component);
            const positionIndex = positions.indexOf(index);
            if (index > -1) {
                if (direction === 'up') {
                    if (positionIndex > 0) {
                        SALT.System.swapArrayItems(entity.components, positions[positionIndex], positions[positionIndex - 1]);
                        Signals.dispatch('inspectorBuild', 'rebuild');
                    }
                } else { /* if (direction === 'down') { */
                    if (positionIndex < positions.length - 1) {
                        SALT.System.swapArrayItems(entity.components, positions[positionIndex], positions[positionIndex + 1]);
                        Signals.dispatch('inspectorBuild', 'rebuild');
                    }
                }
            }
        }
        if (component && !entity.locked) {
            const moveUpIcon = `${EDITOR.FOLDER_MENU}component/move-up.svg`;
            const moveDownIcon = `${EDITOR.FOLDER_MENU}component/move-down.svg`;
            const moveUpItem = new SUEY.MenuItem('Move Up', moveUpIcon);
            const moveDownItem = new SUEY.MenuItem('Move Down', moveDownIcon);
            moveUpItem.onSelect(() => { moveComponent(entity, component, 'up'); });
            moveDownItem.onSelect(() => { moveComponent(entity, component, 'down'); });
            this.componentMenu.add(moveUpItem, moveDownItem);
        }

        // 'Save to Assets' (saves Component as Asset)
        if (component && _saveTypes.includes(component.type)) {
            const saveIcon = `${EDITOR.FOLDER_MENU}component/copy.svg`;
            const saveItem = new SUEY.MenuItem(`Save ${SUEY.Strings.capitalize(component.type)} to Assets`, saveIcon);
            saveItem.onSelect(() => {
                switch (component.type) {
                    case 'geometry':
                    case 'material':
                        const object = component.backend;
                        if (object && typeof object.clone === 'function') {
                            const clone = object.clone();
                            if (clone) editor.execute(new AddAssetCommand(clone));
                        }
                        break;
                }
            });
            this.componentMenu.add(saveItem);
        }

        this.componentMenu.newCategory();

        // 'Delete Component'
        if (component && !entity.locked) {
            const deleteIcon = `${EDITOR.FOLDER_MENU}component/delete.svg`;
            const deleteItem = new SUEY.MenuItem('Delete Component', deleteIcon);
            deleteItem.onSelect(() => {
                const entity = component.entity;
                if (entity && entity.isEntity) {
                    editor.execute(new RemoveComponentCommand(entity, component));
                } else {
                    component.detach();
                    component.dispose();
                }
            });
            this.componentMenu.add(deleteItem);
        }

        /***** SIGNALS *****/

        function updateClipboard() {
            // EMPTY
        }
        signals.clipboardChanged.add(updateClipboard);

        /***** DESTROY *****/

        this.on('destroy', () => {
            signals.clipboardChanged.remove(updateClipboard);
        });

        /***** INIT *****/

        updateClipboard();

    } // end ctor

}

export { ComponentSettingsButton };
