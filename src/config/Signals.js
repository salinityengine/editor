import * as SUEY from 'gui';

const SIGNAL_NAMES = [

    /***** EDITOR **************** DISPATCH *********** TYPE ****** DESCRIPTION *****/

    // General
    'advisorInfo',              // (title, html)        FUNCTION    New Advisor title / text
    'editorModeChanged',        // -                    ALERT       Editor mode was changed
    'clipboardChanged',         // -                    ALERT       Clipboard was changed
    'historyChanged',           // (command)            ALERT       History was changed

    // Gui
    'fontSizeChanged',          // -                    ALERT       Font size was changed
    'promodeChanged',           // -                    ALERT       Pro (advanced) mode was toggled
    'schemeChanged',            // -                    ALERT       Color scheme was changed
    'settingsRefreshed',        // -                    ALERT       Settings were refreshed

    // Project
    'projectLoaded',            // -                    ALERT       Editor Project was loaded

    // Selection
    'selectionChanged',         // -                    ALERT       Editor selection ('editor.selected') changed

    // Scene
    'sceneRendered',            // (timeToRenderMs)     ALERT       Scene was rendered

    /***** VIEWPORT **************** DISPATCH *********** TYPE ****** DESCRIPTION *****/

    'mouseModeChanged',         // (mouse mode)         FUNCTION    Change mouse mode
    'mouseStateChanged',        // (state, cursor)      ALERT       Mouse state was changed

    'transformModeChanged',     // (mode, temp?)        FUNCTION    Change transform mode

    'cameraChanged',            // -                    ALERT       Viewport camera was changed
    'gridChanged',              // -                    ALERT       Change to grid settings (shown, snap, etc.)

    'preTransform',             // -                    ALERT       We're about to change some Entity transforms
    'postTransform',            // -                    ALERT       We're done changing, record changes as History

    'draggingStarted',          // -                    ALERT       Dragging of selected items (translation) started
    'draggingEnded',            // -                    ALERT       Dragging of selected items (translation) ended
    'draggingChanged',          // (point1, point2)     ALERT       Selected items currently being dragged (translated)

    'dropEnded',                // -                    ALERT       Fired when 'viewport.dropInfo' was set and drag done

    /***** FLOATER **************** DISPATCH *********** TYPE ****** DESCRIPTION *****/

    // Inspector
    'inspectorBuild',           // (item)               FUNCTION    Build with object or array of objects
    'inspectorClear',           // -                    FUNCTION    Clear the Inspector
    'inspectorRefresh',         // -                    FUNCTION    Rebuild Inspector with current object(s)
    'inspectorChanged',         // -                    ALERT       Inspector was just built / rebuilt

    // Player
    'playerStateChanged',       // (state)              ALERT       Player state changed ('start', 'pause', 'stop')

    /***** PROJECT *************** DISPATCH *********** TYPE ****** DESCRIPTION *****/

    // Scene Graph
    'sceneGraphChanged',        // -                    ALERT       Change of entities/components within 'viewport.world'
    'stageChanged',             // -                    ALERT       Active stage of 'viewport.world' was changed
    'entityChanged',            // (entity)             ALERT       Entity was changed (excluding transform)
    'transformsChanged',        // (entityArray)        ALERT       Transforms changed (may need to rebuild transform group)

    // Assets
    'assetAdded',               // (type, asset)        ALERT       Asset added to AssetManager
    'assetRemoved',             // (type, asset)        ALERT       Asset removed from AssetManager
    'assetChanged',             // (type, asset)        ALERT       Asset was changed
    'assetSelect',              // (type, asset)        FUNCTION    Select Asset in Explorer

    // Scripts
    'editScript',               // (script)             FUNCTION    Open script editor (Scripter) with 'script'

];

class Signals {

    /** Connects callback to signal and stores in Element slot */
    static connect(element, name, callback) {
        if (!(element instanceof SUEY.Element)) {
            console.warn(`Signals.connect(): Element was not type Suey Element`, element);
        } else if (typeof callback !== 'function') {
            console.warn(`Signals.connect(): No callback function, or not of 'function' type`);
        } else {
            const signal = _signals[name];
            if (signal && signal instanceof SUEY.Signal) {
                element.addSlot(signal.add(callback));
            } else {
                console.warn(`Signals.connect(): Could not find signal '${name}'`);
            }
        }
    }

    static dispatch(name, ...args) {
        const signal = _signals[name];
        if (signal && signal instanceof SUEY.Signal) {
            signal.dispatch(...args);
        } else {
            console.warn(`Signals.dispatch(): Could not find signal '${name}'`);
        }
    }

    static toggle(name, active = true) {
        const signal = _signals[name];
        if (signal && signal instanceof SUEY.Signal) {
            signal.active = active;
        } else {
            console.warn(`Signals.toggle(): Could not find signal '${name}'`);
        }
    }

    static logCounts() {
        console.info('Signal Counts...');
        for (const signalName of SIGNAL_NAMES) {
            console.info(`Signal: ${signalName}, Count: ${_signals[signalName].getNumListeners()}`);
        }
    }

}

/******************** CREATE SIGNALS ********************/

const _signals = [];
if (_signals.length === 0) {
    for (const signalName of SIGNAL_NAMES) {
        if (_signals[signalName]) console.warn(`Signals.js: Duplicate signal with name ('${signalName}')`);
        else _signals[signalName] = new SUEY.Signal();
    }
}

export { Signals };
