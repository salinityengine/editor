// https://github.com/mrdoob/three.js/blob/master/editor/js/Loader.js

import * as SALT from 'engine';

import { AddAssetCommand } from '../commands/Commands.js';
import { AddEntityCommand } from '../commands/Commands.js';
import { LoaderUtils } from '../config/LoaderUtils.js';

import { unzipSync, strFromU8 } from '../../../libs/utility/fflate.module.js';

class Loader {

    constructor() {
        const self = this;
        this.texturePath = '';

        this.loadFiles = function(files, filesMap) {
            if (files.length > 0) {
                filesMap = filesMap || LoaderUtils.createFilesMap(files);

                const manager = new THREE.LoadingManager();
                manager.setURLModifier(function(url) {
                    url = url.replace(/^(\.?\/)/, '');          // remove './'

                    const file = filesMap[url];
                    if (file) return URL.createObjectURL(file);
                    return url;
                });

                for (let i = 0; i < files.length; i++) {
                    self.loadFile(files[i], manager);
                }
            }
        };

        this.loadFile = function(file, manager) {

            let filename = file.name;
            let extension = filename.split('.').pop().toLowerCase();
            if (file.type && file.type === 'image/png') extension = 'image';

            const reader = new FileReader();
            reader.addEventListener('progress', function(event) {
                const size = '(' + ONE.Maths.addCommas(Math.floor(event.total / 1000)) + ' KB)';
                const progress = Math.floor((event.loaded / event.total) * 100) + '%';
                console.info('Loading', filename, size, progress);
            });

            switch (extension) {

                /***** JSON *****/

                case 'eye':
                case 'js':
                case 'json':
                {
                    reader.addEventListener('load', function(event) {
                        const contents = event.target.result;

                        let data;
                        try {
                            data = JSON.parse(contents);
                        } catch (error) {
                            alert(error);
                            return;
                        }

                        handleJSON(data);
                    }, false);

                    reader.readAsText(file);
                    break;
                }

                /***** IMAGES *****/

                case 'image':
                case 'bmp':
                case 'gif':
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'webp':
                {
                    reader.addEventListener('load', async function(event) {
                        const contents = event.target.result;

                        ONE.AssetManager.loadTexture(contents, (texture) => {
                            texture.name = ONE.Strings.nameFromUrl(file.name);
                            editor.execute(new AddAssetCommand(texture));
                        });

                    });
                    reader.readAsDataURL(file);
                    break;
                }

                /***** MODELS *****/

                case 'fbx':
                {
                    reader.addEventListener('load', async function(event) {
                        const contents = event.target.result;
                        const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
                        const loader = new FBXLoader(manager);
                        const object = loader.parse(contents);

                        // TODO: Loader fbx
                        console.warn('Loader: FBX not implemented');

                    }, false);
                    reader.readAsArrayBuffer(file);
                    break;
                }

                case 'obj':
                {
                    reader.addEventListener('load', async function(event) {
                        const contents = event.target.result;
                        const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
                        const object = new OBJLoader().parse(contents);
                        object.name = filename;

                        // TODO: Loader obj
                        console.warn('Loader: OBJ not implemented');

                    }, false);
                    reader.readAsText(file);
                    break;
                }

                case 'svg':
                {
                    reader.addEventListener('load', async function(event) {
                        const contents = event.target.result;
                        const { SVGLoader } = await import('three/addons/loaders/SVGLoader.js');

                        const svgGroup = new ONE.Entity3D();
                        const svgName = ONE.Strings.nameFromUrl(filename, true);

                        const loader = new SVGLoader();
                        const paths = loader.parse(contents).paths;

                        ONE.SVGBuilder.createFromPaths(svgGroup, paths, () => {

                            signals.assetAdded.dispatch('geometry');
                            editor.execute(new AddEntityCommand(svgGroup));

                        }, svgName);

                    }, false);
                    reader.readAsText(file);
                    break;
                }

                case 'zip':
                {
                    reader.addEventListener('load', function(event) {
                        handleZIP(event.target.result);
                    }, false);
                    reader.readAsArrayBuffer(file);
                    break;
                }

                default:
                    console.error(`Loader: Unsupported file format ('${extension}'')`);
                    break;
            }
        };


        function handleJSON(data) {

            // // DEBUG: Show internal file type
            // console.info(`Type: ${data.metadata.type.toLowerCase()}`);

            switch (data.metadata.type.toLowerCase()) {

                case 'buffergeometry':
                {
                    const loader = new THREE.BufferGeometryLoader();
                    const result = loader.parse(data);
                    const mesh = new THREE.Mesh(result);

                    // // TODO: Loader buffergeometry
                    console.warn('Loader: BufferGeometry.json not implemented');

                    break;
                }

                case 'object':
                {
                    const loader = new THREE.ObjectLoader();
                    loader.setResourcePath(self.texturePath);
                    const object = loader.parse(data);

                    // // TODO: Loader Object3D
                    console.warn('Loader: Object3D.json not implemented');

                    break;
                }

                // Saved from Three.js Editor
                case 'app':
                {
                    // // TODO: Loader Three.App
                    console.warn('Loader: Three.App.json not implemented');

                    break;
                }

                // Published from Onsight Editor
                case 'onsight':
                {
                    editor.selectEntities(/* none */);
                    editor.project.fromJSON(data, true /* loadAssets? */, /* onLoad */ () => {
                        editor.viewport.world = editor.project.activeWorld();
                        editor.viewport.stage = editor.viewport.world.activeStage();
                        signals.projectLoaded.dispatch();
                    });
                    break;
                }

                default:
                {
                    console.warn(`File type unknown: ${data.metadata.type.toLowerCase()}`);
                }

            }
        }

        async function handleZIP(contents) {
            const zip = unzipSync(new Uint8Array(contents));

            if (zip['model.obj'] && zip['materials.mtl']) {
                const { MTLLoader } = await import('three/addons/loaders/MTLLoader.js');
                const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
                const materials = new MTLLoader().parse(strFromU8(zip['materials.mtl']));
                const object = new OBJLoader().setMaterials(materials).parse(strFromU8(zip['model.obj']));
                editor.execute(new AddEntityCommand(object));
            }

            for (const path in zip) {
                const file = zip[path];

                const manager = new THREE.LoadingManager();
                manager.setURLModifier(function(url) {
                    const file = zip[url];
                    if (file) {
                        console.info('Loading', url);
                        const blob = new Blob([file.buffer], { type: 'application/octet-stream' });
                        return URL.createObjectURL(blob);
                    }
                    return url;
                });

                /***** UNZIPPED *****/

                const extension = path.split('.').pop().toLowerCase();

                switch (extension) {

                    case 'fbx':
                    {
                        const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
                        const loader = new FBXLoader(manager);
                        const object = loader.parse(file.buffer);

                        // // TODO: Loader fbx
                        console.warn('Loader: FBX not implemented');

                        break;
                    }

                    case 'glb':
                    case 'gltf':
                    {
                        const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
                        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
                        const dracoLoader = new DRACOLoader();
                        dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/gltf/');
                        const loader = new GLTFLoader();
                        loader.setDRACOLoader(dracoLoader);

                        const fileString = (extension === 'glb') ? file.buffer /* glb */ : strFromU8(file) /* gltf */;

                        loader.parse(fileString, '', function(result) {

                            // // TODO: Loader gltf
                            // const scene = result.scene;
                            // scene.animations.push(...result.animations);
                            console.warn('Loader: GLB/GLTF not implemented');

                        });
                        break;
                    }

                }

            }
        }

    } // end ctor

}

export { Loader };
