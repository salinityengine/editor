import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Config } from './config/Config.js';
import { Signal } from '../../libs/utility/signals.js';

class EditorSignals {

    constructor() {

        this.signalNames = [

        /***** EDITOR **************** DISPATCH *********** TYPE ****** DESCRIPTION *****/

        // General
        'editorModeChanged',        // -                    ALERT       Editor mode was changed
        'clipboardChanged',         // -                    ALERT       Clipboard was changed
        'historyChanged',           // (command)            ALERT       History was changed

        // Gui
        'fontSizeChanged',          // -                    ALERT       Font size was changed
        'promodeChanged',           // -                    ALERT       Pro (advanced) mode was toggled
        'schemeChanged',            // -                    ALERT       Color scheme was changed
        'refreshSettings',          // -                    FUNCTION    Refresh app settings (color, font size, etc.)
        'refreshWindows',           // -                    FUNCTION    Refresh SUEY Window/Docker sizes
        'windowResize',             // -                    ALERT       Window was resized

        // Project
        'projectLoaded',            // -                    ALERT       Editor Project was loaded

        // Selection
        'selectionChanged',         // -                    ALERT       Editor selection ('editor.selected') changed

        // Scene
        'sceneRendered',            // (timeToRenderMs)     ALERT       Scene was rendered

        /***** PANELS **************** DISPATCH *********** TYPE ****** DESCRIPTION *****/

        // Inspector
        'inspectorBuild',           // (item)               FUNCTION    Build with object, string, 'rebuild'
        'inspectorChanged',         // -                    ALERT       Inspector was just built / rebuilt
        'inspectorUpdate',          // -                    ALERT       Request update UI for current item

        // Previewer
        'previewerBuild',           // (item)               FUNCTION    Build Previewer with item
        'previewerChanged',         // -                    ALERT       Previewer was just built / rebuilt
        'previewerUpdate',          // -                    ALERT       Request update UI for current item

        // Player
        'startPlayer',              // -                    FUNCTION    Start the Game Player
        'pausePlayer',              // -                    FUNCTION    Pause the Game Player
        'stopPlayer',               // -                    FUNCTION    Stop the Game Player
        'playerStateChanged',       // (state)              ALERT       Player state changed ('start', 'pause', 'stop')

        // Viewport
        'mouseModeChanged',         // (mouse mode)         FUNCTION    Change mouse mode
        'mouseStateChanged',        // (state, cursor)      ALERT       Mouse state was changed

        'transformModeChanged',     // (mode, temp?)        FUNCTION    Change transform mode

        'cameraChanged',            // -                    ALERT       Viewport camera was changed
        'cameraFocus',              // -                    FUNCTION    Focus camera
        'cameraReset',              // -                    FUNCTION    Reset camera

        'gridChanged',              // -                    ALERT       Change to grid settings (shown, snap, etc.)

        'preTransform',             // -                    ALERT       We're about to change some Entity transforms
        'postTransform',            // -                    ALERT       We're done changing, record changes as History

        'draggingStarted',          // -                    ALERT       Dragging of selected items (translation) started
        'draggingEnded',            // -                    ALERT       Dragging of selected items (translation) ended
        'draggingChanged',          // (point1, point2)     ALERT       Selected items currently being dragged (translated)

        'dropEnded',                // -                    ALERT       Fired when 'viewport.dropInfo' was set and drag done

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

        ];

        // Create Signals
        for (const signalName of this.signalNames) {
            if (this[signalName]) console.warn(`Create Signals: Duplicate signal with name ('${signalName}')`);
            else this[signalName] = new Signal();
        }
    }

    logSignalCounts() {
        console.info('Signal Counts...');
        for (const signalName of this.signalNames) {
            console.info(`Signal: ${signalName}, Count: ${this[signalName].getNumListeners()}`);
        }
    }

    /** Adds signal handlers to editor */
    addSignalCallbacks() {
        if (editor._addedSignals) return; /* only add them once */

        /******************** PROJECT ********************/

        signals.projectLoaded.add(function() {
            if (editor.history) editor.history.clear();

            // Clear Inspector Panels
            signals.inspectorBuild.dispatch();
            signals.previewerBuild.dispatch();

            // Rebuild Outliner
            signals.sceneGraphChanged.dispatch();

            // Reset Camera / Lights
            signals.cameraReset.dispatch();
        });

        /******************** EDITOR ********************/

        signals.refreshSettings.add(function() {
            // Mouse Modes
            signals.mouseModeChanged.dispatch(Config.getKey('scene/viewport/mode'));
            signals.transformModeChanged.dispatch(Config.getKey('scene/controls/mode'));

            // Font Size Update
            editor.fontSizeChange(Config.getKey('scheme/fontSize'));

            // Color Scheme
            editor.setSchemeBackground(Config.getKey('scheme/background'));
            const schemeColor = Config.getKey('scheme/iconColor');
            const schemeTint = Config.getKey('scheme/backgroundTint');
            const schemeSaturation = Config.getKey('scheme/backgroundSaturation');
            editor.setSchemeColor(schemeColor, schemeTint, schemeSaturation);

            // Transparency
            const panelAlpha = Math.max(Math.min(parseFloat(Config.getKey('scheme/panelTransparency')), 1.0), 0.0);
            SUEY.Css.setVariable('--panel-transparency', panelAlpha);

            // Grids
            signals.gridChanged.dispatch();

            // Tabs
            editor.traverse((child) => {
                if (child.isElement && child.hasClass('osui-tabbed')) {
                    child.selectLastKnownTab();
                }
            }, false /* applyToSelf */);

            // Rebuild Inspector / Preview from Existing Items
            signals.inspectorBuild.dispatch('rebuild');
            signals.previewerBuild.dispatch('rebuild');
            signals.promodeChanged.dispatch();

            // Refresh Docks
            signals.refreshWindows.dispatch();
        });

        /******************** SCENE ********************/

        signals.entityChanged.add(function(entity) {
            if (!entity || !entity.isEntity) return;
            const activeStageUUID = editor.viewport.world.activeStage().uuid;
            const stage = entity.parentStage();
            const world = entity.parentWorld();

            if (stage && world && (stage.uuid === activeStageUUID || world.uuid === activeStageUUID)) {
                if (entity.isLight || entity.isStage || entity.isWorld) editor.viewport.updateSky();
                if (entity.isCamera || entity.isLight) editor.viewport.rebuildHelpers();
                editor.viewport.rebuildColliders();
            }
        });

        // Flag that we've added EditorSignals to Editor
        editor._addedSignals = true;
    }

}

export { EditorSignals };
