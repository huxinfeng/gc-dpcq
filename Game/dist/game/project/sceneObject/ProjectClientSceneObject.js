














var ProjectClientSceneObject = (function (_super) {
    __extends(ProjectClientSceneObject, _super);
    function ProjectClientSceneObject(soData, scene) {
        var _this_1 = _super.call(this, soData, scene) || this;
        _this_1.pos = new Point();
        _this_1.posGrid = new Point(-1, -1);
        _this_1.posRect = new Rectangle();
        _this_1.behaviors = [];
        _this_1.myLastTouchObjects = [];
        _this_1.tempGridPosHelper = new Point();
        if (!_this_1.root)
            return _this_1;
        if (WorldData.rectObsDebug && os.inGC()) {
            var size = WorldData.sceneObjectCollisionSize;
            var rect = new Rectangle(-size / 2, -size / 2, size - 1, size - 1);
            _this_1.root.graphics.drawLines(0, 0, [rect.x, rect.y, rect.right, rect.y, rect.right, rect.bottom, rect.x, rect.bottom, rect.x, rect.y], "#FF0000", 1);
        }
        if (GameGate.gateState >= GameGate.STATE_3_IN_SCENE_COMPLETE) {
            _this_1.init();
        }
        else {
            var initCB = Callback.New(function () {
                if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                    _this_1.init();
                    EventUtils.removeEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, initCB);
                }
            }, _this_1);
            EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, initCB);
        }
        _this_1.settingX = _this_1.x;
        _this_1.settingY = _this_1.y;
        return _this_1;
    }
    ProjectClientSceneObject.prototype.dispose = function () {
        if (!this.isDisposed) {
            if (this.battleAI) {
                this.battleAI.dispose();
                this.battleAI = null;
            }
            EventUtils.removeEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE, this.refreshPointBar, this);
            EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, this.refreshPointBar, this);
        }
        _super.prototype.dispose.call(this);
    };
    ProjectClientSceneObject.prototype.getSaveData = function () {
        var o = { myLastTouchObjects: [], moveState: null, recordMoveRoadInfo: this.recordMoveRoadInfo, eventStartWaitInfo: this.eventStartWaitInfo };
        for (var i = 0; i < this.myLastTouchObjects.length; i++) {
            var myLastTouchSo = this.myLastTouchObjects[i];
            if (myLastTouchSo)
                o.myLastTouchObjects[i] = myLastTouchSo.index;
        }
        o.moveState = this.getRecordMoveState();
        if (this.isJumping) {
            o.jumpState = {
                jumpTo: [this.jumpToPoint.x, this.jumpToPoint.y],
                currentJumpFrame: this.currentJumpFrame
            };
        }
        return o;
    };
    ProjectClientSceneObject.prototype.retorySaveData = function (o) {
        this.isFromRecorySaveData = true;
        for (var i = 0; i < o.myLastTouchObjects.length; i++) {
            var myLastTouchSoIndex = o.myLastTouchObjects[i];
            if (myLastTouchSoIndex != null) {
                var myLastTouchSo = Game.currentScene.sceneObjects[myLastTouchSoIndex];
                if (myLastTouchSo)
                    this.myLastTouchObjects.push(myLastTouchSo);
            }
        }
        this.restoryMove(o.moveState, true);
        this.recordMoveRoadInfo = o.recordMoveRoadInfo;
        this.eventStartWaitInfo = o.eventStartWaitInfo;
        if (o.jumpState) {
            this.jumpTo(o.jumpState.jumpTo[0], o.jumpState.jumpTo[1], o.jumpState.currentJumpFrame);
        }
    };
    ProjectClientSceneObject.prototype.battlerInit = function (refreshAttribute, fullState) {
        if (refreshAttribute === void 0) { refreshAttribute = true; }
        if (fullState === void 0) { fullState = true; }
        if (this.battleAI)
            this.battleAI.dispose(false);
        if (this.isBattler) {
            if (refreshAttribute)
                Game.refreshActorAttribute(this.actor, 1, this);
            this.battleAI = new GameBattleAI(this);
            if (this.isDead)
                GameBattlerHandler.battlerDeadAnimation(this, false);
            else if (fullState) {
                this.setPointFullState();
            }
            EventUtils.removeEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE, this.refreshPointBar, this);
            EventUtils.addEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE, this.refreshPointBar, this);
            EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, this.refreshPointBar, this);
            EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, this.refreshPointBar, this);
        }
        GameBattlerHandler.refreshBattlerActionByStatus(this);
        this.root.visible = true;
        this.refreshPointBar();
    };
    ProjectClientSceneObject.prototype.refreshPointBar = function () {
        if (this.isBattler && !this.isDead) {
            this.pointBar.visible = WorldData.displayBattlerPointBar;
            this.pointBar.hpBar.value = this.actor.hp * 100 / this.actor.MaxHP;
            this.pointBar.hpText.text = this.actor.hp + "/" + this.actor.MaxHP;
        }
        else if (this.pointBar) {
            this.pointBar.visible = false;
        }
        if (this.inPartyIndex >= 0) {
            var mainUI = GameUI.get(13);
            mainUI.refreshActorHP(this.inPartyIndex);
            mainUI.refreshActorSP(this.inPartyIndex);
        }
    };
    ProjectClientSceneObject.prototype.setPointFullState = function () {
        this.actor.hp = this.actor.MaxHP;
        this.actor.sp = this.actor.MaxSP;
    };
    ProjectClientSceneObject.prototype.update = function (nowTime) {
        if (this.isMoving)
            this.updateCoordinate(nowTime);
        if (!this.isDead || !this.isBattler)
            this.updateBehavior();
        this.parallelEventUpdate();
        this.updateBattlerData();
    };
    ProjectClientSceneObject.prototype.addBehavior = function (behaviorData, loop, targetSceneObject, onOver, cover, startIndex, Immediate, forceStopLastBehavior, delayFrame, executor) {
        var _this_1 = this;
        if (startIndex === void 0) { startIndex = 0; }
        if (Immediate === void 0) { Immediate = true; }
        if (forceStopLastBehavior === void 0) { forceStopLastBehavior = false; }
        if (delayFrame === void 0) { delayFrame = 0; }
        if (executor === void 0) { executor = null; }
        GameCommand.startCommonCommand(14016, [], null, Game.player.sceneObject, Game.player.sceneObject);
        var soBehavior = new ProjectSceneObjectBehaviors(this, loop, targetSceneObject, Callback.New(function (onOver, soBehavior) {
            GameCommand.startCommonCommand(14017, [], null, _this_1, _this_1);
            var idx = _this_1.behaviors.indexOf(soBehavior);
            if (idx != -1)
                _this_1.behaviors.splice(idx, 1);
            onOver && onOver.run();
            _this_1.updateBehavior();
        }, this, [onOver]), startIndex, executor);
        soBehavior.setBehaviors(behaviorData, delayFrame);
        if (forceStopLastBehavior) {
            this.stopBehavior(true);
        }
        if (cover)
            this.behaviors.length = 0;
        this.behaviors.push(soBehavior);
        if (Immediate)
            this.updateBehavior();
        return soBehavior;
    };
    ProjectClientSceneObject.prototype.stopBehavior = function (force) {
        if (force === void 0) { force = false; }
        if (this._isMoving) {
            this.stopMove(force);
        }
    };
    ProjectClientSceneObject.prototype.getBehaviorLayer = function () {
        return this.behaviors.length;
    };
    ProjectClientSceneObject.prototype.setTo = function (x, y, stopMove, integer, alreadySetTempPosHelper, alreadySetRect, clacTouchEvent) {
        if (stopMove === void 0) { stopMove = true; }
        if (integer === void 0) { integer = true; }
        if (alreadySetTempPosHelper === void 0) { alreadySetTempPosHelper = false; }
        if (alreadySetRect === void 0) { alreadySetRect = false; }
        if (clacTouchEvent === void 0) { clacTouchEvent = true; }
        if (this.isJumping)
            return;
        if (stopMove)
            this.isMoving = false;
        if (integer) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        this._x = x;
        this._y = y;
        this.root.pos(x, y);
        this.refreshCoordinate(alreadySetTempPosHelper, alreadySetRect, clacTouchEvent);
    };
    ProjectClientSceneObject.prototype.autoFindRoadMove = function (toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle, forceDir4, fromAutoRetry) {
        if (ifObstacleHandleMode === void 0) { ifObstacleHandleMode = 0; }
        if (costTime === void 0) { costTime = 0; }
        if (useAstar === void 0) { useAstar = true; }
        if (whenCantMoveRetry === void 0) { whenCantMoveRetry = false; }
        if (useGridObstacle === void 0) { useGridObstacle = true; }
        if (forceDir4 === void 0) { forceDir4 = false; }
        if (fromAutoRetry === void 0) { fromAutoRetry = false; }
        if (this.isJumping)
            return;
        if (this.duringRelease) {
        }
        var currentScene = Game.currentScene;
        var realLineArr;
        var toP = new Point(toX, toY);
        currentScene.sceneUtils.limitInside(toP);
        if (ClientWorld.data.moveToGridCenter) {
            GameUtils.getGridCenter(toP, toP);
        }
        if (toP.x == this.x && toP.y == this.y)
            return;
        if (ClientWorld.data.moveToGridCenter && this.isMoving) {
            return;
        }
        var moveDir4 = forceDir4 ? true : WorldData.moveDir4;
        this.clearRetryAutoFindRoadMove();
        if (this.through && !moveDir4) {
            realLineArr = [[toP.x, toP.y]];
        }
        else {
            if (ifObstacleHandleMode != 2) {
                if (currentScene.sceneUtils.isObstacle(toP, this)) {
                    if (ifObstacleHandleMode == 0) {
                        if (whenCantMoveRetry)
                            this.retryAutoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle);
                        return;
                    }
                    var gridP = GameUtils.getGridPostion(toP);
                    var myGridP = GameUtils.getGridPostion(new Point(this.x, this.y));
                    gridP = SceneUtils.getNearThroughGrid(gridP, myGridP);
                    if (!gridP) {
                        if (whenCantMoveRetry)
                            this.retryAutoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle);
                        return;
                    }
                    gridP.x *= Config.SCENE_GRID_SIZE;
                    gridP.y *= Config.SCENE_GRID_SIZE;
                    toP = GameUtils.getGridCenter(gridP, toP);
                }
            }
            if (useAstar && (SceneUtils.twoPointHasObstacle(this.x, this.y, toP.x, toP.y, Game.currentScene, this, ifObstacleHandleMode == 2) || moveDir4)) {
                realLineArr = AstarUtils.moveTo(this.x, this.y, toP.x, toP.y, Game.currentScene.gridWidth, Game.currentScene.gridHeight, Game.currentScene, moveDir4, ifObstacleHandleMode == 2);
                if (!realLineArr) {
                    if (whenCantMoveRetry) {
                        this.retryAutoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle);
                    }
                    return;
                }
            }
            else {
                realLineArr = [[toP.x, toP.y]];
            }
        }
        if (whenCantMoveRetry) {
            this.off(ProjectClientSceneObject.COLLISION, this, this.retryAutoFindRoadMove);
            this.once(ProjectClientSceneObject.COLLISION, this, this.retryAutoFindRoadMove, [toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle]);
        }
        this.doStartMove(realLineArr, costTime, useGridObstacle, fromAutoRetry);
    };
    ProjectClientSceneObject.prototype.startMove = function (movePath, costTime, useGridObstacle, onMoveOver) {
        if (costTime === void 0) { costTime = 0; }
        if (useGridObstacle === void 0) { useGridObstacle = false; }
        if (onMoveOver === void 0) { onMoveOver = null; }
        if (this.isJumping)
            return;
        this.onMoveOver = onMoveOver;
        this.clearRetryAutoFindRoadMove();
        this.doStartMove.apply(this, arguments);
    };
    ProjectClientSceneObject.prototype.stopMove = function (force) {
        if (force === void 0) { force = false; }
        this.stopSendNextMoveStartEvent = false;
        this.stopSendNextMoveOverEvent = false;
        if (!Config.BEHAVIOR_EDIT_MODE && !force && WorldData.moveToGridCenter && this.isMoving) {
            var currentRoad = this.roadsArr[this.nowRoad + 1];
            var newToP = new Point;
            var offsetX = Math.abs(currentRoad.x - this.x);
            var offsetY = Math.abs(currentRoad.y - this.y);
            if (offsetX == 0 && offsetX == offsetY) {
                this.isMoving = false;
                this.clearRetryAutoFindRoadMove();
                return;
            }
            else if (offsetY > offsetX) {
                newToP.x = this.x;
                var trend = (currentRoad.y - this.y);
                var currentGridY = Math.floor(this.y / Config.SCENE_GRID_SIZE);
                var currentGridCenterY = currentGridY * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
                if (trend < 0) {
                    if (this.y > currentGridCenterY) {
                        newToP.y = currentGridCenterY;
                    }
                    else {
                        newToP.y = currentGridCenterY - Config.SCENE_GRID_SIZE;
                    }
                }
                else {
                    if (this.y < currentGridCenterY) {
                        newToP.y = currentGridCenterY;
                    }
                    else {
                        newToP.y = currentGridCenterY + Config.SCENE_GRID_SIZE;
                    }
                }
            }
            else {
                newToP.y = this.y;
                var trend = (currentRoad.x - this.x) / (Math.abs(currentRoad.x - this.x));
                var currentGridX = Math.floor(this.x / Config.SCENE_GRID_SIZE);
                var currentGridCenterX = currentGridX * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
                if (trend < 0) {
                    if (this.x > currentGridCenterX) {
                        newToP.x = currentGridCenterX;
                    }
                    else {
                        newToP.x = currentGridCenterX - Config.SCENE_GRID_SIZE;
                    }
                }
                else {
                    if (this.x < currentGridCenterX) {
                        newToP.x = currentGridCenterX;
                    }
                    else {
                        newToP.x = currentGridCenterX + Config.SCENE_GRID_SIZE;
                    }
                }
            }
            if (Game.currentScene.sceneUtils.isObstacle(newToP, this)) {
                this.isMoving = false;
                this.clearRetryAutoFindRoadMove();
                var thisGrid = GameUtils.getGridCenterByGrid(this.posGrid);
                this.setTo(thisGrid.x, thisGrid.y);
                return;
            }
            this.updateCoordinate(Game.now);
            this.isMoving = false;
            this.clearRetryAutoFindRoadMove();
            this.stopSendNextMoveStartEvent = true;
            this.stopSendNextMoveOverEvent = true;
            this.startMove([[newToP.x, newToP.y]], 0, false, null);
        }
        else {
            this.isMoving = false;
            this.clearRetryAutoFindRoadMove();
        }
    };
    ProjectClientSceneObject.prototype.jumpTo = function (x, y, costFrame) {
        var _this_1 = this;
        if (costFrame === void 0) { costFrame = 0; }
        if (this.isJumping)
            return;
        this.isMoving = false;
        this.isJumping = true;
        this.jumpToPoint = new Point(x, y);
        this.event(ProjectClientSceneObject.JUMP_START);
        var oldX = this.x;
        var oldY = this.y;
        var toJumpUpY = -ClientWorld.data.jumpHeight;
        var toJumpDownY = 0;
        var oldJumpY = this.jumpY;
        this.currentJumpFrame = costFrame;
        if (!this.fixOri) {
            if (this.x != x || this.y != y) {
                var dir = GameUtils.getOriByAngle(MathUtils.direction360(this.x, this.y, x, y));
                this.avatarOri = dir;
            }
        }
        var frameTotal = Math.ceil(ClientWorld.data.jumpTimeCost * 1000 / Game.oneFrame);
        var frameHalf = frameTotal / 2;
        os.add_ENTERFRAME(function () {
            if (_this_1.isDisposed) {
                os.remove_ENTERFRAME(arguments.callee, _this_1);
                return;
            }
            if (Game.pause)
                return;
            _this_1.currentJumpFrame++;
            if (_this_1.currentJumpFrame > frameTotal) {
                os.remove_ENTERFRAME(arguments.callee, _this_1);
                _this_1.isJumping = false;
                if (_this_1.inScene) {
                    _this_1.refreshCoordinate();
                    _this_1.event(ProjectClientSceneObject.JUMP_OVER);
                }
                return;
            }
            var per1 = _this_1.currentJumpFrame / frameTotal;
            var func1 = Ease.linearNone;
            _this_1.x = func1(per1, oldX, x - oldX, 1);
            _this_1.y = func1(per1, oldY, y - oldY, 1);
            if (_this_1.currentJumpFrame <= frameHalf) {
                var per2 = _this_1.currentJumpFrame / frameHalf;
                var func2 = Ease.quintOut;
                var toJumpY = toJumpUpY;
            }
            else {
                per2 = (_this_1.currentJumpFrame - frameHalf) / frameHalf;
                func2 = Ease.quintIn;
                toJumpY = toJumpDownY;
                oldJumpY = toJumpUpY;
            }
            var jumpY = func2(per2, oldJumpY, toJumpY - oldJumpY, 1);
            _this_1.jumpY = jumpY;
        }, this);
    };
    ProjectClientSceneObject.prototype.getRecordMoveState = function () {
        if (!this._isMoving)
            return null;
        return {
            useGridObstacle: this.useGridObstacle,
            roadsArr: ObjectUtils.depthClone(this.roadsArr),
            roadMax: this.roadMax,
            nowRoad: this.nowRoad,
            nowRoadStartDate: this.nowRoadStartDate,
            nowRoadTime: this.nowRoadTime,
            thisRoadS: this.thisRoadS,
            recordNow: Game.now,
            moveSpeed: this.moveSpeed
        };
    };
    ProjectClientSceneObject.prototype.restoryMove = function (recordMoveStateInfo, force) {
        if (force === void 0) { force = false; }
        if (!recordMoveStateInfo)
            return;
        if (force || !this._isMoving) {
            this.useGridObstacle = recordMoveStateInfo.useGridObstacle;
            this.roadsArr = recordMoveStateInfo.roadsArr;
            this.nowRoad = recordMoveStateInfo.nowRoad;
            this.nowRoadStartDate = recordMoveStateInfo.nowRoadStartDate + (Game.now - recordMoveStateInfo.recordNow);
            this.nowRoadTime = recordMoveStateInfo.nowRoadTime;
            this.thisRoadS = recordMoveStateInfo.thisRoadS;
            if (this.moveSpeed != recordMoveStateInfo.moveSpeed) {
                var t = Game.now - this.nowRoadStartDate;
                var s = t * recordMoveStateInfo.moveSpeed;
                var roadArr = [];
                for (var i = this.nowRoad + 1; i < this.roadsArr.length; i++) {
                    var p = this.roadsArr[i];
                    roadArr.push([p.x, p.y]);
                }
                this.startMove(roadArr, 0, this.useGridObstacle);
            }
            else {
                for (var rs in this.roadsArr) {
                    var pointClone = this.roadsArr[rs];
                    this.roadsArr[rs] = new Point(pointClone.x, pointClone.y);
                }
                this.changeMoveAction(true);
                this._isMoving = true;
            }
        }
    };
    ProjectClientSceneObject.prototype.refreshCoordinate = function (alreadySetTempPosHelper, alreadySetRect, clacTouchEvent) {
        if (alreadySetTempPosHelper === void 0) { alreadySetTempPosHelper = false; }
        if (alreadySetRect === void 0) { alreadySetRect = false; }
        if (clacTouchEvent === void 0) { clacTouchEvent = true; }
        if (!this.inScene)
            return;
        var scene = this.scene;
        if (!scene || scene.isDisposed)
            return;
        if (scene.camera.sceneObject == this) {
            scene.updateCamera();
        }
        this.updateShadow();
        this.pos.x = this.x;
        this.pos.y = this.y;
        if (!alreadySetTempPosHelper)
            GameUtils.getGridPostion(this.pos, this.tempGridPosHelper);
        if (!alreadySetRect) {
            this.posRect.x = this.x;
            this.posRect.y = this.y;
            this.posRect.width = this.posRect.height = WorldData.sceneObjectCollisionSize - 1;
        }
        if (this.posGrid.x != this.tempGridPosHelper.x || this.posGrid.y != this.tempGridPosHelper.y) {
            this.posGrid.x = this.tempGridPosHelper.x;
            this.posGrid.y = this.tempGridPosHelper.y;
            scene.sceneUtils.updateDynamicObsAndBridge(this, true, this.posGrid);
            this.root.alpha = scene.sceneUtils.isMaskGrid(this.posGrid) ? 0.5 : 1;
        }
        if (clacTouchEvent) {
            var touchRes = scene.sceneUtils.touchCheck(this, false, this.pos, this.tempGridPosHelper, this.pos, this.tempGridPosHelper);
            this.touchEventHandle(touchRes);
        }
    };
    Object.defineProperty(ProjectClientSceneObject.prototype, "isEventStartWait", {
        get: function () {
            return this.eventStartWaitInfo ? true : false;
        },
        enumerable: false,
        configurable: true
    });
    ProjectClientSceneObject.prototype.eventStartWait = function (trigger, faceToTrigger) {
        if (faceToTrigger === void 0) { faceToTrigger = true; }
        if (this.eventStartWaitInfo)
            return false;
        if (this.fixOri)
            faceToTrigger = false;
        this.eventStartWaitInfo = {
            faceToTrigger: faceToTrigger,
            oldOri: this.avatar.orientation,
            moveState: this.getRecordMoveState()
        };
        this.lockBehaviorLayer = this.getBehaviorLayer();
        if (this.isMoving)
            this.stopMove(true);
        if (faceToTrigger) {
            this.addBehavior([[25, 1]], false, trigger, null, false);
            this.once(ProjectClientSceneObject.CHANGE_ORI, this, this.onExecuteWaitEventChangeOri);
            this.once(ProjectClientSceneObject.MOVE_START, this, this.onExecuteWaitEventNewMove);
        }
        return true;
    };
    ProjectClientSceneObject.prototype.eventCompleteContinue = function () {
        if (!this.eventStartWaitInfo)
            return false;
        this.off(ProjectClientSceneObject.CHANGE_ORI, this, this.onExecuteWaitEventChangeOri);
        this.off(ProjectClientSceneObject.MOVE_START, this, this.onExecuteWaitEventNewMove);
        this.lockBehaviorLayer = 0;
        if (this.eventStartWaitInfo.faceToTrigger)
            this.avatarOri = this.eventStartWaitInfo.oldOri;
        this.restoryMove(this.eventStartWaitInfo.moveState, true);
        this.eventStartWaitInfo = null;
        return true;
    };
    ProjectClientSceneObject.prototype.clearMyTouchRecord = function (targetSo) {
        if (targetSo === void 0) { targetSo = null; }
        if (targetSo) {
            ArrayUtils.remove(this.myLastTouchObjects, targetSo);
        }
        else {
            this.myLastTouchObjects.length = 0;
        }
    };
    ProjectClientSceneObject.prototype.clearTouchMeRecord = function () {
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var targetSo = Game.currentScene.sceneObjects[i];
            if (targetSo instanceof ProjectClientSceneObject)
                targetSo.clearMyTouchRecord(this);
        }
    };
    Object.defineProperty(ProjectClientSceneObject.prototype, "touchEnabled", {
        get: function () {
            return this.inScene && this.scene.sceneObjects[this.index] == this && !this.isJumping;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProjectClientSceneObject.prototype, "lastTouchObjects", {
        get: function () {
            return this.myLastTouchObjects;
        },
        enumerable: false,
        configurable: true
    });
    ProjectClientSceneObject.prototype.isInMyTouchList = function (targetSo) {
        return this.myLastTouchObjects.indexOf(targetSo) != -1;
    };
    ProjectClientSceneObject.prototype.doStartMove = function (movePath, costTime, useGridObstacle, fromAutoRetry) {
        if (costTime === void 0) { costTime = 0; }
        if (useGridObstacle === void 0) { useGridObstacle = false; }
        if (fromAutoRetry === void 0) { fromAutoRetry = false; }
        var roadsArr = [new Point(this.x, this.y)];
        for (var i in movePath) {
            roadsArr.push(new Point(movePath[i][0], movePath[i][1]));
        }
        var lastPoint = roadsArr[roadsArr.length - 1];
        if (roadsArr.length == 2 && lastPoint.x == this.x && lastPoint.y == this.y) {
            return;
        }
        this.useGridObstacle = useGridObstacle;
        var now = Game.now;
        if (this._isMoving)
            this.updateCoordinate(now);
        this.roadMax = roadsArr.length;
        if (movePath && this.roadMax > 1) {
            this.nowRoadStartDate = now;
            this.nowRoadStartDate -= costTime;
            this.roadsArr = roadsArr;
            this.isMoving = true;
            if (!this.stopSendNextMoveStartEvent) {
                this.event(ProjectClientSceneObject.MOVE_START, [fromAutoRetry]);
            }
            this.stopSendNextMoveStartEvent = false;
        }
    };
    Object.defineProperty(ProjectClientSceneObject.prototype, "isMoving", {
        get: function () { return this._isMoving; },
        set: function (isMove) {
            if (isMove) {
                this.changeMoveAction(true);
                this.nowRoad = 0;
                this.nowRoadTime = 0;
                this._isMoving = isMove;
                var now = Game.now;
                this.updateCoordinate(now);
            }
            else {
                this.changeMoveAction(false);
                this._isMoving = false;
            }
        },
        enumerable: false,
        configurable: true
    });
    ProjectClientSceneObject.prototype.changeMoveAction = function (isMove) {
        if (this.isDead)
            return;
        if (isMove) {
            if (this.moveAutoChangeAction) {
                var moveAct = WorldData.sceneObjectMoveStartAct;
                if (WorldData.useSceneObjectMoveStartAct2 && this.moveSpeed >= WorldData.sceneObjectMoveStartAct2Speed &&
                    ArrayUtils.matchAttributes(this.avatar.actionList, { id: WorldData.sceneObjectMoveStartAct2 }, true)) {
                    moveAct = WorldData.sceneObjectMoveStartAct2;
                }
                this.avatarAct = moveAct;
            }
        }
        else {
            if (this.moveAutoChangeAction) {
                this.avatarAct = 1;
            }
        }
    };
    ProjectClientSceneObject.prototype.updateCoordinate = function (_nowTime) {
        var per;
        var isChangeDir = false;
        var isMoveOver = false;
        var thisRoadP = this.roadsArr[this.nowRoad];
        var nextRoadP = this.roadsArr[this.nowRoad + 1];
        if (thisRoadP.x == nextRoadP.x && thisRoadP.y == nextRoadP.y) {
            this.nowRoad++;
            this.updateCoordinate(_nowTime);
            return;
        }
        if (this.nowRoadTime == 0) {
            var thisRoadS = this.thisRoadS = thisRoadP.distance(nextRoadP.x, nextRoadP.y);
            this.nowRoadTime = thisRoadS * 1000 / this.moveSpeed;
            isChangeDir = true;
        }
        var nowRoadEndDate = this.nowRoadStartDate + this.nowRoadTime;
        if (_nowTime > nowRoadEndDate) {
            this.nowRoad++;
            if (this.nowRoad < this.roadMax - 1) {
                this.nowRoadStartDate += this.nowRoadTime;
                this.nowRoadTime = 0;
                this.updateCoordinate(_nowTime);
                return;
            }
            else {
                per = 1;
                this.isMoving = false;
                isMoveOver = true;
            }
        }
        else {
            per = (_nowTime - this.nowRoadStartDate) / this.nowRoadTime;
        }
        if (isChangeDir && !this.fixOri) {
            var dir = GameUtils.getOriByAngle(MathUtils.direction360(this.x, this.y, nextRoadP.x, nextRoadP.y));
            this.avatarOri = dir;
        }
        var nowP = Point.interpolate(nextRoadP, thisRoadP, per);
        var isMoved = this.x != nowP.x || this.y != nowP.y;
        var trendP = new Point(nowP.x, nowP.y);
        var dx = nextRoadP.x - thisRoadP.x;
        var dy = nextRoadP.y - thisRoadP.y;
        var absDx = Math.abs(dx);
        var absDy = Math.abs(dy);
        if (absDx > absDy) {
            trendP.x += dx < 0 ? -1 : 1;
            trendP.y += (nextRoadP.y - thisRoadP.y) * 1 / absDx;
        }
        else {
            trendP.x += (nextRoadP.x - thisRoadP.x) * 1 / absDy;
            trendP.y += dy < 0 ? -1 : 1;
        }
        GameUtils.getGridPostion(nowP, this.tempGridPosHelper);
        if (!this.useGridObstacle) {
            var lastRectX = this.posRect.x;
            var lastRectY = this.posRect.y;
        }
        var touchRes = this.scene.sceneUtils.touchCheck(this, this.useGridObstacle, nowP, this.tempGridPosHelper, trendP, null);
        if (touchRes.isObstacle) {
            if (touchRes.alreadyCalcPosRect) {
                this.posRect.x = lastRectX;
                this.posRect.y = lastRectY;
            }
            if (this.ignoreCantMove) {
                if (this.keepMoveActWhenCollsionObstacleAndIgnoreCantMove) {
                    this._isMoving = false;
                }
                else {
                    this.isMoving = false;
                }
            }
            else {
                this.nowRoadStartDate += Game.oneFrame;
            }
            if (isMoved) {
                var myLastX = this.x;
                var myLastY = this.y;
                var hasTouchEvent = this.touchEventHandle(touchRes);
                if (hasTouchEvent && myLastX == this.x && myLastY == this.y && this._isMoving) {
                    var touchResAgain = this.scene.sceneUtils.touchCheck(this, this.useGridObstacle, nowP, this.tempGridPosHelper, trendP, null);
                    if (!touchResAgain.isObstacle) {
                        this.setTo(nowP.x, nowP.y, false, true, true, touchRes.alreadyCalcPosRect, false);
                    }
                }
            }
            this.event(ProjectClientSceneObject.COLLISION, [touchRes]);
        }
        else {
            this.setTo(nowP.x, nowP.y, false, true, true, touchRes.alreadyCalcPosRect, false);
            if (isMoved)
                this.touchEventHandle(touchRes);
        }
        if (isMoveOver) {
            if (this.onMoveOver)
                this.onMoveOver.run();
            if (!this.stopSendNextMoveOverEvent) {
                this.event(ProjectClientSceneObject.MOVE_OVER);
            }
            this.stopSendNextMoveOverEvent = false;
        }
    };
    Object.defineProperty(ProjectClientSceneObject.prototype, "jumpY", {
        get: function () {
            return this.avatar ? this.avatar.y : 0;
        },
        set: function (v) {
            if (this.isDisposed)
                return;
            this.avatar.y = v;
        },
        enumerable: false,
        configurable: true
    });
    ProjectClientSceneObject.prototype.touchEventHandle = function (touchRes) {
        if (this.isFromRecorySaveData && this.fromRecorySaveDataGameFrame == __fCount)
            return false;
        var hasTouchEvent = false;
        for (var t in touchRes.touchSceneObjects) {
            var targetSo = touchRes.touchSceneObjects[t];
            if (!targetSo || targetSo == this)
                continue;
            var canExecuteTargetTouchEvent = true;
            if (!targetSo.repeatedTouchEnabled) {
                var index = this.myLastTouchObjects.indexOf(targetSo);
                if (index != -1) {
                    canExecuteTargetTouchEvent = false;
                }
            }
            if (canExecuteTargetTouchEvent) {
                var hasTouchTargetEvent = Controller.startSceneObjectTouchEvent(this, targetSo);
                if (hasTouchTargetEvent)
                    hasTouchEvent = true;
            }
            var canExecuteMyTouchEvent = true;
            if (!this.repeatedTouchEnabled) {
                var index = targetSo.myLastTouchObjects.indexOf(this);
                if (index != -1) {
                    canExecuteMyTouchEvent = false;
                }
            }
            if (canExecuteMyTouchEvent) {
                var hasTouchMyEvent = Controller.startSceneObjectTouchEvent(targetSo, this);
                if (hasTouchMyEvent)
                    hasTouchEvent = true;
            }
            if (targetSo.myLastTouchObjects.indexOf(this) == -1) {
                targetSo.myLastTouchObjects.push(this);
            }
        }
        var subtractList = ArrayUtils.compare(touchRes.touchSceneObjects, this.myLastTouchObjects).subtract;
        for (var i = 0; i < subtractList.length; i++) {
            var subtractSo = subtractList[i];
            if (subtractSo != this) {
                if (subtractSo.isInMyTouchList(this)) {
                    subtractSo.clearMyTouchRecord(this);
                    var hasTouchTargetOutEvent = Controller.startSceneObjectTouchOutEvent(this, subtractSo);
                    if (hasTouchTargetOutEvent)
                        hasTouchEvent = true;
                }
                var hasTouchMyOutEvent = Controller.startSceneObjectTouchOutEvent(subtractSo, this);
                if (hasTouchMyOutEvent)
                    hasTouchEvent = true;
            }
        }
        this.myLastTouchObjects = touchRes.touchSceneObjects;
        return hasTouchEvent;
    };
    ProjectClientSceneObject.prototype.parallelEventUpdate = function () {
        if (Config.BEHAVIOR_EDIT_MODE)
            return;
        if (!this.inScene || GameGate.gateState < GameGate.STATE_4_PLAYER_CONTROL_START)
            return;
        var updateCmdPage = this.customCommandPages[2];
        if (updateCmdPage && updateCmdPage.commands.length != 0) {
            var updateTrigger = this.getCommandTrigger(1, 2, Game.currentScene, this);
            if (updateTrigger) {
                updateCmdPage.startTriggerEvent(updateTrigger);
            }
        }
    };
    ProjectClientSceneObject.prototype.appearEventHandle = function () {
        GameCommand.startCommonCommand(14015, [], null, this, this);
        if (this.hasCommand[3]) {
            GameCommand.startSceneObjectCommand(this.index, 3, null, null, this);
        }
    };
    ProjectClientSceneObject.prototype.init = function () {
        var _this_1 = this;
        this.refreshCoordinate(false, false, false);
        EventUtils.addEventListener(this, SceneObjectEntity.EVENT_CHANGE_STATUS_PAGE_FOR_INSTANCE, Callback.New(this.onStausPageChange, this, [false]));
        EventUtils.addEventListener(Game, Game.EVENT_PAUSE_CHANGE, Callback.New(this.onGamePauseChangeHandle, this));
        if (this.inScene && this.scene && this.scene.sceneObjects[this.index] == this) {
            this.onStausPageChange(true);
        }
        else {
            this.once(EventObject.ADDED, this, function () {
                _this_1.onStausPageChange(true);
            });
        }
    };
    ProjectClientSceneObject.prototype.onStausPageChange = function (isFirst) {
        var _this_1 = this;
        if (!this.inScene)
            return;
        this.eventCompleteContinue();
        if (Game.pause) {
            EventUtils.addEventListener(Game, Game.EVENT_PAUSE_CHANGE, Callback.New(this.onStausPageChange, this, []), true);
            return;
        }
        if (!this.isFromRecorySaveData) {
            if (!isFirst) {
                this.clearMyTouchRecord();
                this.clearTouchMeRecord();
            }
            this.startDefBehavior();
            Callback.CallLaterBeforeRender(this.appearEventHandle, this);
            if (!isFirst) {
                Callback.CallLaterBeforeRender(this.refreshCoordinate, this);
            }
        }
        else {
            this.fromRecorySaveDataGameFrame = __fCount;
            Callback.CallLaterBeforeRender(function () { _this_1.isFromRecorySaveData = false; }, this);
            this.onGamePauseChangeHandle();
        }
        this.battlerInit(true, !this.isFromRecorySaveData);
    };
    ProjectClientSceneObject.prototype.startDefBehavior = function () {
        this.stopBehavior();
        this.clearBehaviors();
        var beData = SceneObjectBehaviors.toBehaviorData(this.defBehavior);
        if (beData.behaviorData.length > 0) {
            this.addBehavior(beData.behaviorData, beData.loop, this, null, beData.cover, 0, false, beData.forceStopLastBehavior, 0, this);
        }
    };
    ProjectClientSceneObject.prototype.updateBehavior = function () {
        if (Config.BEHAVIOR_EDIT_MODE)
            return;
        if (Game.pause)
            return;
        if (!this.inScene || GameGate.gateState < GameGate.STATE_3_IN_SCENE_COMPLETE || Game.currentScene.sceneObjects[this.index] != this)
            return;
        if (this.behaviors.length > 0) {
            var layer = this.behaviors.length - 1;
            if (layer < this.lockBehaviorLayer)
                return;
            var newestBehavior = this.behaviors[this.behaviors.length - 1];
            newestBehavior.update();
        }
    };
    ProjectClientSceneObject.prototype.retryAutoFindRoadMove = function (toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle, touchRes) {
        var _this_1 = this;
        if (ifObstacleHandleMode === void 0) { ifObstacleHandleMode = 0; }
        if (costTime === void 0) { costTime = 0; }
        if (useAstar === void 0) { useAstar = true; }
        if (whenCantMoveRetry === void 0) { whenCantMoveRetry = false; }
        if (useGridObstacle === void 0) { useGridObstacle = true; }
        if (touchRes === void 0) { touchRes = null; }
        if (touchRes && !touchRes.isObstacle)
            return;
        this.clearRetryAutoFindRoadMove(false);
        this.needRetryAutoFindRoadMoveSign = setFrameout(function () {
            if (_this_1.isDisposed || !_this_1.inScene)
                return;
            _this_1.autoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle, false, true);
        }, 16);
    };
    ProjectClientSceneObject.prototype.clearRetryAutoFindRoadMove = function (offCollisionEvent) {
        if (offCollisionEvent === void 0) { offCollisionEvent = true; }
        if (Game.player.sceneObject == this)
            this.off(ProjectClientSceneObject.COLLISION, this, this.retryAutoFindRoadMove);
        if (this.needRetryAutoFindRoadMoveSign)
            clearFrameout(this.needRetryAutoFindRoadMoveSign);
        this.needRetryAutoFindRoadMoveSign = null;
    };
    ProjectClientSceneObject.prototype.onSystemCommandStart = function (mode) {
        if (this == Game.player.sceneObject)
            this.stopMove();
    };
    ProjectClientSceneObject.prototype.onExecuteWaitEventChangeOri = function () {
        if (this.eventStartWaitInfo)
            this.eventStartWaitInfo.faceToTrigger = false;
    };
    ProjectClientSceneObject.prototype.onExecuteWaitEventNewMove = function () {
        if (this.eventStartWaitInfo) {
            this.eventStartWaitInfo.moveState = null;
        }
    };
    ProjectClientSceneObject.prototype.onGamePauseChangeHandle = function () {
        for (var i in this.triggerLines) {
            var trigger = this.triggerLines[i];
            if (trigger && trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE_OBJECT)
                trigger.delayPause = Game.pause;
        }
    };
    ProjectClientSceneObject.prototype.updateBattlerData = function () {
        if (this.isBattler) {
            for (var i = 0; i < this.actor.status.length; i++) {
                var status = this.actor.status[i];
            }
        }
    };
    ProjectClientSceneObject.CHANGE_ORI = "so_1CHANGE_ORI";
    ProjectClientSceneObject.MOVE_START = "so_1MOVE_START";
    ProjectClientSceneObject.MOVE_OVER = "so_1MOVE_OVER";
    ProjectClientSceneObject.JUMP_START = "so_1JUMP_START";
    ProjectClientSceneObject.JUMP_OVER = "so_1JUMP_OVER";
    ProjectClientSceneObject.COLLISION = "so_1COLLISION";
    ProjectClientSceneObject.mustActionCompleteTask = "mustActionCompleteTask";
    return ProjectClientSceneObject;
}(SceneObjectCommon));
ObjectUtils.reDefineGetSet("ProjectClientSceneObject.prototype", {
    avatarOri: function (v) {
        if (this.avatar) {
            if (this.avatar.orientation != v)
                this.avatar.orientation = v;
            this.event(ProjectClientSceneObject.CHANGE_ORI);
        }
    }
});
//# sourceMappingURL=ProjectClientSceneObject.js.map