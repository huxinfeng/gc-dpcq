/**
 * 自定义事件命令-战斗指令
 * 
 * -- 调用「进入战斗」的指令
 *    -- 记录战斗前的状态
 *    -- 暂停当前事件执行，直到战斗结束后恢复
 *    -- 触发世界设定中的「战斗开始时事件」
 *    -- 玩家的场景对象变为光标
 * 
 * -- 调用「进入结束」的指令：默认模板的常规战斗结束后奖励框中点击后调用，或是自行在任意时中断战斗
 *    -- 恢复战前的状态
 *    -- 触发世界设定中的「战斗结束时事件」
 *    -- 恢复调用进入战斗的事件，使之后续能够正常执行
 * 
 * 
 * 
 * 
 * Created by 黑暗之神KDS on 2021-01-12 07:06:34.
 */
module CommandExecute {
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗参数设定
     */
    export function customCommand_5003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5003): void {
        var bool = cp.value == 0 ? true : false;
        switch (cp.paramType) {
            case 0:
                WorldData.deadPlayerActorLeaveParty = bool;
                return;
            case 1:
                Game.player.data.aiMode = bool ? 1 : 0;
                return;
            case 2:
                WorldData.displayBattlerPointBar = bool;
                EventUtils.happen(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE);
                return;
            case 3:
                WorldData.whenDeadContinue = bool;
                return;
            case 4:
                WorldData.showVigilanceRange = bool;
                EventUtils.happen(Game, Game.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE);
                return;
        }
    }
    /**
     * 增减战斗者的生命
     */
    export function customCommand_5004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5004): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || soc.isDead) return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.actor;
        actor.hp += cp.symbol == 0 ? value : -value;
        actor.hp = Math.max(Math.min(actor.hp, actor.MaxHP), 0);
        soc.refreshPointBar();
        if (actor.hp == 0) {
            GameBattlerHandler.dead(soc, soc);
        }
    }
    /**
     * 增减战斗者的魔法
     */
    export function customCommand_5005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5005): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || soc.isDead) return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.actor;
        actor.sp += cp.symbol == 0 ? value : -value;
        actor.sp = Math.max(Math.min(actor.sp, actor.MaxSP), 0);
        soc.refreshPointBar();
    }
    /**
     * 增减战斗者的状态
     */
    export function customCommand_5006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5006): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || soc.isDead) return;
        var statusID = MathUtils.int(cp.statusUseVar ? Game.player.variable.getVariable(cp.statusIDVarID) : cp.statusID);
        var actor = soc.actor;
        if (cp.symbol == 0) {
            GameBattlerHandler.addStatus(soc, statusID, soc, cp.force);
        }
        else if (cp.symbol == 1) {
            GameBattlerHandler.removeStatus(soc, statusID);
        }
        else if (cp.symbol == 2) {
            GameBattlerHandler.removeAllStatus(soc);
        }
        var level = GameBattleHelper.getLevelByActor(actor);
        Game.refreshActorAttribute(actor, level, soc);
    }
    /**
     * 显示伤害
     */
    export function customCommand_5007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5007): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc) return;
        var actor = soc.actor;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        if (cp.type <= 2) value = -value;
        GameBattleAction.showDamage(soc, cp.type, value, cp.isCrit);
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 增减装备
     */
    export function customCommand_6001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_6001): void {
        var equipID = p.useVar1 ? Game.player.variable.getVariable(p.equipIDVarID) : p.equipID;
        var num = p.useVar2 ? Game.player.variable.getVariable(p.numVarID) : p.num;
        // 找不到预设装备的话则忽略
        if (!GameData.getModuleData(4, equipID)) return;
        // 浮动装备设定
        if (p.attributeRand && p.equipRandSetting.length > 0 && p.symbol == 0) {
            var equipAttributeNames = ["maxHP", "maxSP", "atk", "def", "mag", "magDef", "agi", "moveGrid", "hit", "crit", "magCrit"];
            // 计算总概率和
            var probabilityCount = 0;
            for (var i = 0; i < p.equipRandSetting.length; i++) {
                probabilityCount += p.equipRandSetting[i].probability;
            }
            if (probabilityCount < 100) probabilityCount = 100;
            // 生成装备
            for (var n = 0; n < num; n++) {
                var newEquip: Module_Equip = GameData.newModuleData(4, equipID, true);
                for (var i = 0; i < p.equipRandSetting.length; i++) {
                    var thisSetting = p.equipRandSetting[i];
                    var thisPer = thisSetting.probability / probabilityCount;
                    if (Math.random() < thisPer) {
                        // 计算属性变化率
                        for (var s = 0; s < equipAttributeNames.length; s++) {
                            var per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                            var newValue = newEquip[equipAttributeNames[s]] * per;
                            newEquip[equipAttributeNames[s]] = Math.ceil(newValue);
                        }
                        break;
                    }
                }
                ProjectPlayer.addEquipByInstance(newEquip);
            }
        }
        else {
            ProjectPlayer.changeItemNumber(equipID, p.symbol == 0 ? num : -num, true);
        }
    }
    /**
     * 替换队伍角色
     */
    export function customCommand_6002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6002): void {
        var actorID = MathUtils.int(cp.useVar ? Game.player.variable.getVariable(cp.actorIDVarID) : cp.actorID);
        if (!GameData.getModuleData(1, actorID)) return;
        if (cp.type == 0) {
            var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
            ProjectPlayer.addPlayerActorByActorID(actorID, lv);
        }
        else if (cp.type == 1) {
            ProjectPlayer.removePlayerActorByActorID(actorID);
        }
        else {
            // 获取等级
            var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
            // 替换主角的数据
            var newActor: Module_Actor = GameData.newModuleData(1, actorID, true);
            var newActorDS = new DataStructure_inPartyActor();
            newActorDS.actor = newActor;
            newActorDS.lv = Math.min(lv, newActor.MaxLv);
            // 替换成新的该队伍数据
            Game.player.data.party.splice(Game.player.sceneObject.inPartyIndex, 1, newActorDS);
            Game.player.sceneObject.actor = newActorDS.actor;
            newActorDS.sceneObjectIndex = Game.player.sceneObject.index;
            Game.refreshActorAttribute(Game.player.sceneObject.actor, newActorDS.lv, Game.player.sceneObject);
            Game.player.sceneObject.setPointFullState();
            Game.player.sceneObject.refreshPointBar();
            GameData.changeModuleDataToCopyMode(newActorDS.actor, 1);
            // 刷新学习的技能
            ProjectPlayer.initPlayerActor(Game.player.sceneObject.inPartyIndex);
            // 更换行走图
            Game.player.sceneObject.avatarID = newActor.avatar;
            Game.player.sceneObject.avatarFrame = 1;
            // 刷新主界面
            var guiMain = GameUI.get(13) as GUI_Main;
            if (guiMain) guiMain.refreshAll();
        }
    }
    /**
     * 替换角色的技能
     */
    export function customCommand_6003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6003): void {
        // 获取角色
        var actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        // 获取对应的场景对象
        var battler = GameBattleHelper.getBattlerByActor(actor);
        if (!battler) return;
        // 获取技能编号
        var skillID = MathUtils.int(cp.skillUseVar ? Game.player.variable.getVariable(cp.skillIDVarID) : cp.skillID);
        // 学习技能
        if (cp.symbol == 0) {
            if (battler.inPartyIndex >= 0) {
                ProjectPlayer.learnSkillBySkillID(battler.inPartyIndex, skillID);
            }
            else {
                Game.actorLearnSkill(actor, skillID);
            }
        }
        // 忘记技能
        else if (cp.symbol == 1) {
            Game.actorForgetSkill(actor, skillID);
        }
        // 忘记全部技能
        else if (cp.symbol == 2) {
            Game.actorForgetAllSkills(actor);
        }
    }
    /**
     * 替换角色的道具
     */
    export function customCommand_6004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6004): void {
        // 获取角色
        var actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        // 获取装备编号
        var equipID = MathUtils.int(cp.equipUseVar ? Game.player.variable.getVariable(cp.equipIDVarID) : cp.equipID);
        // 判断是否是玩家的角色
        var inPartyActorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        // 记录卸下的装备
        var takeOffEquip: Module_Equip;
        // 穿戴
        if (cp.symbol == 0) {
            if (inPartyActorDS && cp.fromPlayerPackage) {
                // -- 如果该装备存在于玩家的背包的话则穿戴
                var fromPackageEquip = ProjectPlayer.getItemDS(equipID, true);
                if (fromPackageEquip) ProjectPlayer.wearPlayerActorEquip(inPartyActorIndex, fromPackageEquip.equip);
            }
            else {
                // 新建一件装备进行穿戴
                if (GameData.getModuleData(4, equipID)) {
                    var newEquip = GameData.newModuleData(4, equipID);
                    Game.wearActorEquip(actorDS.actor, newEquip);
                }
            }
        }
        // 卸下/移除
        else if (cp.symbol == 1 || cp.symbol == 3) {
            // 使用部件卸下
            if (cp.usePartID) {
                if (inPartyActorDS && cp.symbol == 1) takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, cp.partID);
                else takeOffEquip = Game.takeOffActorEquipByPartID(actor, cp.partID);
            }
            // 否则查找该件装备是否已经穿戴上了
            else {
                var thisEquip = Game.getActorEquipByEquipID(actor, equipID);
                if (thisEquip) {
                    var thisEquipPartID = thisEquip.partID;
                    if (inPartyActorDS && cp.symbol == 1) takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, thisEquipPartID);
                    else takeOffEquip = Game.takeOffActorEquipByPartID(actor, thisEquipPartID);
                }
            }
        }
        // 卸下/移除全部装备
        else if (cp.symbol == 2 || cp.symbol == 4) {
            if (inPartyActorDS && cp.symbol == 2) ProjectPlayer.takeOffPlayerActorAllEquips(inPartyActorIndex);
            else Game.takeOffActorAllEquips(actor);
        }
        // 刷新属性
        var battler = GameBattleHelper.getBattlerByActor(actor);
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor), battler);
        // 记录卸下的装备编号
        if (cp.isTakeOffEquipSaveToVar) {
            var takeOffEquipID = takeOffEquip ? takeOffEquip.id : -1;
            Game.player.variable.setVariable(cp.takeOffEquipSaveToVar, takeOffEquipID);
        }
    }
    /**
     * 永久增加属性
     */
    export function customCommand_6005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6005): void {
        // 获取角色
        var actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        // 判断是否是玩家的角色
        var inPartyActorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        // 增加永久属性
        switch (cp.attributeType) {
            case 0:
                actor.increaseMaxHP += value;
                break;
            case 1:
                actor.increaseMaxSP += value;
                break;
            case 2:
                actor.increasePow += value;
                break;
            case 3:
                actor.increaseMag += value;
                break;
            case 4:
                actor.increaseEnd += value;
                break;
            case 5:
                actor.increaseAgi += value;
                break;
            case 6:
                if (inPartyActorIndex != -1) {
                    ProjectPlayer.increaseExpByIndex(inPartyActorIndex, value);
                }
                break;
            case 7:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv += value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
            case 8:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv -= value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
        }
        // 刷新属性
        var battler = GameBattleHelper.getBattlerByActor(actor);
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor), battler);
    }
    /**
     * 复活
     */
    export function customCommand_6006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6006): void {
        // 复活指定的我方角色
        if (cp.actorCheckType < 3) {
            var actor: Module_Actor;
            if (cp.actorCheckType <= 1) {
                var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                    cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                    cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
                if (!actorDS) return;
                actor = actorDS.actor;
            }
            else {
                actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            }
            if (!actor) return;
            var battler = GameBattleHelper.getBattlerByActor(actor);
            if (battler && battler.inPartyIndex >= 0) {
                GameBattlerHandler.resuscitate(battler);
            }
        }
        // 复活我方全体角色
        else if (cp.actorCheckType == 3) {
            for (var i = 0; i < Game.player.data.party.length; i++) {
                var actorDS = Game.player.data.party[i];
                if (!actorDS) continue;
                var sceneObjectIndex = actorDS.sceneObjectIndex;
                var battler = Game.currentScene.sceneObjects[sceneObjectIndex];
                if (battler && battler.inPartyIndex >= 0) {
                    GameBattlerHandler.resuscitate(battler);
                }
            }
        }
    }
    /**
     * 更改角色的名称
     */
    var changeActorNameInfo: { [actorID: number]: string } = {};
    export function customCommand_6007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6007): void {
        // 获取角色
        var actor: Module_Actor;
        var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
            cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
            null, null, null, null, trigger);
        if (!actorDS) return;
        actor = actorDS.actor;
        if (!actor) return;
        // 更改该角色的名称
        let newName = cp.valueUseVar ? Game.player.variable.getString(cp.valueVarID) : cp.value;
        for (let i = 0; i < Game.player.data.party.length; i++) {
            let inPartyActor = Game.player.data.party[i];
            let actorID = inPartyActor.actor.id;
            if (actorID == actor.id) {
                inPartyActor.actor.name = newName;
            }
        }
        // 记录更改项以便恢复存档时重新需要设置该值
        changeActorNameInfo[actor.id] = newName;
    }
    /**
     * 使用SinglePlayerGame需要在非行为编辑器模式下
     */
    if (!Config.BEHAVIOR_EDIT_MODE) {
        SinglePlayerGame.regSaveCustomData("___changeActorName", Callback.New(() => {
            return changeActorNameInfo;
        }, null));
        EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(() => {
            EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(() => {
                if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                    let restoryChangeActorNameInfo = SinglePlayerGame.getSaveCustomData("___changeActorName");
                    if (restoryChangeActorNameInfo) {
                        changeActorNameInfo = restoryChangeActorNameInfo;
                        for (let i = 0; i < Game.player.data.party.length; i++) {
                            let actorID = Game.player.data.party[i].actor.id;
                            if (changeActorNameInfo[actorID]) {
                                Game.player.data.party[i].actor.name = changeActorNameInfo[actorID];
                            }
                        }
                    }
                }
            }, null));
        }, null), true);
    }
}