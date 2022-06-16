














var ProjectSceneObjectBehaviors = (function (_super) {
    __extends(ProjectSceneObjectBehaviors, _super);
    function ProjectSceneObjectBehaviors(so, loop, targetSceneObject, onOver, startIndex, executor) {
        if (startIndex === void 0) { startIndex = 0; }
        if (executor === void 0) { executor = null; }
        var _this_1 = _super.call(this, so, loop, targetSceneObject, onOver, startIndex, executor) || this;
        if (Config.BEHAVIOR_EDIT_MODE) {
            var soModule_shadow = _this_1.so.getModule(1);
            if (soModule_shadow)
                _this_1.soModule_shadow_default = [soModule_shadow.shadowWidth, soModule_shadow.shadowHeight, soModule_shadow.shadowAlpha];
        }
        return _this_1;
    }
    Object.defineProperty(ProjectSceneObjectBehaviors.prototype, "logicPause", {
        get: function () {
            return (this.executeCommandPageFragment || this.so.isMoving || this.so.isJumping || this.isWaitingActionOver) ? true : false;
        },
        enumerable: false,
        configurable: true
    });
    ProjectSceneObjectBehaviors.prototype.reset = function (defSceneObejct) {
        if (this.soModule_shadow_default) {
            this.so.addModuleByID(1);
            var soModuleShadow = this.so.getModule(1);
            soModuleShadow.shadowWidth = this.soModule_shadow_default[0];
            soModuleShadow.shadowHeight = this.soModule_shadow_default[1];
            soModuleShadow.shadowAlpha = this.soModule_shadow_default[2];
        }
        else {
            this.so.removeModuleByID(1);
        }
        this.so.stopMove();
        this.so.stopAllAnimation();
        ObjectUtils.clone(defSceneObejct, this.so);
        this.so.scene.camera.sceneObject = this.so;
        this.so.scene.updateCamera();
        this.so.refreshCoordinate();
    };
    ProjectSceneObjectBehaviors.prototype.behavior0 = function (avatarID, actID, frame, ori) {
        if (ori === void 0) { ori = null; }
        this.so.avatarID = avatarID;
        this.so.avatarAct = actID;
        this.so.avatarFrame = frame;
        this.so.avatarOri = ori;
    };
    ProjectSceneObjectBehaviors.prototype.behavior1 = function () {
        this.behaviorMoveD(0, 1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior2 = function () {
        this.behaviorMoveD(-1, 0);
    };
    ProjectSceneObjectBehaviors.prototype.behavior3 = function () {
        this.behaviorMoveD(0, -1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior4 = function () {
        this.behaviorMoveD(1, 0);
    };
    ProjectSceneObjectBehaviors.prototype.behavior5 = function () {
        this.behaviorMoveD(-1, 1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior6 = function () {
        this.behaviorMoveD(1, 1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior7 = function () {
        this.behaviorMoveD(-1, -1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior8 = function () {
        this.behaviorMoveD(1, -1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior9 = function () {
        var arr = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        if (!WorldData.moveDir4 && !this.so.behaviorDir4) {
            arr.push([-1, -1], [1, 1], [1, -1], [-1, 1]);
        }
        var dp = arr[MathUtils.rand(arr.length)];
        var currentIgnoreCantMove = this.so.ignoreCantMove;
        this.so.ignoreCantMove = true;
        if (!currentIgnoreCantMove) {
            this.behaviors.splice(this.index, 0, [this.behavior37, [1, true, this.so.keepMoveActWhenCollsionObstacleAndIgnoreCantMove]]);
        }
        this.behaviorMoveD(dp[0], dp[1], true, true);
    };
    ProjectSceneObjectBehaviors.prototype.behavior10 = function (type, useVar, varID, soIndex, flip) {
        if (flip === void 0) { flip = 1; }
        if (Config.BEHAVIOR_EDIT_MODE)
            return;
        var targetSceneObject;
        if (type == 0)
            targetSceneObject = Game.player.sceneObject;
        else if (type == 1)
            targetSceneObject = this.targetSceneObject;
        else if (type == 2)
            targetSceneObject = this.executor;
        else {
            if (useVar == 1) {
                soIndex = Game.player.variable.getVariable(varID);
            }
            if (soIndex < 0)
                return;
            targetSceneObject = this.so.scene.sceneObjects[soIndex];
        }
        if (targetSceneObject && this.so != targetSceneObject) {
            var px = targetSceneObject.x - this.so.x;
            var py = targetSceneObject.y - this.so.y;
            if (Math.abs(px) < Config.SCENE_GRID_SIZE / 2)
                px = 0;
            if (Math.abs(py) < Config.SCENE_GRID_SIZE / 2)
                py = 0;
            var dx = px < 0 ? -1 : px == 0 ? 0 : 1;
            var dy = py < 0 ? -1 : py == 0 ? 0 : 1;
            if (ClientWorld.data.moveDir4 || this.so.behaviorDir4) {
                if (Math.abs(dx) == 1 && Math.abs(dy) == 1) {
                    px > py ? dy = 0 : dx = 0;
                }
            }
            this.behaviorMoveD(dx * flip, dy * flip);
        }
    };
    ProjectSceneObjectBehaviors.prototype.behavior11 = function (type, useVar, varID, soIndex) {
        this.behavior10(type, useVar, varID, soIndex, -1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior12 = function (useVar, x, y, autoFindRoad, xVarID, yVarID, useGrid, relative, whenCantMoveRetry, ifObstacleHandleMode, moveToGridCenter, mode) {
        if (useVar == 1) {
            x = Game.player.variable.getVariable(xVarID);
            y = Game.player.variable.getVariable(yVarID);
            if (Config.BEHAVIOR_EDIT_MODE)
                return;
        }
        if (relative) {
            if (!useGrid) {
                x += this.so.x;
                y += this.so.y;
            }
            else {
                if (!moveToGridCenter) {
                    x += this.so.x / Config.SCENE_GRID_SIZE;
                    y += this.so.y / Config.SCENE_GRID_SIZE;
                }
                else {
                    x += this.so.posGrid.x;
                    y += this.so.posGrid.y;
                }
            }
        }
        var toP = useGrid ? ((moveToGridCenter || !relative || !useGrid) ? GameUtils.getGridCenter(new Point(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE)) : new Point(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE)) : new Point(x, y);
        if (this.so.scene.sceneUtils.isOutside(toP)) {
            return;
        }
        if (this.ignoreProcess) {
            this.so.x = toP.x;
            this.so.y = toP.y;
        }
        else {
            if (mode == null) {
                if (autoFindRoad) {
                    this.so.autoFindRoadMove(toP.x, toP.y, ifObstacleHandleMode, 0, true, whenCantMoveRetry, true, this.so.behaviorDir4);
                }
                else {
                    this.so.startMove([[toP.x, toP.y]], Game.oneFrame);
                }
            }
            else {
                if (ifObstacleHandleMode == 0 || ifObstacleHandleMode == 2) {
                    if (!this.so.through && this.so.scene.sceneUtils.isObstacle(toP, this.so)) {
                        if (ifObstacleHandleMode == 0)
                            this.index--;
                        return;
                    }
                }
                if (mode == 1)
                    this.so.jumpTo(toP.x, toP.y);
                else
                    this.so.setTo(toP.x, toP.y);
            }
        }
    };
    ProjectSceneObjectBehaviors.prototype.behavior13 = function (useVar, x, y, xVarID, yVarID, useGrid, relative, ifObstacleHandleMode, moveToGridCenter) {
        this.behavior12(useVar, x, y, false, xVarID, yVarID, useGrid, relative, false, ifObstacleHandleMode, moveToGridCenter, 1);
    };
    ProjectSceneObjectBehaviors.prototype.behavior14 = function (useVar, x, y, xVarID, yVarID, useGrid, relative, ifObstacleHandleMode, moveToGridCenter) {
        this.behavior12(useVar, x, y, false, xVarID, yVarID, useGrid, relative, false, ifObstacleHandleMode, moveToGridCenter, 2);
    };
    ProjectSceneObjectBehaviors.prototype.behavior15 = function (useVar, waitF, waitFVarID) {
        if (useVar) {
            waitF = Game.player.variable.getVariable(waitFVarID);
            if (Config.BEHAVIOR_EDIT_MODE)
                waitF = 30;
        }
        this.waitFrame(waitF);
    };
    ProjectSceneObjectBehaviors.prototype.behavior16 = function () {
        this.so.avatarOri = 2;
    };
    ProjectSceneObjectBehaviors.prototype.behavior17 = function () {
        this.so.avatarOri = 4;
    };
    ProjectSceneObjectBehaviors.prototype.behavior18 = function () {
        this.so.avatarOri = 8;
    };
    ProjectSceneObjectBehaviors.prototype.behavior19 = function () {
        this.so.avatarOri = 6;
    };
    ProjectSceneObjectBehaviors.prototype.behavior20 = function () {
        this.so.avatarOri = 1;
    };
    ProjectSceneObjectBehaviors.prototype.behavior21 = function () {
        this.so.avatarOri = 3;
    };
    ProjectSceneObjectBehaviors.prototype.behavior22 = function () {
        this.so.avatarOri = 7;
    };
    ProjectSceneObjectBehaviors.prototype.behavior23 = function () {
        this.so.avatarOri = 9;
    };
    ProjectSceneObjectBehaviors.prototype.behavior24 = function () {
        var arr = [2, 4, 6, 8];
        if (!WorldData.moveDir4 && !this.so.behaviorDir4) {
            arr.push(1, 3, 7, 9);
        }
        this.so.avatarOri = arr[MathUtils.rand(arr.length)];
    };
    ProjectSceneObjectBehaviors.prototype.behavior25 = function (type, useVar, soIndexVarID, soIndex, isFlip) {
        if (Config.BEHAVIOR_EDIT_MODE)
            return;
        var targetSceneObject;
        if (type == 0)
            targetSceneObject = Game.player.sceneObject;
        else if (type == 1)
            targetSceneObject = this.targetSceneObject;
        else if (type == 2)
            targetSceneObject = this.executor;
        else {
            if (useVar) {
                soIndex = Game.player.variable.getVariable(soIndexVarID);
            }
            if (soIndex < 0)
                return;
            targetSceneObject = this.so.scene.sceneObjects[soIndex];
        }
        if (!targetSceneObject)
            return;
        var angle = MathUtils.direction360(this.so.x, this.so.y, targetSceneObject.x, targetSceneObject.y);
        var ori = GameUtils.getOriByAngle(angle);
        this.so.avatarOri = isFlip ? GameUtils.getFlipOri(ori) : ori;
    };
    ProjectSceneObjectBehaviors.prototype.behavior26 = function (type, useVar, soIndexVarID, soIndex) {
        this.behavior25(type, useVar, soIndexVarID, soIndex, true);
    };
    ProjectSceneObjectBehaviors.prototype.behavior27 = function (oriVarID) {
        if (Config.BEHAVIOR_EDIT_MODE)
            return;
        var ori = Game.player.variable.getVariable(oriVarID);
        this.so.avatarOri = ori;
    };
    ProjectSceneObjectBehaviors.prototype.behavior28 = function (useVar, v, varID) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE)
                v = 1;
        }
        this.so.scale = v;
    };
    ProjectSceneObjectBehaviors.prototype.behavior29 = function (useVar, v, varID) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE)
                v = 200;
        }
        this.so.moveSpeed = v;
    };
    ProjectSceneObjectBehaviors.prototype.behavior30 = function (useVar, v, varID) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE)
                v = 1;
        }
        this.so.avatarAlpha = v;
    };
    ProjectSceneObjectBehaviors.prototype.behavior31 = function (useVar, v, varID) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE)
                v = 0;
        }
        this.so.avatarHue = v;
    };
    ProjectSceneObjectBehaviors.prototype.behavior32 = function (useVar, v, varID) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE)
                v = 12;
        }
        this.so.avatarFPS = v;
    };
    ProjectSceneObjectBehaviors.prototype.behavior33 = function (enabled, w, h, alpha) {
        if (enabled) {
            var soModule = this.so.getModule(1);
            if (!soModule)
                soModule = this.so.addModuleByID(1);
            if (soModule) {
                var soModule_shadow = soModule;
                soModule_shadow.shadowWidth = w;
                soModule_shadow.shadowHeight = h;
                soModule_shadow.shadowAlpha = alpha;
                soModule_shadow.refresh();
            }
        }
        else {
            this.so.removeModuleByID(1);
        }
    };
    ProjectSceneObjectBehaviors.prototype.behavior34 = function (aniID, showHitEffect, loop, fps, useVar, varID) {
        if (useVar) {
            aniID = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE)
                aniID = 0;
        }
        this.so.playAnimation(aniID, loop, showHitEffect ? true : false, fps);
    };
    ProjectSceneObjectBehaviors.prototype.behavior35 = function (useVar, aniID, varID) {
        if (useVar && !Config.BEHAVIOR_EDIT_MODE)
            aniID = Game.player.variable.getVariable(varID);
        this.so.stopAnimation(aniID);
    };
    ProjectSceneObjectBehaviors.prototype.behavior36 = function (url, varID, useVar) {
        if (this.ignoreProcess)
            return;
        var url = useVar == 1 ? Game.player.variable.getString(varID) : url;
        GameAudio.playSE(url, 1, 1, this.so);
    };
    ProjectSceneObjectBehaviors.prototype.behavior37 = function (v, keepMoveActWhenCollsionObstacleAndIgnoreCantMove, systemRecovery) {
        this.so.ignoreCantMove = v == 0 ? true : false;
        this.so.keepMoveActWhenCollsionObstacleAndIgnoreCantMove = keepMoveActWhenCollsionObstacleAndIgnoreCantMove;
        if (systemRecovery) {
            this.behaviors.splice(this.index - 1, 1);
            this.index--;
        }
    };
    ProjectSceneObjectBehaviors.prototype.behavior38 = function (v) {
        this.so.selectEnabled = v == 0 ? true : false;
    };
    ProjectSceneObjectBehaviors.prototype.behavior39 = function (v) {
        this.so.fixOri = v == 0 ? true : false;
    };
    ProjectSceneObjectBehaviors.prototype.behavior40 = function (v) {
        this.so.layerLevel = v;
    };
    ProjectSceneObjectBehaviors.prototype.behavior41 = function (v) {
        this.so.bridge = v == 0 ? true : false;
    };
    ProjectSceneObjectBehaviors.prototype.behavior42 = function (v) {
        this.so.autoPlayEnable = v == 0 ? true : false;
    };
    ProjectSceneObjectBehaviors.prototype.behavior43 = function (v) {
        this.so.moveAutoChangeAction = v == 0 ? true : false;
    };
    ProjectSceneObjectBehaviors.prototype.behavior44 = function (v) {
        this.so.through = v == 0 ? true : false;
    };
    ProjectSceneObjectBehaviors.prototype.behavior45 = function (v) {
        this.so.behaviorDir4 = v == 0 ? true : false;
    };
    ProjectSceneObjectBehaviors.prototype.behavior46 = function (useVar, avatarID, avatarIDVarID) {
        this.so.avatarID = useVar ? Game.player.variable.getVariable(avatarIDVarID) : avatarID;
    };
    ProjectSceneObjectBehaviors.prototype.behavior47 = function (useVar, actionID, actionIDVarID, once, waitOver) {
        var _this_1 = this;
        var actID = useVar ? Game.player.variable.getVariable(actionIDVarID) : actionID;
        if (once) {
            if (this.so.avatar.hasActionID(actID)) {
                if (waitOver) {
                    this.isWaitingActionOver = true;
                }
                this.so.avatar.currentFrame = this.so.avatar.currentFrame % this.so.avatar.totalFrame;
                this.so.avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, function () {
                    _this_1.so.avatarFrame = _this_1.so.avatar.totalFrame;
                    _this_1.so.autoPlayEnable = false;
                    _this_1.isWaitingActionOver = false;
                });
            }
        }
        this.so.avatarAct = useVar ? Game.player.variable.getVariable(actionIDVarID) : actionID;
    };
    ProjectSceneObjectBehaviors.prototype.behavior48 = function (useVar, frame, frameVarID) {
        this.so.avatarFrame = useVar ? Game.player.variable.getVariable(frameVarID) : frame;
    };
    ProjectSceneObjectBehaviors.prototype.behavior49 = function (feData) {
        var _this_1 = this;
        if (Config.BEHAVIOR_EDIT_MODE)
            return;
        this.executeCommandPageFragment = true;
        CommandPage.startTriggerFragmentEvent(feData, this.targetSceneObject, this.executor, Callback.New(function () {
            _this_1.executeCommandPageFragment = false;
            _this_1.sceneObjectUpdate();
        }, this));
    };
    ProjectSceneObjectBehaviors.prototype.behavior50 = function (x, y, avatarID, actionID, ori, usePos, useAvatarID, useActionID, useOri, isGrid) {
        if (!Config.BEHAVIOR_EDIT_MODE)
            return;
        if (usePos) {
            this.so.x = isGrid ? x * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2 : x;
            this.so.y = isGrid ? y * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2 : y;
        }
        if (useAvatarID) {
            this.so.avatarID = avatarID;
        }
        if (useActionID) {
            this.so.avatarAct = actionID;
        }
        if (useOri) {
            var mappings = [8, 2, 4, 6, 7, 1, 9, 3];
            this.so.avatarOri = mappings[ori];
        }
    };
    ProjectSceneObjectBehaviors.prototype.behaviorMoveD = function (dx, dy, forceIgnoreCantMove, checkObstacle) {
        if (forceIgnoreCantMove === void 0) { forceIgnoreCantMove = false; }
        if (checkObstacle === void 0) { checkObstacle = false; }
        if (!this.so.scene)
            return;
        var toGrid = GameUtils.getGridPostion(new Point(this.so.x, this.so.y));
        toGrid.x += dx;
        toGrid.y += dy;
        var toP = new Point(toGrid.x * Config.SCENE_GRID_SIZE, toGrid.y * Config.SCENE_GRID_SIZE);
        toP = GameUtils.getGridCenter(toP);
        var hasObs = false;
        if (dx == 0 && dy == 0) {
            hasObs = true;
        }
        else {
            if (Config.BEHAVIOR_EDIT_MODE || checkObstacle) {
                if (!this.so.through) {
                    if (this.so.scene.sceneUtils.isObstacleGrid(toGrid, this.so)) {
                        hasObs = true;
                    }
                }
                else {
                    if (this.so.scene.sceneUtils.isOutsideByGrid(toGrid)) {
                        hasObs = true;
                    }
                }
            }
        }
        if (hasObs) {
            if (!this.so.ignoreCantMove && !forceIgnoreCantMove) {
                this.index--;
            }
            return;
        }
        if (this.ignoreProcess) {
            if (!this.so.fixOri)
                this.so.avatarOri = GameUtils.getOriByAngle(MathUtils.direction360(this.so.x, this.so.y, toP.x, toP.y));
            this.so.x = toP.x;
            this.so.y = toP.y;
        }
        else {
            this.so.startMove([[toP.x, toP.y]], Game.oneFrame, false, Callback.New(this.sceneObjectUpdate, this));
        }
    };
    ProjectSceneObjectBehaviors.prototype.sceneObjectUpdate = function () {
        this.so.update(Game.now);
    };
    return ProjectSceneObjectBehaviors;
}(SceneObjectBehaviors));
SceneObjectBehaviors.implClass = ProjectSceneObjectBehaviors;
//# sourceMappingURL=ProjectSceneObjectBehaviors.js.map