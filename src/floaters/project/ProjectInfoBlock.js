import {
    FOLDER_FLOATERS,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';
import { SmartShrinker } from '../../gui/SmartShrinker.js';

import { Signals } from '../../config/Signals.js';

class ProjectInfoBlock extends SmartShrinker {

    constructor() {
        const icon = `${FOLDER_FLOATERS}project/info.svg`;
        super({ title: 'Info', icon, arrow: 'right', border: true });

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** SCENE *****/

        // props.addHeader('Scene', `${FOLDER_FLOATERS}settings/info/scene.svg`);

        // Scenes
        const scenesInfo = new SUEY.Text('0').selectable(false);
        props.addRow('Scenes', scenesInfo);

        // Entities
        const entitiesInfo = new SUEY.Text('0').selectable(false);
        props.addRow('Entities', entitiesInfo);

        // Geometries
        const geometriesInfo = new SUEY.Text('0').selectable(false);
        props.addRow('Geometries', geometriesInfo);

        // Materials
        const materialsInfo = new SUEY.Text('0').selectable(false);
        props.addRow('Materials', materialsInfo);

        // Textures
        const texturesInfo = new SUEY.Text('0').selectable(false);
        props.addRow('Textures', texturesInfo);

        // // DEBUG: Log 'editor.project' to Console
        const debugRow = new SUEY.Row().setStyle('justify-content', 'center');
        const logButton = new SUEY.Button('Log to Console');
        logButton.setStyle(
            'justify-content', 'center',
            'min-height', '1.7em',
            'width', '50%',
            'margin-bottom', 'var(--pad-small)',
        );
        logButton.onPress(() => console.log(editor.project));
        props.add(debugRow.add(logButton));

        /***** UPDATE *****/

        function updateUI() {
            let sceneCount = 0;
            let entityCount = 0;
            editor.project.traverseWorlds((object) => {
                if (object.isStage) {
                    sceneCount++;
                } else if (object.isEntity) {
                    entityCount++;
                }
            });

            scenesInfo.setTextContent(SALT.MathUtils.addCommas(sceneCount));
            entitiesInfo.setTextContent(SALT.MathUtils.addCommas(entityCount));
            // const geometries = SALT.AssetManager.library('asset', 'geometry');
            // const materials = SALT.AssetManager.library('asset', 'material');
            // const textures = SALT.AssetManager.library('asset', 'texture');
            // geometriesInfo.setTextContent(SALT.MathUtils.addCommas(geometries.length));
            // materialsInfo.setTextContent(SALT.MathUtils.addCommas(materials.length));
            // texturesInfo.setTextContent(SALT.MathUtils.addCommas(textures.length));
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'assetAdded', updateUI);
        Signals.connect(this, 'assetRemoved', updateUI);
        Signals.connect(this, 'sceneGraphChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { ProjectInfoBlock };
