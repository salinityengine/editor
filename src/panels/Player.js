import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

const _size = { x: 0, y: 0 };

class Player extends SUEY.Window {

    constructor() {
        super({
            height: '85%',
            width: '60%',
        });
        const self = this;
        this.addClass('salt-player');
        this.setDisplay('none');

        // App
        const app = new SALT.App();

        // DOM
        this.contents().dom.appendChild(app.dom);
        this.contents().setStyle('background', 'rgba(0, 0, 0, 1.0)');
        this.contents().setStyle('position', 'relative');
        this.contents().setStyle('padding', '0');

        // Don't want Player transparent
        this.setStyle('opacity', '1.0');

        // App State
        Object.defineProperties(this, {
            isPlaying: { get: function() { return app.isPlaying; }, },
            isPaused: { get: function() { return app.gameClock.isStopped(); }, },
        });

        // Panel Widgets
        this.addTitleBar('Player', true /* draggable */);
        SUEY.Interaction.addCloseButton(this, SUEY.CLOSE_SIDES.LEFT, 1.7 /* offset */);
        SUEY.Interaction.addMaxButton(this, SUEY.CLOSE_SIDES.LEFT, 1.7 /* offset */);

        /***** OUTLINE BOX */

        const outlineBox = new SUEY.Div().addClass('salt-app-outline');
        const leftBox = new SUEY.Div().addClass('salt-app-side');
        const rightBox = new SUEY.Div().addClass('salt-app-side');
        this.add(outlineBox, leftBox, rightBox);

        function resizeOutLine() {
            const screenWidth = parseFloat(Config.getKey('renderer/screen/width'));
            const screenHeight = parseFloat(Config.getKey('renderer/screen/height'));
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
        this.dom.addEventListener('destroy', function() {
            if (resizeObserver) resizeObserver.disconnect();
        }, { once: true });

        /***** TOOLBAR BUTTONS */

        const screen = new SUEY.ToolbarButton();
        const camera = new SUEY.ToolbarButton();
        const pause = new SUEY.ToolbarButton();
        const stop = new SUEY.ToolbarButton();

        screen.dom.setAttribute('tooltip', 'Screen Size');
        camera.dom.setAttribute('tooltip', Config.tooltip('Screenshot', 'P'));
        pause.dom.setAttribute('tooltip', 'Pause Game');
        stop.dom.setAttribute('tooltip', 'Stop Game');

        const screenMonitor = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}screen-monitor.svg`).setId('tb-screen-monitor');
        const cameraBody = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}camera-body.svg`).setId('tb-camera-body');
        const cameraLens = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}camera-lens.svg`).setId('tb-camera-lens');
        const cameraFlash = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}camera-flash.svg`).setId('tb-camera-flash');
        const playPause = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}play-pause.svg`).setId('tb-play-pause');
        const playActive = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}play-active.svg`).setId('tb-play-active');
        const playStop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}play-stop.svg`).setId('tb-play-stop');
        screen.add(screenMonitor);
        camera.add(cameraBody, cameraLens, cameraFlash);
        pause.add(playPause, playActive);
        stop.add(playStop);

        camera.onClick(() => editor.requestScreenshot());
        pause.onClick(() => editor.player.pause());
        stop.onClick(() => editor.player.stop());

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

        /******************** START / STOP */

        this.start = function() {
            if (app.isPlaying) return;

            // Show Player (focus forces Inspector to blur, and edited Inspector variables to auto update)
            self.setStyle('opacity', '0');
            self.showWindow();
            adjustPlayButtons();

            // Save Project to JSON
            const json = editor.project.toJSON();

            // // DEBUG: Exported project json
            // console.log(json);

            // Load Project into App
            app.load(json, false /* load assets? */);

            // Play!
            app.start();
            Signals.dispatch('playerStateChanged', 'start');

            // Update Size
            setTimeout(() => {
                updateSize();
                self.setStyle('opacity', '1');
            }, 50);
        };

        this.pause = function() {
            app.pause();
            Signals.dispatch('playerStateChanged', app.gameClock.isRunning() ? 'start' : 'pause');
        };

        this.stop = function() {
            self.setDisplay('none');
            if (app.isPlaying) {
                app.stop();
                Signals.dispatch('playerStateChanged', 'stop');
            }
        };

        Signals.connect(this, 'playerStateChanged', function(state) {
            if (state === 'start') {
                playActive.setStyle('display', 'none', 'pointer-events', 'none');
                playPause.setStyle('display', '', 'pointer-events', 'all');
            } else if (state === 'pause') {
                playActive.setStyle('display', '', 'pointer-events', 'all');
                playPause.setStyle('display', 'none', 'pointer-events', 'none');
            }
        });

        /******************** SCREEN TYPE */

        const screenMenu = new SUEY.Menu();
        const currentScreen = Config.getKey('renderer/screen/name');
        const screenItems = [];
        EDITOR.SCREEN_RATIOS.forEach((screen) => {
            const screenItem = new SUEY.MenuItem(screen.name).keepOpen();
            screenItem.setChecked(currentScreen === screen.name);
            screenItem.onSelect(() => {
                screenItems.forEach((item) => { item.setChecked(false); });
                screenItem.setChecked(true);
                Config.setKey('renderer/screen/name', screen.name);
                Config.setKey('renderer/screen/width', screen.width);
                Config.setKey('renderer/screen/height', screen.height);
                Config.setKey('renderer/screen/pixelRatio', screen.pixelRatio);
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
        this.dom.addEventListener('resizer', () => { updateSize(); });
        window.addEventListener('resize', () => { updateSize(); });

        // Stop Player when Window 'X' is clicked
        this.dom.addEventListener('hidden', () => {
            self.stop();
        });

        /******************** SCREENSHOT */

        this.requestScreenshot = function() {
            // Save Current Size
            app.renderer.getSize(_size);

            // Desired Size
            const outWidth = parseInt(Config.getKey('renderer/screen/width'));
            const outHeight = parseInt(Config.getKey('renderer/screen/height'));
            const outRatio = parseInt(Config.getKey('renderer/screen/pixelRatio'));
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
