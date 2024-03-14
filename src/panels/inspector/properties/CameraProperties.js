import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { CallbackEntityCommand } from '../../../commands/Commands.js';
import { Config } from '../../../config/Config.js';
import { Language } from '../../../config/Language.js';
import { PropertyGroup } from '../../../gui/PropertyGroup.js';

class CameraProperties extends SUEY.Div {

    constructor(camera) {
        super();
        this.addClass('salt-property-panel');

        /******************** CAMERA */

        const displayGroup = new PropertyGroup({ title: 'Camera', icon: `${EDITOR.FOLDER_TYPES}entity/camera.svg` });
        displayGroup.setLeftPropertyWidth('50%');
        this.add(displayGroup);

        // Camera Type
        const typeDrop = new SUEY.Dropdown();
        typeDrop.overflowMenu = SUEY.OVERFLOW.LEFT;
        const typeOptions = {
            PerspectiveCamera: 'Perspective',
            OrthographicCamera: 'Orthographic',
        };
        typeDrop.setOptions(typeOptions);
        typeDrop.onChange(() => {
            const newType = typeDrop.getValue();
            const oldType = camera.type;
            editor.execute(new CallbackEntityCommand(camera, () => { camera.changeType(newType); }, () => { camera.changeType(oldType); }, 'Set Camera Type'));
        });
        displayGroup.addRow('Type', typeDrop);

        /******************** PREVIEW */

        let orientation = (editor.project) ? editor.project.settings.orientation : SALT.APP_ORIENTATION.PORTRAIT;

        // Add to PropertyList
        const emptyBox = new SUEY.FlexBox().addClass('salt-view-camera');
        this.add(emptyBox);

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        switch (orientation) {
            case (SALT.APP_ORIENTATION.LANDSCAPE):
                canvas.width = EDITOR.PREVIEW_WIDTH;
                canvas.height = canvas.width * 0.75;
                break;
            case (SALT.APP_ORIENTATION.PORTRAIT):
            default:
                canvas.height = EDITOR.PREVIEW_WIDTH;
                canvas.width = canvas.height;
        }
        emptyBox.dom.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const outlineBox = new SUEY.Div().addClass('salt-app-outline');
        emptyBox.add(outlineBox);

        function resizeOutLine() {
            const screenWidth = parseFloat(Config.getKey('renderer/screen/width'));
            const screenHeight = parseFloat(Config.getKey('renderer/screen/height'));
            const aspect = screenHeight / screenWidth;

            let x = 0, y = 0;
            switch (orientation) {
                case (SALT.APP_ORIENTATION.LANDSCAPE):
                    y = (emptyBox.getHeight() - (emptyBox.getWidth() * aspect)) / 2;
                    break;
                case (SALT.APP_ORIENTATION.PORTRAIT):
                default:
                    x = (emptyBox.getWidth() - (emptyBox.getHeight() * aspect)) / 2;
                    break;
            }
            outlineBox.setStyle('left', `${x}px`);
            outlineBox.setStyle('right', `${x}px`);
            outlineBox.setStyle('top', `${y}px`);
            outlineBox.setStyle('bottom', `${y}px`);
            outlineBox.setStyle('opacity', '1');
        }
        const resizeObserver = new ResizeObserver(resizeOutLine).observe(emptyBox.dom);
        emptyBox.dom.addEventListener('destroy', function() {
            if (resizeObserver) resizeObserver.disconnect();
        }, { once: true });

        /***** UPDATE *****/

        function updateUI() {
            typeDrop.setValue(camera.type);
        }

        function render() {
            if (!camera || !camera.isEntity3D) return;
            const scene = camera.parentWorld();
            if (!scene) return;

            if (editor.project) orientation = editor.project.settings.orientation;

            const tempCam = new SALT.Camera3D({
                type: camera.type, width: canvas.width, height: canvas.height,
                fit: (orientation === SALT.APP_ORIENTATION.PORTRAIT) ? 'height' : 'width',
            });
            SALT.EntityUtils.copyTransform(camera, tempCam);
            tempCam.updateProjectionMatrix();

            SALT.RenderUtils.offscreenRenderer(canvas.width, canvas.height).render(scene, tempCam);
            if (typeof tempCam.dispose === 'function') tempCam.dispose()

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(SALT.RenderUtils.offscreenRenderer().domElement, 0, 0, canvas.width, canvas.height);
            }
        }

        /***** SIGNALS *****/

        function entityChanged(entity) {
            if (!entity || !entity.isEntity || !entity.isCamera) return;
            if (entity.uuid === camera.uuid) render();
        }

        function transformsChanged(entityArray) {
            if (!Array.isArray(entityArray)) return;
            for (const entity of entityArray) entityChanged(entity);
        }

        signals.entityChanged.add(entityChanged);
        signals.transformsChanged.add(transformsChanged);

        this.dom.addEventListener('destroy', function() {
            signals.entityChanged.remove(entityChanged);
            signals.transformsChanged.remove(transformsChanged);
        }, { once: true });

        /***** INIT *****/

        updateUI();
        setTimeout(() => { render(); }, 0);

    } // end ctor

}

export { CameraProperties };
