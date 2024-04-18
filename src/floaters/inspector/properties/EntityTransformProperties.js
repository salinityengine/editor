import {
    BASE_MOVE,
    FOLDER_FLOATERS,
    FOLDER_MENU,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../../../config/Config.js';
import { Language } from '../../../config/Language.js';
import { PropertyGroup } from '../../../gui/PropertyGroup.js';
import { SceneUtils } from '../../../viewport/SceneUtils.js';
import { Signals } from '../../../config/Signals.js';

import { MultiCmdsCommand } from '../../../commands/CommandList.js';
// import { SetPositionCommand } from '../../../commands/CommandList.js';
// import { SetRotationCommand } from '../../../commands/CommandList.js';
// import { SetScaleCommand } from '../../../commands/CommandList.js';
import { SetEntityValueCommand } from '../../../commands/CommandList.js';

const PROCESS_SIGNAL_MILLISECONDS = 50;         // 20 times per second

let _lastSignalTime = performance.now();

class EntityTransformProperties extends SUEY.Div {

    constructor(entity) {
        super();
        this.addClass('salt-property-panel');

        // Scoped Variables
        const entitySize = new THREE.Vector3();
        const identitySize = new THREE.Vector3();

        /******************** TRANSFORM */

        const transformGroup = new PropertyGroup({ title: 'Transform', icon: `${FOLDER_FLOATERS}inspector/entity/transform.svg` });
        transformGroup.setLeftPropertyWidth('30%');
        this.add(transformGroup);

        /***** HEADER BUTTONS *****/

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-large)');

        // 'Edit Transform' Button
        const editTransform = new SUEY.Button().addClass('suey-borderless-button');
        editTransform.overflowMenu = SUEY.OVERFLOW.LEFT;
        editTransform.setAttribute('tooltip', 'Edit Transform');
        editTransform.add(new SUEY.ShadowBox(`${FOLDER_MENU}more.svg`).setColor(SUEY.TRAIT.TRIADIC5));

        // Transform Menu
        const transformMenu = new SUEY.Menu();
        const transformRotateLeft = new SUEY.MenuItem('Rotate Left', `${FOLDER_MENU}transform/rotate-left.svg`, '[').keepOpen();
        const transformRotateRight = new SUEY.MenuItem('Rotate Right', `${FOLDER_MENU}transform/rotate-right.svg`, ']').keepOpen();
        const transformFlipHorizontal = new SUEY.MenuItem('Flip Horizontal', `${FOLDER_MENU}transform/flip-h.svg`, '<').keepOpen();
        const transformFlipVertical = new SUEY.MenuItem('Flip Vertical', `${FOLDER_MENU}transform/flip-v.svg`, '>').keepOpen();
        const transformReset = new SUEY.MenuItem('Reset Transform', `${FOLDER_MENU}transform/reset.svg`, '');

        transformRotateLeft.onSelect(() => { SceneUtils.transformSelection2D('rotate', 90); });
        transformRotateRight.onSelect(() => { SceneUtils.transformSelection2D('rotate', -90); });
        transformFlipHorizontal.onSelect(() => { SceneUtils.transformSelection2D('scale', -1, 'left'); });
        transformFlipVertical.onSelect(() => { SceneUtils.transformSelection2D('scale', -1, 'up'); });
        transformReset.onSelect(() => {
            entityRotationX.setValue(0);
            entityRotationY.setValue(0);
            entityRotationZ.setValue(0);
            entityScaleX.setValue(1);
            entityScaleY.setValue(1);
            entityScaleZ.setValue(1);
            const beforeAspect = Config.getKey('viewport/transform/aspectLock');
            Config.setKey('viewport/transform/aspectLock', false);
            update();
            Config.setKey('viewport/transform/aspectLock', beforeAspect);
        });

        transformMenu.add(
            transformRotateLeft, transformRotateRight,
            new SUEY.MenuSeparator(),
            transformFlipHorizontal, transformFlipVertical,
            new SUEY.MenuSeparator(),
            transformReset
        );

        // Add Menus/Buttons
        editTransform.attachMenu(transformMenu);
        buttonRow.add(new SUEY.FlexSpacer(), editTransform);
        transformGroup.titleDiv.add(buttonRow);

        /***** PROPERTIES *****/

        const hasMesh = true; // EntityUtils.containsMesh(entity);
        const hasCamera = entity.isCamera;
        const isSpecial = entity.userData.flagHelper;

        const showPosition = !entity.isPrefab;
        const showRotation = hasMesh || hasCamera || isSpecial;
        const showScale = hasMesh || hasCamera || isSpecial;
        const showSize = hasMesh && !isSpecial;
        const showBillboard = hasMesh && !entity.isStage && !isSpecial && !hasCamera;
        const showVisible = !isSpecial;
        const showShadow = hasMesh && !isSpecial;

        // Position
        const gridSize = parseFloat(editor.viewport()?.gridSize() ?? 0);
        const moveSize = gridSize; // (Config.getKey('viewport/grid/snap')) ? gridSize : BASE_MOVE;
        const entityPositionX = new SUEY.NumberBox(0).setStep(moveSize).on('change', update);
        const entityPositionY = new SUEY.NumberBox(0).setStep(moveSize).on('change', update);
        const entityPositionZ = new SUEY.NumberBox(0).setStep(moveSize).on('change', update);
        entityPositionX.setStyle('color', 'rgb(var(--triadic1))');
        entityPositionY.setStyle('color', 'rgb(var(--triadic2))');
        entityPositionZ.setStyle('color', 'rgb(var(--complement))');
        if (showPosition) {
            transformGroup.addRow(Language.getKey('inspector/entity/position'), entityPositionX, entityPositionY, entityPositionZ);
        }

        // Rotation
        const entityRotationX = new SUEY.NumberBox(0).setStep(5).setPrecision(2).setUnit('°').on('change', update);
        const entityRotationY = new SUEY.NumberBox(0).setStep(5).setPrecision(2).setUnit('°').on('change', update);
        const entityRotationZ = new SUEY.NumberBox(0).setStep(5).setPrecision(2).setUnit('°').on('change', update);
        entityRotationX.setStyle('color', 'rgb(var(--triadic1))');
        entityRotationY.setStyle('color', 'rgb(var(--triadic2))');
        entityRotationZ.setStyle('color', 'rgb(var(--complement))');
        if (showRotation) {
            transformGroup.addRow(Language.getKey('inspector/entity/rotation'), entityRotationX, entityRotationY, entityRotationZ);
        }

        // Scale
        const entityScaleX = new SUEY.NumberBox(1).setStep(0.1).setNudge(0.1).on('change', () => update('x'));
        const entityScaleY = new SUEY.NumberBox(1).setStep(0.1).setNudge(0.1).on('change', () => update('y'));
        const entityScaleZ = new SUEY.NumberBox(1).setStep(0.1).setNudge(0.1).on('change', () => update('z'));
        entityScaleX.setStyle('color', 'rgb(var(--triadic1))');
        entityScaleY.setStyle('color', 'rgb(var(--triadic2))');
        entityScaleZ.setStyle('color', 'rgb(var(--complement))');
        const scaleRow = transformGroup.createRow(Language.getKey('inspector/entity/scale'), entityScaleX, entityScaleY, entityScaleZ);
        if (showScale) {
            transformGroup.add(scaleRow);
        }

        const scaleButtonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');
        const lockScale = new SUEY.Button().addClass('suey-borderless-button').setStyle('font-size', '90%');
        const lockIcon = new SUEY.VectorBox(`${FOLDER_MENU}lock.svg`).setColor(SUEY.TRAIT.TEXT);
        const unlockIcon = new SUEY.VectorBox(`${FOLDER_MENU}unlock.svg`).setColor(SUEY.TRAIT.TEXT);
        lockScale.add(new SUEY.ShadowBox(lockIcon, unlockIcon));
        lockScale.on('pointerdown', () => {
            Config.setKey('viewport/transform/aspectLock', !Config.getKey('viewport/transform/aspectLock'));
            setScaleIconState();
        });
        scaleButtonRow.add(new SUEY.FlexSpacer(), lockScale);
        scaleRow.leftWidget.setStyle('position', 'relative');
        scaleRow.leftWidget.add(scaleButtonRow);

        function setScaleIconState() {
            const locked = Config.getKey('viewport/transform/aspectLock');
            lockIcon.setStyle('opacity', (locked) ? '1' : '0');
            unlockIcon.setStyle('opacity', (locked) ? '0' : '1');
            lockScale.setAttribute('tooltip', (locked) ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio');
        }
        setScaleIconState();

        // Size
        const entitySizeX = new SUEY.NumberBox(1).setStep(moveSize).setNudge(1).on('change', () => update('x'));
        const entitySizeY = new SUEY.NumberBox(1).setStep(moveSize).setNudge(1).on('change', () => update('y'));
        const entitySizeZ = new SUEY.NumberBox(1).setStep(moveSize).setNudge(1).on('change', () => update('z'));
        if (showSize) {
            // SALT.ObjectUtils.identityBoundsCalculate(entity, identitySize);
            entitySize.copy(identitySize);

            // Add Size Row
            entitySizeX.setStyle('color', 'rgb(var(--triadic1))');
            entitySizeY.setStyle('color', 'rgb(var(--triadic2))');
            entitySizeZ.setStyle('color', 'rgb(var(--complement))');
            transformGroup.addRow(Language.getKey('inspector/entity/size'), entitySizeX, entitySizeY, entitySizeZ);
        }

        // Billboard
        const billboardBox = new SUEY.Checkbox().on('change', () => {
            const isBillboard = billboardBox.getValue();
            editor.execute(new SetEntityValueCommand(entity, 'lookAtCamera', isBillboard, false /* recursive */));
        });
        const yOnlyTitle = new SUEY.Text(`Y Only`).selectable(false);
        const lookAtYOnlyBox = new SUEY.Checkbox().on('change', () => {
            const isYOnly = lookAtYOnlyBox.getValue();
            editor.execute(new SetEntityValueCommand(entity, 'lookAtYOnly', isYOnly, false /* recursive */));
        });
        if (showBillboard) {
            transformGroup.addRow('Billboard', billboardBox, yOnlyTitle, lookAtYOnlyBox);
        }

        // Visible
        const visibleBox = new SUEY.Checkbox().on('change', () => {
            const isVisible = visibleBox.getValue();
            editor.execute(new SetEntityValueCommand(entity, 'visible', isVisible, false /* recursive */));
        });
        if (showVisible) {
            transformGroup.addRow('Visible', visibleBox);
        }

        /***** SHADOWS *****/

        const shadowGroup = new PropertyGroup({ title: 'Lighting', icon: `${FOLDER_FLOATERS}inspector/entity/shadow.svg` });
        if (showShadow) {
            this.add(shadowGroup);
        }

        // Bloom
        const bloomBox = new SUEY.Checkbox().on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'bloom', bloomBox.getValue(), true /* recursive */));
        });
        shadowGroup.addRow('Bloom', bloomBox);

        // Cast Shadow
        const castBox = new SUEY.Checkbox().on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'castShadow', castBox.getValue(), true /* recursive */));
        });
        shadowGroup.addRow('Cast Shadow', castBox);

        // Receive Shadow
        const receiveBox = new SUEY.Checkbox().on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'receiveShadow', receiveBox.getValue(), true /* recursive */));
        });
        shadowGroup.addRow('Receive Shadow', receiveBox);

        /***** UPDATE OBJECT *****/

        const newPosition = new THREE.Vector3();
        const newRotation = new THREE.Euler();
        const newScale = new THREE.Vector3();
        const newSize = new THREE.Vector3();

        function update(axis = '') {
            if (!entity || !entity.isObject3D) return;

            // Multi-Command List
            const cmds = [];

            // Position / Rotation / Scale / Size
            const xAngle = SALT.Maths.degreesToRadians(entityRotationX.getValue());
            const yAngle = SALT.Maths.degreesToRadians(entityRotationY.getValue());
            const zAngle = SALT.Maths.degreesToRadians(entityRotationZ.getValue());
            newPosition.set(entityPositionX.getValue(), entityPositionY.getValue(), entityPositionZ.getValue());
            newRotation.set(xAngle, yAngle, zAngle);
            newScale.set(entityScaleX.getValue(), entityScaleY.getValue(), entityScaleZ.getValue());
            newSize.set(entitySizeX.getValue(), entitySizeY.getValue(), entitySizeZ.getValue());

            let changePosition = SALT.Maths.fuzzyVector(entity.position, newPosition) === false;
            let changeRotate = SALT.Maths.fuzzyVector(entity.rotation, newRotation) === false;
            let changeScale = SALT.Maths.fuzzyVector(entity.scale, newScale) === false;
            let changeSize = SALT.Maths.fuzzyVector(entitySize, newSize) === false;
                changeSize = changeSize && hasMesh && !changeScale;

            if (changeSize) {
                newScale.copy(newSize).divide(identitySize);
                if (isNaN(newScale.x) || !isFinite(newScale.x)) newScale.x = 0;
                if (isNaN(newScale.y) || !isFinite(newScale.y)) newScale.y = 0;
                if (isNaN(newScale.z) || !isFinite(newScale.z)) newScale.z = 0;
            }

            if (Config.getKey('viewport/transform/aspectLock') && (changeScale || changeSize)) {
                let ratio = undefined;
                switch (axis) {
                    case 'x': ratio = newScale.x / entity.scale.x; break;
                    case 'y': ratio = newScale.y / entity.scale.y; break;
                    case 'z': ratio = newScale.z / entity.scale.z; break;
                }
                if (!isNaN(ratio) && isFinite(ratio)) {
                    newScale.x = entity.scale.x * ratio;
                    newScale.y = entity.scale.y * ratio;
                    newScale.z = entity.scale.z * ratio;
                } else {
                    switch (axis) {
                        case 'x': newScale.y = newScale.z = newScale.x; break;
                        case 'y': newScale.x = newScale.z = newScale.y; break;
                        case 'z': newScale.x = newScale.y = newScale.z; break;
                    }
                }
            }

            if (changePosition) cmds.push(new SetPositionCommand(entity, newPosition));
            if (changeRotate) cmds.push(new SetRotationCommand(entity, newRotation));
            if (changeScale) cmds.push(new SetScaleCommand(entity, newScale));
            if (changeSize) cmds.push(new SetScaleCommand(entity, newScale));

            // Align Scale/Size UI
            entitySize.copy(identitySize).multiply(newScale);
            entityScaleX.setValue(newScale.x);
            entityScaleY.setValue(newScale.y);
            entityScaleZ.setValue(newScale.z);
            entitySizeX.setValue(entitySize.x);
            entitySizeY.setValue(entitySize.y);
            entitySizeZ.setValue(entitySize.z);

            // Execute
            if (cmds.length > 0) {
                editor.execute(new MultiCmdsCommand(cmds, `Set Transform`));
            }
        }

        /***** UPDATE UI *****/

        function updateUI() {
            castBox.setValue(entity.castShadow);
            receiveBox.setValue(entity.receiveShadow);

            billboardBox.setValue(entity.lookAtCamera);
            lookAtYOnlyBox.setValue(entity.lookAtYOnly);
            yOnlyTitle.setStyle('display', (entity.lookAtCamera) ? '' : 'none');
            lookAtYOnlyBox.setStyle('display', (entity.lookAtCamera) ? '' : 'none');

            visibleBox.setValue(entity.visible);

            entityPositionX.setValue(entity.position.x);
            entityPositionY.setValue(entity.position.y);
            entityPositionZ.setValue(entity.position.z);

            entityRotationX.setValue(entity.rotation.x * (180 / Math.PI));
            entityRotationY.setValue(entity.rotation.y * (180 / Math.PI));
            entityRotationZ.setValue(entity.rotation.z * (180 / Math.PI));

            entityScaleX.setValue(entity.scale.x);
            entityScaleY.setValue(entity.scale.y);
            entityScaleZ.setValue(entity.scale.z);

            // Calculate Current Bounds
            if (hasMesh) {
                entitySizeX.setValue(identitySize.x * entity.scale.x);
                entitySizeY.setValue(identitySize.y * entity.scale.y);
                entitySizeZ.setValue(identitySize.z * entity.scale.z);
            }
        }

        /***** SIGNALS *****/

        function entityChanged(changedEntity) {
            if (!changedEntity || !changedEntity.isEntity) return;
            if (changedEntity.uuid === entity.uuid) {
                // SALT.ObjectUtils.identityBoundsCalculate(entity, identitySize);
                updateUI();
            }
        };

        function transformsChanged(entityArray) {
            if (!Array.isArray(entityArray)) return;

            // Limit how often to update UI
            let timeSinceUpdate = performance.now() - _lastSignalTime;
            if (timeSinceUpdate < PROCESS_SIGNAL_MILLISECONDS) return;
            _lastSignalTime = performance.now();

            // If entity is selected, update UI
            for (const changedEntity of entityArray) entityChanged(changedEntity);
        }

        Signals.connect(this, 'entityChanged', entityChanged);
        Signals.connect(this, 'transformsChanged', transformsChanged);

        /***** INIT *****/

        updateUI();

        if (entity.locked) {
            transformGroup.disableInputs();
            editTransform.setDisabled(true);
            shadowGroup.disableInputs();
        }

    } // end ctor

}

export { EntityTransformProperties };
