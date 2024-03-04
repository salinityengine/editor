/******************** CONSTANTS ********************/

import { VERSION } from './constants.js';
export * from './constants.js';

/******************** CLASSES - App ********************/

export { Application } from './app/Application.js';

/******************** CLASSES - Project  ********************/

// Core
//export { Project } from './project/Project.js';

/******************** CLASSES - Utils  ********************/

export { System } from './utils/System.js';

/******************** SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Onsight v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}
