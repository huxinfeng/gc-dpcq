/**
 * 自定义条件分歧
 * Created by 黑暗之神KDS on 2020-09-16 19:47:24.
 */
module CustomCondition {
    /**
     * 场景对象
     * @param trigger 事件触发器
     * @param p 自定义参数
     * @return [boolean] 
     */
    export function f1(trigger: CommandTrigger, p: CustomConditionParams_1): boolean {
        // 获取场景对象
        var so = ProjectClientScene.getSceneObjectBySetting(p.soType, p.soIndex, p.useVar, p.soIndexVarID, trigger);
        if (!so) return;
        // 非自定义属性的话如果不是1号原型则忽略掉其他项属性
        if (p.type != 13 && !(so instanceof ProjectClientSceneObject)) return false;
        // 类别
        if (p.type == 0) return so.inScene;
        if (p.type == 1) return so.fixOri;
        if (p.type == 2) return so.selectEnabled;
        if (p.type == 3) return so.bridge;
        if (p.type == 4) return so.through;
        if (p.type == 5) return so.moveAutoChangeAction;
        if (p.type == 6) return so.ignoreCantMove;
        if (p.type == 7) return so.autoPlayEnable;
        if (p.type == 8) return so.isMoving;
        if (p.type == 9) return so.isJumping;
        if (p.type == 10) return so.repeatedTouchEnabled;
        if (p.type == 11) return so.onlyPlayerTouch;
        if (p.type == 12) return so.waitTouchEvent;
        if (p.type == 13) return so[p.soCustomAttrName] ? true : false;
        // ====== 战斗相关 ======
        if (p.type >= 15) if (!GameBattleHelper.isBattler(so)) return false;
        if (p.type == 15) return true;
        if (p.type == 16) return GameBattleHelper.isPlayerCamp(so);
        if (p.type == 17) return GameBattleHelper.isEnemyCamp(so);
        if (p.type == 18) return GameBattleHelper.isInPlayerParty(so);
        if (p.type == 19) {
            var skillID = p.skillUseVar ? Game.player.variable.getVariable(p.skillIDVarID) : p.skillID;
            return Game.getActorSkillBySkillID(so.actor, skillID) != null;
        }
        if (p.type == 20) {
            var equipID = p.equipUseVar ? Game.player.variable.getVariable(p.equipIDVarID) : p.equipID;
            return Game.getActorEquipByEquipID(so.actor, equipID) != null;
        }
        if (p.type == 21) {
            var statusID = p.statusUseVar ? Game.player.variable.getVariable(p.statusIDVarID) : p.statusID;
            var status = GameBattleHelper.getBattlerStatus(so, statusID);
            return status && status.currentLayer >= p.statusLayer;
        }
        if (p.type == 22) {
            var classID = p.classUseVar ? Game.player.variable.getVariable(p.classIDVarID) : p.classID;
            return so.actor.class == classID;
        }
        if (p.type == 23) {
            return so.isDead;
        }
        if (p.type == 24) {
            return !GameBattleHelper.canMove(so);
        }
        if (p.type == 25) {
            return !GameBattleHelper.canAttack(so);
        }
        if (p.type == 26) {
            return !GameBattleHelper.canUseSkill(so);
        }
        if (p.type == 27) {
            return so.battleAI.hateList.length != 0;
        }
        if (p.type == 28) {
            return !GameBattleHelper.isCanHitBy(so, null, null);
        }
        if (p.type == 29) {
            return so.inBattle;
        }
    }
    /**
     * 界面
     * @param trigger 事件触发器
     * @param p 自定义参数
     * @return [boolean] 
     */
    export function f2(trigger: CommandTrigger, p: CustomConditionParams_2): boolean {
        // 获取界面
        if (p.checkType == 0) {
            if (p.useVarID) {
                var uiID = Game.player.variable.getVariable(p.uiIDVarID);
            }
            else {
                uiID = p.uiID;
            }
        }
        else {
            uiID = p.uiComp.uiID;
        }
        // 界面ID
        var ui: GUI_BASE = GameUI.get(uiID) as any;
        if (!ui) {
            if (p.checkType == 0 && p.type == 3) return true;
            return false;
        }
        if (p.checkType == 1) {
            // 根据组件唯一ID找到该组件
            var comp = ui.compsIDInfo[p.uiComp.compID];
            if (!comp) return false;
            var value = comp[p.uiComp.varName];
            return value ? true : false;
        }
        if (p.type == 0) return true;
        if (p.type == 1) return false;
        if (p.type == 2) return ui.stage ? true : false;
        if (p.type == 3) return ui.stage ? false : true;
        if (p.type == 4) {
            let topLayer = Game.layer.uiLayer.numChildren - 1;
            let topUI = Game.layer.uiLayer.getChildAt(topLayer);
            if (!topUI) return false;
            // 虚拟键盘的情况下
            if (topUI == GameUI.get(30)) {
                if (topLayer >= 1) return Game.layer.uiLayer.getChildAt(topLayer - 1) == ui;
                else return false;
            }
            else {
                return topUI == ui;
            }
        }
    }
    /**
     * 系统信息
     */
    export function f3(trigger: CommandTrigger, p: CustomConditionParams_3): boolean {
        if (p.type == 0) return !WorldData.menuEnabled;
        if (p.type == 1) return !Controller.inSceneEnabled;
        if (p.type == 2) return Game.pause;
        if (p.type == 3) return GameDialog.isInDialog;
        if (p.type == 4) return WorldData[p.worldAttrName] ? true : false;
        if (p.type == 5) return Browser.onMobile;
        if (p.type == 6) return os.platform == 3;
        if (p.type == 7) {
            if (!ProjectUtils.keyboardEvent) return false;
            var systemKeyName = GUI_Setting.SYSTEM_KEYS[p.systemKey];
            var systemKeyboardInfo: { index: number, name: string, keys: number[] } = GUI_Setting.KEY_BOARD[systemKeyName];
            return systemKeyboardInfo.keys.indexOf(ProjectUtils.keyboardEvent.keyCode) != -1;
        }
    }
    /**
     * 战斗相关
     */
    export function f4(trigger: CommandTrigger, p: CustomConditionParams_4): boolean {
        if (p.type == 0) return WorldData.displayBattlerPointBar;
        if (p.type == 1) return WorldData.deadPlayerActorLeaveParty;
        if (p.type == 2) return WorldData.showVigilanceRange;
    }
    /**
     * 玩家拥有
     */
    export function f5(trigger: CommandTrigger, p: CustomConditionParams_5): boolean {
        switch (p.ownType) {
            case 0:
                var itemID = p.itemUseVar ? Game.player.variable.getVariable(p.itemIDVarID) : p.itemID;
                return ProjectPlayer.getItem(itemID) != null;
            case 1:
                var equipID = p.equipUseVar ? Game.player.variable.getVariable(p.equipIDVarID) : p.equipID;
                return ProjectPlayer.getItemDS(equipID, true) != null;
            case 2:
                var actorID = p.actorUseVar ? Game.player.variable.getVariable(p.actorIDVarID) : p.actorID;
                return ProjectPlayer.getPlayerActorDSByActorID(actorID) != null;
        }
    }
    /**
     * 角色
     */
    export function f6(trigger: CommandTrigger, cp: CustomConditionParams_6): boolean {
        // -- 获取角色
        var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.actorUseVar, cp.actorID, cp.actorIDVarID,
            cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
            cp.soType + 1, cp.soUseVar, cp.soIndex, cp.soIndexVarID, trigger);
        // -- 没有找到角色的情况则忽略
        if (!actorDS) return;
        // -- 判断
        switch (cp.checkType) {
            // -- 是否拥有指定的技能
            case 0:
                var skillID = MathUtils.int(cp.skillUseVar ? Game.player.variable.getVariable(cp.skillIDVarID) : cp.skillID);
                return Game.getActorSkillBySkillID(actorDS.actor, skillID) != null;
            // -- 是否拥有指定的装备
            case 1:
                var equipID = MathUtils.int(cp.equipUseVar ? Game.player.variable.getVariable(cp.equipIDVarID) : cp.equipID);
                return Game.getActorEquipByEquipID(actorDS.actor, equipID) != null;
        }
        return false;
    }
}