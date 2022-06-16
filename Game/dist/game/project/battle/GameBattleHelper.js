var GameBattleHelper = (function () {
    function GameBattleHelper() {
    }
    GameBattleHelper.getLevelByActor = function (actor) {
        var playerActorDS = ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
        if (playerActorDS) {
            return playerActorDS.lv;
        }
        return 1;
    };
    Object.defineProperty(GameBattleHelper, "allBattlers", {
        get: function () {
            var arr = [];
            for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
                var so = Game.currentScene.sceneObjects[i];
                if (GameBattleHelper.isBattler(so)) {
                    arr.push(so);
                }
            }
            return arr;
        },
        enumerable: false,
        configurable: true
    });
    GameBattleHelper.getBattlerByActor = function (actor) {
        var arr = [];
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (so && so.actor == actor) {
                return so;
            }
        }
        return null;
    };
    GameBattleHelper.isBattler = function (so) {
        return so && so.modelID == 1 && so.isBattler && so.actor != null;
    };
    GameBattleHelper.isPlayerCamp = function (so) {
        return this.isBattler(so) && so.camp == 1;
    };
    GameBattleHelper.isEnemyCamp = function (so) {
        return this.isBattler(so) && so.camp == 0 && so.inPartyIndex < 0;
    };
    GameBattleHelper.isInPlayerParty = function (so) {
        return this.isPlayerCamp(so) && ProjectPlayer.getPlayerActorIndexByActor(so.actor) >= 0;
    };
    GameBattleHelper.isFriendlyRelationship = function (so1, so2) {
        return this.isBattler(so1) && this.isBattler(so2) && so1.camp == so2.camp;
    };
    GameBattleHelper.isHostileRelationship = function (so1, so2) {
        return this.isBattler(so1) && this.isBattler(so2) && ((so1.camp == 0 && so2.camp != 0) || (so1.camp != 0 && so2.camp == 0));
    };
    GameBattleHelper.isHostileSkill = function (skill) {
        return skill.skillType <= 1 && (skill.targetType == 2 || skill.targetType == 4 || skill.targetType == 6);
    };
    GameBattleHelper.isFriendlySkill = function (skill) {
        return skill.skillType <= 1 && !this.isHostileSkill(skill);
    };
    GameBattleHelper.getBattlerStatus = function (battler, statusID) {
        return ArrayUtils.matchAttributes(battler.actor.status, { id: statusID }, true)[0];
    };
    GameBattleHelper.isIncludeStatus = function (battler, statusID) {
        return ArrayUtils.matchAttributes(battler.actor.status, { id: statusID }, true).length == 1;
    };
    GameBattleHelper.canSuperpositionLayer = function (battler, statusID) {
        var status = ArrayUtils.matchAttributes(battler.actor.status, { id: statusID }, true)[0];
        if (status && status.currentLayer >= status.maxlayer)
            return false;
        return true;
    };
    GameBattleHelper.canMove = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        if (battler.isDead)
            return false;
        if (battler.duringRelease)
            return false;
        if (battler.moveSpeed <= 0)
            return false;
        return ArrayUtils.matchAttributes(battler.actor.status, { cantMove: true }, true).length == 0;
    };
    GameBattleHelper.canAttack = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        var actor = battler.actor;
        if ((!actor.atkSkill || actor.atkSkill.currentCD != 0 || actor.atkSkill.costSP > actor.sp))
            return false;
        return ArrayUtils.matchAttributes(battler.actor.status, { cantAtk: true }, true).length == 0;
    };
    GameBattleHelper.canUseSkill = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        if (battler.isDead)
            return false;
        if (battler.duringRelease)
            return false;
        if (ArrayUtils.matchAttributes(battler.actor.status, { cantUseSkill: true }, true).length == 1)
            return false;
        return true;
    };
    GameBattleHelper.canUseOneSkill = function (battler, skill, checkUseSkillCommconCondition, recordTargets, firstTarget) {
        if (checkUseSkillCommconCondition === void 0) { checkUseSkillCommconCondition = true; }
        if (recordTargets === void 0) { recordTargets = null; }
        if (firstTarget === void 0) { firstTarget = null; }
        if (!GameBattleHelper.isBattler(battler))
            return false;
        var isAtkSkill = skill == battler.actor.atkSkill;
        if (checkUseSkillCommconCondition && !this.canUseSkill(battler))
            return false;
        if (skill.skillType == 2)
            return false;
        if ((battler.inBattle && skill.useCondition == 2) || (!battler.inBattle && skill.useCondition == 1))
            return false;
        if (!this.isSkillCooled(skill) || skill.costSP > battler.actor.sp)
            return false;
        if (skill.skillReleaseType < 2) {
            var targets = this.getSkillTargets(battler, skill, firstTarget);
            if (targets.length == 0 && (!isAtkSkill || battler != ProjectPlayer.ctrlActorSceneObject))
                return false;
            if (recordTargets) {
                for (var i = 0; i < targets.length; i++)
                    recordTargets.push(targets[i]);
            }
        }
        else if (skill.skillType == 0) {
            return false;
        }
        return true;
    };
    GameBattleHelper.isSkillCooled = function (skill) {
        if (skill.currentCD == 0)
            return true;
        return Game.now - skill.currentCD >= skill.totalCD * 1000;
    };
    GameBattleHelper.isStatusOverTime = function (status) {
        if (status.currentDuration == 0)
            return false;
        return Game.now - status.currentDuration >= status.totalDuration * 1000;
    };
    GameBattleHelper.canAutoPlayAvatarAction = function (battler) {
        if (!battler.autoPlayEnable)
            return false;
        if (battler.isDead)
            return false;
        if (!GameBattleHelper.isBattler(battler))
            return true;
        return ArrayUtils.matchAttributes(battler.actor.status, { cantAutoPlay: true }, true).length == 0;
    };
    GameBattleHelper.canChangeOri = function (battler) {
        if (battler.isDead)
            return false;
        if (!GameBattleHelper.isBattler(battler))
            return true;
        return ArrayUtils.matchAttributes(battler.actor.status, { cantChangeOri: true }, true).length == 0;
    };
    GameBattleHelper.isCanHitBy = function (targetBattler, fromBattler, fromSkill) {
        if (targetBattler.isDead) {
            return false;
        }
        if (fromBattler && GameBattleHelper.isFriendlyRelationship(targetBattler, fromBattler)) {
            return true;
        }
        if (ArrayUtils.matchAttributes(targetBattler.actor.status, { cantBeHit: true }, true).length == 1) {
            return false;
        }
        return true;
    };
    GameBattleHelper.getSkillTargets = function (battler, skill, firstTarget) {
        if (firstTarget === void 0) { firstTarget = null; }
        if (skill.targetType == 0) {
            if (this.isCanHitBy(battler, battler, skill)) {
                return [battler];
            }
            else {
                return [];
            }
        }
        if (skill.skillReleaseType >= 2)
            return [];
        var battlePoint = new Point(battler.x, battler.y);
        var userScanningAngleRange = this.getScanningAngleRange(battler, skill.scanAngle);
        var targets = [];
        var singleTargetDis = Number.MAX_VALUE;
        if (skill.skillReleaseType == 1 && (skill.targetType == 1 || skill.targetType == 3 || skill.targetType == 5)) {
            if (this.isCanHitBy(battler, battler, skill)) {
                targets.push(battler);
            }
            if (skill.targetType == 1 && targets.length == 1)
                return targets;
        }
        var sceneObjects = Game.currentScene.sceneObjects;
        var soLen = Game.currentScene.sceneObjects.length;
        for (var i = 0; i < soLen; i++) {
            var target = sceneObjects[i];
            if (!this.isBattler(target))
                continue;
            if (target.isDead)
                continue;
            if (target == battler)
                continue;
            if (!this.isCanHitBy(target, battler, skill))
                continue;
            if ((this.isHostileSkill(skill) && GameBattleHelper.isHostileRelationship(battler, target)) ||
                (!this.isHostileSkill(skill) && GameBattleHelper.isFriendlyRelationship(battler, target))) {
                var targetPoint = new Point(target.x, target.y);
                var dis = Point.distance(battlePoint, targetPoint);
                if (skill.distance < dis)
                    continue;
                if ((skill.skillReleaseType == 0 && this.isInScanningAngleRange(target, battlePoint, userScanningAngleRange)) ||
                    skill.skillReleaseType == 1) {
                    targets.push(target);
                }
            }
        }
        if (!(skill.targetType == 3 || skill.targetType == 4)) {
            var targetNum = (skill.targetType == 5 || skill.targetType == 6) ? skill.targetNum : 1;
            targets.sort(function (target1, target2) {
                var dis1 = Point.distanceSquare2(battler.x, battler.y, target1.x, target1.y);
                var dis2 = Point.distanceSquare2(battler.x, battler.y, target2.x, target2.y);
                return dis1 < dis2 ? -1 : 1;
            });
            if (firstTarget) {
                var idx = targets.indexOf(firstTarget);
                if (idx != -1) {
                    targets.splice(idx, 1);
                    targets.unshift(firstTarget);
                }
            }
            if (targets.length > targetNum)
                targets.length = targetNum;
        }
        return targets;
    };
    GameBattleHelper.getScanningAngleRange = function (so, rangeAngle) {
        var dir = so.avatar.orientation;
        var angle = GameUtils.getAngleByOri(dir);
        return { start: angle - rangeAngle / 2, end: angle + rangeAngle / 2 };
    };
    GameBattleHelper.isInScanningAngleRange = function (target, scanningPoint, scanningRange) {
        var targetAngle = MathUtils.direction360(scanningPoint.x, scanningPoint.y, target.x, target.y);
        return MathUtils.inAngleRange(scanningRange.end, scanningRange.start, targetAngle);
    };
    GameBattleHelper.getBattlerDistance = function (battler1, battler2) {
        return Math.abs(battler1.posGrid.x - battler2.posGrid.x) + Math.abs(battler1.posGrid.y - battler2.posGrid.y);
    };
    GameBattleHelper.getGridDistance = function (grid1, grid2) {
        return Math.abs(grid1.x - grid2.x) + Math.abs(grid1.y - grid2.y);
    };
    GameBattleHelper.calculationHitResult = function (fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status) {
        if (skill === void 0) { skill = null; }
        if (item === void 0) { item = null; }
        if (status === void 0) { status = null; }
        var res;
        var fromActor = fromBattler.actor;
        var targetBattlerActor = targetBattler.actor;
        var addTargetBattlerStatusArr = [];
        var addFromBattlerStatusArr = [];
        var removeTargetBattlerStatusArr = [];
        var targetOriStatus = targetBattlerActor.status.concat();
        var damageType = -2;
        var hpChangeValue = 0;
        var spChangeValue = 0;
        var hitRemoveStatus = false;
        var critPer = 1;
        var magCritPer = 1;
        var isCrit;
        var isMagCrit;
        if (isHitSuccess) {
            isCrit = MathUtils.rand(100) < fromActor.CRIT ? true : false;
            isMagCrit = MathUtils.rand(100) < fromActor.MagCrit ? true : false;
            critPer = isCrit ? 2 : 1;
            magCritPer = isMagCrit ? 2 : 1;
            if (actionType == 0) {
                addFromBattlerStatusArr = addFromBattlerStatusArr.concat(fromActor.hitTargetSelfAddStatus);
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(fromActor.hitTargetStatus);
            }
            if (actionType <= 1) {
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(skill.addStatus);
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(skill.removeStatus);
            }
            else if (actionType == 2) {
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(item.addStatus);
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(item.removeStatus);
            }
            for (var i = 0; i < addTargetBattlerStatusArr.length; i++) {
                var addStatusID = addTargetBattlerStatusArr[i];
                GameBattlerHandler.addStatus(targetBattler, addStatusID, fromBattler);
            }
            for (var i = 0; i < removeTargetBattlerStatusArr.length; i++) {
                var removeStatusID = removeTargetBattlerStatusArr[i];
                GameBattlerHandler.removeStatus(targetBattler, removeStatusID);
            }
            for (var i = 0; i < addFromBattlerStatusArr.length; i++) {
                var addStatusID = addFromBattlerStatusArr[i];
                GameBattlerHandler.addStatus(fromBattler, addStatusID, fromBattler);
            }
            if (addTargetBattlerStatusArr.length > 0 || removeTargetBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level, targetBattler);
            }
            if (addFromBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level, targetBattler);
            }
        }
        if (!isHitSuccess) {
            damageType = -1;
            res = { damageType: -1, damage: hpChangeValue, isCrit: false };
        }
        if (isHitSuccess) {
            if (actionType <= 1) {
                var skillDamage = 0;
                if (skill.useDamage) {
                    var damageShowCrit = false;
                    damageType = skill.damageType;
                    skillDamage = skill.damageValue;
                    if (skill.useAddition) {
                        var actorAttributeValue = skill.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                        var addDamageValue = skill.additionMultiple / 100 * actorAttributeValue;
                        skillDamage += addDamageValue;
                    }
                    if (damageType == 0) {
                        hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.DEF) * critPer;
                        hitRemoveStatus = true;
                        damageShowCrit = isCrit;
                    }
                    else if (damageType == 1) {
                        hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.MagDef) * magCritPer;
                        hitRemoveStatus = true;
                        damageShowCrit = isMagCrit;
                    }
                    else if (damageType == 2) {
                        hpChangeValue = -Math.max(1, skillDamage);
                        hitRemoveStatus = true;
                    }
                    else if (damageType == 3) {
                        hpChangeValue = Math.max(0, skillDamage) * magCritPer;
                        damageShowCrit = isMagCrit;
                    }
                    else if (damageType == 4) {
                        spChangeValue = Math.max(0, skillDamage) * magCritPer;
                        damageShowCrit = isMagCrit;
                    }
                    if (hpChangeValue != 0) {
                        res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                    }
                    else if (spChangeValue != 0) {
                        res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                    }
                }
                if (skill.useHate) {
                    GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, skill, skillDamage);
                }
                if (GameBattleHelper.isHostileRelationship(fromBattler, targetBattler)) {
                    GameBattlerHandler.increaseHate(fromBattler, targetBattler, 1);
                }
            }
            else if (actionType == 2) {
                if (item.recoveryHP) {
                    damageType = 3;
                    hpChangeValue = item.recoveryHP;
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: false };
                }
                if (item.recoverySP) {
                    spChangeValue = item.recoverySP;
                    if (damageType != 3) {
                        damageType = 4;
                        res = { damageType: damageType, damage: spChangeValue, isCrit: false };
                    }
                }
            }
            else if (actionType == 3) {
                damageType = status.damageType;
                var damageShowCrit = false;
                var statusDamage = status.damageValue;
                if (status.useAddition) {
                    var actorAttributeValue = status.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                    var addDamageValue = status.additionMultiple / 100 * actorAttributeValue;
                    statusDamage += addDamageValue;
                }
                if (damageType == 0) {
                    hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.DEF);
                    hitRemoveStatus = true;
                    damageShowCrit = isCrit;
                }
                else if (damageType == 1) {
                    hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.MagDef);
                    hitRemoveStatus = true;
                    damageShowCrit = isMagCrit;
                }
                else if (damageType == 2) {
                    hpChangeValue = -Math.max(1, statusDamage);
                    hitRemoveStatus = true;
                }
                else if (damageType == 3) {
                    hpChangeValue = Math.max(0, statusDamage);
                    damageShowCrit = isMagCrit;
                }
                else if (damageType == 4) {
                    spChangeValue = Math.max(0, statusDamage);
                    damageShowCrit = isMagCrit;
                }
                hpChangeValue *= status.currentLayer;
                spChangeValue *= status.currentLayer;
                if (hpChangeValue != 0) {
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                }
                else if (spChangeValue != 0) {
                    res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                }
                GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, status, statusDamage);
                if (GameBattleHelper.isHostileRelationship(fromBattler, targetBattler)) {
                    GameBattlerHandler.increaseHate(fromBattler, targetBattler, 1);
                }
            }
        }
        hpChangeValue = Math.floor(hpChangeValue);
        spChangeValue = Math.floor(spChangeValue);
        if (hpChangeValue != 0)
            targetBattlerActor.hp += hpChangeValue;
        if (spChangeValue != 0)
            targetBattlerActor.sp += spChangeValue;
        targetBattlerActor.hp = Math.max(Math.min(targetBattlerActor.hp, targetBattlerActor.MaxHP), 0);
        targetBattlerActor.sp = Math.max(Math.min(targetBattlerActor.sp, targetBattlerActor.MaxSP), 0);
        if (hitRemoveStatus) {
            var hitRemoveStatusSuccess = false;
            if ((actionType == 0 || actionType == 1 || actionType == 3) && damageType <= 2) {
                for (var i = 0; i < targetOriStatus.length; i++) {
                    var needRemoveStatus = targetOriStatus[i];
                    if (needRemoveStatus.removeWhenInjured && MathUtils.rand(100) < needRemoveStatus.removePer) {
                        if (GameBattlerHandler.removeStatus(targetBattler, needRemoveStatus.id))
                            hitRemoveStatusSuccess = true;
                    }
                }
                if (hitRemoveStatusSuccess) {
                    var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                    Game.refreshActorAttribute(targetBattlerActor, level, targetBattler);
                }
            }
        }
        return res;
    };
    return GameBattleHelper;
}());
//# sourceMappingURL=GameBattleHelper.js.map