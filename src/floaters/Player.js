import {
    FOLDER_FLOATERS,
    FOLDER_TOOLBAR,
    SCREEN_RATIOS,
 } from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Layout } from '../config/Layout.js';
import { Signals } from '../config/Signals.js';

const _size = { x: 0, y: 0 };

/**
 * Game Player
 */
class Player extends SmartFloater {

    constructor() {
        const icon = `${FOLDER_FLOATERS}player.svg`;
        super('player', { titled: false, icon, color: 'var(--button-dark)', color: 'rgb(223, 32, 32)', shadow: false, shrink: 0.75 });
        const self = this;
        this.addClass('salt-player');
        Advice.attach(this.button, 'floater/player');

        // App
        const app = new SALT.App();

        // DOM
        this.dom.appendChild(app.dom);
        this.setStyle('background', 'rgba(0, 0, 0, 1.0)');

        // App State
        Object.defineProperties(this, {
            isPlaying: { get: function() { return app.isPlaying; }, },
            isPaused: { get: function() { return app.gameClock.isStopped(); }, },
        });

        /***** OUTLINE BOX */

        const outlineBox = new SUEY.Div().addClass('salt-app-outline');
        const leftBox = new SUEY.Div().addClass('salt-app-side');
        const rightBox = new SUEY.Div().addClass('salt-app-side');
        this.add(outlineBox, leftBox, rightBox);

        function resizeOutLine() {
            const screenWidth = parseFloat(Config.getKey('player/screen/width'));
            const screenHeight = parseFloat(Config.getKey('player/screen/height'));
            const aspect = screenHeight / screenWidth;

            let x = 0, y = 0;
            switch (app.project.settings.orientation) {
                case (SALT.APP_ORIENTATION.LANDSCAPE):
                    y = (self.contents().getHeight() - (self.contents().getWidth() * aspect)) / 2;
                    break;
                case (SALT.APP_ORIENTATION.PORTRAIT):
                default:
                    x = (self.contents().getWidth() - (self.contents().getHeight() * aspect)) / 2;
                    break;
            }
            outlineBox.setStyle('left', `${x}px`);
            outlineBox.setStyle('right', `${x}px`);
            outlineBox.setStyle('top', `${y}px`);
            outlineBox.setStyle('bottom', `${y}px`);

            leftBox.setStyle('left', '0');
            leftBox.setStyle('top', '0');
            rightBox.setStyle('right', '0');
            rightBox.setStyle('bottom', '0');
            switch (app.project.settings.orientation) {
                case (SALT.APP_ORIENTATION.LANDSCAPE):
                    leftBox.setStyle('width',   `${self.contents().getWidth()}px`);
                    rightBox.setStyle('width',  `${self.contents().getWidth()}px`);
                    leftBox.setStyle('height',  `${Math.max(y, 0)}px`);
                    rightBox.setStyle('height', `${Math.max(y, 0)}px`);
                    break;
                case (SALT.APP_ORIENTATION.PORTRAIT):
                default:
                    leftBox.setStyle('width',   `${Math.max(x, 0)}px`);
                    rightBox.setStyle('width',  `${Math.max(x, 0)}px`);
                    leftBox.setStyle('height',  `${self.contents().getHeight()}px`);
                    rightBox.setStyle('height', `${self.contents().getHeight()}px`);
                    break;
            }
        }
        const resizeObserver = new ResizeObserver(resizeOutLine).observe(this.dom);
        this.on('destroy', function() {
            if (resizeObserver) resizeObserver.disconnect();
        });

        /***** TOOLBAR BUTTONS */

        const screen = new SUEY.ToolbarButton();
        const camera = new SUEY.ToolbarButton();
        const pause = new SUEY.ToolbarButton();
        const stop = new SUEY.ToolbarButton();

        screen.setAttribute('tooltip', 'Screen Size');
        camera.setAttribute('tooltip', Config.tooltip('Screenshot', 'P'));
        pause.setAttribute('tooltip', 'Pause Game');
        stop.setAttribute('tooltip', 'Stop Game');

        const screenMonitor = new SUEY.VectorBox(`${FOLDER_TOOLBAR}screen-monitor.svg`).setID('tb-screen-monitor');
        const cameraBody = new SUEY.VectorBox(`${FOLDER_TOOLBAR}camera-body.svg`).setID('tb-camera-body');
        const cameraLens = new SUEY.VectorBox(`${FOLDER_TOOLBAR}camera-lens.svg`).setID('tb-camera-lens');
        const cameraFlash = new SUEY.VectorBox(`${FOLDER_TOOLBAR}camera-flash.svg`).setID('tb-camera-flash');
        const playPause = new SUEY.VectorBox(`${FOLDER_TOOLBAR}play-pause.svg`).setID('tb-play-pause');
        const playActive = new SUEY.VectorBox(`${FOLDER_TOOLBAR}play-active.svg`).setID('tb-play-active');
        const playStop = new SUEY.VectorBox(`${FOLDER_TOOLBAR}play-stop.svg`).setID('tb-play-stop');
        screen.add(screenMonitor);
        camera.add(cameraBody, cameraLens, cameraFlash);
        pause.add(playPause, playActive);
        stop.add(playStop);

        camera.onPress(() => self.requestScreenshot());
        pause.onPress(() => {
            if (app.isPlaying) self.pause();
            else self.start();
        });
        stop.onPress(() => self.removeSelf());

        const playButtons = new SUEY.FlexBox().addClass('salt-active-toolbar');
        playButtons.add(stop, pause, camera, screen);
        this.add(playButtons);

        // Button Direction / Flex Direction
        function adjustPlayButtons() {
            switch (editor.project.settings.orientation) {
                case (SALT.APP_ORIENTATION.LANDSCAPE):
                    screen.dom.style.order = 0;
                    camera.dom.style.order = 1;
                    pause.dom.style.order = 2;
                    stop.dom.style.order = 3;
                    playButtons.setStyle('flex-direction', 'row');
                    break;
                case (SALT.APP_ORIENTATION.PORTRAIT):
                default:
                    screen.dom.style.order = 3;
                    camera.dom.style.order = 2;
                    pause.dom.style.order = 1;
                    stop.dom.style.order = 0;
                    playButtons.setStyle('flex-direction', 'column');
            }
        }

        function playButtonAdjust(state) {
            if (state === 'start') {
                playActive.setStyle('display', 'none', 'pointer-events', 'none');
                playPause.setStyle('display', '', 'pointer-events', 'all');
            } else if (state === 'pause' || state === 'stop') {
                playActive.setStyle('display', '', 'pointer-events', 'all');
                playPause.setStyle('display', 'none', 'pointer-events', 'none');
            }
        }

        Signals.connect(this, 'playerStateChanged', playButtonAdjust);

        adjustPlayButtons();
        playButtonAdjust('stop');

        /******************** START / STOP */

        this.start = function() {
            if (app.isPlaying) return;
            adjustPlayButtons();

            // Serialize Project
            const json = editor.project.serialize();

            // // DEBUG: Exported project json
            // console.log(json);

            // Load Project into App
            app.load(json, false /* load assets? */);

            // Play!
            app.start();
            Signals.dispatch('playerStateChanged', 'start');
        };

        this.pause = function() {
            app.pause();
            Signals.dispatch('playerStateChanged', app.gameClock.isRunning() ? 'start' : 'pause');
        };

        this.stop = function() {
            if (app.isPlaying) {
                app.stop();
                Signals.dispatch('playerStateChanged', 'stop');
            }
        };

        /******************** SCREEN TYPE */

        const screenMenu = new SUEY.Menu();
        const currentScreen = Config.getKey('player/screen/name');
        const screenItems = [];
        SCREEN_RATIOS.forEach((screen) => {
            const screenItem = new SUEY.MenuItem(screen.name).keepOpen();
            screenItem.setChecked(currentScreen === screen.name);
            screenItem.onSelect(() => {
                screenItems.forEach((item) => { item.setChecked(false); });
                screenItem.setChecked(true);
                Config.setKey('player/screen/name', screen.name);
                Config.setKey('player/screen/width', screen.width);
                Config.setKey('player/screen/height', screen.height);
                Config.setKey('player/screen/pixelRatio', screen.pixelRatio);
                resizeOutLine();
            });
            screenItems.push(screenItem);
            screenMenu.add(screenItem);
        })
        screen.attachMenu(screenMenu);

        /******************** RESIZE */

        function updateSize() {
            const width = Math.max(1, self.contents().getWidth());
            const height = Math.max(1, self.contents().getHeight());
            app.setSize(width, height);
        }
        this.on('resizer', updateSize);
        window.addEventListener('resize', updateSize);

        // Stop Player when hidden, i.e. Tab is changed
        this.on('hidden', () => {
            self.stop();
        });

        // Stop Player when Window 'X' is clicked
        this.on('destroy', () => {
            window.removeEventListener('resize', updateSize);
            self.stop();
        });

        /******************** SCREENSHOT */

        this.requestScreenshot = function() {
            // Save Current Size
            app.renderer.getSize(_size);

            // Desired Size
            const outWidth = parseInt(Config.getKey('player/screen/width'));
            const outHeight = parseInt(Config.getKey('player/screen/height'));
            const outRatio = parseInt(Config.getKey('player/screen/pixelRatio'));
            const w = ((app.project.settings.orientation === SALT.APP_ORIENTATION.LANDSCAPE) ? outWidth : outHeight) * outRatio;
            const h = ((app.project.settings.orientation === SALT.APP_ORIENTATION.LANDSCAPE) ? outHeight : outWidth) * outRatio;
            app.setSize(w, h);

            // Render
            SALT.SceneManager.renderWorld(app.world);

            // Screenshot
            const filename = app.project.name + ' ' + new Date().toLocaleString() + '.png';
            const strMime = 'image/png'; /* or 'image/jpeg' or 'image/webp' */
            const imgData = app.renderer.domElement.toDataURL(strMime);
            SALT.System.saveImage(imgData, filename);

            // Restore
            app.setSize(_size.x, _size.y);
        };

    } // end ctor

}

export { Player };
