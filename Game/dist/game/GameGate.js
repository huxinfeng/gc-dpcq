var GameGate = (function () {
    function GameGate() {
    }
    GameGate.start = function () {
        EventUtils.addEventListener(ClientScene, ClientScene.EVENT_IN_NEW_SCENE, Callback.New(GameGate.onInNewScene, GameGate));
        EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(GameGate.onWorldInit, this), true);
    };
    GameGate.onWorldInit = function () {
        KeyboardControl.init();
        GUI_Setting.initHotKeySetting();
        GamepadControl.init();
        ProjectUtils.init();
        ProjectClientScene.init();
        if (Browser.onMobile) {
            stage.screenMode = ClientWorld.data.screenMode == 0 ? "horizontal" : "vertical";
            stage.setScreenSize(Browser.width, Browser.height);
        }
        UIList.SINGLE_FOCUS_MODE = WorldData.focusEnabled;
        UIList.KEY_BOARD_ENABLED = WorldData.hotKeyListEnabled;
        var onceLoadGame = LocalStorage.getJSON(GUI_SaveFileManager.onceInSceneLoadGameSign);
        if (onceLoadGame && onceLoadGame.id != null && SinglePlayerGame.getSaveInfoByID(onceLoadGame.id)) {
            LocalStorage.removeItem(GUI_SaveFileManager.onceInSceneLoadGameSign);
            GUI_SaveFileManager.currentSveFileIndexInfo = SinglePlayerGame.getSaveInfoByID(onceLoadGame.id);
            GUI_SaveFileManager.loadFile(onceLoadGame.id, Callback.New(function (success) {
                if (!success)
                    GameCommand.startCommonCommand(14007);
            }, this));
            return;
        }
        GameCommand.startCommonCommand(14001);
    };
    GameGate.onInNewScene = function (sceneID, inNewSceneState) {
        if (this.gateState != null && this.gateState < GameGate.STATE_3_IN_SCENE_COMPLETE)
            return;
        if (Game.player.sceneObject.stopMove) {
            Game.player.sceneObject.stopMove(true);
        }
        if (Game.player.sceneObject.clearBehaviors) {
            Game.player.sceneObject.clearBehaviors();
        }
        Controller.stop();
        GameGate.gateState = GameGate.STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT;
        EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
        var startEvents = [14011, 14003, 14005];
        GameCommand.startCommonCommand(startEvents[inNewSceneState], [], Callback.New(disposeLastScene, this));
        var lastTonal = null;
        function disposeLastScene() {
            GameGate.gateState = GameGate.STATE_1_START_LOAD_SCENE;
            EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
            if (Game.currentScene) {
                if (Game.player.sceneObject.inScene)
                    Game.currentScene.removeSceneObject(Game.player.sceneObject);
                var lastScene = Game.currentScene;
                lastTonal = lastScene.displayObject.getTonal();
                Game.layer.sceneLayer.removeChildren();
                if (inNewSceneState == 0)
                    AssetManager.disposeScene(lastScene.id);
                lastScene.dispose();
                Game.currentScene = null;
            }
            loadPlayerAsset();
        }
        function loadPlayerAsset() {
            if (inNewSceneState != 0)
                AssetManager.preLoadSceneObjectAsset(Game.player.data.sceneObject, Callback.New(loadNewScene, this));
            else
                loadNewScene.apply(this);
        }
        function loadNewScene() {
            var _this_1 = this;
            AssetManager.preLoadSceneAsset(sceneID, Callback.New(function () {
                ClientScene.createScene(sceneID, Callback.New(function (scene) {
                    if ((scene.bgm && (GameAudio.lastBgmURL != scene.bgm || GameAudio.lastBGMPitch != scene.bgmPitch)) || inNewSceneState != 0) {
                        new SyncTask(GameGate.bgmSyncTaskName, function () {
                            GameAudio.playBGM(GameAudio.lastBgmURL, 0, 9999, true, ClientWorld.data.sceneBGMGradientTime * 1000, GameAudio.lastBGMPitch);
                            Callback.New(SyncTask.taskOver, SyncTask, [GameGate.bgmSyncTaskName]).delayRun(ClientWorld.data.sceneBGMGradientTime * 1000);
                        });
                    }
                    if ((scene.bgs && GameAudio.lastBgsURL != scene.bgs || GameAudio.lastBGSPitch != scene.bgsPitch) || inNewSceneState != 0) {
                        new SyncTask(GameGate.bgsSyncTaskName, function () {
                            GameAudio.playBGS(GameAudio.lastBgsURL, 0, 9999, true, ClientWorld.data.sceneBGSGradientTime * 1000, GameAudio.lastBGSPitch);
                            Callback.New(SyncTask.taskOver, SyncTask, [GameGate.bgsSyncTaskName]).delayRun(ClientWorld.data.sceneBGSGradientTime * 1000);
                        });
                    }
                }, _this_1), Callback.New(onLoadedNewScene, _this_1), true);
            }, this), true, false, true);
        }
        function onLoadedNewScene(scene) {
            Game.currentScene = scene;
            if (lastTonal) {
                var t = lastTonal;
                Game.currentScene.displayObject.setTonal(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
            }
            if (inNewSceneState != 2) {
                var sceneObjects = scene.getPresetSceneObjectDatas();
                var len = sceneObjects.length;
                for (var i = 0; i < len; i++) {
                    var soObj = sceneObjects[i];
                    if (!soObj)
                        continue;
                    var soc = scene.addSceneObjectFromClone(sceneID, i, false);
                    var soSwitchs = SinglePlayerGame.getSceneObjectSwitch(sceneID, i);
                    if (soSwitchs) {
                        soc.installSwitchs(soSwitchs);
                    }
                }
            }
            var insertNewPostion = inNewSceneState != 2;
            if (!GameGate.inSceneInited) {
                GameGate.addPlayerSceneObject(Game.player.data.sceneObject, false, insertNewPostion);
            }
            else {
                GameGate.addPlayerSceneObject(Game.player.sceneObject, true, insertNewPostion);
            }
            Game.currentScene.startRender();
            Game.layer.sceneLayer.addChild(Game.currentScene.displayObject);
            if (inNewSceneState != 2) {
                new SyncTask(GameGate.bgmSyncTaskName, function (sceneBgm, bgmVolume, bgmPitch) {
                    if (sceneBgm) {
                        GameAudio.playBGM(sceneBgm, bgmVolume, 9999, true, ClientWorld.data.sceneBGMGradientTime * 1000, bgmPitch);
                    }
                    SyncTask.taskOver(GameGate.bgmSyncTaskName);
                }, [Game.currentScene.bgm, Game.currentScene.bgmVolume, Game.currentScene.bgmPitch]);
                new SyncTask(GameGate.bgsSyncTaskName, function (sceneBgs, bgsVolume, bgsPitch) {
                    if (sceneBgs) {
                        GameAudio.playBGS(sceneBgs, bgsVolume, 9999, true, ClientWorld.data.sceneBGSGradientTime * 1000, bgsPitch);
                    }
                    SyncTask.taskOver(GameGate.bgsSyncTaskName);
                }, [Game.currentScene.bgs, Game.currentScene.bgsVolume, Game.currentScene.bgsPitch]);
            }
            if (inNewSceneState == 2) {
                SinglePlayerGame.recoveryData();
            }
            startExecuteSceneLoadedEvent.apply(this);
        }
        function startExecuteSceneLoadedEvent() {
            GameGate.gateState = GameGate.STATE_2_START_EXECUTE_IN_SCENE_EVENT;
            EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
            var endEvents = [14010, 14004, 14006];
            GameCommand.startCommonCommand(endEvents[inNewSceneState], [], Callback.New(inSceneComplete, this));
        }
        function inSceneComplete() {
            GameGate.gateState = GameGate.STATE_3_IN_SCENE_COMPLETE;
            EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
            if (!GameGate.inSceneInited) {
                GameGate.inSceneInited = true;
                GameCommand.startCommonCommand(14002);
            }
            if (inNewSceneState != 2) {
                var sceneCmdTypeIndex = 0;
                var commandPageInScene = Game.currentScene.customCommandPages[sceneCmdTypeIndex];
                var inSceneCmdLength = commandPageInScene.commands.length;
                if (inSceneCmdLength > 0) {
                    var commandTriggerInScene = Game.player.sceneObject.getCommandTrigger(CommandTrigger.COMMAND_MAIN_TYPE_SCENE, sceneCmdTypeIndex, Game.currentScene, Game.player.sceneObject);
                    EventUtils.addEventListener(commandTriggerInScene, CommandTrigger.EVENT_OVER, Callback.New(function () {
                        Controller.start();
                        GameGate.gateState = GameGate.STATE_4_PLAYER_CONTROL_START;
                        EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
                    }, this, []), true);
                    commandPageInScene.startTriggerEvent(commandTriggerInScene);
                }
                else {
                    Controller.start();
                    GameGate.gateState = GameGate.STATE_4_PLAYER_CONTROL_START;
                    EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
                }
            }
            else {
                GameGate.gateState = GameGate.STATE_4_PLAYER_CONTROL_START;
            }
        }
    };
    GameGate.addPlayerSceneObject = function (so, isEntity, insertNewPostion) {
        if (isEntity === void 0) { isEntity = false; }
        if (insertNewPostion === void 0) { insertNewPostion = true; }
        if (!Game.currentScene)
            return;
        if (!isEntity)
            delete so.player;
        else {
            so.x = Game.player.data.sceneObject.x;
            so.y = Game.player.data.sceneObject.y;
        }
        if (insertNewPostion) {
            var newIndex = ArrayUtils.getNullPosition(Game.currentScene.sceneObjects);
            so.index = newIndex;
        }
        var soc = Game.currentScene.addSceneObject(so, isEntity, true);
        Game.player.sceneObject = soc;
        if (typeof Game.player.sceneObject.inPartyIndex != "undefined")
            Game.player.sceneObject.inPartyIndex = 0;
        Game.player.sceneObject.stopMove();
        soc.player = Game.player;
        Game.currentScene.camera.sceneObject = soc;
        Game.currentScene.updateCamera();
    };
    GameGate.EVENT_IN_SCENE_STATE_CHANGE = "GameGateEVENT_SCENE_STATE_CHANGE";
    GameGate.STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT = 0;
    GameGate.STATE_1_START_LOAD_SCENE = 1;
    GameGate.STATE_2_START_EXECUTE_IN_SCENE_EVENT = 2;
    GameGate.STATE_3_IN_SCENE_COMPLETE = 3;
    GameGate.STATE_4_PLAYER_CONTROL_START = 4;
    GameGate.bgmSyncTaskName = "bgmTask";
    GameGate.bgsSyncTaskName = "bgsTask";
    return GameGate;
}());
//# sourceMappingURL=GameGate.js.map