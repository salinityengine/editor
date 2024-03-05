import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

class ProjectInfoTab extends SUEY.Titled {

    constructor() {
        super({ title: 'Info' });

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** SCENE *****/

        // props.addHeader('Scene', `${EDITOR.FOLDER_INSPECTOR}settings/info/scene.svg`);

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
        );
        logButton.onClick(() => console.log(editor.project));
        this.add(debugRow.add(logButton));

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

            scenesInfo.setTextContent(SALT.Maths.addCommas(sceneCount));
            entitiesInfo.setTextContent(SALT.Maths.addCommas(entityCount));
            // const geometries = SALT.AssetManager.getLibrary('asset', 'geometry');
            // const materials = SALT.AssetManager.getLibrary('asset', 'material');
            // const textures = SALT.AssetManager.getLibrary('asset', 'texture');
            // geometriesInfo.setTextContent(SALT.Maths.addCommas(geometries.length));
            // materialsInfo.setTextContent(SALT.Maths.addCommas(materials.length));
            // texturesInfo.setTextContent(SALT.Maths.addCommas(textures.length));
        }

        /***** SIGNALS *****/

        signals.assetAdded.add(updateUI);
        signals.assetRemoved.add(updateUI);
        signals.sceneGraphChanged.add(updateUI);

        this.dom.addEventListener('destroy', function() {
            signals.assetAdded.remove(updateUI);
            signals.assetRemoved.remove(updateUI);
            signals.sceneGraphChanged.remove(updateUI);
        }, { once: true });

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { ProjectInfoTab };
