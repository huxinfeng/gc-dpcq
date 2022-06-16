var ProjectUtils = (function () {
    function ProjectUtils() {
    }
    ProjectUtils.init = function () {
        var _this_1 = this;
        stage.on(EventObject.MOUSE_WHEEL, this, function (e) { ProjectUtils.mouseWhileValue = e.delta; });
        stage.on(EventObject.MOUSE_MOVE, this, function (e) { ProjectUtils.lastControl = 0; });
        stage.on(EventObject.KEY_DOWN, this, function (e) { ProjectUtils.lastControl = ProjectUtils.fromGamePad ? 2 : 1; ProjectUtils.fromGamePad = false; _this_1.keyboardEvent = e; });
        stage.on(EventObject.KEY_UP, this, function (e) { _this_1.keyboardEvent = null; });
    };
    ProjectUtils.takeoutRect = function () {
        return ProjectUtils.rectanglePool.takeout();
    };
    ProjectUtils.freeRect = function (rect) {
        ProjectUtils.rectanglePool.free(rect);
    };
    ProjectUtils.dateFormat = function (fmt, date) {
        var ret;
        var opt = {
            "Y+": date.getFullYear().toString(),
            "m+": (date.getMonth() + 1).toString(),
            "d+": date.getDate().toString(),
            "H+": date.getHours().toString(),
            "M+": date.getMinutes().toString(),
            "S+": date.getSeconds().toString()
        };
        for (var k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
            }
            ;
        }
        ;
        return fmt;
    };
    ProjectUtils.timerFormat = function (time) {
        var S = 1000;
        var M = S * 60;
        var H = M * 60;
        var hTotal = Math.floor(time / H);
        var hStr = MathUtils.fixIntDigit(hTotal, 2);
        time -= H * hTotal;
        var mTotal = Math.floor(time / M);
        var mStr = MathUtils.fixIntDigit(mTotal, 2);
        time -= M * mTotal;
        var sTotal = Math.floor(time / S);
        var sStr = MathUtils.fixIntDigit(sTotal, 2);
        return hStr + ":" + mStr + ":" + sStr;
    };
    ProjectUtils.getPlayerActorByCheckType = function (actorCheckType, actorIDUseVar, actorID, actorIDVarID, actorInPartyIndexVarIDUseVar, actorInPartyIndex, actorInPartyIndexVarID, soType, soIndexUseVar, soIndex, soIndexVarID, trigger) {
        if (actorCheckType == 0) {
            var pActorID = MathUtils.int(actorIDUseVar ? Game.player.variable.getVariable(actorIDVarID) : actorID);
            return ProjectPlayer.getPlayerActorDSByActorID(pActorID);
        }
        else if (actorCheckType == 1) {
            var pActorInPartyIndex = MathUtils.int(actorInPartyIndexVarIDUseVar ? Game.player.variable.getVariable(actorInPartyIndexVarID) : actorInPartyIndex);
            return ProjectPlayer.getPlayerActorDSByInPartyIndex(pActorInPartyIndex);
        }
        else if (actorCheckType == 2) {
            var soc = ProjectClientScene.getSceneObjectBySetting(soType + 1, soIndex, soIndexUseVar, soIndexVarID, trigger);
            if (GameBattleHelper.isBattler(soc)) {
                var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(soc.actor);
                return ProjectPlayer.getPlayerActorDSByInPartyIndex(inPlayerActorIndex);
            }
        }
    };
    ProjectUtils.getActorBySceneObjectIndex = function (soType, soIndexUseVar, soIndex, soIndexVarID, trigger) {
        var soc = ProjectClientScene.getSceneObjectBySetting(soType + 1, soIndex, soIndexUseVar, soIndexVarID, trigger);
        if (GameBattleHelper.isBattler(soc)) {
            return soc.actor;
        }
        return null;
    };
    ProjectUtils.groupElementsMoveIndex = function (groupElements, currentIndex, moveDir, limitSecondAxis) {
        if (limitSecondAxis === void 0) { limitSecondAxis = 50; }
        var currentElement = currentIndex == -1 ? { x: 0, y: 0 } : groupElements[currentIndex];
        var allowOris = {
            2: [1, 2, 3],
            4: [1, 4, 7],
            6: [3, 6, 9],
            8: [7, 8, 9]
        }[moveDir];
        if (!allowOris)
            return null;
        var secondAxisName = (moveDir == 4 || moveDir == 6) ? "y" : "x";
        var minDis = Number.MAX_VALUE;
        var minIndex = null;
        for (var i = 0; i < groupElements.length; i++) {
            var targetEle = groupElements[i];
            if (i == currentIndex)
                continue;
            var angle = MathUtils.direction360(currentElement.x, currentElement.y, targetEle.x, targetEle.y);
            var ori = GameUtils.getOriByAngle(angle);
            if (allowOris.indexOf(ori) == -1)
                continue;
            var secondAxisDistance = Math.abs(targetEle[secondAxisName] - currentElement[secondAxisName]);
            if (secondAxisDistance > limitSecondAxis)
                continue;
            var dis2 = Point.distanceSquare2(currentElement.x, currentElement.y, targetEle.x, targetEle.y);
            if (dis2 < minDis) {
                minDis = dis2;
                minIndex = i;
            }
        }
        return minIndex;
    };
    ProjectUtils.mouseWhileValue = 0;
    ProjectUtils.callbackHelper = new Callback;
    ProjectUtils.pointHelper = new Point;
    ProjectUtils.rectangleHelper = new Rectangle;
    ProjectUtils.lastControl = 0;
    ProjectUtils.rectanglePool = new PoolUtils(Rectangle);
    return ProjectUtils;
}());
//# sourceMappingURL=ProjectUtils.js.map