/**
 * 自定义游戏数值
 * Created by 黑暗之神KDS on 2020-09-16 19:47:24.
 */
module CustomGameNumber {
    /**
     * 场景数值获取
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f1(trigger: CommandTrigger, p: CustomGameNumberParams_1): number {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return 0;
        var scene = Game.currentScene;
        if (p.type == 0) return scene.id;
        if (p.type == 1) return p.isGrid ? scene.gridWidth : scene.width;
        if (p.type == 2) return p.isGrid ? scene.gridHeight : scene.height;
        if (p.type == 3) return scene.sceneObjects.length - 1;
        if (p.type == 4) {
            var xGrid = p.dataGridUseVar ? Game.player.variable.getVariable(p.x2) : p.x;
            var yGrid = p.dataGridUseVar ? Game.player.variable.getVariable(p.y2) : p.y;
            if (p.dataGridIndex == 0) {
                ProjectUtils.pointHelper.x = xGrid;
                ProjectUtils.pointHelper.y = yGrid;
                var soc = ProjectClientScene.getSceneObjectBySetting(p.dataLayerSoType, p.dataLayerSoIndex, p.dataLayerSoUseVar, p.dataLayerSoVarID, trigger);
                return p.dynamicObs ? (scene.sceneUtils.isObstacleGrid(ProjectUtils.pointHelper, soc) ? 1 : 0) : (scene.sceneUtils.isFixedObstacleGrid(ProjectUtils.pointHelper) ? 1 : 0);
            }
            else {
                return scene.getDataGridState(p.dataGridIndex, xGrid, yGrid) == 1 ? 1 : 0;
            }
        }
        if (p.type == 5) {
            if (p.cameraAttr == 0) return scene.camera.viewPort.x;
            if (p.cameraAttr == 1) return scene.camera.viewPort.y;
            if (p.cameraAttr == 2) return scene.camera.scaleX;
            if (p.cameraAttr == 3) return scene.camera.scaleY;
            if (p.cameraAttr == 4) return scene.camera.rotation;
        }
    }
    /**
     * 场景对象数值
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f2(trigger: CommandTrigger, p: CustomGameNumberParams_2): number {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return 0;
        // 获取对象
        var so: ProjectClientSceneObject = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.varID, trigger);
        if (!(so instanceof ProjectClientSceneObject) && p.type != 13) return 0;
        // 属性
        if (p.type == 0) return so.index;
        if (p.type == 1) return so.modelID;
        if (p.type == 2) {
            if (p.posMode == 0) {
                return so.x;
            }
            else if (p.posMode == 1) {
                return Math.floor(so.x / Config.SCENE_GRID_SIZE);
            }
            else {
                return Game.currentScene.getGlobalPos(so.x, so.y).x;
            }
        }
        if (p.type == 3) {
            if (p.posMode == 0) {
                return so.y;
            }
            else if (p.posMode == 1) {
                return Math.floor(so.y / Config.SCENE_GRID_SIZE);
            }
            else {
                return Game.currentScene.getGlobalPos(so.x, so.y).y;
            }
        }
        if (p.type == 4) return so.avatar.id;
        if (p.type == 5) return so.scale;
        if (p.type == 6) return so.avatarAlpha;
        if (p.type == 7) return so.avatarHue;
        if (p.type == 8) return so.avatarFPS;
        if (p.type == 9) return so.moveSpeed;
        if (p.type == 10) return so.avatar.orientation;
        if (p.type == 11) return so.avatar.actionID;
        if (p.type == 12) return so.avatar.currentFrame;
        if (p.type == 13) {
            var attrValue = so[p.customAttrName];
            return MathUtils.float(attrValue);
        }
        if (p.type == 14) {
            if (!GameBattleHelper.isBattler(so)) return 0;
            var actor = so.actor;
            return getActorAttributes(actor, p.actorAttrName, p.actorCustomAttrName);
        }
    }
    /**
     * 场景对象关系
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f3(trigger: CommandTrigger, p: CustomGameNumberParams_3): number {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return 0;
        // 获取对象
        var so1: ProjectClientSceneObject = ProjectClientScene.getSceneObjectBySetting(p.soType1, p.no1, p.useVar1, p.varID1, trigger);
        if (!so1) return 0;
        var so2: ProjectClientSceneObject = ProjectClientScene.getSceneObjectBySetting(p.soType2, p.no2, p.useVar2, p.varID2, trigger);
        if (!so2) return 0;
        // 比较属性
        if (p.type == 0) return GameUtils.getOriByAngle(MathUtils.direction360(so1.x, so1.y, so2.x, so2.y));
        if (p.type == 1) {
            var dis = Point.distance2(so1.x, so1.y, so2.x, so2.y);
            return p.isGrid ? Math.floor(dis / Config.SCENE_GRID_SIZE) : dis;
        }
        if (p.type == 2) return p.isGrid ? Math.floor((so2.x - so1.x) / Config.SCENE_GRID_SIZE) : so2.x - so1.x;
        if (p.type == 3) return p.isGrid ? Math.floor((so2.y - so1.y) / Config.SCENE_GRID_SIZE) : so2.y - so1.y;
        if (p.type == 4) return MathUtils.direction360(so1.x, so1.y, so2.x, so2.y);
    }
    /**
     * 玩家
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f4(trigger: CommandTrigger, p: CustomGameNumberParams_4): number {
        if (p.type == 0) return Game.player.data.gold;
        if (p.type == 1) {
            var itemDS = ProjectPlayer.getItemDS(p.itemID, false);
            return itemDS ? itemDS.number : 0;
        }
        if (p.type == 2) {
            var attrValue = Game.player.data[p.customAttrName];
            return MathUtils.float(attrValue);
        }
        if (p.type == 3) {
            var actorID = p.actorUseVar ? Game.player.variable.getVariable(p.actorIDVarID) : p.actorID;
            return ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, false).length;
        }
        if (p.type == 4) {
            if (p.actorCheckType == 0) {
                var actorID = p.actorUseVar ? Game.player.variable.getVariable(p.actorIDVarID) : p.actorID;
                var actorDS = ProjectPlayer.getPlayerActorDSByActorID(actorID);
            }
            else {
                var inPartyIndex = p.actorInPartyIndexVarIDUseVar ? Game.player.variable.getVariable(p.actorInPartyIndexVarID) : p.actorInPartyIndex;
                actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
            }
            if (!actorDS) return 0;
            if (p.actorAttrName == 19) {
                var battler = GameBattleHelper.getBattlerByActor(actorDS.actor);
                return battler ? battler.index : -1;
            }
            else {
                return getActorAttributes(actorDS.actor, p.actorAttrName, p.actorCustomAttrName);
            }
        }
        if (p.type == 5) {
            return Game.player.data.party.length;
        }
    }
    /**
     * 界面
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f5(trigger: CommandTrigger, p: CustomGameNumberParams_5): number {
        // 界面按钮焦点数
        if (p.type == 2) {
            if (!FocusButtonsManager.focus) return -1;
            return FocusButtonsManager.focus.selectedIndex;
        }
        // 获取界面
        if (p.useVarID) {
            var uiID = Game.player.variable.getVariable(p.uiIDVarID);
        }
        else {
            uiID = p.type == 1 ? p.uiComp.uiID : p.uiID;
        }
        // 界面ID
        var ui: GUI_BASE = GameUI.get(uiID) as any;
        if (!ui) return 0;
        // 界面本体属性
        if (p.type == 0) {
            return MathUtils.float(ui[p.uiAttrName]);
        }
        // 界面内组件的属性
        else if (p.type == 1) {
            // 根据组件唯一ID找到该组件
            var comp = ui.compsIDInfo[p.uiComp.compID];
            if (!comp) return 0;
            return MathUtils.float(comp[p.uiComp.varName]);
        }
    }
    /**
     * 鼠标
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f6(trigger: CommandTrigger, p: CustomGameNumberParams_6): number {
        if (p.type == 0) return stage.mouseX;
        else if (p.type == 1) return stage.mouseY;
        else if (p.type == 2) return Game.currentScene ? (p.isGrid ? Math.floor(Game.currentScene.localX / Config.SCENE_GRID_SIZE) : Game.currentScene.localX) : 0;
        else if (p.type == 3) return Game.currentScene ? (p.isGrid ? Math.floor(Game.currentScene.localY / Config.SCENE_GRID_SIZE) : Game.currentScene.localY) : 0;
        else if (p.type == 4) return MouseControl.selectSceneObject && MouseControl.selectSceneObject.inScene ? MouseControl.selectSceneObject.index : -1;
        else if (p.type == 5) return ProjectUtils.mouseWhileValue;
        else if (p.type == 6) return p.pointKeyboard;
        else if (p.type == 7) return ProjectUtils.keyboardEvent ? ProjectUtils.keyboardEvent.keyCode : -1;
    }
    /**
     * 模块
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f7(trigger: CommandTrigger, p: CustomGameNumberParams_7): number {
        var dataID = p.useDataVar ? Game.player.variable.getVariable(p.dataVarID) : p.dataID;
        var moduleData = GameData.getModuleData(p.moduleID, dataID);
        if (!moduleData) return 0;
        return MathUtils.float(moduleData[p.attrName]);
    }
    /**
     * 世界
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数
     */
    export function f8(trigger: CommandTrigger, p: CustomGameNumberParams_8): number {
        if (p.type == 0) {
            if (p.presetType == 0) return GameAudio.bgmVolume * 100;
            if (p.presetType == 1) return GameAudio.bgsVolume * 100;
            if (p.presetType == 2) return GameAudio.seVolume * 100;
            if (p.presetType == 3) return GameAudio.tsVolume * 100;
        }
        else {
            return MathUtils.float(WorldData[p.attrName]);
        }
    }
    /**
     * 作用目标
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数
     */
    export function f9(trigger: CommandTrigger, p: CustomGameNumberParams_9): number {
        switch (p.type1) {
            case 0:
                return GUI_Package.actorSelectedIndex;
            case 1:
                var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(GUI_Package.actorSelectedIndex)
                return actorDS ? actorDS.actor.id : 0;
        }
        return 0;
    }
    /**
     * 其他
     */
    export function f10(trigger: CommandTrigger, p: CustomGameNumberParams_10): number {
        switch (p.normalNumber) {
            case 0:
                return !ProjectGame.gameStartTime ? 0 : (Date.now() - ProjectGame.gameStartTime.getTime());
            case 1:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 1000));
            case 2:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 60000));
            case 3:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 3600000));
            case 4:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 86400000));
            case 5:
                return new Date().getSeconds();
            case 6:
                return new Date().getMinutes();
            case 7:
                return new Date().getHours();
            case 8:
                return new Date().getDay();
            case 9:
                return new Date().getDate();
            case 10:
                return new Date().getMonth() + 1;
            case 11:
                return new Date().getFullYear();
            case 12:
                return GUI_SaveFileManager.currentSveFileIndexInfo ? GUI_SaveFileManager.currentSveFileIndexInfo.id : 0;
            case 13:
                return MathUtils.float(trigger.inputMessage[0]);
            case 14:
                return MathUtils.float(trigger.inputMessage[1]);
            case 15:
                return MathUtils.float(trigger.inputMessage[2]);
            case 16:
                return MathUtils.float(trigger.inputMessage[3]);
            case 17:
                return MathUtils.float(trigger.inputMessage[4]);
            case 18:
                return __fCount;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    function getActorAttributes(actor: Module_Actor, attributeIndex: number, actorCustomAttrName: string): number {
        switch (attributeIndex) {
            case 0:
                return GameBattleHelper.getLevelByActor(actor);
            case 1:
                return actor.growUpEnabled ? actor.currentEXP : 0;
            case 2:
                var lv = GameBattleHelper.getLevelByActor(actor);
                return Game.getLevelUpNeedExp(actor, lv);
            case 3:
                return actor.MaxHP;
            case 4:
                return actor.MaxSP;
            case 5:
                return actor.hp;
            case 6:
                return actor.sp;
            case 7:
                return actor.ATK;
            case 8:
                return actor.DEF;
            case 9:
                return actor.MAG;
            case 10:
                return actor.MagDef;
            case 11:
                return actor.HIT;
            case 12:
                return actor.CRIT;
            case 13:
                return actor.MagCrit;
            case 14:
                return actor.DOD;
            case 15:
                return actor.POW;
            case 16:
                return actor.END;
            case 17:
                return actor.AGI;
            case 18:
                var attrValue = actor[actorCustomAttrName];
                return MathUtils.float(attrValue);
        }
    }
}