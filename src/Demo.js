import * as SALT from 'salt';

function loadDemoProject(project) {

    // Clear Assets
    SALT.AssetManager.clear();

    // Clear Project
    project.clear();
    project.name = 'Demo Project';

    /********** ASSETS **********/

    // // Textures
    // const textures = '../../files/assets/textures';
    // const texture0 = SALT.AssetManager.loadTexture(`${textures}/checker.png`);
    // const texture1 = SALT.AssetManager.loadTexture(`${textures}/dragon.png`);
    // const texture2 = SALT.AssetManager.loadTexture(`${textures}/uv-test-col.png`);
    // const texture3 = SALT.AssetManager.loadTexture(`${textures}/unicorn.png`);

    // // Duplicate Image Test
    // const texture1b = SALT.AssetManager.loadTexture(`${textures}/dragon.png`);

    /********** PALETTES **********/

    const palette16 = new SALT.Palette().default16();
    const purpleGold = new SALT.Palette().purpleGold();
    SALT.AssetManager.add(palette16);
    SALT.AssetManager.add(purpleGold);

    /********** SCRIPTS **********/

    /********** WORLDS / STAGES **********/

    // World
    const world = new SALT.World(SALT.WORLD_TYPES.WORLD_2D, 'World of Wonder');
    project.addWorld(world);

    // Stage
    const stage1 = new SALT.Stage(SALT.STAGE_TYPES.STAGE_2D, 'Start');
    const stage2 = new SALT.Stage(SALT.STAGE_TYPES.STAGE_2D, 'Stage 2');
    const stage3 = new SALT.Stage(SALT.STAGE_TYPES.STAGE_2D, 'Stage 3');
    stage2.enabled = false;
    stage3.enabled = false;
    world.addEntity(stage1);
    world.addEntity(stage2);
    world.addEntity(stage3);

    /********** ENTITIES **********/

    /***** WORLD */

    // Player
    const player = new SALT.Entity('Player');
    world.addEntity(player);

    // // Camera
    // const camera = new SALT.Camera();
    // camera.position.set(0, 0, 10);
    // world.addEntity(camera);

    /***** STAGE */

    // Cube
    const cube1 = new SALT.Entity('Cube 1');
    // cube1.position.set(-1, 1, 0);
    stage1.addEntity(cube1);

}

export { loadDemoProject };
