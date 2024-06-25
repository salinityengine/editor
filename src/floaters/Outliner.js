import {
    EDITOR_MODES,
    FOLDER_FLOATERS,
    FOLDER_IMAGES,
    FOLDER_MENU,
    FOLDER_TYPES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Signals } from '../config/Signals.js';

import { AddEntityCommand } from '../commands/CommandList.js';
import { MoveEntityCommand } from '../commands/CommandList.js';
import { MultiCmdsCommand } from '../commands/CommandList.js';
import { SelectCommand } from '../commands/CommandList.js';
import { SetStageCommand } from '../commands/CommandList.js';
import { SetEntityValueCommand } from '../commands/CommandList.js';

const _nodeStates = new WeakMap();

/**
 * Project Scene Hierarchy
 */
class Outliner extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}outliner.svg`;
        super('outliner', { icon });
        const self = this;
        Advice.attach(this.button, 'floater/outliner');

        /******************** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');

        /***** 'Add' Entity *****/
        const addButton = new SUEY.Button().addClass('suey-borderless-button');
        addButton.setAttribute('tooltip', 'Add Asset');
        addButton.add(new SUEY.ShadowBox(`${FOLDER_MENU}add.svg`).setColor('complement'));

        // 'Add' Menu
        const entityMenu = new SUEY.Menu();

        // 'Entities'
        function addEntityMenuItem(name, icon, factory = () => {}) {
            const entityMenuItem = new SUEY.MenuItem(name, icon);
            entityMenuItem.onSelect(() => {
                const viewWorld = editor.viewport().getWorld();
                if (!viewWorld) return;
                const entity = factory();
                if (!entity) return;
                //
                // TODO: Set entity position based on camera
                //
                // entity.position.copy(editor.viewport().getCameraTarget());
                //
                const cmds = [];
                if (entity.isStage) {
                    cmds.push(new AddEntityCommand(entity, viewWorld));
                    cmds.push(new SetStageCommand(viewWorld.type, entity));
                } else {
                    cmds.push(new AddEntityCommand(entity, viewWorld.activeStage()));
                }
                cmds.push(new SelectCommand([ entity ], editor.selected));
                editor.execute(new MultiCmdsCommand(cmds, `Add ${name}`));
            });
            entityMenu.add(entityMenuItem);
            return entityMenuItem;
        }

        // Add Entity
        addEntityMenuItem('Entity', `${FOLDER_TYPES}entity/entity.svg`, () => {
            switch (editor.viewport().mode()) {
                case EDITOR_MODES.WORLD_2D: return new SALT.Entity();
                // case EDITOR_MODES.WORLD_3D: return new SALT.Entity3D();
            }
        });

        // Add Camera
        addEntityMenuItem('Camera', `${FOLDER_TYPES}entity/camera.svg`, () => {
            switch (editor.viewport().mode()) {
                // case EDITOR_MODES.WORLD_2D: return new SALT.Camera2D();
                // case EDITOR_MODES.WORLD_3D: return new SALT.Camera3D();
            }
        });

        entityMenu.add(new SUEY.MenuSeparator());

        // Add Stage
        const stageMenuItem = addEntityMenuItem('Stage', `${FOLDER_TYPES}entity/stage.svg`, () => {
            const viewWorld = editor.viewport().getWorld();
            if (!viewWorld) return;
            switch (editor.viewport().mode()) {
                case EDITOR_MODES.WORLD_2D: return new SALT.Stage(SALT.STAGE_TYPES.STAGE_2D, `Stage ${viewWorld.getStages().length + 1}`);
                case EDITOR_MODES.WORLD_3D: return new SALT.Stage(SALT.STAGE_TYPES.STAGE_3D, `Stage ${viewWorld.getStages().length + 1}`);
            }
        });
        stageMenuItem.divIcon.img.setStyle('padding', '0.05em', 'border-radius', '0.5em');

        // Append Children
        addButton.attachMenu(entityMenu);
        buttonRow.add(addButton, new SUEY.FlexSpacer());
        this.tabTitle.add(buttonRow);

        /******************** TREELIST */

        const treeList = new SUEY.TreeList(true /* multiSelect */).addClass('salt-outliner');
        this.add(treeList);

        // CHANGE: Fired on Key Down & Pointer Click
        let ignoreSelectionChangedSignal = false;
        treeList.on('change', () => {
            const viewWorld = editor.viewport().getWorld();
            if (!viewWorld) return;
            const uuids = treeList.getValues();
            if (uuids.length === 0) return;
            ignoreSelectionChangedSignal = true;

            // Select 'world'
            const world = editor.project.getWorldByUUID(uuids[0]);
            if (world && world.isWorld) {
                if (world.uuid !== viewWorld.activeStage().uuid) {
                    const cmds = [];
                    cmds.push(new SetStageCommand(viewWorld.type, null, world));
                    cmds.push(new SelectCommand([ world ], editor.selected));
                    editor.execute(new MultiCmdsCommand(cmds, 'Select World'));
                } else {
                    editor.execute(new SelectCommand([ world ], editor.selected));
                }
                ignoreSelectionChangedSignal = false;
                return;
            }

            // Select 'stage'
            const stage = viewWorld.getStageByUUID(uuids[0]);
            if (stage && stage.isStage) {
                if (stage.uuid !== viewWorld.activeStage().uuid) {
                    const cmds = [];
                    cmds.push(new SetStageCommand(viewWorld.type, stage));
                    cmds.push(new SelectCommand([ stage ], editor.selected));
                    editor.execute(new MultiCmdsCommand(cmds, 'Select Stage'));
                } else {
                    editor.execute(new SelectCommand([ stage ], editor.selected));
                }
                ignoreSelectionChangedSignal = false;
                return;
            }

            // Select 'entities'
            const entities = [];
            for (const uuid of uuids) {
                const entity = viewWorld.getEntityByUUID(uuid);
                if (entity && entity.isEntity) entities.push(entity);
            }
            editor.execute(new SelectCommand(entities, editor.selected));
            ignoreSelectionChangedSignal = false;
        });

        // DOUBLE CLICK
        treeList.on('dblclick', (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
                /* NOTHING */
            } else {
                // Ensure clicked entities parent is active scene
                const viewWorld = editor.viewport().getWorld();
                if (!viewWorld) return;
                const uuids = treeList.getValues();
                if (uuids.length === 0) return;
                const clickedEntity = editor.project.findEntityByUUID(uuids[0]);
                if (!clickedEntity || !clickedEntity.isEntity) return;
                const parent = clickedEntity.parentStage();
                if (parent && parent.uuid !== viewWorld.activeStage().uuid) {
                    const cmds = [];
                    cmds.push(new SetStageCommand(viewWorld.type, parent));
                    cmds.push(new SelectCommand([ clickedEntity ], editor.selected));
                    editor.execute(new MultiCmdsCommand(cmds, 'Change Active Stage'));
                }

                // Focus camera
                editor.viewport()?.cameraFocus();
            }
        });

        /******************** REFRESH */

        function rebuildTree() {
            const promode = Boolean(Config.getKey('promode'));

            function emptyOption(title = 'No World') {
                const option = document.createElement('div');
                option.classList.add('suey-no-select');
                option.draggable = false;
                option.value = -1;
                option.dropGroup = -1;
                const optionTitle = document.createElement('span');
                optionTitle.classList.add('suey-disabled');
                optionTitle.textContent = `\u00A0 ${title}`; /* unicode literal for a &nbsp; (non breaking space) */
                option.appendChild(optionTitle);
                return option;
            }

            function buildOption(entity, draggable = true) {
                let type = 'Unknown';
                if (entity.isWorld) type = 'World';
                else if (entity.isStage) type = 'Stage';
                else if (entity.isLight) type = 'Light';
                else if (entity.isCamera) type = 'Camera';
                else if (entity.isEntity) type = 'Entity';
                type = String(type).toLowerCase();

                // Option
                const option = document.createElement('div');
                option.draggable = draggable;
                option.style['display'] = 'flex';

                // Option Column: Name
                const columnName = document.createElement('span');
                columnName.classList.add('outliner-name-column');
                const nameWidth = (promode) ? '2em' : '1em';
                columnName.style['max-width'] = `calc(100% - ${nameWidth})`;
                option.appendChild(columnName);

                // Option Column: Spacer
                const spacer = document.createElement('span');
                spacer.classList.add('outliner-spacer-column');
                option.appendChild(spacer);

                // Option Column: Data / Checkboxes
                const columnCheck = document.createElement('span');
                columnCheck.classList.add('outliner-check-column');
                option.appendChild(columnCheck);

                // Option Type Dot
                const optionType = document.createElement('span');
                optionType.classList.add('outliner-type', `outliner-type-${type}`);
                columnName.appendChild(optionType);

                // Option Name Label
                const optionName = document.createElement('span');
                optionName.classList.add('outliner-entity-name');
                if (!entity.isWorld && !entity.isStage && !entity.visible) {
                    optionName.classList.add('outliner-entity-hidden');
                }
                if (entity.isStage && !entity.enabled) {
                    optionName.classList.add('outliner-entity-hidden');
                }
                optionName.style['padding-left'] = '0.35em';
                optionName.textContent = SUEY.Strings.escapeHTML(entity.name);
                columnName.appendChild(optionName);

                // 'JS' Image (if Entity has Scripts)
                const scriptComponent = entity.getComponentByType('script');
                if (scriptComponent && scriptComponent.isComponent) {
                    const scriptImages = document.createElement('div');
                    const scriptJS = document.createElement('img');
                    scriptImages.classList.add('outliner-script-images');
                    scriptJS.src = `${FOLDER_TYPES}asset/script/javascript.svg`;
                    scriptJS.classList.add('outliner-script-type');
                    scriptImages.appendChild(scriptJS);
                    columnName.appendChild(scriptImages);
                }

                option.value = entity.uuid;
                option.dropGroup = -1;
                if (entity.isWorld) {
                    option.singleSelect = true;
                    option.noDirectDrop = true;
                    option.dropGroup = 0;
                } else if (entity.isStage) {
                    option.singleSelect = true;
                    option.noDirectDrop = true;
                    option.dropGroup = 1;
                } else if (entity.isEntity) {
                    option.dropGroup = 2;
                }

                // Opener/Expander (for when an Entity has Entity children)
                if (!entity.isWorld && _nodeStates.has(entity)) {
                    const state = _nodeStates.get(entity);
                    const opener = document.createElement('span');
                    opener.classList.add('suey-opener');
                    if (entity.isEntity && entity.getEntities().length > 0) opener.classList.add(state ? 'suey-is-open' : 'suey-is-closed');
                    function openerPointerDown(event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        _nodeStates.set(entity, !state);
                        setTimeout(() => rebuildTree(), 0);
                    }
                    opener.addEventListener('pointerdown', openerPointerDown);
                    opener.addEventListener('destroy', () => opener.removeEventListener('pointerdown', openerPointerDown), { once: true });
                    columnName.insertBefore(opener, columnName.firstChild);
                }

                // Flags
                if (entity.isWorld) {
                    if (promode) {
                        // World Visible
                        const shown = document.createElement('span');
                        shown.classList.add('outliner-visible-checkbox');
                        shown.classList.add('suey-black-or-white');
                        const eyeIcon = document.createElement('img');
                        eyeIcon.style['max-width'] = '1em';
                        eyeIcon.src = `${FOLDER_MENU}eye.svg`;
                        shown.appendChild(eyeIcon);
                        shown.style['pointer-events'] = 'none';
                        columnCheck.appendChild(shown);

                        // World Locked
                        const lockCheck = document.createElement('span');
                        lockCheck.classList.add('outliner-lock-checkbox');
                        lockCheck.classList.add('suey-black-or-white');
                        const lockIcon = document.createElement('img');
                        lockIcon.style['max-width'] = '1em';
                        lockIcon.src = `${FOLDER_MENU}lock.svg`;
                        lockCheck.appendChild(lockIcon);
                        lockCheck.style['pointer-events'] = 'none';
                        columnCheck.appendChild(lockCheck);
                    }

                } else if (!entity.isStage) {
                    // Stage Visible
                    if (promode) {
                        const shown = document.createElement('span');
                        shown.classList.add('outliner-visible-checkbox');
                        shown.classList.add('suey-black-or-white');
                        const eyeIcon = document.createElement('img');
                        eyeIcon.style['max-width'] = '1em';
                        function setVisibleIcon() {
                            if (!eyeIcon) return;
                            if (!entity.visible) eyeIcon.src = `${FOLDER_MENU}hidden.svg`;
                            else eyeIcon.src = `${FOLDER_MENU}dot.svg`;
                        }
                        setVisibleIcon();
                        shown.appendChild(eyeIcon);
                        shown.addEventListener('click', (event) => event.stopImmediatePropagation());
                        shown.addEventListener('dblclick', (event) => event.stopImmediatePropagation());
                        shown.addEventListener('pointerenter', (event) => { shown.classList.add('suey-highlight'); });
                        shown.addEventListener('pointerleave', (event) => { shown.classList.remove('suey-highlight'); });
                        shown.addEventListener('pointerup', (event) => event.stopImmediatePropagation());
                        shown.addEventListener('pointerdown', (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            const isVisible = !entity.visible;
                            editor.execute(new SetEntityValueCommand(entity, 'visible', isVisible, false /* recursive */));
                            setTimeout(() => { setVisibleIcon(); });
                        });
                        columnCheck.appendChild(shown);
                    }

                    // Stage Locked
                    const lockCheck = document.createElement('span');
                    lockCheck.classList.add('outliner-lock-checkbox');
                    lockCheck.classList.add('suey-black-or-white');
                    const lockIcon = document.createElement('img');
                    lockIcon.style['max-width'] = '1em';
                    function setLockedIcon() {
                        if (!lockIcon) return;
                        if (entity.locked) lockIcon.src = `${FOLDER_MENU}lock.svg`;
                        else lockIcon.src = `${FOLDER_MENU}dot.svg`;
                    }
                    setLockedIcon();
                    lockCheck.appendChild(lockIcon);
                    lockCheck.addEventListener('click', (event) => event.stopImmediatePropagation());
                    lockCheck.addEventListener('dblclick', (event) => event.stopImmediatePropagation());
                    lockCheck.addEventListener('pointerenter', (event) => { lockCheck.classList.add('suey-highlight'); });
                    lockCheck.addEventListener('pointerleave', (event) => { lockCheck.classList.remove('suey-highlight'); });
                    lockCheck.addEventListener('pointerup', (event) => event.stopImmediatePropagation());
                    lockCheck.addEventListener('pointerdown', (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        const lockedNow = !Boolean(entity.locked);
                        const cmds = [];
                        const selectedIndex = editor.selected.indexOf(entity);
                        if (selectedIndex !== -1) {
                            const currentSelection = [...editor.selected];
                            for (const selectedEntity of editor.selected) {
                                if (!selectedEntity || !selectedEntity.isEntity) continue;
                                if (selectedEntity.isStage) continue;
                                if (selectedEntity.isWorld) continue;
                                cmds.push(new SetEntityValueCommand(selectedEntity, 'locked', lockedNow, false /** recursive? */));
                            }
                            cmds.push(new SelectCommand(currentSelection, currentSelection)); // force 'selectionChanged' signal
                        } else {
                            cmds.push(new SetEntityValueCommand(entity, 'locked', lockedNow, false /** recursive? */));
                        }

                        editor.execute(new MultiCmdsCommand(cmds, 'Toggle Entity Locked'));
                        setTimeout(() => { setLockedIcon(); });
                    });
                    columnCheck.appendChild(lockCheck);
                }

                return option;
            }

            const viewWorld = editor.viewport().getWorld();
            if (!viewWorld || !viewWorld.isEntity) return treeList.setOptions([ emptyOption() ]);
            const viewStageUUID = (viewWorld && viewWorld.isWorld) ? viewWorld.activeStage().uuid : -1;

            function addToOptions(entities = [], pad, recursive = true) {
                if (!Array.isArray(entities)) entities = [ entities ];
                for (const entity of entities) {
                    if (!_nodeStates.has(entity)) _nodeStates.set(entity, entity.isStage);

                    // Build option
                    const draggable = !entity.isWorld && !entity.locked;
                    const option = buildOption(entity, draggable);
                    option.style['padding-left'] = pad + 'em';
                    options.push(option);

                    // Active Stage??
                    if (option.value == viewStageUUID) option.classList.add('outliner-active-stage');

                    // Recurse
                    if (recursive && _nodeStates.get(entity)) {
                        addToOptions(entity.getEntities(), pad + 1);
                    }
                }
            }

            // Add World, Children, Stages
            const options = [];
            addToOptions(viewWorld, 0.1, false /* recursive */);
            addToOptions(viewWorld.getEntities(false /* includeStages */), 0);
            addToOptions(viewWorld.getStages(), 0);

            // Rebuild Outliner
            treeList.setOptions(options);

            // Multi-selection
            if (editor.selected.length > 0) {
                const selectedUUIDs = SALT.MathUtils.toUUIDArray(editor.selected);
                treeList.setValues(selectedUUIDs);
            }
        }

        /******************** DRAG & DROP */

        treeList.onDrop = function(event, option /* received drop */, uuids = [] /* uuids being dragged */) {
            const viewWorld = editor.viewport().getWorld();
            if (!viewWorld) return;

            let nextEntity = undefined;
            let parent = undefined;
            const area = event.offsetY / option.clientHeight;
            const topHit = (option.noDirectDrop) ? 0.5 : 0.25;
            const botHit = (option.noDirectDrop) ? 0.0 : 0.75;

            if (area < topHit) {
                nextEntity = viewWorld.getEntityByUUID(option.value);
                parent = nextEntity.parent;
            } else if (area > botHit) {
                let sibling = undefined;
                const optionIndex = treeList.options.indexOf(option);
                for (let i = optionIndex + 1; i < treeList.options.length; i++) {
                    const nextOption = treeList.options[i];
                    if (nextOption.dropGroup < option.dropGroup) {
                        break;
                    } else if (nextOption.dropGroup === option.dropGroup) {
                        sibling = nextOption;
                        break;
                    }
                }
                if (sibling) {
                    nextEntity = viewWorld.getEntityByUUID(sibling.value);
                    parent = nextEntity.parent;
                } else {
                    nextEntity = null; // end of list, so no next entity
                    parent = viewWorld.getEntityByUUID(option.value).parent;
                }
            } else {
                parent = viewWorld.getEntityByUUID(option.value);
            }

            function adjustEntity(entity, newParent, nextEntity) {
                if (nextEntity === null) nextEntity = undefined;
                let newParentIsChild = false;
                entity.traverse(function(child) {
                    if (child === newParent) newParentIsChild = true;
                });
                if (newParentIsChild) return;
                editor.execute(new MoveEntityCommand(entity, newParent, nextEntity));
                treeList.dom.dispatchEvent(new Event('change'));
            }

            for (const uuid of uuids) {
                const entity = viewWorld.getEntityByUUID(uuid);
                adjustEntity(entity, parent, nextEntity);
            }
        };

        /******************** SIGNALS */

        function rebuildOnAssetChange(type, asset) {
            if (type === 'script') rebuildTree();
        }

        Signals.connect(this, 'assetAdded', rebuildOnAssetChange);
        Signals.connect(this, 'assetRemoved', rebuildOnAssetChange);
        Signals.connect(this, 'promodeChanged', rebuildTree);
        Signals.connect(this, 'sceneGraphChanged', rebuildTree);

        Signals.connect(this, 'entityChanged', (entity) => {
            //
            // TODO: Update entity (script icon, etc)
            //
        });

        Signals.connect(this, 'stageChanged', () => {
            const viewWorld = editor.viewport().getWorld();
            const viewStageUUID = viewWorld?.activeStage()?.uuid ?? -1;
            for (const div of treeList.options) {
                if (div.value == viewStageUUID) div.classList.add('outliner-active-stage');
                else div.classList.remove('outliner-active-stage');
            }
        });

        Signals.connect(this, 'selectionChanged', () => {
            if (ignoreSelectionChangedSignal === true) return;
            const viewWorld = editor.viewport().getWorld();
            if (!viewWorld) return rebuildTree();

            let needsRefresh = false;
            let highlightUUIDs = [];
            for (const entity of editor.selected) {
                highlightUUIDs.push(entity.uuid);

                let parent = entity.parent;
                while (parent && !parent.isStage && !parent.isWorld) {
                    if (_nodeStates.get(parent) !== true) {
                        _nodeStates.set(parent, true);
                        needsRefresh = true;
                    }
                    parent = parent.parent;
                }
            }

            if (needsRefresh) rebuildTree();
            else treeList.setValues(highlightUUIDs, true /* scroll to */);
        });

        // Initial Build
        rebuildTree();

    } // end ctor

}

export { Outliner };
