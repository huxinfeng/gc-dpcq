














var GameBullet = (function (_super) {
    __extends(GameBullet, _super);
    function GameBullet(now, from, targetBattler, skill, preAngle) {
        if (preAngle === void 0) { preAngle = null; }
        var _this_1 = _super.call(this) || this;
        _this_1.updateCount = 0;
        _this_1.updateAngleInterval = MathUtils.rand(4) + 2;
        if (!Game.currentScene)
            return _this_1;
        _this_1.startTime = now;
        _this_1.from = from;
        _this_1.targetBattler = targetBattler;
        _this_1.skill = skill;
        _this_1.id = skill.bulletAnimation;
        _this_1.loop = true;
        if (targetBattler) {
            var angle = MathUtils.direction360(targetBattler.x, targetBattler.y, from.x, from.y);
        }
        else if (_this_1.skill.skillReleaseType == 2 || (ProjectUtils.lastControl == 2 && _this_1.skill.skillReleaseType == 3)) {
            var angle = GameUtils.getAngleByOri(from.avatarOri);
            if (_this_1.skill.bulletRotation)
                _this_1.rotation = angle;
            angle += 180;
        }
        else if (_this_1.skill.skillReleaseType == 3) {
            if (preAngle) {
                angle = preAngle;
            }
            else {
                if (ProjectPlayer.ctrlActorSceneObject == from) {
                    angle = MathUtils.direction360(from.x, from.y, Game.currentScene.localX, Game.currentScene.localY);
                }
                else if (from.battleAI.myTarget) {
                    angle = MathUtils.direction360(from.x, from.y, from.battleAI.myTarget.x, from.battleAI.myTarget.y);
                }
                else {
                    angle = GameUtils.getAngleByOri(from.avatarOri);
                }
            }
            if (_this_1.skill.bulletRotation)
                _this_1.rotation = angle;
            angle += 180;
        }
        var dx = -Math.sin(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2;
        var dy = Math.cos(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2;
        _this_1.x = from.x + dx;
        _this_1.y = from.y + dy - Config.SCENE_GRID_SIZE / 2;
        if (_this_1.skill.skillReleaseType >= 2) {
            if (_this_1.skill.targetType >= 5 && _this_1.skill.targetType >= 6) {
                _this_1.hitTargetCount = _this_1.skill.targetNum;
            }
            else if (_this_1.skill.targetType >= 1 && _this_1.skill.targetType >= 2) {
                _this_1.hitTargetCount = 1;
            }
            _this_1.alreadyHitTarget = [];
            _this_1.hitRange2 = Math.pow(_this_1.skill.hitRange, 2);
            _this_1.maxDurationTime = _this_1.skill.distance * 1000 / _this_1.skill.bulletSpeed;
            _this_1.startX = _this_1.x;
            _this_1.startY = _this_1.y;
            var dis = Point.distance2(0, 0, Math.abs(dx), Math.abs(dy));
            var disPer = skill.distance / dis;
            _this_1.toDx = dx * disPer;
            _this_1.toDy = (dy) * disPer;
        }
        else {
            var refObj = targetBattler.avatar.refObjs[1];
            if (refObj) {
                _this_1.toDx = refObj.x + refObj.width / 2;
                _this_1.toDy = refObj.y + refObj.height / 2;
            }
            else {
                _this_1.toDx = 0;
                _this_1.toDy = 0;
            }
        }
        _this_1.play();
        Game.currentScene.animationHighLayer.addChild(_this_1);
        Callback.CallLaterBeforeRender(_this_1.update, _this_1, [now]);
        return _this_1;
    }
    GameBullet.prototype.update = function (now) {
        if (!Game.currentScene) {
            return;
        }
        this.updateCount++;
        var speed = this.skill.bulletSpeed;
        var isHit;
        var targets;
        var isOver;
        var dt = now - this.startTime;
        if (this.skill.skillReleaseType >= 2) {
            if (dt >= this.maxDurationTime) {
                this.dispose();
                isOver = true;
            }
            else {
                targets = [];
                var per = dt / this.maxDurationTime;
                this.x = (this.toDx) * per + this.startX;
                this.y = (this.toDy) * per + this.startY;
                var allBattlers = GameBattleHelper.allBattlers;
                var len = allBattlers.length;
                for (var i = 0; i < allBattlers.length; i++) {
                    var targetBattler = allBattlers[i];
                    if (!GameBattleHelper.isCanHitBy(targetBattler, this.from, this.skill)) {
                        continue;
                    }
                    if (this.alreadyHitTarget[targetBattler.index]) {
                        continue;
                    }
                    if ((GameBattleHelper.isHostileSkill(this.skill) && GameBattleHelper.isHostileRelationship(this.from, targetBattler)) ||
                        (GameBattleHelper.isFriendlySkill(this.skill) && GameBattleHelper.isFriendlyRelationship(this.from, targetBattler))) {
                        var refObj = new Rectangle;
                        var hitDx = Config.SCENE_GRID_SIZE / 2;
                        var hitDy = -Config.SCENE_GRID_SIZE / 2;
                        var dis2 = Point.distanceSquare2(this.x, this.y, targetBattler.x + hitDx, targetBattler.y + hitDy);
                        if (dis2 <= this.hitRange2) {
                            isHit = true;
                            targets.push(targetBattler);
                            this.alreadyHitTarget[targetBattler.index] = true;
                            if (this.hitTargetCount != null) {
                                this.hitTargetCount--;
                                if (this.hitTargetCount == 0) {
                                    isOver = true;
                                    this.dispose();
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            this.startTime = now;
            var px = speed * dt / 1000;
            var toX = this.targetBattler.x + this.toDx;
            var toY = this.targetBattler.y + this.toDy;
            var dis = Point.distance2(this.x, this.y, toX, toY);
            var per = px / dis;
            this.x = (toX - this.x) * per + this.x;
            this.y = (toY - this.y) * per + this.y;
            if (this.skill.bulletRotation && (this.updateCount == 1 || (this.updateCount % this.updateAngleInterval == 0))) {
                var angle = MathUtils.direction360(this.x, this.y, toX, toY);
                this.rotation = angle;
            }
            if (dis <= px) {
                isHit = true;
                if (GameBattleHelper.isCanHitBy(this.targetBattler, this.from, this.skill)) {
                    targets = [this.targetBattler];
                }
                else {
                    targets = [];
                }
                isOver = true;
                Game.currentScene.sceneObjectLayer.removeChild(this);
                this.dispose();
            }
        }
        return { isHit: isHit, targets: targets, isOver: isOver };
    };
    return GameBullet;
}(GCAnimation));
//# sourceMappingURL=GameBullet.js.map