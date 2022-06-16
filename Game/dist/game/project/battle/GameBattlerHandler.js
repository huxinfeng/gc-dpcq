var GameBattlerHandler = (function () {
    function GameBattlerHandler() {
    }
    GameBattlerHandler.init = function () {
    };
    GameBattlerHandler.start = function () {
        return;
    };
    GameBattlerHandler.stop = function () {
        return;
    };
    GameBattlerHandler.onBattlerRemoved = function (battler) {
    };
    GameBattlerHandler.battlerDeadAnimation = function (battler, playMode) {
        GameBattlerHandler.syncTaskPlayAction(GameBattlerHandler.mustActionCompleteTask, battler, 7, true, playMode, 1, 1034, 1035);
    };
    GameBattlerHandler.resuscitateAction = function (battler) {
        GameBattlerHandler.syncTaskPlayAction(GameBattlerHandler.mustActionCompleteTask, battler, 1, false, false, 2, 1034, 1035);
    };
    GameBattlerHandler.backAction = function (battler) {
    };
    GameBattlerHandler.refreshInBattleState = function (battler) {
        if (!battler || battler.isDisposed)
            return;
        var lastInBattle = battler.inBattle;
        var nowInBattle = battler.battleAI.hateList.length > 0;
        if (!lastInBattle && nowInBattle) {
            battler.inBattle = true;
            Game.refreshActorAttribute(battler.actor, GameBattleHelper.getLevelByActor(battler.actor), battler);
            GameCommand.startCommonCommand(14020, [], null, battler, battler);
            EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, [true, battler]);
        }
        else if (lastInBattle && !nowInBattle) {
            battler.inBattle = false;
            Game.refreshActorAttribute(battler.actor, GameBattleHelper.getLevelByActor(battler.actor), battler);
            GameCommand.startCommonCommand(14021, [], null, battler, battler);
            EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, [false, battler]);
        }
    };
    GameBattlerHandler.dead = function (battler, fromBattler) {
        var _this_1 = this;
        if (battler.isDead)
            return;
        GameBattleAction.stopAction(battler);
        battler.isDead = true;
        battler.through = true;
        battler.actor.hp = 0;
        battler.actor.sp = 0;
        GameBattlerHandler.removeAllStatus(battler);
        GameBattlerHandler.battlerDeadAnimation(battler, true);
        this.clearHateList(battler, true);
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, [battler]);
        var battleActor = battler.actor;
        if (battler.actor.dropEnabled && battler.camp == 0) {
            if (battler.actor.dropGold != 0) {
                ProjectPlayer.increaseGold(battler.actor.dropGold);
                this.effectText(battler, "+" + battler.actor.dropGold.toString() + " G", 1052, 1052);
            }
            if (battler.actor.dropExp != 0) {
                var mainUI = GameUI.get(13);
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorBattler = ProjectPlayer.getPlayerPartyBattler(i);
                    if (!actorBattler.actor.growUpEnabled || actorBattler.isDead)
                        continue;
                    var res = ProjectPlayer.increaseExpByIndex(i, battler.actor.dropExp);
                    if (res && res.toLv > res.fromLv) {
                        GameCommand.startCommonCommand(14023, [], null, actorBattler, actorBattler);
                        mainUI.refreshActorLv(i);
                    }
                    mainUI.refreshActorExp(i);
                }
                this.effectText(battler, "+" + battler.actor.dropExp.toString() + " exp", 1051, 1053);
            }
            for (var i = 0; i < battleActor.dropItems.length; i++) {
                var dropItemDS = battleActor.dropItems[i];
                if (MathUtils.rand(100) < dropItemDS.dropProbability) {
                    ProjectPlayer.changeItemNumber(dropItemDS.item, dropItemDS.num, false);
                    var presetItem = GameData.getModuleData(5, dropItemDS.item);
                    GUI_Main.showGetItem(presetItem, dropItemDS.num);
                }
            }
            for (var i = 0; i < battleActor.dropEquips.length; i++) {
                var dropEquipDS = battleActor.dropEquips[i];
                if (MathUtils.rand(100) < dropEquipDS.dropProbability) {
                    var newEquip = ObjectUtils.depthClone(dropEquipDS.equip);
                    ProjectPlayer.addEquipByInstance(newEquip);
                    GUI_Main.showGetItem(newEquip, 1);
                }
            }
        }
        if (battler.inPartyIndex >= 0) {
            if (Game.player.sceneObject.isDead) {
                GameCommand.startCommonCommand(14022, [], null, Game.player.sceneObject, Game.player.sceneObject);
            }
            else if (WorldData.deadPlayerActorLeaveParty) {
                ProjectPlayer.removePlayerActorByInPartyIndex(battler.inPartyIndex);
            }
        }
        else {
            if (battler.actor.whenDeadEvent) {
                CommandPage.startTriggerFragmentEvent(battler.actor.whenDeadEvent, fromBattler, battler);
            }
            if (battler.actor.isPeriodicResurrection) {
                var lastScene = Game.currentScene;
                setTimeout(function (lastScene, battler) {
                    if (lastScene == Game.currentScene) {
                        if (battler.isDead && GameBattleHelper.isBattler(battler)) {
                            battler.root.visible = false;
                        }
                    }
                }, battler.actor.periodicResurrectionTime * 500, lastScene, battler);
                setTimeout(function (lastScene, battler) {
                    if (lastScene == Game.currentScene) {
                        if (battler.isDead && GameBattleHelper.isBattler(battler)) {
                            battler.root.visible = true;
                            battler.setTo(battler.settingX, battler.settingY);
                            _this_1.resuscitate(battler, true);
                        }
                    }
                }, battler.actor.periodicResurrectionTime * 1000, lastScene, battler);
            }
        }
    };
    GameBattlerHandler.resuscitate = function (battler, isMaxHP) {
        if (isMaxHP === void 0) { isMaxHP = false; }
        if (!battler || !battler.isDead || !GameBattleHelper.isBattler(battler))
            return;
        battler.isDead = false;
        GameBattlerHandler.resuscitateAction(battler);
        battler.through = false;
        var lv;
        if (battler.inPartyIndex >= 0) {
            lv = Game.player.data.party[battler.inPartyIndex].lv;
        }
        else {
            lv = 1;
        }
        Game.refreshActorAttribute(battler.actor, lv, battler);
        battler.actor.hp = isMaxHP ? battler.actor.MaxHP : 1;
        this.refreshBattlerActionByStatus(battler);
        battler.refreshPointBar();
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_RESUSCITATE, [battler]);
    };
    GameBattlerHandler.releaseAction = function (battler, actionID, releaseFrame, whenCompleteActionID, onRelease) {
        battler.duringRelease = true;
        var avatar = battler.avatar;
        var hasAtkAction = avatar.hasActionID(actionID);
        if (hasAtkAction) {
            var isReleaseAction = false;
            var onRender = function () {
                if (avatar.currentFrame >= releaseFrame) {
                    avatar.off(Avatar.RENDER, avatar, arguments.callee);
                    onRelease();
                    isReleaseAction = true;
                }
            };
            avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, function () {
                if (battler.isDisposed)
                    return;
                battler.duringRelease = false;
                avatar.off(Avatar.RENDER, avatar, onRender);
                if (avatar.actionID != actionID)
                    return;
                if (!GameBattleHelper.isBattler(battler) || battler.isDead)
                    return;
                avatar.actionID = whenCompleteActionID;
                if (!isReleaseAction)
                    onRelease();
            });
            avatar.on(Avatar.RENDER, avatar, onRender);
            avatar.currentFrame = 1;
            avatar.actionID = actionID;
        }
        else {
            onRelease();
        }
    };
    GameBattlerHandler.syncTaskPlayAction = function (taskGroup, battler, actionID, isStopLastFrame, playMode, animationMode, playAnimationID, loopAnimationID) {
        var _this_1 = this;
        var taskName = taskGroup + "_" + battler.index;
        new SyncTask(taskName, function () {
            if (playMode) {
                var doPlayAct = function () {
                    if (!battler.isDisposed) {
                        if (battler.avatar.hasActionID(actionID)) {
                            if (isStopLastFrame) {
                                battler.autoPlayEnable = true;
                                battler.avatar.currentFrame = battler.avatar.currentFrame % battler.avatar.totalFrame;
                                var lastCurrentStatusPageIndex = battler.currentStatusPageIndex;
                                battler.avatar.once(Avatar.ACTION_PLAY_COMPLETED, _this_1, function (battler, lastCurrentStatusPageIndex) {
                                    if (battler.currentStatusPageIndex == lastCurrentStatusPageIndex) {
                                        battler.avatarFrame = battler.avatar.totalFrame;
                                        battler.autoPlayEnable = false;
                                    }
                                    SyncTask.taskOver(taskName);
                                }, [battler, lastCurrentStatusPageIndex]);
                            }
                            else {
                                battler.autoPlayEnable = true;
                            }
                            battler.avatarAct = actionID;
                            battler.avatarFrame = 1;
                            if (animationMode == 2) {
                                battler.stopAnimation(playAnimationID);
                                battler.stopAnimation(loopAnimationID);
                            }
                            if (!isStopLastFrame) {
                                SyncTask.taskOver(taskName);
                            }
                            return;
                        }
                        else if (animationMode == 1) {
                            var actionAnimation = battler.playAnimation(playAnimationID, false, true);
                            if (loopAnimationID > 0) {
                                actionAnimation.once(GCAnimation.PLAY_COMPLETED, _this_1, function () {
                                    battler.playAnimation(loopAnimationID, true, true);
                                    SyncTask.taskOver(taskName);
                                });
                                return;
                            }
                        }
                    }
                    if (animationMode == 2) {
                        battler.stopAnimation(playAnimationID);
                        battler.stopAnimation(loopAnimationID);
                    }
                    SyncTask.taskOver(taskName);
                };
                if (battler.avatar.isLoading) {
                    battler.avatar.once(EventObject.LOADED, _this_1, doPlayAct);
                }
                else {
                    doPlayAct.apply(_this_1);
                }
            }
            else {
                var doSetActionLastFrame = function () {
                    if (!battler.isDisposed) {
                        if (battler.avatar.hasActionID(actionID)) {
                            battler.avatarAct = actionID;
                            battler.avatarFrame = isStopLastFrame ? battler.avatar.totalFrame : 1;
                            battler.autoPlayEnable = isStopLastFrame ? false : true;
                        }
                        else if (animationMode == 1) {
                            battler.playAnimation(loopAnimationID, true, true);
                        }
                        if (animationMode == 2) {
                            battler.stopAnimation(playAnimationID);
                            battler.stopAnimation(loopAnimationID);
                        }
                    }
                    SyncTask.taskOver(taskName);
                };
                if (battler.avatar.isLoading) {
                    battler.avatar.once(EventObject.LOADED, _this_1, doSetActionLastFrame);
                }
                else {
                    doSetActionLastFrame.apply(_this_1);
                }
            }
        });
    };
    GameBattlerHandler.clearHateList = function (battler, clearAll) {
        if (clearAll === void 0) { clearAll = false; }
        if (!battler || !battler.battleAI)
            return;
        battler.battleAI.hateList.length = 0;
        battler.battleAI.myTarget = null;
        if (clearAll)
            this.removeHateTargetFromAllList(battler);
    };
    GameBattlerHandler.removeHateTarget = function (battler, hateTarget) {
        if (battler.battleAI.myTarget == hateTarget)
            battler.battleAI.myTarget = null;
        var hateIndex = ArrayUtils.matchAttributes(battler.battleAI.hateList, { targetIndex: hateTarget.index }, true, "==", true)[0];
        if (hateIndex == null)
            return;
        battler.battleAI.hateList.splice(hateIndex, 1);
    };
    GameBattlerHandler.removeHateTargetFromAllList = function (hateTarget) {
        var allBattler = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattler.length; i++) {
            var battler = allBattler[i];
            this.removeHateTarget(battler, hateTarget);
        }
    };
    GameBattlerHandler.increaseHate = function (battler, hateTarget, hateValue, ignoreNotInHateList) {
        if (ignoreNotInHateList === void 0) { ignoreNotInHateList = false; }
        if (!GameBattleHelper.isHostileRelationship(battler, hateTarget))
            return;
        if (battler.isDead || hateTarget.isDead)
            return;
        var hateDS = ArrayUtils.matchAttributes(battler.battleAI.hateList, { targetIndex: hateTarget.index }, true)[0];
        if (hateDS) {
            hateDS.hateValue += hateValue;
        }
        else {
            if (ignoreNotInHateList)
                return;
            hateDS = new DataStructure_battlerHate;
            hateDS.targetIndex = hateTarget.index;
            hateDS.hateValue = hateValue;
            battler.battleAI.hateList.push(hateDS);
        }
        this.hateListOrderByDESC(battler);
    };
    GameBattlerHandler.increaseHateByHit = function (fromBattler, targetBattler, hitFrom, hitValue) {
        if (hitValue === void 0) { hitValue = 0; }
        hitValue = hitFrom.damageType <= 2 ? -hitValue : hitValue;
        var hateValue = hitFrom.fixedHeteValue + Math.abs(hitValue) * hitFrom.damageHatePer / 100;
        if (hitValue < 0) {
            this.increaseHate(targetBattler, fromBattler, hateValue);
        }
        else {
            if (GameBattleHelper.isFriendlyRelationship(fromBattler, targetBattler)) {
                var enemyCampBattlers = [];
                var allBattlers = GameBattleHelper.allBattlers;
                for (var i = 0; i < allBattlers.length; i++) {
                    var battler = allBattlers[i];
                    if (GameBattleHelper.isHostileRelationship(fromBattler, battler)) {
                        enemyCampBattlers.push(battler);
                    }
                }
                for (var i = 0; i < enemyCampBattlers.length; i++) {
                    this.increaseHate(enemyCampBattlers[i], fromBattler, hateValue, true);
                }
            }
        }
    };
    GameBattlerHandler.addStatus = function (targetBattler, statusID, fromBattler, force) {
        if (fromBattler === void 0) { fromBattler = null; }
        if (force === void 0) { force = false; }
        var systemStatus = GameData.getModuleData(6, statusID);
        if (!systemStatus)
            return false;
        if (!force && MathUtils.rand(100) >= systemStatus.statusHit) {
            return false;
        }
        if (fromBattler == null)
            fromBattler = targetBattler;
        var targetBattlerActor = targetBattler.actor;
        var targetIsImmuneThisStatus = targetBattlerActor.selfImmuneStatus.indexOf(statusID) != -1;
        if (!force && targetIsImmuneThisStatus)
            return false;
        ;
        var thisStatus = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true)[0];
        if (thisStatus) {
            thisStatus.currentLayer += 1;
            if (thisStatus.currentLayer > thisStatus.maxlayer)
                thisStatus.currentLayer = thisStatus.maxlayer;
        }
        else {
            thisStatus = GameData.newModuleData(6, statusID);
            thisStatus.fromBattlerID = fromBattler.index;
            thisStatus.fromSceneID = Game.currentScene.id;
            targetBattlerActor.status.push(thisStatus);
        }
        if (thisStatus.animation)
            targetBattler.playAnimation(thisStatus.animation, true, true);
        thisStatus.currentDuration = Game.now;
        this.refreshBattlerActionByStatus(targetBattler);
        if (systemStatus.whenAddEvent)
            CommandPage.startTriggerFragmentEvent(systemStatus.whenAddEvent, targetBattler, fromBattler);
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, [targetBattler]);
        return true;
    };
    GameBattlerHandler.removeStatus = function (targetBattler, statusID, refreshBattlerAction) {
        if (refreshBattlerAction === void 0) { refreshBattlerAction = true; }
        var systemStatus = GameData.getModuleData(6, statusID);
        if (!systemStatus)
            return false;
        var targetBattlerActor = targetBattler.actor;
        var thisStatusIdx = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true, "==", true)[0];
        if (thisStatusIdx != null) {
            targetBattlerActor.status.splice(thisStatusIdx, 1);
            if (systemStatus.whenRemoveEvent)
                CommandPage.startTriggerFragmentEvent(systemStatus.whenRemoveEvent, targetBattler, targetBattler);
            if (systemStatus.animation) {
                if (ArrayUtils.matchAttributes(targetBattlerActor.status, { animation: systemStatus.animation }, true, "==", true).length == 0) {
                    targetBattler.stopAnimation(systemStatus.animation);
                }
            }
            if (refreshBattlerAction)
                this.refreshBattlerActionByStatus(targetBattler);
            EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, [targetBattler]);
            return true;
        }
        return false;
    };
    GameBattlerHandler.removeAllStatus = function (battler) {
        var statusArr = battler.actor.status;
        for (var i = 0; i < statusArr.length; i++) {
            var status = statusArr[i];
            if (status.animation)
                battler.stopAnimation(status.animation);
        }
        battler.actor.status.length = 0;
        this.refreshBattlerActionByStatus(battler);
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, [battler]);
    };
    GameBattlerHandler.removeAllBattlerStatusByFromBattler = function (fromBattler) {
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            var isRemoved = false;
            if (GameBattleHelper.isBattler(so)) {
                var statusArr = so.actor.status;
                for (var s = 0; s < statusArr.length; s++) {
                    var status = statusArr[s];
                    if (status.fromBattlerID == fromBattler.index) {
                        if (this.removeStatus(so, status.id, false)) {
                            s--;
                            isRemoved = true;
                        }
                    }
                }
                if (isRemoved) {
                    this.refreshBattlerActionByStatus(so);
                }
            }
        }
    };
    GameBattlerHandler.refreshBattlerActionByStatus = function (battler) {
        if (battler.isDead)
            return;
        if (!GameBattleHelper.canMove(battler)) {
            if (battler.avatarAct == WorldData.sceneObjectMoveStartAct2 || battler.avatarAct == WorldData.sceneObjectMoveStartAct) {
                battler.stopMove();
            }
        }
        battler.autoPlayEnable = GameBattleHelper.canAutoPlayAvatarAction(battler);
        battler.fixOri = !GameBattleHelper.canChangeOri(battler);
    };
    GameBattlerHandler.onChangeSceneObjectStatus = function (so) {
        if (GameBattleHelper.isBattler(so)) {
            this.onBattlerRemoved(so);
        }
    };
    GameBattlerHandler.hateListOrderByDESC = function (battler) {
        battler.battleAI.hateList.sort(function (a, b) {
            return a.hateValue < b.hateValue ? 1 : -1;
        });
    };
    GameBattlerHandler.effectText = function (target, label, uiID, aniID) {
        var textUI = GameUI.load(uiID, true);
        if (!textUI)
            return;
        var uiTarget = textUI["target"];
        var uiTxt = textUI["txt"];
        if (!uiTarget || !uiTxt)
            return;
        uiTxt.text = label;
        Game.currentScene.animationHighLayer.addChild(textUI);
        textUI.x = target.x + MathUtils.rand(30) - 15;
        textUI.y = target.y - Config.SCENE_GRID_SIZE + MathUtils.rand(30) - 15;
        var ani = new GCAnimation();
        ani.id = aniID;
        ani.addToGameSprite(uiTarget, textUI, textUI);
        uiTarget.addChild(ani);
        ani.once(GCAnimation.PLAY_COMPLETED, this, function (ani, textUI) {
            ani.dispose();
            textUI.dispose();
        }, [ani, textUI]);
        ani.play();
        return textUI;
    };
    GameBattlerHandler.EVENT_BATTLER_DEAD = "GameBattlerHandlerEVENT_BATTLER_DEAD";
    GameBattlerHandler.EVENT_BATTLER_RESUSCITATE = "GameBattlerHandlerEVENT_BATTLER_RESUSCITATE";
    GameBattlerHandler.EVENT_BATTLER_IN_BATTLE = "GameBattlerHandlerEVENT_BATTLER_IN_BATTLE";
    GameBattlerHandler.EVENT_STATUS_CHANGE = "GameBattlerHandlerEVENT_STATUS_CHANGE";
    GameBattlerHandler.hitReward = { gold: 0, exp: 0, items: [], equips: [] };
    GameBattlerHandler.mustActionCompleteTask = "mustActionCompleteTask";
    return GameBattlerHandler;
}());
//# sourceMappingURL=GameBattlerHandler.js.map