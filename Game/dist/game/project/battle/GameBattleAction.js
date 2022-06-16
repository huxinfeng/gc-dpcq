var GameBattleAction = (function () {
    function GameBattleAction() {
    }
    GameBattleAction.init = function () {
    };
    GameBattleAction.start = function () {
        os.add_ENTERFRAME(this.update, this);
    };
    GameBattleAction.stop = function () {
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            this.stopAction(allBattlers[i]);
        }
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].dispose();
        }
        this.bullets = [];
        os.remove_ENTERFRAME(this.update, this);
    };
    GameBattleAction.update = function () {
        if (Game.pause)
            return;
        this.updateCount++;
        var now = Game.now;
        this.updateBullets(now);
    };
    GameBattleAction.updateBullets = function (now) {
        for (var i = 0; i < this.bullets.length; i++) {
            var bullet = this.bullets[i];
            var bulletState = bullet.update(now);
            if (bulletState.isHit) {
                for (var s in bulletState.targets) {
                    var target = bulletState.targets[s];
                    if (target.isDisposed || target.isDead)
                        continue;
                    this.hitTarget(bullet.from, target, 1, bullet.skill);
                }
            }
            if (bulletState.isOver) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    };
    GameBattleAction.stopAction = function (battler) {
        if (!battler.isDead) {
            battler.stopMove();
        }
    };
    GameBattleAction.useSkill = function (fromBattler, skill, firstTarget) {
        var _this_1 = this;
        if (firstTarget === void 0) { firstTarget = null; }
        if (!fromBattler || !skill)
            return false;
        var recordTargets = [];
        if (!GameBattleHelper.canUseOneSkill(fromBattler, skill, true, recordTargets, firstTarget))
            return false;
        fromBattler.actor.sp -= skill.costSP;
        if (skill.costSP != 0 && fromBattler.inPartyIndex >= 0) {
            fromBattler.refreshPointBar();
        }
        skill.currentCD = Game.now;
        var doUseSkill = function () {
            if (skill.useAction2 && Math.random() < 0.5) {
                var releaseActionID = skill.releaseActionID2;
                var releaseFrame = skill.releaseFrame2;
            }
            else {
                var releaseActionID = skill.releaseActionID;
                var releaseFrame = skill.releaseFrame;
            }
            fromBattler.stopMove();
            var angle = null;
            if (skill.skillType == 1 && (skill.skillReleaseType == 3 && ProjectUtils.lastControl != 2)) {
                if (ProjectPlayer.ctrlActorSceneObject == fromBattler) {
                    angle = MathUtils.direction360(fromBattler.x, fromBattler.y, Game.currentScene.localX, Game.currentScene.localY);
                }
                else if (fromBattler.battleAI.myTarget) {
                    angle = MathUtils.direction360(fromBattler.x, fromBattler.y, fromBattler.battleAI.myTarget.x, fromBattler.battleAI.myTarget.y);
                }
                else {
                    angle = GameUtils.getAngleByOri(fromBattler.avatarOri);
                }
                var ori = GameUtils.getOriByAngle(angle);
                fromBattler.avatarOri = ori;
            }
            GameBattlerHandler.releaseAction(fromBattler, releaseActionID, releaseFrame, 1, function () {
                _this_1.releaseSkill(fromBattler, skill, recordTargets, angle);
            });
            if (skill.releaseAnimation) {
                fromBattler.playAnimation(skill.releaseAnimation, false, true);
            }
        };
        if (skill.releaseEvent)
            CommandPage.startTriggerFragmentEvent(skill.releaseEvent, fromBattler, fromBattler, Callback.New(doUseSkill, this));
        else
            doUseSkill.apply(this);
        return true;
    };
    GameBattleAction.releaseSkill = function (fromBattler, skill, targets, angle) {
        if (skill.skillType == 0) {
            for (var i = 0; i < targets.length; i++) {
                this.hitTarget(fromBattler, targets[i], 1, skill);
            }
        }
        else if (skill.skillType == 1) {
            if (skill.skillReleaseType >= 2) {
                this.releaseBullet(fromBattler, skill, null, angle);
            }
            else {
                for (var i = 0; i < targets.length; i++) {
                    this.releaseBullet(fromBattler, skill, targets[i], angle);
                }
            }
        }
    };
    GameBattleAction.releaseBullet = function (fromBattler, skill, targetBattler, angle) {
        if (targetBattler === void 0) { targetBattler = null; }
        if (angle === void 0) { angle = null; }
        var bullet = new GameBullet(Game.now, fromBattler, targetBattler, skill, angle);
        this.bullets.push(bullet);
    };
    GameBattleAction.hitTarget = function (fromBattler, targetBattler, actionType, skill, item, status) {
        var _this_1 = this;
        if (skill === void 0) { skill = null; }
        if (item === void 0) { item = null; }
        if (status === void 0) { status = null; }
        if (actionType == 1 && fromBattler.actor.atkSkill == skill)
            actionType = 0;
        var fromActor = fromBattler.actor;
        var battleActor = targetBattler.actor;
        var isHitSuccess = true;
        var hitAniID = 0;
        var showTargetHurtAnimation = false;
        if (actionType == 0) {
            isHitSuccess = MathUtils.rand(100) < (fromActor.HIT - battleActor.DOD);
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = true;
        }
        else if (actionType == 1) {
            isHitSuccess = MathUtils.rand(100) < skill.hit;
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = GameBattleHelper.isHostileRelationship(fromBattler, targetBattler);
        }
        else if (actionType == 2) {
            isHitSuccess = true;
            hitAniID = item.useAnimation;
        }
        else if (actionType == 3) {
            showTargetHurtAnimation = false;
        }
        var callNextStep = function () {
            if (GameBattleHelper.isCanHitBy(targetBattler, fromBattler, skill)) {
                _this_1.hitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status);
            }
        };
        var callHitEvent = function () {
            if (actionType <= 1 && isHitSuccess && skill.hitEvent)
                CommandPage.startTriggerFragmentEvent(skill.hitEvent, fromBattler, targetBattler, Callback.New(callNextStep, _this_1));
            else if (actionType == 2 && item.callEvent)
                CommandPage.startTriggerFragmentEvent(item.callEvent, fromBattler, targetBattler, Callback.New(callNextStep, _this_1));
            else
                callNextStep.apply(_this_1);
        };
        if (hitAniID) {
            var alreadyInShowDamageStage = false;
            if (isHitSuccess && showTargetHurtAnimation) {
            }
            var hitAni = targetBattler.playAnimation(hitAniID, false, isHitSuccess, null, true);
            callHitEvent.apply(this);
        }
        else {
            callHitEvent.apply(this);
        }
    };
    GameBattleAction.hitResult = function (fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status) {
        if (skill === void 0) { skill = null; }
        if (item === void 0) { item = null; }
        if (status === void 0) { status = null; }
        if (!GameBattleHelper.isBattler(targetBattler)) {
            return;
        }
        var res = GameBattleHelper.calculationHitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status);
        if (res) {
            targetBattler.pointBar.hpBar.value = targetBattler.actor.hp * 100 / targetBattler.actor.MaxHP;
            this.showDamage(targetBattler, res.damageType, res.damage, res.isCrit);
        }
        GameBattle.checkBattlerIsDead(targetBattler, fromBattler);
        targetBattler.refreshPointBar();
    };
    GameBattleAction.showDamage = function (targetBattler, damageType, damage, isCrit, onFin) {
        if (damage === void 0) { damage = 0; }
        if (isCrit === void 0) { isCrit = false; }
        if (onFin === void 0) { onFin = null; }
        if (!Game.currentScene)
            return;
        var lastRelease = true;
        damage = Math.floor(damage);
        var uiID;
        switch (damageType) {
            case -2:
                uiID = 0;
                break;
            case -1:
                uiID = 1041;
                break;
            default:
                uiID = 1042 + damageType;
                break;
        }
        if (uiID != 0) {
            var damageUI = GameUI.load(uiID, true);
            damageUI.x = targetBattler.x;
            damageUI.y = targetBattler.y;
            Game.currentScene.animationHighLayer.addChild(damageUI);
            var targetUI = damageUI["target"];
            if (!targetUI)
                targetUI = damageUI.getChildAt(0);
            if (targetUI) {
                if (damageType >= 0) {
                    var damageLabel = damageUI["damage"];
                    if (damageLabel && damageLabel instanceof UIString) {
                        damageLabel.text = (damage > 0 ? "+" : "") + damage.toString();
                    }
                }
                var damageAni = new GCAnimation();
                damageAni.target = targetUI;
                damageAni.once(GCAnimation.PLAY_COMPLETED, this, function () {
                    damageAni.dispose();
                    damageUI.dispose();
                    if (lastRelease) {
                        onFin && onFin.run();
                    }
                });
                damageAni.id = (isCrit ? 1049 : 1046) + MathUtils.rand(3);
                damageAni.play();
                if (!lastRelease) {
                    onFin && onFin.run();
                }
                return;
            }
        }
        onFin && onFin.run();
    };
    GameBattleAction.bullets = [];
    GameBattleAction.updateCount = 0;
    return GameBattleAction;
}());
//# sourceMappingURL=GameBattleAction.js.map