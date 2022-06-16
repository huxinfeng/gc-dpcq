var GameBattle = (function () {
    function GameBattle() {
    }
    GameBattle.start = function () {
        GameBattleAI.start();
        GameBattleAction.start();
        GameBattlerHandler.start();
        os.add_ENTERFRAME(this.update, this);
    };
    GameBattle.stop = function () {
        GameBattleAI.stop();
        GameBattleAction.stop();
        GameBattlerHandler.stop();
        os.remove_ENTERFRAME(this.update, this);
    };
    GameBattle.update = function () {
        if (Game.pause)
            return;
        this.updateCount++;
        this.updateStatus();
        this.refreshInBattleState();
    };
    GameBattle.updateStatus = function () {
        var now = Game.now;
        if (this.updateCount % 6 == 0) {
            var allBattlers = GameBattleHelper.allBattlers;
            for (var i = 0; i < allBattlers.length; i++) {
                var battler = allBattlers[i];
                var status = battler.actor.status;
                var hasRemoveStatus = false;
                var overtimeHit = [];
                for (var s = 0; s < status.length; s++) {
                    var st = status[s];
                    if (!st)
                        continue;
                    var intervalTime = now - st.currentDuration;
                    if (st.overtime && st.intervalTime != 0 && st.fromSceneID == Game.currentScene.id) {
                        var needEffectTimes = Math.floor(intervalTime / (st.intervalTime * 1000));
                        for (var t = st.effectTimes; t < needEffectTimes; t++) {
                            var fromBattler = Game.currentScene.sceneObjects[st.fromBattlerID];
                            if (GameBattleHelper.isBattler(fromBattler)) {
                                overtimeHit.push({ fromBattler: fromBattler, battler: battler, status: st });
                            }
                        }
                        st.effectTimes = needEffectTimes;
                    }
                    if (GameBattleHelper.isStatusOverTime(st)) {
                        var isRemoved = GameBattlerHandler.removeStatus(battler, st.id, false);
                        if (isRemoved) {
                            i--;
                            hasRemoveStatus = true;
                        }
                    }
                }
                if (hasRemoveStatus) {
                    var lv = GameBattleHelper.getLevelByActor(battler.actor);
                    Game.refreshActorAttribute(battler.actor, lv, battler);
                    GameBattlerHandler.refreshBattlerActionByStatus(battler);
                }
                for (var s = 0; s < overtimeHit.length; s++) {
                    var o = overtimeHit[s];
                    GameBattleAction.hitTarget(o.fromBattler, o.battler, 3, null, null, o.status);
                }
            }
        }
    };
    GameBattle.checkBattlerIsDead = function (battler, fromBattler) {
        if (!battler.isDisposed && GameBattleHelper.isBattler(battler) && !battler.isDead && battler.actor.hp == 0) {
            GameBattlerHandler.dead(battler, fromBattler);
        }
    };
    GameBattle.refreshInBattleState = function () {
        var sceneObjects = Game.currentScene.sceneObjects;
        for (var i = 0; i < sceneObjects.length; i++) {
            var so = sceneObjects[i];
            if (!GameBattleHelper.isBattler(so))
                continue;
            GameBattlerHandler.refreshInBattleState(so);
        }
    };
    GameBattle.cameraTweenFrame = 20;
    GameBattle.actionReflectionTime = 200;
    GameBattle.noActionWaitTime = 1000;
    GameBattle.battleRound = 0;
    GameBattle.playerBattlers = [];
    GameBattle.enemyBattlers = [];
    GameBattle.usedPlayerActorRecord = new Dictionary();
    GameBattle.updateCount = 0;
    return GameBattle;
}());
//# sourceMappingURL=GameBattle.js.map