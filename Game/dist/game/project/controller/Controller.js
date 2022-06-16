var Controller = (function () {
    function Controller() {
    }
    Controller.start = function () {
        this.stop();
        Controller.ctrlStart = true;
        this.startEvent();
        MouseControl.start();
        KeyboardControl.start();
        GamepadControl.start();
        GameBattle.start();
        EventUtils.happen(Controller, Controller.EVENT_CONTROLLER_START);
    };
    Controller.stop = function () {
        Controller.ctrlStart = false;
        this.clearEvent();
        MouseControl.stop();
        KeyboardControl.stop();
        GamepadControl.stop();
        GameBattle.stop();
    };
    Object.defineProperty(Controller, "inSceneEnabled", {
        get: function () {
            if (Game.pause || !WorldData.playCtrlEnabled || !Controller.ctrlStart)
                return false;
            if ((GameDialog.isInDialog || (GameUI.get(3) && GameUI.get(3).stage))) {
                return false;
            }
            for (var i in Controller.enabledMapping) {
                if (!Controller.enabledMapping[i])
                    return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Controller.startJoy = function (dirAngle, recordAngle, tryTimes, oriAngle) {
        if (recordAngle === void 0) { recordAngle = true; }
        if (tryTimes === void 0) { tryTimes = -1; }
        if (oriAngle === void 0) { oriAngle = null; }
        ProjectUtils.lastControl = 2;
        if (!Controller.ctrlStart || !Controller.inSceneEnabled)
            return;
        if (WorldData.moveToGridCenter) {
            if (!Game.player.sceneObject.isMoving) {
                var dir = GameUtils.getOriByAngle(dirAngle);
                var offset = KeyboardControl.dirOffsetArr[dir];
                var xGrid = Math.floor(Game.player.sceneObject.x / Config.SCENE_GRID_SIZE) + offset[0];
                var yGrid = Math.floor(Game.player.sceneObject.y / Config.SCENE_GRID_SIZE) + offset[1];
                if (!Game.currentScene.sceneUtils.isOutsideByGrid(new Point(xGrid, yGrid))) {
                    KeyboardControl.moveDirectGrid(xGrid, yGrid);
                }
            }
            return;
        }
        if (!GameBattleHelper.canMove(ProjectPlayer.ctrlActorSceneObject)) {
            this.lastJoyAngle = null;
            Callback.New(this.startJoy, Controller, [dirAngle, recordAngle, tryTimes, oriAngle]).delayRun(1, setFrameout);
            return;
        }
        if (recordAngle) {
            var nearAngle = 5;
            if (this.lastJoyAngle != null) {
                if (MathUtils.inAngleRange(0 - nearAngle, 0 + nearAngle, dirAngle) && MathUtils.inAngleRange(0 - nearAngle, 0 + nearAngle, this.lastJoyAngle)) {
                    return;
                }
                else if (Math.abs(dirAngle - this.lastJoyAngle) <= nearAngle * 2) {
                    return;
                }
            }
            this.lastJoyAngle = dirAngle;
        }
        var currentX = Game.player.sceneObject.x;
        var currentY = Game.player.sceneObject.y;
        var R = 1000000;
        var radian = dirAngle * Math.PI / 180;
        var targetX = Math.sin(radian) * R + currentX;
        var targetY = -Math.cos(radian) * R + currentY;
        Game.player.sceneObject.off(ProjectClientSceneObject.COLLISION, this, this.onJoyCollision);
        Game.player.sceneObject.on(ProjectClientSceneObject.COLLISION, this, this.onJoyCollision, [dirAngle, tryTimes, oriAngle]);
        var lastX = Game.player.sceneObject.x;
        var lastY = Game.player.sceneObject.y;
        Game.player.sceneObject.startMove([[targetX, targetY]], Game.oneFrame);
        if (lastX == Game.player.sceneObject.x && lastY == Game.player.sceneObject.y) {
            Game.player.sceneObject.setTo(lastX, lastY);
            if (oriAngle == null)
                oriAngle = dirAngle;
            if (tryTimes == -1) {
                tryTimes = 2;
            }
            else {
                if (tryTimes <= 0)
                    return;
                tryTimes--;
            }
            dirAngle = this.getCollisionAutoTryAngle(oriAngle, tryTimes);
            this.startJoy(dirAngle % 360, false, tryTimes, oriAngle);
        }
        else {
            this.lastJoyAngle = dirAngle;
            Game.player.sceneObject.stopMove();
            Game.player.sceneObject.setTo(lastX, lastY);
            Game.player.sceneObject.startMove([[targetX, targetY]]);
        }
    };
    Controller.stopJoy = function () {
        this.lastJoyAngle = null;
        if (!ClientWorld.data.moveToGridCenter) {
            Game.player.sceneObject.stopMove();
        }
        else {
            var pCenter = GameUtils.getGridCenter(Game.player.sceneObject.pos);
            if (Game.player.sceneObject.x == pCenter.x && Game.player.sceneObject.y == pCenter.y) {
                Game.player.sceneObject.stopMove();
            }
        }
        Game.player.sceneObject.off(ProjectClientSceneObject.COLLISION, this, this.onJoyCollision);
    };
    Controller.startSceneObjectClickEvent = function (target, playerFaceToTarget) {
        var _this_1 = this;
        if (playerFaceToTarget === void 0) { playerFaceToTarget = false; }
        if (Game.pause)
            return;
        if (target) {
            if (!target.inScene || target.scene != Game.currentScene || target.isJumping)
                return;
            if (target.hasCommand[0]) {
                var bool = target.eventStartWait(Game.player.sceneObject);
                if (!bool)
                    return;
                Game.player.sceneObject.stopMove();
                if (playerFaceToTarget && !Game.player.sceneObject.fixOri) {
                    var dis = Point.distance2(Game.player.sceneObject.x, Game.player.sceneObject.y, target.x, target.y);
                    var gridDis = Math.floor(dis / Config.SCENE_GRID_SIZE);
                    if (gridDis >= 1)
                        Game.player.sceneObject.addBehavior([[25, 2]], false, Game.player.sceneObject, null, false, 0, true, false, 0, target);
                }
                EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, [true]);
                GameCommand.startCommonCommand(14012, [], Callback.New(function () {
                    GameCommand.startSceneObjectCommand(target.index, 0, null, Callback.New(function (target) {
                        target.eventCompleteContinue();
                        EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, [false]);
                    }, _this_1, [target]), Game.player.sceneObject);
                }, this), Game.player.sceneObject, target);
            }
        }
    };
    Controller.moveToNearTargetSceneObjectAndTriggerClickEvent = function (targetSceneObject) {
        if (!targetSceneObject.hasCommand[0])
            return;
        Controller.clearNearTargetSceneObjectAndTriggerClickEvent();
        var dis2 = Math.pow(Config.SCENE_GRID_SIZE * 1.5, 2);
        if (Point.distanceSquare(targetSceneObject.pos, Game.player.sceneObject.pos) <= dis2) {
            Controller.startSceneObjectClickEvent(targetSceneObject, true);
        }
        else {
            Game.player.sceneObject.once(ProjectClientSceneObject.MOVE_OVER, Controller, Controller.moveToNearTargetSceneObjectAndTriggerClickEvent, [targetSceneObject]);
            Game.player.sceneObject.autoFindRoadMove(targetSceneObject.x, targetSceneObject.y, 1, 0, true, true, true);
            Game.player.sceneObject.on(ProjectClientSceneObject.MOVE_START, Controller, this.clearNearTargetSceneObjectAndTriggerClickEvent);
        }
    };
    Controller.clearNearTargetSceneObjectAndTriggerClickEvent = function (fromAutoRetry) {
        if (fromAutoRetry === void 0) { fromAutoRetry = false; }
        if (fromAutoRetry)
            return;
        Game.player.sceneObject.off(ProjectClientSceneObject.MOVE_START, Controller, Controller.clearNearTargetSceneObjectAndTriggerClickEvent);
        Game.player.sceneObject.off(ProjectClientSceneObject.MOVE_OVER, Controller, Controller.moveToNearTargetSceneObjectAndTriggerClickEvent);
    };
    Controller.startSceneObjectTouchEvent = function (trigger, executor, onCommandExecuteOver) {
        if (onCommandExecuteOver === void 0) { onCommandExecuteOver = null; }
        if (GameGate.gateState < GameGate.STATE_4_PLAYER_CONTROL_START) {
            Callback.New(Controller.startSceneObjectTouchEvent, Controller, [trigger, executor, onCommandExecuteOver]).delayRun(0);
            return false;
        }
        if (Game.pause) {
            EventUtils.addEventListener(Game, Game.EVENT_PAUSE_CHANGE, Callback.New(Controller.startSceneObjectTouchEvent, this, [trigger, executor, onCommandExecuteOver]), true);
            return false;
        }
        if (!executor.inScene || !trigger.inScene || trigger.scene != Game.currentScene || executor.scene != Game.currentScene)
            return false;
        if (executor.isJumping || trigger.isJumping)
            return false;
        if (executor.onlyPlayerTouch && trigger != Game.player.sceneObject)
            return false;
        if (executor.waitTouchEvent && trigger == Game.player.sceneObject) {
            if (executor.isEventStartWait) {
                return false;
            }
            GameCommand.startCommonCommand(14013, [], null, trigger, executor);
            if (!executor.hasCommand[1])
                return false;
            var bool = executor.eventStartWait(trigger);
            if (!bool)
                return false;
            trigger.stopMove();
            EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, [true]);
            GameCommand.startCommonCommand(14013, [], null, trigger, executor);
            return GameCommand.startSceneObjectCommand(executor.index, 1, null, Callback.New(function () {
                executor.eventCompleteContinue();
                EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, [false]);
                onCommandExecuteOver && onCommandExecuteOver.run();
            }, this), trigger);
        }
        else {
            GameCommand.startCommonCommand(14013, [], null, trigger, executor);
            if (!executor.hasCommand[1])
                return false;
            return GameCommand.startSceneObjectCommand(executor.index, 1, null, onCommandExecuteOver, trigger);
        }
    };
    Controller.startSceneObjectTouchOutEvent = function (trigger, executor, onCommandExecuteOver) {
        if (onCommandExecuteOver === void 0) { onCommandExecuteOver = null; }
        if (Game.pause) {
            EventUtils.addEventListener(Game, Game.EVENT_PAUSE_CHANGE, Callback.New(Controller.startSceneObjectTouchEvent, this, [trigger, executor, onCommandExecuteOver]), true);
            return false;
        }
        if (!executor.inScene || !trigger.inScene || trigger.scene != Game.currentScene || executor.scene != Game.currentScene)
            return false;
        if (executor.onlyPlayerTouch && trigger != Game.player.sceneObject)
            return false;
        GameCommand.startCommonCommand(14014, [], null, trigger, executor);
        if (!executor.hasCommand[4])
            return false;
        return GameCommand.startSceneObjectCommand(executor.index, 4, null, onCommandExecuteOver, trigger);
    };
    Controller.startEvent = function () {
        this.clearEvent();
        EventUtils.addEventListener(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, Callback.New(this.onCommandStart, this, [Controller.ENABLED_COMMAND_SCENE_OBJECT_CLICK_EXECUTE]));
        EventUtils.addEventListener(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, Callback.New(this.onCommandStart, this, [Controller.ENABLED_COMMAND_SCENE_OBJECT_TOUCH_EXECUTE]));
    };
    Controller.clearEvent = function () {
        EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, [false]);
        EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, [false]);
    };
    Controller.onCommandStart = function (enabledID, isStart) {
        Controller.enabledMapping[enabledID] = !isStart;
    };
    Controller.onJoyCollision = function (dirAngle, tryTimes, oriAngle) {
        if (oriAngle == null)
            oriAngle = dirAngle;
        if (tryTimes == -1) {
            tryTimes = 2;
        }
        else {
            if (tryTimes <= 0)
                return;
            tryTimes--;
        }
        dirAngle = this.getCollisionAutoTryAngle(oriAngle, tryTimes);
        this.startJoy(dirAngle % 360, false, tryTimes, oriAngle);
    };
    Controller.getCollisionAutoTryAngle = function (fromAngle, tryTimes) {
        var nearAngle = 22;
        if (fromAngle > 360 - nearAngle || fromAngle < 0 + nearAngle) {
            return 0;
        }
        else if (Math.abs(90 - fromAngle) <= nearAngle) {
            return 90;
        }
        else if (Math.abs(180 - fromAngle) <= nearAngle) {
            return 180;
        }
        else if (Math.abs(270 - fromAngle) <= nearAngle) {
            return 270;
        }
        if (fromAngle >= 315) {
            if (tryTimes == 2)
                return 0;
            else if (tryTimes == 1)
                return 270;
        }
        else if (fromAngle >= 270) {
            if (tryTimes == 2)
                return 270;
            else if (tryTimes == 1)
                return 0;
        }
        else if (fromAngle >= 225) {
            if (tryTimes == 2)
                return 270;
            else if (tryTimes == 1)
                return 180;
        }
        else if (fromAngle >= 180) {
            if (tryTimes == 2)
                return 180;
            else if (tryTimes == 1)
                return 270;
        }
        else if (fromAngle >= 135) {
            if (tryTimes == 2)
                return 180;
            else if (tryTimes == 1)
                return 90;
        }
        else if (fromAngle >= 90) {
            if (tryTimes == 2)
                return 90;
            else if (tryTimes == 1)
                return 180;
        }
        else if (fromAngle >= 45) {
            if (tryTimes == 2)
                return 90;
            else if (tryTimes == 1)
                return 0;
        }
        else if (fromAngle >= 0) {
            if (tryTimes == 2)
                return 0;
            else if (tryTimes == 1)
                return 90;
        }
        return fromAngle;
    };
    Controller.EVENT_CONTROLLER_START = "ControllerEVENT_CONTROLLER_START";
    Controller.EVENT_CONTROLLER_STOP = "ControllerEVENT_CONTROLLER_STOP";
    Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND = "GameCommand_EVENT_SCENE_OBJECT_CLICK_COMMAND";
    Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND = "GameCommand_EVENT_SCENE_OBJECT_TOUCH_COMMAND";
    Controller.ENABLED_COMMAND_SCENE_OBJECT_CLICK_EXECUTE = 0;
    Controller.ENABLED_COMMAND_SCENE_OBJECT_TOUCH_EXECUTE = 1;
    Controller.enabledMapping = {
        0: true,
        1: true
    };
    Controller.inputState = 0;
    return Controller;
}());
//# sourceMappingURL=Controller.js.map