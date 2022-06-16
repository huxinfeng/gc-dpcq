var AstarUtils = (function () {
    function AstarUtils() {
        this.openList = new Array();
        this.closeList = new Array();
        this.roadArr = new Array();
    }
    AstarUtils.moveTo = function (x_x1, x_y1, x_x2, x_y2, gridW, gridH, scene, ori4, toGridAsThroughEnabled, throughMode) {
        if (ori4 === void 0) { ori4 = false; }
        if (toGridAsThroughEnabled === void 0) { toGridAsThroughEnabled = false; }
        if (throughMode === void 0) { throughMode = false; }
        var sceneUtils = scene.sceneUtils;
        var GRID_SIZE = Config.SCENE_GRID_SIZE;
        var GRID_SIZE_HALF = Math.floor(Config.SCENE_GRID_SIZE / 2);
        var x_mapw = gridW;
        var x_maph = gridH;
        var rangeW = Math.floor(Config.WINDOW_WIDTH / GRID_SIZE) + 1;
        var rangeH = Math.floor(Config.WINDOW_HEIGHT / GRID_SIZE) + 1;
        var n_f_x1 = Math.floor(x_x1 / GRID_SIZE) - rangeW;
        var n_f_y1 = Math.floor(x_y1 / GRID_SIZE) - rangeH;
        var n_f_x2 = Math.floor(x_x1 / GRID_SIZE) + rangeW;
        var n_f_y2 = Math.floor(x_y1 / GRID_SIZE) + rangeH;
        if (Math.abs(x_x2 - x_x1) > rangeW * GRID_SIZE || Math.abs(x_y2 - x_y1) > rangeH * GRID_SIZE) {
            return null;
        }
        var mapmapmap = [];
        var thisBox;
        n_f_x1 = n_f_x1 < 0 ? 0 : n_f_x1;
        n_f_y1 = n_f_y1 < 0 ? 0 : n_f_y1;
        n_f_x2 = n_f_x2 > x_mapw ? x_mapw : n_f_x2;
        n_f_y2 = n_f_y2 > x_maph ? x_maph : n_f_y2;
        var offsetX = n_f_x1 - 0;
        var offsetY = n_f_y1 - 0;
        var yLen = (n_f_y2 - n_f_y1);
        var xLen = (n_f_x2 - n_f_x1);
        for (var y = 0; y < yLen; y++) {
            var mapmapmapY = mapmapmap[y] = [];
            for (var x = 0; x < xLen; x++) {
                thisBox = new AstarBox();
                mapmapmapY.push(thisBox);
                thisBox.px = x;
                thisBox.py = y;
                thisBox.go = 0;
            }
        }
        var n_obx, n_oby, i;
        var helpP = new Point();
        if (!throughMode) {
            for (var _x = n_f_x1; _x < n_f_x2; _x++) {
                for (var _y = n_f_y1; _y < n_f_y2; _y++) {
                    helpP.x = _x;
                    helpP.y = _y;
                    if (sceneUtils.isObstacleGrid(helpP)) {
                        mapmapmap[_y - offsetY][_x - offsetX].go = 1;
                    }
                }
            }
        }
        var goX = Math.floor(x_y1 / GRID_SIZE) - offsetY;
        var mapGoXs = mapmapmap[goX];
        if (!mapGoXs)
            return null;
        var goY = Math.floor(x_x1 / GRID_SIZE) - offsetX;
        var actor_go = mapGoXs[goY];
        if (!actor_go)
            return null;
        var toX = Math.floor(x_y2 / GRID_SIZE) - offsetY;
        var mapToXs = mapmapmap[toX];
        if (!mapToXs)
            return null;
        var toY = Math.floor(x_x2 / GRID_SIZE) - offsetX;
        var actor_to = mapToXs[toY];
        if (!actor_to)
            return null;
        if (toGridAsThroughEnabled) {
            actor_to.go = 0;
        }
        var _ARoad = new AstarUtils();
        _ARoad.ori4 = ori4;
        var roadList = _ARoad.searchRoad(actor_go, actor_to, mapmapmap);
        if (roadList.length < 1) {
            return null;
        }
        var roadLines = [];
        for (i = roadList.length - 1; i > 0; i--) {
            var n_px_real = roadList[i].px + offsetX;
            var n_py_real = roadList[i].py + offsetY;
            roadLines.push([n_px_real * GRID_SIZE + GRID_SIZE_HALF, n_py_real * GRID_SIZE + GRID_SIZE_HALF]);
        }
        roadLines.push([x_x2, x_y2]);
        return roadLines;
    };
    AstarUtils.routeGrid = function (startGridX, startGridY, toGridX, toGridY, range, throughGridMap, roadLineOffset, ori4, toGridAsThroughEnabled, resaultToPx) {
        if (roadLineOffset === void 0) { roadLineOffset = null; }
        if (ori4 === void 0) { ori4 = true; }
        if (toGridAsThroughEnabled === void 0) { toGridAsThroughEnabled = false; }
        if (resaultToPx === void 0) { resaultToPx = false; }
        var _ARoad = new AstarUtils();
        _ARoad.ori4 = true;
        var mapmapmap = [];
        var thisBox;
        var mapSize = range * 2 + 1;
        for (var y = 0; y < mapSize; y++) {
            var mapmapmapY = mapmapmap[y] = [];
            for (var x = 0; x < mapSize; x++) {
                thisBox = new AstarBox();
                mapmapmapY.push(thisBox);
                thisBox.px = x;
                thisBox.py = y;
                var throughGridMapX = throughGridMap[x];
                if (!throughGridMapX || !throughGridMapX[y]) {
                    thisBox.go = 1;
                }
                else {
                    thisBox.go = 0;
                }
            }
        }
        var goX = mapmapmap[startGridY];
        if (!goX)
            return null;
        var go = goX[startGridX];
        if (!go)
            return null;
        var toX = mapmapmap[toGridY];
        if (!toX)
            return null;
        var to = toX[toGridX];
        if (!to)
            return null;
        if (toGridAsThroughEnabled) {
            to.go = 0;
        }
        var roadList = _ARoad.searchRoad(go, to, mapmapmap);
        if (roadList.length < 1) {
            return null;
        }
        var roadLines = [];
        var offsetX = roadLineOffset ? roadLineOffset.x : 0;
        var offsetY = roadLineOffset ? roadLineOffset.y : 0;
        for (var i = roadList.length - 1; i > 0; i--) {
            var targetGridX = roadList[i].px + offsetX;
            var targetGridY = roadList[i].py + offsetY;
            roadLines.push([targetGridX, targetGridY]);
        }
        roadLines.push([toGridX + offsetX, toGridY + offsetY]);
        if (resaultToPx) {
            var roadLinesLen = roadLines.length;
            for (var i = 0; i < roadLinesLen; i++) {
                var g = roadLines[i];
                var gridP = new Point(g[0], g[1]);
                var pos = GameUtils.getGridCenterByGrid(gridP);
                roadLines[i] = [pos.x, pos.y];
            }
        }
        return roadLines;
    };
    AstarUtils.def_bigMoveTo = function (gridW, gridH, obsArr) {
        var n_f_x1 = 0;
        var n_f_y1 = 0;
        var n_f_x2 = gridW;
        var n_f_y2 = gridH;
        var mapmapmap = [];
        var thisBox;
        var offsetX = n_f_x1 - 0;
        var offsetY = n_f_y1 - 0;
        var yLen = (n_f_y2 - n_f_y1);
        var xLen = (n_f_x2 - n_f_x1);
        for (var y = 0; y <= yLen; y++) {
            mapmapmap[y] = [];
            for (var x = 0; x <= xLen; x++) {
                thisBox = new AstarBox();
                mapmapmap[y].push(thisBox);
                mapmapmap[y][x].px = x;
                mapmapmap[y][x].py = y;
                mapmapmap[y][x].go = 0;
            }
        }
        var n_obx, n_oby, i;
        for (var _x = n_f_x1; _x < n_f_x2; _x++) {
            for (var _y = n_f_y1; _y < n_f_y2; _y++) {
                if (obsArr[_x][_y]) {
                    mapmapmap[_y - offsetY][_x - offsetX].go = 1;
                }
            }
        }
        this.big_mapmapmap = mapmapmap;
    };
    AstarUtils.bigMoveTo = function (x_x1, x_y1, x_x2, x_y2) {
        var GRID_SIZE = Config.SCENE_GRID_SIZE;
        var GRID_SIZE_HALF = Math.floor(Config.SCENE_GRID_SIZE / 2) - 1;
        var mapmapmap = this.big_mapmapmap;
        var actor_go = mapmapmap[Math.floor(x_y1 / GRID_SIZE)][Math.floor(x_x1 / GRID_SIZE)];
        var actor_to = mapmapmap[Math.floor(x_y2 / GRID_SIZE)][Math.floor(x_x2 / GRID_SIZE)];
        var _ARoad = new AstarUtils();
        var roadList = _ARoad.searchRoad(actor_go, actor_to, mapmapmap);
        if (roadList.length < 1) {
            return null;
        }
        var roadLines = [];
        for (var i = roadList.length - 1; i > 0; i--) {
            var n_px_real = roadList[i].px;
            var n_py_real = roadList[i].py;
            roadLines.push([n_px_real * GRID_SIZE + GRID_SIZE_HALF, n_py_real * GRID_SIZE + GRID_SIZE_HALF]);
        }
        roadLines.push([x_x2, x_y2]);
        return roadLines;
    };
    AstarUtils.prototype.searchRoad = function (start, end, map) {
        this.startPoint = start;
        this.endPoint = end;
        this.mapArr = map;
        this.w = this.mapArr[0].length - 1;
        this.h = this.mapArr.length - 1;
        this.openList.push(this.startPoint);
        var ix = 0;
        while (true) {
            ix++;
            if (this.openList.length < 1 || ix >= AstarUtils.ROAD_FIND_MAX) {
                return this.roadArr;
            }
            var thisPoint = this.openList.splice(this.getMinF(), 1)[0];
            if (thisPoint == this.endPoint) {
                while (thisPoint.father != this.startPoint.father) {
                    this.roadArr.push(thisPoint);
                    thisPoint = thisPoint.father;
                }
                return this.roadArr;
            }
            this.closeList.push(thisPoint);
            this.addAroundPoint(thisPoint);
        }
    };
    AstarUtils.prototype.addAroundPoint = function (thisPoint) {
        var thisPx = thisPoint.px;
        var thisPy = thisPoint.py;
        if (thisPx > 0 && this.mapArr[thisPy][thisPx - 1].go == 0) {
            if (!this.inArr(this.mapArr[thisPy][thisPx - 1], this.closeList)) {
                if (!this.inArr(this.mapArr[thisPy][thisPx - 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy][thisPx - 1], thisPoint, 10);
                    this.openList.push(this.mapArr[thisPy][thisPx - 1]);
                }
                else {
                    this.checkG(this.mapArr[thisPy][thisPx - 1], thisPoint);
                }
            }
            if (!this.ori4 && thisPy > 0 && this.mapArr[thisPy - 1][thisPx - 1].go == 0 && this.mapArr[thisPy - 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy - 1][thisPx - 1], this.closeList) && !this.inArr(this.mapArr[thisPy - 1][thisPx - 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy - 1][thisPx - 1], thisPoint, 14);
                    this.openList.push(this.mapArr[thisPy - 1][thisPx - 1]);
                }
            }
            if (!this.ori4 && thisPy < this.h && this.mapArr[thisPy + 1][thisPx - 1].go == 0 && this.mapArr[thisPy + 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy + 1][thisPx - 1], this.closeList) && !this.inArr(this.mapArr[thisPy + 1][thisPx - 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy + 1][thisPx - 1], thisPoint, 14);
                    this.openList.push(this.mapArr[thisPy + 1][thisPx - 1]);
                }
            }
        }
        if (thisPx < this.w && this.mapArr[thisPy][thisPx + 1].go == 0) {
            if (!this.inArr(this.mapArr[thisPy][thisPx + 1], this.closeList)) {
                if (!this.inArr(this.mapArr[thisPy][thisPx + 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy][thisPx + 1], thisPoint, 10);
                    this.openList.push(this.mapArr[thisPy][thisPx + 1]);
                }
                else {
                    this.checkG(this.mapArr[thisPy][thisPx + 1], thisPoint);
                }
            }
            if (!this.ori4 && thisPy > 0 && this.mapArr[thisPy - 1][thisPx + 1].go == 0 && this.mapArr[thisPy - 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy - 1][thisPx + 1], this.closeList) && !this.inArr(this.mapArr[thisPy - 1][thisPx + 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy - 1][thisPx + 1], thisPoint, 14);
                    this.openList.push(this.mapArr[thisPy - 1][thisPx + 1]);
                }
            }
            if (!this.ori4 && thisPy < this.h && this.mapArr[thisPy + 1][thisPx + 1].go == 0 && this.mapArr[thisPy + 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy + 1][thisPx + 1], this.closeList) && !this.inArr(this.mapArr[thisPy + 1][thisPx + 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy + 1][thisPx + 1], thisPoint, 14);
                    this.openList.push(this.mapArr[thisPy + 1][thisPx + 1]);
                }
            }
        }
        if (thisPy > 0 && this.mapArr[thisPy - 1][thisPx].go == 0) {
            if (!this.inArr(this.mapArr[thisPy - 1][thisPx], this.closeList)) {
                if (!this.inArr(this.mapArr[thisPy - 1][thisPx], this.openList)) {
                    this.setGHF(this.mapArr[thisPy - 1][thisPx], thisPoint, 10);
                    this.openList.push(this.mapArr[thisPy - 1][thisPx]);
                }
                else {
                    this.checkG(this.mapArr[thisPy - 1][thisPx], thisPoint);
                }
            }
        }
        if (thisPy < this.h && this.mapArr[thisPy + 1][thisPx].go == 0) {
            if (!this.inArr(this.mapArr[thisPy + 1][thisPx], this.closeList)) {
                if (!this.inArr(this.mapArr[thisPy + 1][thisPx], this.openList)) {
                    this.setGHF(this.mapArr[thisPy + 1][thisPx], thisPoint, 10);
                    this.openList.push(this.mapArr[thisPy + 1][thisPx]);
                }
                else {
                    this.checkG(this.mapArr[thisPy + 1][thisPx], thisPoint);
                }
            }
        }
    };
    AstarUtils.prototype.inArr = function (obj, arr) {
        for (var m in arr) {
            var mc = arr[m];
            if (obj == mc) {
                return true;
            }
        }
        return false;
    };
    AstarUtils.prototype.setGHF = function (point, thisPoint, G) {
        if (!thisPoint.G) {
            thisPoint.G = 0;
        }
        point.G = thisPoint.G + G;
        point.H = (Math.abs(point.px - this.endPoint.px) + Math.abs(point.py - this.endPoint.py)) * 10;
        point.F = point.H + point.G;
        point.father = thisPoint;
    };
    AstarUtils.prototype.checkG = function (chkPoint, thisPoint) {
        var newG = thisPoint.G + 10;
        if (newG <= chkPoint.G) {
            chkPoint.G = newG;
            chkPoint.F = chkPoint.H + newG;
            chkPoint.father = thisPoint;
        }
    };
    AstarUtils.prototype.getMinF = function () {
        var tmpF = 100000000;
        var id = 0;
        var rid;
        for (var m in this.openList) {
            var mc = this.openList[m];
            if (mc.F < tmpF) {
                tmpF = mc.F;
                rid = id;
            }
            id++;
        }
        return rid;
    };
    AstarUtils.ROAD_FIND_MAX = 200;
    return AstarUtils;
}());
var AstarBox = (function () {
    function AstarBox() {
    }
    return AstarBox;
}());
//# sourceMappingURL=AstarUtils.js.map