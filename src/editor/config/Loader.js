// https://github.com/mrdoob/three.js/blob/master/editor/js/Loader.js

import * as SALT from 'engine';
import { Signals } from './Signals.js';

import { AddAssetCommand } from '../commands/Commands.js';
import { AddEntityCommand } from '../commands/Commands.js';

import { unzipSync, strFromU8 } from '../../../libs/utility/fflate.module.js';

class Loader {

    constructor() {
        const self = this;
        this.texturePath = '';

        this.loadFiles = function(files, filesMap) {
            if (files.length > 0) {
                filesMap = filesMap || createFilesMap(files);

                const manager = new SALT.LoadingManager();
                manager.setURLModifier(function(url) {
                    url = url.replace(/^(\.?\/)/, '');          // remove './'

                    const file = filesMap[url];
                    if (file) return URL.createObjectURL(file);
                    return url;
                });

                for (const file of files) {
                    self.loadFile(file, manager);
                }
            }
        };

        this.loadFile = function(file, manager) {
            let filename = file.name;
            let extension = filename.split('.').pop().toLowerCase();
            if (file.type && file.type === 'image/png') extension = 'image';

            const reader = new FileReader();
            reader.addEventListener('progress', function(event) {
                const size = '(' + SALT.Maths.addCommas(Math.floor(event.total / 1000)) + ' KB)';
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

                        SALT.AssetManager.loadTexture(contents, (texture) => {
                            texture.name = SALT.Strings.nameFromUrl(file.name);
                            editor.execute(new AddAssetCommand(texture));
                        });

                    });
                    reader.readAsDataURL(file);
                    break;
                }

                /***** OBJECTS *****/

                case 'svg':
                {
                    //
                    // TODO: Load svg
                    //
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

                // // TODO: Object Types
                case 'entity':
                case 'geometry':
                case 'palette':
                case 'texture':
                    break;

                // Published from Salinity Editor
                case 'salt':
                {
                    editor.selectEntities(/* none */);
                    editor.project.fromJSON(data, true /* loadAssets? */, /* onLoad */ () => {
                        editor.viewport.world = editor.project.activeWorld();
                        editor.viewport.stage = editor.viewport.world.activeStage();
                        Signals.dispatch('projectLoaded');
                    });
                    break;
                }

                default:
                    console.warn(`File type unknown: ${data.metadata.type.toLowerCase()}`);
            }
        }

        async function handleZIP(contents) {
            const zip = unzipSync(new Uint8Array(contents));

            for (const path in zip) {
                const file = zip[path];
                const manager = new SALT.LoadingManager();
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

                    // // TODO: Zipped files
                    case 'fbx':
                    case 'gltf':
                        break;

                }
            }
        }

    } // end ctor

}

export { Loader };

/******************** INTERNAL ********************/

function createFilesMap(files) {
    const map = {};
    for (const file of files) {
        map[file.name] = file;
    }
    return map;
}
