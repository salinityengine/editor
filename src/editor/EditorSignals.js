import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Config } from './config/Config.js';
import { Signal } from '../../libs/utility/signals.js';

class EditorSignals {

    constructor() {

        this.signalNames = [

        /***** EDITOR **************** DISPATCH *********** TYPE ****** DESCRIPTION *****/

        // General
        'advisorInfo',              // (title, html)        FUNCTION    New Advisor title / text
        'editorMode',               // (newMode)            FUNCTION    New Editor mode
        'clipboardChanged',         // -                    ALERT       Clipboard was changed
        'historyChanged',           // (command)            ALERT       History was changed
        'showInfo',                 // (info)               FUNCTION    Display temporary, centered tooltip

        // Gui
        'fontSizeChanged',          // -                    ALERT       Font size was changed
        'promodeChanged',           // -                    ALERT       Pro (advanced) mode was toggled
        'schemeChanged',            // -                    ALERT       Color scheme was changed
        'refreshSettings',          // -                    FUNCTION    Refresh app settings (color, font size, etc.)
        'refreshWindows',           // -                    FUNCTION    Refresh OSUI Window/Docker sizes
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
        'transformUpdate',          // (origin)             FUNCTION    Tell TransformControls to updateMatrixWorld()

        'cameraChanged',            // -                    ALERT       Viewport camera was changed
        'cameraFocus',              // -                    FUNCTION    Focus camera
        'cameraReset',              // -                    FUNCTION    Reset camera

        'gridChanged',              // -                    ALERT       Change to grid settings (shown, snap, etc.)
        'gridPlaneChanged',         // -                    ALERT       Grid plane was changed

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
        'componentChanged',         // (component)          ALERT       Component was changed

        // Assets
        'assetAdded',               // (type, asset)        ALERT       Asset added to AssetManager
        'assetRemoved',             // (type, asset)        ALERT       Asset removed from AssetManager
        'assetChanged',             // (type, asset)        ALERT       Asset was changed
        'assetSelect',              // (type, asset)        FUNCTION    Select Asset in Explorer

        // Scripts
        'editScript',               // (script)             FUNCTION    Open Scripter (script editor) with 'script'

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

        signals.editorMode.add(function(mode) {
            // Close (Hide) Windows
            const windows = document.querySelectorAll('.osui-window');
            for (const window of windows) {
                window.classList.remove('osui-active-window');
                window.style.display = 'none';
                window.dispatchEvent(new Event('hidden'));
            }

            // Hide Dock Panels
            if (editor.explorer) editor.explorer.hide();
            if (editor.inspector) {
                const persistent = [ 'project', 'history', 'settings'];
                if (!persistent.includes(editor.inspector.currentItem())) editor.inspector.hide();
            }
            if (editor.previewer) editor.previewer.hide();

            // Hide Editor Panels
            if (editor.viewport) editor.viewport.hide();
            if (editor.worlds) editor.worlds.hide();

            // Switch Mode
            switch (mode) {
                case EDITOR.MODES.UI_EDITOR:

                    break;
                case EDITOR.MODES.SCENE_EDITOR_2D:

                    break;
                case EDITOR.MODES.SCENE_EDITOR_3D:
                    if (editor.explorer) editor.explorer.display();
                    if (editor.viewport) editor.viewport.display();
                    break;
                case EDITOR.MODES.SOUND_EDITOR:

                    break;
                case EDITOR.MODES.WORLD_GRAPH:
                default:
                    if (editor.worlds) {
                        editor.worlds.display();
                        editor.worlds.zoomTo();
                    }
                    mode = EDITOR.MODES.WORLD_GRAPH;
            }
            Config.setKey('settings/editorMode', mode);

            // Rebuild Inspector if on 'settings'
            if (editor.inspector && editor.inspector.currentItem() === 'settings') {
                signals.inspectorBuild.dispatch('rebuild');
            }

            // Refresh Panel Sizes
            signals.windowResize.dispatch();
        });

        signals.refreshSettings.add(function() {
            // Mouse Modes
            signals.mouseModeChanged.dispatch(Config.getKey('scene/viewport/mode'));
            signals.transformModeChanged.dispatch(Config.getKey('scene/controls/mode'));

            // Viewport
            if (editor.viewport) {
                editor.viewport.setGizmo(Config.getKey('scene/gizmo'));
                editor.viewport.wireframePass.enabled = Config.getKey('scene/select/showWireframe');
            }

            // Font Size Update
            editor.fontSizeUpdate();

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
            signals.gridPlaneChanged.dispatch();

            // Tabs
            editor.traverse((child) => {
                if (child.isElement && child.hasClass('osui-tabbed')) {
                    child.selectLastKnownTab();
                }
            }, false /* applyToSelf */);

            // Render Mode (also dispatches cameraChanged signal)
            if (editor.viewport) editor.viewport.setRenderMode(Config.getKey('scene/render/mode'));

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

        signals.componentChanged.add(function(component) {
            if (!component || !component.entity || !component.entity.isEntity) return;

            // Individual Component Signals
            switch (component.type) {
                case 'geometry':
                    signals.transformsChanged.dispatch([ component.entity ]);
                    break;
                case 'material':
                    /* signals.assetChanged.dispatch('material'); */
                    break;
                case 'rigidbody':
                    editor.viewport.rebuildColliders();
                    break;
            }
        });

        // Flag that we've added EditorSignals to Editor
        editor._addedSignals = true;
    }

}

export { EditorSignals };
