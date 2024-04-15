import {
    FOLDER_MENU,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AddAssetCommand } from '../../../commands/CommandList.js';
// import { AddComponentCommand } from '../../../commands/CommandList.js';
import { MultiCmdsCommand } from '../../../commands/CommandList.js';
// import { RemoveComponentCommand } from '../../../commands/CommandList.js';

class EntitySettingsButton extends SUEY.Button {

    constructor(entity) {
        super();

        // Checks
        let hideButton = !entity || !entity.isEntity;
        hideButton = hideButton || entity.isStage;
        hideButton = hideButton || entity.userData.flagHelper;
        if (hideButton) return this.setStyle('display', 'none');

        // Setup
        this.addClass('suey-borderless-button');
        this.overflowMenu = SUEY.OVERFLOW.LEFT;
        this.setAttribute('tooltip', 'Edit Component');
        this.add(new SUEY.ShadowBox(`${FOLDER_MENU}edit.svg`).addClass('suey-rotate-colorize'));

        // Properties
        this.componentMenu = new SUEY.Menu();
        this.attachMenu(this.componentMenu);

        /***** MENU *****/

        // 'Paste'
        let pasteItem;
        if (!entity.locked) {
            const pasteIcon = `${FOLDER_MENU}main/edit/paste.svg`;
            pasteItem = new SUEY.MenuItem('Paste Component', pasteIcon);
            pasteItem.onSelect(() => {
                if (pasteItem.disabled === true) return;
                if (!entity || !entity.isEntity) return;
                if (!Array.isArray(editor.clipboard.items)) return;
                const cmds = [];
                for (const componentData of editor.clipboard.items) {
                    if (!componentData.base || !componentData.base.isComponent) continue;
                    const type = componentData.base.type;
                    const ComponentClass = SALT.ComponentManager.registered(type);
                    const component = entity.getComponent(type);
                    if (!component || ComponentClass.config.multiple) {
                        cmds.push(new AddComponentCommand(entity, type, componentData));
                    } else {
                        cmds.push(new ChangeComponentCommand(entityComponent, componentData));
                    }
                }
                editor.execute(new MultiCmdsCommand(cmds, 'Paste Component'));
            });
            this.componentMenu.add(pasteItem);
        }

        this.componentMenu.newCategory();

        // 'Save to Prefabs' (saves Entity as Prefab)
        if (!entity.isPrefab && !entity.isWorld) {
            const saveIcon = `${FOLDER_MENU}component/copy.svg`;
            const saveItem = new SUEY.MenuItem('Save Entity to Prefabs', saveIcon);
            saveItem.onSelect(() => {
                const clone = entity.cloneEntity();
                clone.position.set(0, 0, 0);
                editor.execute(new AddAssetCommand(clone));
            });
            this.componentMenu.add(saveItem);
        }

        /***** SIGNALS *****/

        function updateClipboard() {
            const hasComponents = editor.clipboard.containsComponents(entity.type);
            if (pasteItem) pasteItem.setDisabled(!hasComponents);
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

export { EntitySettingsButton };
