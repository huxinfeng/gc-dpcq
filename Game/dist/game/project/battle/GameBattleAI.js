var GameBattleAI = (function () {
    function GameBattleAI(battler) {
        this.aiStage = 0;
        this.aiUpdateCount = 0;
        this.aiUpdateInFrame = MathUtils.rand(GameBattleAI.FREQUENCY);
        this.lastPosition = new Point();
        this.cantAtkMoveTimes = 0;
        this.battler = battler;
        this.hateList = [];
        if (GameBattleHelper.isEnemyCamp(battler) && battler.actor.aiType == 0) {
            EventUtils.addEventListenerFunction(Game, Game.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE, this.refreshVigilanceRange, this);
            this.vigilanceRangeLayer = new Sprite();
            Game.currentScene.animationLowLayer.addChildAt(this.vigilanceRangeLayer, 0);
            this.vigilanceRangeLayer.blendMode = "lighter";
        }
        this.battler.on(ProjectClientSceneObject.CHANGE_ORI, this, this.onBattlerChangeOri);
        this.refreshBattlerVigilanceRangeEffect();
    }
    GameBattleAI.prototype.dispose = function (clearBattlerStatus) {
        if (clearBattlerStatus === void 0) { clearBattlerStatus = true; }
        if (!this.battler)
            return;
        if (clearBattlerStatus) {
            GameBattlerHandler.removeAllBattlerStatusByFromBattler(this.battler);
            GameBattlerHandler.removeAllStatus(this.battler);
        }
        GameBattlerHandler.clearHateList(this.battler, true);
        GameBattlerHandler.refreshInBattleState(this.battler);
        this.battler.off(ProjectClientSceneObject.CHANGE_ORI, this, this.onBattlerChangeOri);
        if (this.vigilanceRangeLayer) {
            this.vigilanceRangeLayer.graphics.clear();
            this.vigilanceRangeLayer.removeSelf();
            this.vigilanceRangeLayer = null;
        }
        this.battler = null;
    };
    GameBattleAI.start = function () {
        os.add_ENTERFRAME(this.update, this);
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, this.onBattlerDead, this);
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_RESUSCITATE, this.onBattlerResuscitate, this);
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, this.onBattlerInBattle, this);
    };
    GameBattleAI.stop = function () {
        os.remove_ENTERFRAME(this.update, this);
        EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, this.onBattlerDead, this);
        EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_RESUSCITATE, this.onBattlerResuscitate, this);
        EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, this.onBattlerInBattle, this);
    };
    GameBattleAI.update = function () {
        if (Game.pause)
            return;
        var sceneObjects = Game.currentScene.sceneObjects;
        this.enemys.length = 0;
        this.allyBattlers.length = 0;
        this.playerBattlers.length = 0;
        for (var i = 0; i < sceneObjects.length; i++) {
            var so = sceneObjects[i];
            if (!GameBattleHelper.isBattler(so))
                continue;
            if (so.camp == 0) {
                if (!so.isDead) {
                    this.enemys.push(so);
                }
            }
            else if (so.camp == 1) {
                if (!so.isDead) {
                    this.allyBattlers.push(so);
                }
            }
            else if (so.camp == -1) {
                this.playerBattlers.push(so);
            }
        }
        var npcBattlers = this.enemys.concat(this.allyBattlers);
        for (var i = 0; i < npcBattlers.length; i++) {
            var npcBattler = npcBattlers[i];
            this.updateNPCAI(npcBattler);
        }
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var teamMember = ProjectPlayer.getPlayerPartyBattler(i);
            if (teamMember != ProjectPlayer.ctrlActorSceneObject) {
                if (!teamMember.isDead) {
                    this.updateTeamMemberAI(teamMember);
                }
            }
        }
        this.refreshBattlerVigilanceRangeEffectPosition();
    };
    GameBattleAI.updateNPCAI = function (battler) {
        var battlerAI = battler.battleAI;
        if (!battlerAI)
            return;
        battlerAI.aiUpdateCount++;
        if (battlerAI.aiUpdateCount % this.FREQUENCY != battlerAI.aiUpdateInFrame)
            return;
        if (battler.actor.aiType == 2)
            return;
        if (battler.actor.aiType == 1 && battlerAI.hateList.length == 0) {
            if (battlerAI.aiStage == 2) {
                battlerAI.backToInBattlePostion();
            }
            return;
        }
        var soPoint = new Point(battler.x, battler.y);
        var btTarget;
        if ((battlerAI.hateList.length == 0)) {
            var userScanningAngleRange = GameBattleHelper.getScanningAngleRange(battler, battler.actor.vigilanceAngle);
            if (battler.camp == 0) {
                var targetBattlers = this.playerBattlers.concat(this.allyBattlers);
            }
            else {
                targetBattlers = this.enemys;
            }
            for (var i = 0; i < targetBattlers.length; i++) {
                var target = targetBattlers[i];
                if (target.isDead)
                    continue;
                var dis = Point.distance(new Point(target.x, target.y), soPoint);
                if (dis <= battler.actor.aiVigilanceRange && GameBattleHelper.isInScanningAngleRange(target, soPoint, userScanningAngleRange)) {
                    GameBattlerHandler.increaseHate(battler, target, 0);
                    break;
                }
            }
        }
        else if (battlerAI.hateList.length > 0) {
            btTarget = Game.currentScene.sceneObjects[battlerAI.hateList[0].targetIndex];
        }
        battlerAI.myTarget = btTarget;
        if (!btTarget) {
            if (battlerAI.aiStage == 2) {
                battlerAI.backToInBattlePostion();
            }
            return;
        }
        battler.eventStartWait(null, false);
        battlerAI.aiStage = 1;
        if (!battlerAI.aiInBattlePoint)
            battlerAI.aiInBattlePoint = new Point(soPoint.x, soPoint.y);
        var targetPoint = new Point(btTarget.x, btTarget.y);
        var lostTarget = false;
        var dis1 = Point.distance(soPoint, targetPoint);
        if (dis1 >= battler.actor.lostTargetRange1) {
            lostTarget = true;
        }
        else {
            var dis2 = Point.distance(battlerAI.aiInBattlePoint, targetPoint);
            if (dis2 >= battler.actor.lostTargetRange2) {
                lostTarget = true;
            }
        }
        if (lostTarget) {
            GameBattlerHandler.removeHateTarget(battler, btTarget);
            GameBattlerHandler.removeHateTarget(btTarget, battler);
            if (battlerAI.hateList.length == 0) {
                battlerAI.aiStage = 2;
                battlerAI.backToInBattlePostion();
            }
            return;
        }
        battlerAI.isInBackToInBattlePoint = false;
        this.attackTarget(battler, btTarget, dis1);
    };
    GameBattleAI.prototype.backToInBattlePostion = function () {
        var battler = this.battler;
        var battlerAI = battler.battleAI;
        if (battler.actor.lostTargetBack && (battlerAI.aiInBattlePoint.x != battler.x || battlerAI.aiInBattlePoint.y != battler.y)) {
            if (GameBattleHelper.canMove(battler)) {
                battlerAI.isInBackToInBattlePoint = true;
                battler.autoFindRoadMove(battlerAI.aiInBattlePoint.x, battlerAI.aiInBattlePoint.y, 1, 0, true, false, true, WorldData.moveDir4);
                battler.once(ProjectClientSceneObject.MOVE_OVER, this, function () {
                    if (battlerAI.aiStage == 2) {
                        battlerAI.aiStage = 0;
                        battlerAI.aiInBattlePoint = null;
                        battlerAI.isInBackToInBattlePoint = false;
                        battler.eventCompleteContinue();
                        Game.refreshActorAttribute(battler.actor, GameBattleHelper.getLevelByActor(battler.actor), battler);
                    }
                });
            }
        }
        else {
            battlerAI.aiStage = 0;
            battlerAI.aiInBattlePoint = null;
            battler.eventCompleteContinue();
        }
    };
    GameBattleAI.updateTeamMemberAI = function (battler) {
        var battlerAI = battler.battleAI;
        if (!battlerAI)
            return;
        battlerAI.aiUpdateCount++;
        if (battlerAI.aiUpdateCount % this.FREQUENCY != battlerAI.aiUpdateInFrame)
            return;
        if (Game.player.data.aiMode == 0) {
            if (!battlerAI.myTarget) {
                if (battlerAI.hateList.length > 0) {
                    var hateInfo = battlerAI.hateList[0];
                    battlerAI.myTarget = Game.currentScene.sceneObjects[hateInfo.targetIndex];
                }
            }
            if (!battlerAI.myTarget) {
                if (ProjectPlayer.ctrlActorSceneObject.battleAI.hateList.length > 0) {
                    var hateInfo = ProjectPlayer.ctrlActorSceneObject.battleAI.hateList[0];
                    battlerAI.myTarget = Game.currentScene.sceneObjects[hateInfo.targetIndex];
                }
            }
        }
        else {
            if (!battlerAI.myTarget) {
                var vigilanceRange2 = Math.pow(Game.player.data.aiVigilanceRange, 2);
                var minDis2 = Number.MAX_VALUE;
                for (var i = 0; i < this.enemys.length; i++) {
                    var enemy = this.enemys[i];
                    var dis2 = Point.distanceSquare2(battler.x, battler.y, enemy.x, enemy.y);
                    if (dis2 <= minDis2 && dis2 <= vigilanceRange2) {
                        minDis2 = dis2;
                        battlerAI.myTarget = enemy;
                    }
                }
            }
        }
        var soPoint = new Point(battler.x, battler.y);
        var dis1 = Point.distance(soPoint, new Point(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y));
        var lostTarget = false;
        if (dis1 >= stage.width) {
            GameBattleAction.stopAction(battler);
            GameBattlerHandler.clearHateList(battler);
            GameBattlerHandler.removeHateTargetFromAllList(battler);
            battler.setTo(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y);
            battlerAI.wantToGoGrid = null;
            this.followCtrlActorSceneObject(battler, dis1);
            return;
        }
        else if (dis1 >= stage.width / 2) {
            GameBattleAction.stopAction(battler);
            GameBattlerHandler.clearHateList(battler);
            GameBattlerHandler.removeHateTargetFromAllList(battler);
            this.followCtrlActorSceneObject(battler, dis1);
            return;
        }
        if (battlerAI.myTarget) {
            var targetPoint = new Point(battlerAI.myTarget.x, battlerAI.myTarget.y);
            var dis2_1 = Point.distance(soPoint, targetPoint);
            this.attackTarget(battler, battlerAI.myTarget, dis2_1);
        }
        else {
            this.followCtrlActorSceneObject(battler, dis1);
        }
    };
    GameBattleAI.attackTarget = function (so, btTarget, distance) {
        var atkSkill = so.actor.atkSkill;
        if ((so.actor.moveType != 0 || so.camp == -1) && GameBattleHelper.canMove(so)) {
            var keepingDis = Math.max(Config.SCENE_GRID_SIZE, atkSkill.distance);
            if (distance > keepingDis) {
                var posArr = SceneUtils.getAroundPositions(1, btTarget, so);
                var moveToDestination;
                if (posArr.length > 0) {
                    moveToDestination = posArr[0];
                    so.autoFindRoadMove(posArr[0].x, posArr[0].y, 1, 0, true, false, true, moveDir4);
                }
                else {
                    moveToDestination = btTarget.pos;
                    so.autoFindRoadMove(btTarget.x, btTarget.y, 1, 0, true, false, true, moveDir4);
                }
                var isCantAtkMove = so.battleAI.lastPosition.x == so.x && so.battleAI.lastPosition.y == so.y;
                var moveDir4 = isCantAtkMove ? true : WorldData.moveDir4;
                if (isCantAtkMove) {
                    so.battleAI.cantAtkMoveTimes++;
                    if (so.battleAI.cantAtkMoveTimes >= 5) {
                        var myAroundPosArr = SceneUtils.getAroundPositions(1, so, btTarget);
                        if (myAroundPosArr.length > 0)
                            moveToDestination = myAroundPosArr[0];
                        so.battleAI.cantAtkMoveTimes = 0;
                    }
                }
                else {
                    so.battleAI.cantAtkMoveTimes = 0;
                }
                so.autoFindRoadMove(moveToDestination.x, moveToDestination.y, 1, 0, true, false, true, moveDir4);
                so.battleAI.lastPosition.x = so.x;
                so.battleAI.lastPosition.y = so.y;
            }
            else if (!so.duringRelease) {
                so.stopMove();
            }
        }
        var isFaceToTarget = false;
        if (distance < atkSkill.distance) {
            if (!isFaceToTarget) {
                this.faceToTarget(so, btTarget);
                isFaceToTarget = true;
            }
            var useAtkSuccess = GameBattleAction.useSkill(so, atkSkill, btTarget);
            if (useAtkSuccess) {
                return;
            }
        }
        for (var i = 0; i < so.actor.skills.length; i++) {
            var skill = so.actor.skills[i];
            if (distance < skill.distance) {
                if (!isFaceToTarget) {
                    this.faceToTarget(so, btTarget);
                    isFaceToTarget = true;
                }
                var useSkillSuccess = GameBattleAction.useSkill(so, skill, btTarget);
                if (useSkillSuccess) {
                    return;
                }
            }
        }
    };
    GameBattleAI.faceToTarget = function (battler, target) {
        if (!battler.duringRelease && !battler.fixOri) {
            var angle = MathUtils.direction360(battler.x, battler.y, target.x, target.y);
            var ori = GameUtils.getOriByAngle(angle);
            battler.avatarOri = ori;
        }
    };
    GameBattleAI.followCtrlActorSceneObject = function (battler, distance) {
        if (!GameBattleHelper.canMove(battler))
            return;
        var posArr = SceneUtils.getAroundPositions(0, ProjectPlayer.ctrlActorSceneObject, battler);
        if (posArr.length > 0) {
            battler.autoFindRoadMove(posArr[0].x, posArr[0].y, 1, 0, true, false, true, WorldData.moveDir4);
        }
        else {
            battler.autoFindRoadMove(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y, 1, 0, true, false, true, WorldData.moveDir4);
        }
    };
    GameBattleAI.prototype.onBattlerChangeOri = function () {
        this.refreshBattlerVigilanceRangeEffect();
    };
    GameBattleAI.prototype.refreshBattlerVigilanceRangeEffect = function () {
        if (!this.vigilanceRangeLayer)
            return;
        this.vigilanceRangeLayer.graphics.clear();
        if (this.battler.isDead || this.battler.inBattle || !WorldData.showVigilanceRange)
            return;
        var oriAngle = GameUtils.getAngleByOri(this.battler.avatarOri) - 90;
        var halfAngle = Math.floor(this.battler.actor.vigilanceAngle / 2);
        var color = WorldData.vigilanceColor;
        this.vigilanceRangeLayer.alpha = WorldData.vigilanceAlpha;
        this.vigilanceRangeLayer.graphics.drawPie(0, 0, this.battler.actor.aiVigilanceRange, oriAngle - halfAngle, oriAngle + halfAngle, color);
    };
    GameBattleAI.refreshBattlerVigilanceRangeEffectPosition = function () {
        for (var i = 0; i < this.enemys.length; i++) {
            var enemy = this.enemys[i];
            if (enemy && enemy.battleAI) {
                var layer = enemy.battleAI.vigilanceRangeLayer;
                if (layer) {
                    layer.x = enemy.x;
                    layer.y = enemy.y;
                }
            }
        }
    };
    GameBattleAI.onBattlerDead = function (battler) {
        if (battler && battler.battleAI) {
            battler.battleAI.refreshBattlerVigilanceRangeEffect();
        }
    };
    GameBattleAI.onBattlerResuscitate = function (battler) {
        if (battler && battler.battleAI) {
            battler.battleAI.refreshBattlerVigilanceRangeEffect();
        }
    };
    GameBattleAI.onBattlerInBattle = function (isInBattle, battler) {
        if (battler && battler.battleAI) {
            battler.battleAI.refreshBattlerVigilanceRangeEffect();
        }
    };
    GameBattleAI.prototype.refreshVigilanceRange = function () {
        if (this.vigilanceRangeLayer) {
            this.vigilanceRangeLayer.visible = WorldData.showVigilanceRange;
            if (WorldData.showVigilanceRange)
                this.refreshBattlerVigilanceRangeEffect();
        }
    };
    GameBattleAI.FREQUENCY = 15;
    GameBattleAI.enemys = [];
    GameBattleAI.allyBattlers = [];
    GameBattleAI.playerBattlers = [];
    return GameBattleAI;
}());
//# sourceMappingURL=GameBattleAI.js.map