import * as ONE from 'onsight';
import * as OSUI from 'osui';
import * as EDITOR from 'editor';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Config } from '../../config/Config.js';
import { SetAssetValueCommand } from '../../commands/Commands.js';

let _controls;
let _scene, _camera, _material, _geometry, _mesh;

class TexturePreview extends OSUI.Titled {

    constructor(texture) {
        super({ title: (texture.isCubeTexture) ? 'Cube Texture' : 'Texture' });

        // Property Box
        const props = new OSUI.PropertyList('30%');
        this.add(props);

        // Name
        const nameTextBox = new OSUI.TextBox().onChange(() => {
            editor.execute(new SetAssetValueCommand(texture, 'name', nameTextBox.getValue()));
        });
        props.addRow('Name', nameTextBox);

        // UUID
        const textureUUID = new OSUI.TextBox().setDisabled(true);

        // 'Copy' UUID Button
        const textureUUIDCopy = new OSUI.Button('Copy').onClick(() => {
            navigator.clipboard.writeText(texture.uuid).then(
                function() { /* success */ },
                function(err) { console.error('Async: Could not copy text: ', err);
            });
        });
        textureUUIDCopy.setStyle('marginLeft', EDITOR.WIDGET_SPACING)
        textureUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            props.addRow('UUID', textureUUID, textureUUIDCopy);
        }

        // Size (Width / Height)
        const sizeBox = new OSUI.TextBox().setDisabled(true);
        if (!texture.isCubeTexture) props.addRow('Size', sizeBox);

        // Edit
        const textureEdit = new OSUI.Button(`Properties`).onClick(() => {
            signals.inspectorBuild.dispatch(texture);
            signals.assetSelect.dispatch('texture', texture);
        });
        props.addRow('Edit', textureEdit);

        /***** TEXTURE *****/

        const canvas = document.createElement('canvas');
        canvas.draggable = false;
        canvas.style.width = '100%';
        let context;

        if (!texture.isCubeTexture) {
            // Outer Box
            const assetBox = new OSUI.AssetBox(texture.name, 'icon', false /* mini */);
            assetBox.contents().noShadow();
            assetBox.contents().dom.style.width = '96%';
            assetBox.contents().dom.style.height = '96%';
            assetBox.dom.style.width = '98%';
            assetBox.dom.style.aspectRatio = '2 / 1';
            assetBox.dom.draggable = false;
            assetBox.contents().dom.draggable = false;

            // Inner Box
            const emptyBox = new OSUI.AbsoluteBox();
            emptyBox.dom.draggable = false;

            // Scale to Canvas
            let width = 512, height = 512;
            if (texture.image && texture.image.complete && texture.image.width > 0 && texture.image.height > 0) {
                width = texture.image.width;
                height = texture.image.height;
            }
            if (width / height > 2) {
                canvas.width = Math.max(512, width);
                const scale = canvas.width / width;
                canvas.height = height * scale;
            } else {
                canvas.width = Math.max(512, height) * 2;
                canvas.height = Math.max(512, height);
            }

            // Append Children
            emptyBox.dom.appendChild(canvas);
            assetBox.add(emptyBox);
            props.add(assetBox);

        } else {
            _scene = new THREE.Scene();
            _camera = new THREE.PerspectiveCamera(50, EDITOR.PREVIEW_WIDTH / EDITOR.PREVIEW_HEIGHT);
            _camera.position.set(0, 0, -3);
            _camera.lookAt(new THREE.Vector3(0, 0, 0));
            const shader = THREE.ShaderLib.cube;
            _material = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: THREE.UniformsUtils.clone(shader.uniforms),
                depthWrite: false,
                side: THREE.BackSide,
            });
            _material.uniforms.tCube.value = texture;
            _material.needsUpdate = true;
            // OR: _material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: texture });
            _geometry = new THREE.BoxGeometry(2, 2, 2);
            _mesh = new THREE.Mesh(_geometry, _material);
            _scene.add(_mesh);

            // Add to PropertyList
            const emptyBox = new OSUI.FlexBox();
            emptyBox.dom.appendChild(canvas);
            props.add(emptyBox);

            canvas.width = EDITOR.PREVIEW_WIDTH;
            canvas.height = EDITOR.PREVIEW_HEIGHT;
            context = canvas.getContext('2d');

            // Setup Render
            _controls = new OrbitControls(_camera, canvas);
            _controls.addEventListener('change', render);
            render();
        }

        function render() {
            if (!texture.isCubeTexture) {
                ONE.RenderUtils.renderTextureToCanvas(canvas, texture);
            } else {
                ONE.RenderUtils.offscreenRenderer(canvas.width, canvas.height).render(_scene, _camera);
                if (context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(ONE.RenderUtils.offscreenRenderer().domElement, 0, 0, canvas.width, canvas.height);
                }
            }
        }

        /***** UPDATE *****/

        function updateUI() {
            // Properties
            nameTextBox.setValue(texture.name);
            textureUUID.setValue(texture.uuid);
            if (texture.image && texture.image.complete && texture.image.width > 0 && texture.image.height > 0) {
                sizeBox.setValue(`${texture.image.width} × ${texture.image.height}`);
            } else {
                sizeBox.setValue(`? × ?`);
            }

            // Render
            render();
        }

        /***** SIGNALS *****/

        function assetChangedCallback(type, asset) {
            if (!type || !asset || type !== 'texture') return;
            if (asset.uuid === texture.uuid) updateUI();
        }

        signals.assetChanged.add(assetChangedCallback);

        this.dom.addEventListener('destroy', function() {
            signals.assetChanged.remove(assetChangedCallback);

            if (_controls && typeof _controls.dispose === 'function') _controls.dispose();
            if (_material && typeof _material.dispose === 'function') _material.dispose();
            if (_geometry && typeof _geometry.dispose === 'function') _geometry.dispose();
        }, { once: true });

        /***** INIT *****/

        updateUI();
    }

}

export { TexturePreview };
