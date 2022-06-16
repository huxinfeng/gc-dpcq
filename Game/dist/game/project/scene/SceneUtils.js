var SceneUtils = (function () {
    function SceneUtils(scene) {
        this.gridSceneObjects = [];
        this.lastUpdateObsBridgeGrid = [];
        this.scene = scene;
        this.halfGridPlus = Config.SCENE_GRID_SIZE / 2 + 1;
        this.innerBoundaryRect = new Rectangle(Config.SCENE_GRID_SIZE / 2, Config.SCENE_GRID_SIZE / 2, scene.width - Config.SCENE_GRID_SIZE, scene.height - Config.SCENE_GRID_SIZE);
        for (var x = 0; x < scene.gridWidth; x++) {
            var gsx = this.gridSceneObjects[x] = [];
            for (var y = 0; y < scene.gridHeight; y++) {
                gsx[y] = [];
            }
        }
        var maskData = scene.dataLayers[1];
        if (!maskData)
            maskData = scene.dataLayers[1] = [];
        var obsData = scene.dataLayers[0];
        if (!obsData)
            obsData = scene.dataLayers[0] = [];
        var bridgeData = scene.dataLayers[2];
        if (!bridgeData)
            bridgeData = scene.dataLayers[2] = [];
        for (var i = 0; i < scene.LayerDatas.length; i++) {
            var layerData = scene.LayerDatas[i];
            if (layerData.p)
                continue;
            if (layerData.drawMode && layerData.dx == 0 && layerData.dy == 0 && layerData.xMove == 0 && layerData.yMove == 0
                && layerData.scaleX == 1 && layerData.scaleY == 1 && layerData.prospectsPerX == 1 && layerData.prospectsPerY == 1 && layerData.skewX == 0 && layerData.skewY == 0) {
                for (var x = 0; x < scene.gridWidth; x++) {
                    var tileDataW = layerData.tileData[x];
                    if (!tileDataW)
                        continue;
                    for (var y = 0; y < scene.gridHeight; y++) {
                        var layerTileData = tileDataW[y];
                        if (!layerTileData)
                            continue;
                        var tileData;
                        var isAutoData = false;
                        if (layerTileData.texID < 0) {
                            tileData = AutoTileData.getAutoTileData(-layerTileData.texID);
                            isAutoData = true;
                        }
                        else {
                            tileData = TileData.getTileData(layerTileData.texID);
                        }
                        if (!tileData)
                            continue;
                        var tileGridP = GameUtils.getGridPostion(new Point(layerTileData.x, layerTileData.y));
                        mergeTileGridData(x, y, tileData, 0, isAutoData, obsData, tileGridP);
                        mergeTileGridData(x, y, tileData, 1, isAutoData, maskData, tileGridP);
                        mergeTileGridData(x, y, tileData, 2, isAutoData, bridgeData, tileGridP);
                    }
                }
            }
        }
        function mergeTileGridData(x, y, tileData, dataLayerIndex, isAutoData, gridDataFild, tileGridP) {
            var tileGridDatas = tileData.dataLayers[dataLayerIndex];
            if (tileGridDatas) {
                if (isAutoData) {
                    var gridDataX = gridDataFild[x];
                    if (!gridDataX)
                        gridDataX = gridDataFild[x] = [];
                    gridDataX[y] = 1;
                }
                else {
                    var tileDataMaskX = tileGridDatas[tileGridP.x];
                    if (tileDataMaskX && tileDataMaskX[tileGridP.y]) {
                        var gridDataX = gridDataFild[x];
                        if (!gridDataX)
                            gridDataX = gridDataFild[x] = [];
                        gridDataX[y] = 1;
                    }
                }
            }
        }
    }
    SceneUtils.getNearThroughGrid = function (gridP, targetP) {
        if (targetP === void 0) { targetP = null; }
        var nearGrid = 5;
        var currentScene = Game.currentScene;
        var n_32_x1 = gridP.x - nearGrid;
        var n_32_x2 = gridP.x + nearGrid;
        var n_32_y1 = gridP.y - nearGrid;
        var n_32_y2 = gridP.y + nearGrid;
        n_32_x1 = n_32_x1 < 0 ? 0 : n_32_x1;
        n_32_y1 = n_32_y1 < 0 ? 0 : n_32_y1;
        n_32_x2 = n_32_x2 > Game.currentScene.gridWidth ? Game.currentScene.gridWidth : n_32_x2;
        n_32_y2 = n_32_y2 > Game.currentScene.gridHeight ? Game.currentScene.gridHeight : n_32_y2;
        var findGrid = new Point(-1, -1);
        var helpP = new Point();
        var dis_x = 9999;
        var findGrids = [];
        for (var x = n_32_x1; x < n_32_x2; x++) {
            for (var y = n_32_y1; y < n_32_y2; y++) {
                helpP.x = x;
                helpP.y = y;
                if (currentScene.sceneUtils.isOutsideByGrid(helpP)) {
                    continue;
                }
                if (currentScene.sceneUtils.isObstacleGrid(helpP)) {
                    continue;
                }
                var n_jin_x32 = Math.abs(x - gridP.x);
                var n_jin_y32 = Math.abs(y - gridP.y);
                var dis = n_jin_x32 + n_jin_y32;
                if (targetP) {
                    if (dis <= dis_x) {
                        findGrid.x = x;
                        findGrid.y = y;
                        if (dis_x != dis)
                            findGrids.length = 0;
                        dis_x = dis;
                        findGrids.push(new Point(findGrid.x, findGrid.y));
                    }
                }
                else {
                    if (dis < dis_x) {
                        findGrid.x = x;
                        findGrid.y = y;
                        dis_x = dis;
                    }
                }
            }
        }
        if (targetP) {
            findGrid = new Point(-1, -1);
            dis_x = 9999;
            for (var p in findGrids) {
                var tp = findGrids[p];
                var n_jin_x32 = Math.abs(tp.x - targetP.x);
                var n_jin_y32 = Math.abs(tp.y - targetP.y);
                var dis = n_jin_x32 + n_jin_y32;
                if (dis < dis_x) {
                    findGrid = tp;
                    dis_x = dis;
                }
            }
        }
        if (findGrid.x == -1)
            return null;
        return findGrid;
    };
    SceneUtils.twoPointHasObstacle = function (x1, y1, x2, y2, scene, except, exceptToP) {
        if (except === void 0) { except = null; }
        if (exceptToP === void 0) { exceptToP = false; }
        var p1 = new Point(x1, y1);
        var p2 = new Point(x2, y2);
        var step = 16;
        var dis = Point.distance(p1, p2);
        var nArr = [];
        var len = Math.floor(dis / step);
        for (var i = 1; i <= len; i++) {
            var newX = (p2.x - p1.x) / (dis / step) * i + p1.x;
            var newY = (p2.y - p1.y) / (dis / step) * i + p1.y;
            if (exceptToP && newX == x2 && newY == y2)
                continue;
            nArr.push(new Point(newX, newY));
        }
        if (!exceptToP)
            nArr.push(new Point(x2, y2));
        for (var s in nArr) {
            if (scene.sceneUtils.isObstacle(nArr[s], except)) {
                return true;
            }
        }
        return false;
    };
    SceneUtils.prototype.isObstacle = function (p, except) {
        if (except === void 0) { except = null; }
        var map32 = GameUtils.getGridPostion(p);
        return this.isObstacleGrid(map32, except);
    };
    SceneUtils.prototype.isObstacleGrid = function (gridP, except) {
        if (except === void 0) { except = null; }
        if (this.isOutsideByGrid(gridP)) {
            return true;
        }
        var gridStatus = this.getGridDynamicObsStatus(gridP, except);
        if (gridStatus == 1) {
            return false;
        }
        else if (gridStatus == 2) {
            return true;
        }
        return this.isFixedObstacleGrid(gridP);
    };
    SceneUtils.prototype.isFixedObstacleGrid = function (gridP, calcBridge) {
        if (calcBridge === void 0) { calcBridge = true; }
        if (!calcBridge)
            return this.scene.getDataGridState(0, gridP.x, gridP.y) == 1;
        return this.scene.getDataGridState(0, gridP.x, gridP.y) == 1 && this.scene.getDataGridState(2, gridP.x, gridP.y) != 1;
    };
    SceneUtils.prototype.isFixedBridgeGrid = function (gridP) {
        return this.scene.getDataGridState(2, gridP.x, gridP.y) == 1;
    };
    SceneUtils.prototype.isMask = function (p) {
        var map32 = GameUtils.getGridPostion(p);
        return this.isMaskGrid(map32);
    };
    SceneUtils.prototype.isMaskGrid = function (gridP) {
        return this.scene.getDataGridState(1, gridP.x, gridP.y) == 1;
    };
    SceneUtils.prototype.isOutside = function (p, innerBoundary) {
        if (innerBoundary === void 0) { innerBoundary = false; }
        if (innerBoundary) {
            if (p.x < this.innerBoundaryRect.x || p.x >= this.innerBoundaryRect.right || p.y < this.innerBoundaryRect.y || p.y >= this.innerBoundaryRect.bottom) {
                return true;
            }
        }
        else {
            if (p.x < 0 || p.x >= this.scene.width || p.y < 0 || p.y >= this.scene.height) {
                return true;
            }
        }
        return false;
    };
    SceneUtils.prototype.isOutsideByGrid = function (gridP) {
        if (gridP.x < 0 || gridP.x >= this.scene.gridWidth || gridP.y < 0 || gridP.y >= this.scene.gridHeight) {
            return true;
        }
        return false;
    };
    SceneUtils.prototype.limitInside = function (p, innerBoundary) {
        if (innerBoundary === void 0) { innerBoundary = false; }
        var wh = Scene.getRealWidth(this.scene);
        wh.width -= 1;
        wh.height -= 1;
        if (!innerBoundary) {
            if (p.x < 0) {
                p.x = 0;
            }
            else if (p.x > wh.width) {
                p.x = wh.width;
            }
            if (p.y < 0) {
                p.y = 0;
            }
            else if (p.y > wh.height) {
                p.y = wh.height;
            }
        }
        else {
            if (p.x < this.innerBoundaryRect.x) {
                p.x = this.innerBoundaryRect.x;
            }
            else if (p.x >= this.innerBoundaryRect.right) {
                p.x = this.innerBoundaryRect.right;
            }
            if (p.y < this.innerBoundaryRect.y) {
                p.y = this.innerBoundaryRect.y;
            }
            else if (p.y >= this.innerBoundaryRect.bottom) {
                p.y = this.innerBoundaryRect.bottom;
            }
        }
    };
    SceneUtils.prototype.getGridDynamicObsStatus = function (gridP, excepter, gridSceneObjects) {
        if (excepter === void 0) { excepter = null; }
        if (gridSceneObjects === void 0) { gridSceneObjects = null; }
        if (this.isOutsideByGrid(gridP))
            return 2;
        if (!gridSceneObjects)
            gridSceneObjects = this.gridSceneObjects[gridP.x][gridP.y];
        var len = gridSceneObjects.length;
        var res = 0;
        var allSo = null;
        var hasDyncmicObs = false;
        for (var i = 0; i < len; i++) {
            var so = gridSceneObjects[i];
            if (so == excepter)
                continue;
            if (so == null)
                continue;
            if (so.isJumping)
                continue;
            if (so.bridge) {
                return 1;
            }
            if (!so.through && so.avatarID != 0) {
                hasDyncmicObs = true;
            }
        }
        return hasDyncmicObs ? 2 : 0;
    };
    SceneUtils.prototype.updateDynamicObsAndBridge = function (soc, inScene, posGrid) {
        if (posGrid === void 0) { posGrid = null; }
        if (Config.EDIT_MODE)
            return false;
        var nowGrid;
        if (posGrid != null) {
            nowGrid = new Point(posGrid.x, posGrid.y);
        }
        else {
            var nowP = new Point(soc.x, soc.y);
            nowGrid = GameUtils.getGridPostion(nowP, nowP);
        }
        var lastGrid = this.lastUpdateObsBridgeGrid[soc.index];
        if (lastGrid && nowGrid.x == lastGrid.x && nowGrid.y == lastGrid.y && inScene)
            return false;
        if (lastGrid) {
            var sos = this.gridSceneObjects[lastGrid.x][lastGrid.y];
            sos.splice(sos.indexOf(soc), 1);
            delete this.lastUpdateObsBridgeGrid[soc.index];
        }
        if (inScene) {
            var sos = this.gridSceneObjects[nowGrid.x][nowGrid.y];
            sos.push(soc);
            this.lastUpdateObsBridgeGrid[soc.index] = nowGrid;
            return true;
        }
        return false;
    };
    SceneUtils.prototype.touchCheck = function (checker, useGridObstacle, posP, posGridP, trendP, trendGridP) {
        if (posGridP === void 0) { posGridP = null; }
        if (trendP === void 0) { trendP = null; }
        if (!posGridP)
            posGridP = GameUtils.getGridPostion(posP);
        if (useGridObstacle) {
            return this.collsionCheckGrid(checker, posP, posGridP, trendP);
        }
        else {
            return this.collsionCheckRect(checker, posP, trendP, posGridP);
        }
    };
    SceneUtils.getAroundPositions = function (mode, so1, so2, positionSize, calcWantToGo, gridSize) {
        if (positionSize === void 0) { positionSize = 1; }
        if (calcWantToGo === void 0) { calcWantToGo = true; }
        if (gridSize === void 0) { gridSize = Config.SCENE_GRID_SIZE; }
        positionSize = Math.max(Math.min(MathUtils.int(positionSize), 8), 1);
        var dirOffsetMapping = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
        var antiClockwiseMapping = [null, 0, 1, 2, 7, null, 3, 6, 5, 4];
        var offsets = [0, -1, 1, -2, 2, -3, 3, 4];
        if (mode == 0) {
            var startIndex = antiClockwiseMapping[so1.avatar.orientation];
            var flip = -1;
        }
        else if (mode == 1) {
            var angle = MathUtils.direction360(so1.x, so1.y, so2.x, so2.y);
            startIndex = antiClockwiseMapping[GameUtils.getOriByAngle(angle)];
            flip = 1;
        }
        var newDirOffsetMapping = [];
        for (var i = 0; i < dirOffsetMapping.length; i++) {
            var newDirOffset = dirOffsetMapping[(startIndex + i) % dirOffsetMapping.length];
            newDirOffsetMapping.push(newDirOffset);
        }
        var finalPostions = [];
        var sceneObjects = Game.currentScene.sceneObjects;
        for (var i = 0; i < newDirOffsetMapping.length; i++) {
            var offset = offsets[i];
            offset = (offset + 8) % 8;
            var positionOffset = newDirOffsetMapping[offset];
            var finalPosition = new Point(so1.x + gridSize * positionOffset[0] * flip, so1.y + gridSize * positionOffset[1] * flip);
            var finalPositionGrid = GameUtils.getGridPostion(finalPosition);
            if (Game.currentScene.sceneUtils.isObstacleGrid(finalPositionGrid, so2))
                continue;
            if (calcWantToGo && so2) {
                var wantToGoExist = false;
                for (var s = 0; s < sceneObjects.length; s++) {
                    var btSo = sceneObjects[s];
                    if (!btSo || btSo == so2)
                        continue;
                    if (btSo.wantToGoGrid && btSo.wantToGoGrid.x == finalPositionGrid.x && btSo.wantToGoGrid.y == finalPositionGrid.y) {
                        wantToGoExist = true;
                        break;
                    }
                }
                if (wantToGoExist)
                    continue;
            }
            if (so2)
                so2.wantToGoGrid = finalPositionGrid;
            finalPostions.push(finalPosition);
            if (finalPostions.length >= positionSize)
                break;
        }
        return finalPostions;
    };
    SceneUtils.prototype.collsionCheckGrid = function (checker, posP, posGridP, trendP, calcTrendP) {
        if (posGridP === void 0) { posGridP = null; }
        if (trendP === void 0) { trendP = null; }
        if (calcTrendP === void 0) { calcTrendP = true; }
        var res = { isObstacle: false, touchSceneObjects: [], alreadyCalcPosRect: false };
        if (!checker.touchEnabled)
            return res;
        if (this.isOutside(posP) || this.isOutsideByGrid(posGridP)) {
            res.isObstacle = true;
            return res;
        }
        var touchSceneObjects = this.gridSceneObjects[posGridP.x][posGridP.y];
        if (WorldData.moveToGridCenter) {
            var _touchSceneObjects = [];
            var errorValue = Math.max(checker.moveSpeed / 130, 1);
            for (var i = 0; i < touchSceneObjects.length; i++) {
                var touchSo = touchSceneObjects[i];
                if ((touchSo.through || touchSo.avatarID == 0)) {
                    var standPos = GameUtils.getGridCenterByGrid(touchSo.posGrid);
                    if (!touchSo.isMoving && standPos.x == touchSo.x && standPos.y == touchSo.y) {
                        if (Math.abs(posP.x - touchSo.x) < errorValue && Math.abs(posP.y - touchSo.y) < errorValue) {
                            _touchSceneObjects.push(touchSo);
                        }
                    }
                    else {
                        _touchSceneObjects.push(touchSo);
                    }
                }
                else {
                    _touchSceneObjects.push(touchSo);
                }
            }
            touchSceneObjects = _touchSceneObjects;
        }
        else {
            touchSceneObjects = this.gridSceneObjects[posGridP.x][posGridP.y];
        }
        if (calcTrendP) {
            var dGridX = Math.round(trendP.x - posP.x);
            var dGridY = Math.round(trendP.y - posP.y);
            var trendPToGrid = new Point(Math.floor((posP.x - dGridX * this.halfGridPlus) / Config.SCENE_GRID_SIZE) + dGridX, Math.floor((posP.y - dGridY * this.halfGridPlus) / Config.SCENE_GRID_SIZE) + dGridY);
            var trendPTouchRes = this.collsionCheckGrid(checker, trendP, trendPToGrid, null, false);
            touchSceneObjects = touchSceneObjects.concat(trendPTouchRes.touchSceneObjects);
            if (trendPTouchRes.isObstacle)
                res.isObstacle = true;
        }
        res.touchSceneObjects = touchSceneObjects;
        if (checker.through)
            return res;
        if (posGridP.x == checker.posGrid.x && posGridP.y == checker.posGrid.y)
            return res;
        var dynamicObsState = this.getGridDynamicObsStatus(posGridP, checker, res.touchSceneObjects);
        if (dynamicObsState == 2) {
            res.isObstacle = true;
        }
        else if (dynamicObsState != 1 && this.isFixedObstacleGrid(posGridP)) {
            res.isObstacle = true;
        }
        return res;
    };
    SceneUtils.prototype.collsionCheckRect = function (checker, p, trendP, gridP) {
        if (gridP === void 0) { gridP = null; }
        var res = { isObstacle: false, touchSceneObjects: [], alreadyCalcPosRect: false };
        if (!checker.touchEnabled)
            return res;
        var size = WorldData.sceneObjectCollisionSize;
        var fixedGridRangleOffset = size / 2;
        if (!gridP)
            gridP = GameUtils.getGridPostion(p);
        if (this.isOutside(p, true)) {
            res.isObstacle = true;
            return res;
        }
        checker.posRect.x = p.x;
        checker.posRect.y = p.y;
        checker.posRect.width = checker.posRect.height = size - 1;
        res.alreadyCalcPosRect = true;
        var pRect = checker.posRect;
        var targetGrid = new Point;
        var fixRect = new Rectangle(0, 0, Config.SCENE_GRID_SIZE - 1, Config.SCENE_GRID_SIZE - 1);
        var dirOffsetMapping = [[0, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
        var hasBridge = false;
        if (this.isFixedBridgeGrid(gridP))
            hasBridge = true;
        else if (this.getGridDynamicObsStatus(gridP, checker) == 1)
            hasBridge = true;
        else {
            var trendPToGrid = new Point(gridP.x + Math.round(trendP.x - p.x), gridP.y + Math.round(trendP.y - p.y));
            if (!this.isOutsideByGrid(trendPToGrid)) {
                if (this.isFixedBridgeGrid(trendPToGrid))
                    hasBridge = true;
                else if (this.getGridDynamicObsStatus(trendPToGrid, checker) == 1)
                    hasBridge = true;
            }
        }
        for (var i = 0; i < dirOffsetMapping.length; i++) {
            var d = dirOffsetMapping[i];
            targetGrid.x = gridP.x + d[0];
            targetGrid.y = gridP.y + d[1];
            if (this.isOutsideByGrid(targetGrid))
                continue;
            var gridSceneObjects = this.gridSceneObjects[targetGrid.x][targetGrid.y];
            var gridSceneObjectsLen = gridSceneObjects.length;
            for (var s = 0; s < gridSceneObjectsLen; s++) {
                var tSo = gridSceneObjects[s];
                if (tSo != checker) {
                    if (tSo.isJumping)
                        continue;
                    tSo.posRect.x = tSo.x;
                    tSo.posRect.y = tSo.y;
                    var tRect = tSo.posRect;
                    var jRect = tRect.intersection(pRect);
                    if (jRect && jRect.width > 0 && jRect.height > 0) {
                        res.touchSceneObjects.push(tSo);
                        if (!hasBridge) {
                            if (tSo.bridge)
                                hasBridge = true;
                            else if (!checker.through && !tSo.through && tSo.avatar.id != 0) {
                                var d1 = Point.distanceSquare(tSo.pos, p);
                                var d2 = Point.distanceSquare(tSo.pos, trendP);
                                if (d2 < d1) {
                                    res.isObstacle = true;
                                }
                            }
                        }
                    }
                }
            }
            if (!res.isObstacle && !hasBridge && !checker.through) {
                if (this.isFixedObstacleGrid(targetGrid, false)) {
                    var targetGridPosX = targetGrid.x * Config.SCENE_GRID_SIZE + fixedGridRangleOffset;
                    var targetGridPosY = targetGrid.y * Config.SCENE_GRID_SIZE + fixedGridRangleOffset;
                    fixRect.x = targetGridPosX;
                    fixRect.y = targetGridPosY;
                    var jRect = fixRect.intersection(pRect);
                    if (jRect && jRect.width > 0 && jRect.height > 0) {
                        if (this.isFixedBridgeGrid(targetGrid)) {
                            hasBridge = true;
                            continue;
                        }
                        var d1 = new Point(targetGridPosX, targetGridPosY).distance(p.x, p.y);
                        var d2 = new Point(targetGridPosX, targetGridPosY).distance(trendP.x, trendP.y);
                        if (d2 < d1) {
                            res.isObstacle = true;
                        }
                    }
                }
            }
        }
        if (hasBridge) {
            res.isObstacle = false;
        }
        return res;
    };
    return SceneUtils;
}());
//# sourceMappingURL=SceneUtils.js.map