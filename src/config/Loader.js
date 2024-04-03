// https://github.com/mrdoob/three.js/blob/master/editor/js/Loader.js

import * as SALT from 'engine';
import * as SUEY from 'gui'
import { editor } from 'editor';
import { Signals } from './Signals.js';

import { AddAssetCommand } from '../commands/Commands.js';
import { AddEntityCommand } from '../commands/Commands.js';

import { unzipSync, strFromU8 } from '../libs/fflate.module.js';

class Loader {

    static loadFiles(files, filesMap) {
        if (!files || files.length === 0) return;

        function createFilesMap(files) {
            const map = {};
            for (const file of files) map[file.name] = file;
            return map;
        }
        filesMap = filesMap || createFilesMap(files);

        const manager = new SALT.LoadingManager();
        manager.setURLModifier(function(url) {
            url = url.replace(/^(\.?\/)/, '');          // remove './'
            const file = filesMap[url];
            if (file) return URL.createObjectURL(file);
            return url;
        });

        for (const file of files) {
            Loader.loadFile(file, manager);
        }
    }

    static loadFile(file, manager) {
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
            /******************** JSON */
            case 'eye':
            case 'js':
            case 'json':
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

            /******************** IMAGE */
            case 'image':
            case 'bmp':
            case 'gif':
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'webp':
                reader.addEventListener('load', async function(event) {
                    const contents = event.target.result;
                    SALT.AssetManager.loadTexture(contents, (texture) => {
                        texture.name = SUEY.Strings.nameFromUrl(file.name);
                        editor.execute(new AddAssetCommand(texture));
                    });
                });
                reader.readAsDataURL(file);
                break;

            /******************** OBJECT */
            case 'svg':
                //
                // TODO: Load svg
                //
                break;

            /******************** ARCHIVE */
            case 'zip':
                reader.addEventListener('load', function(event) {
                    handleZIP(event.target.result);
                }, false);
                reader.readAsArrayBuffer(file);
                break;

            default:
                console.error(`Loader.loadFile: Unsupported file format ('${extension}'')`);
                break;
        }
    }

}

export { Loader };

/******************** INTERNAL ********************/

function handleJSON(data) {
    // // DEBUG: Show internal file type
    // console.info(`Type: ${data.metadata.type.toLowerCase()}`);

    switch (data.metadata.type.toLowerCase()) {
        case 'entity':
        case 'geometry':
        case 'palette':
        case 'texture':
            //
            // TODO: Object Types
            //
            break;

        // Published from Salinity Editor
        case 'salt':
            editor.selectEntities(/* none */);
            editor.project.fromJSON(data, true /* loadAssets? */, /* onLoad */ () => {
                Signals.dispatch('projectLoaded');
            });

        default:
            console.warn(`Loader: File type unknown: ${data.metadata.type.toLowerCase()}`);
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
            case 'fbx':
            case 'gltf':
                //
                // TODO: Zipped files
                //
                break;
        }
    }
}
