import * as SUEY from 'suey';

const SIGNAL_NAMES = {

    /***** EDITOR *********** IMPORTANT **** DISPATCH ***** TYPE ****** DESCRIPTION *****/

    // General
    'advisorInfo':              false,  // (title, html)    FUNCTION    New Advisor title / text
    'clipboardChanged':         false,  // -                ALERT       Clipboard was changed
    'historyChanged':           false,  // -                ALERT       History was changed

    // Gui
    'fontSizeChanged':          false,  // -                ALERT       Font size was changed
    'promodeChanged':           false,  // -                ALERT       Pro (advanced) mode was toggled
    'schemeChanged':            false,  // -                ALERT       Color scheme was changed
    'settingsRefreshed':        false,  // -                ALERT       Settings were refreshed

    // Mode
    'changeEditorMode':         false,  // (mode)           FUNCTION    Change editor mode
    'editorModeChanged':        false,  // -                ALERT       Editor mode was changed

    // Project
    'projectLoaded':            false,  // -                ALERT       Editor Project was loaded

    // Selection
    'selectionChanged':         false,  // -                ALERT       Editor selection ('editor.selected') changed

    // Scene
    'sceneRendered':            false,  // (msToRender)     ALERT       Scene was rendered

    /***** EDITOR *********** IMPORTANT **** DISPATCH ***** TYPE ****** DESCRIPTION *****/

    'stageChanged':             false,  // -                ALERT       Active stage of 'viewport.world' was changed

    'mouseModeChanged':         false,  // (mouse mode)     FUNCTION    Change mouse mode
    'transformModeChanged':     false,  // (mode, temp?)    FUNCTION    Change transform mode
    'cameraChanged':            false,  // -                ALERT       Viewport camera was changed
    'gridChanged':              false,  // -                ALERT       Change to grid settings (shown, snap, etc.)

    'draggingStarted':          false,  // -                ALERT       Dragging of selected items (translation) started
    'draggingEnded':            false,  // -                ALERT       Dragging of selected items (translation) ended
    'draggingChanged':          false,  // (point1, point2) ALERT       Selected items currently being dragged (translated)
    'dropEnded':                false,  // -                ALERT       Fired when 'viewport.dropInfo' was set and drag done

    /***** EDITOR *********** IMPORTANT **** DISPATCH ***** TYPE ****** DESCRIPTION *****/

    // Player
    'playerStateChanged':       false,  // (state)          ALERT       Player state changed ('start', 'pause', 'stop')

    /***** EDITOR *********** IMPORTANT **** DISPATCH ***** TYPE ****** DESCRIPTION *****/

    // Scene Graph
    'sceneGraphChanged':        false,  // -                ALERT       Change of entities/components within 'viewport.world'
    'entityChanged':            true,   // (entity)         ALERT       Entity was changed (excluding transform)
    'transformsChanged':        true,   // (entityArray)    ALERT       Transforms changed (may need to rebuild transform group)
    'componentChanged':         true,   // (component)      ALERT       Component was changed

    // Assets
    'assetAdded':               true,   // (type, asset)    ALERT       Asset added to AssetManager
    'assetRemoved':             true,   // (type, asset)    ALERT       Asset removed from AssetManager
    'assetChanged':             true,   // (type, asset)    ALERT       Asset was changed
    'assetSelect':              false,  // (type, asset)    FUNCTION    Asset wants to be highlighted in Editor

};

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

    static disable() {
        SUEY.Signal.disableSignals();
    }

    static enable(dispatchMissed = true) {
        const missed = SUEY.Signal.enableSignals();
        if (!dispatchMissed) return;
        for (const signalName in missed) {
            // Important! Dispatch all Signals!
            if (SIGNAL_NAMES[signalName]) {
                for (const args of missed[signalName].args) {
                    Signals.dispatch(signalName, ...args);
                }
            // or, Just Dispatch last Signal
            } else {
                const lastDispatch = missed[signalName].args.at(-1);
                Signals.dispatch(signalName, ...lastDispatch);
            }
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

    static toggled(name = '') {
        const signal = _signals[name];
        if (signal && signal instanceof SUEY.Signal) {
            return signal.active;
        } else {
            console.warn(`Signals.toggled(): Could not find signal '${name}'`);
        }
    }

    static logCounts() {
        console.info('Signal Counts...');
        for (const signalName in SIGNAL_NAMES) {
            console.info(`Signal: ${signalName}, Count: ${_signals[signalName].getNumListeners()}`);
        }
    }

}

/******************** CREATE SIGNALS ********************/

const _signals = [];
if (_signals.length === 0) {
    for (const signalName in SIGNAL_NAMES) {
        if (_signals[signalName]) console.warn(`Signals.js: Duplicate signal with name ('${signalName}')`);
        else _signals[signalName] = new SUEY.Signal(signalName);
    }
}

export { Signals };
