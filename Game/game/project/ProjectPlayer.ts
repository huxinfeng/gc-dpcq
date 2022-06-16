/**
 * 项目层-玩家实现类
 * 
 * Created by 黑暗之神KDS on 2020-03-03 09:04:41.
 */
class ProjectPlayer extends ClientPlayer {
    //------------------------------------------------------------------------------------------------------
    // EventUtils 事件：道具和金币
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：监听道具数目改变 onChangeItemNumber()
     */
    static EVENT_CHANGE_ITEM_NUMBER = "ProjectPlayerCHANGE_ITEM_NUMBER";
    /**
     * 事件：监听金币改变 onChangeGoldNumber(oldGold: number, nowGold: number)
     */
    static EVENT_CHANGE_GOLD_NUMBER = "ProjectPlayerCHANGE_GOLD_NUMBER";
    //------------------------------------------------------------------------------------------------------
    // EventUtils 事件：队伍
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：新增队伍成员 onAddPlayerActor(inPartyIndex: number,actorDS: DataStructure_inPartyActor)
     */
    static EVENT_ADD_PLAYER_ACTOR: string = "ProjectPlayerEVENT_ADD_PLAYER_ACTOR";
    /**
     * 事件：减少队伍成员 onRemovePlayerActor(inPartyIndex: number,actorDS: DataStructure_inPartyActor)
     */
    static EVENT_REMOVE_PLAYER_ACTOR: string = "ProjectPlayerEVENT_REMOVE_PLAYER_ACTOR";
    /**
     * 事件：更改控制角色 onChangeCtrl(lastCtrlSo:GameClientSceneObject_1,currentCtrlSo:GameClientSceneObject_1);
     */
    static EVENT_CHANGE_CTRL_ACTOR: string = "ProjectPlayerEVENT_CHANGE_CTRL_ACTOR";
    //------------------------------------------------------------------------------------------------------
    // EventUtils 事件：玩家的角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：卸下了角色的道具 onPlayerActorRemoveItem(inPartyIndex: number, actorDS: DataStructure_inPartyActor, itemIndex: number, item: Module_Item);
     */
    static EVENT_REMOVE_PLAYER_ACTOR_ITEM: string = "ProjectPlayerEVENT_REMOVE_PLAYER_ACTOR_ITEM";
    /**
     * 事件：安装了角色的道具 onPlayerActorCarryItem(inPartyIndex: number, actorDS: DataStructure_inPartyActor, itemIndex: number, removeItem: Module_Item, newItem: Module_Item);
     */
    static EVENT_CARRY_PLAYER_ACTOR_ITEM: string = "ProjectPlayerEVENT_CARRY_PLAYER_ACTOR_ITEM";
    /**
     * 事件：学习了技能 onPlayerActorLearnSkill(inPartyIndex: number, actorDS: DataStructure_inPartyActor, newSkill: Module_Skill);
     */
    static EVENT_LEARN_PLAYER_ACTOR_SKILL: string = "ProjectPlayerEVENT_LEARN_PLAYER_ACTOR_SKILL";
    /**
     * 事件：忘记了技能 onPlayerActorForgetSkill(inPartyIndex: number, actorDS: DataStructure_inPartyActor, forgetSkill: Module_Skill);
     */
    static EVENT_FORGET_PLAYER_ACTOR_SKILL: string = "ProjectPlayerEVENT_FORGET_PLAYER_ACTOR_SKILL";
    /**
     * 事件：穿戴了装备 onWearPlayerActorEquip(inPartyIndex: number, actorDS: DataStructure_inPartyActor, takeOffEquip: Module_Equip, newEquip: Module_Equip);
     */
    static EVENT_WEAR_PLAYER_ACTOR_EQUIP: string = "ProjectPlayerEVENT_WEAR_PLAYER_ACTOR_EQUIP";
    /**
     * 事件：卸下了装备 onTakeOffPlayerActorEquip(inPartyIndex: number, actorDS: DataStructure_inPartyActor, takeOffEquip: Module_Equip);
     */
    static EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP: string = "ProjectPlayerEVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP";
    //------------------------------------------------------------------------------------------------------
    // 实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 玩家的游戏对象数据：重写以便类别能够指向项目层的ProjectClientSceneObject，方便调用
     */
    declare public sceneObject: ProjectClientSceneObject;
    /**
     * 构造函数
     */
    constructor() {
        super(true);
    }
    /**
     * 初始化角色数据
     * @param actor 角色数据 
     */
    static init(): void {
        // -- 初始化角色
        for (var i = 0; i < Game.player.data.party.length; i++) {
            this.initPlayerActor(i);
        }
        // -- 监听

    }
    //------------------------------------------------------------------------------------------------------
    // 静态方法-金币
    //------------------------------------------------------------------------------------------------------
    /**
     * 增加金币
     * @param v 增加的数
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    static increaseGold(v: number, happenEvent: boolean = true): void {
        // 记录旧的金币数目
        var oldGold = Game.player.data.gold;
        // 修改金币
        Game.player.data.gold = Math.floor(Math.max(Game.player.data.gold + v, 0));
        // 派发事件
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_GOLD_NUMBER, [oldGold, Game.player.data.gold]);
    }
    //------------------------------------------------------------------------------------------------------
    // 静态方法-背包
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取背包中的道具
     * @param itemID 道具编号
     * @return [Module_Item]
     */
    static getItem(itemID: number): Module_Item {
        var itemDS = this.getItemDS(itemID, false);
        if (itemDS) return itemDS.item;
        return null;
    }
    /**
     * 获取背包中的道具-DS类型
     * @param itemID 道具ID
     * @return [DataStructure_packageItem] 
     */
    static getItemDS(itemID: number, isEquip: boolean): DataStructure_packageItem {
        var itemDSs = ArrayUtils.matchAttributes(Game.player.data.package, { isEquip: isEquip }, false);
        if (!isEquip) {
            return ArrayUtils.matchAttributesD2(itemDSs, "item", { id: itemID }, true)[0] as any;
        }
        else {
            var equipDSs: DataStructure_packageItem[] = ArrayUtils.matchAttributesD2(itemDSs, "equip", { id: itemID }, false);
            for (var i = 0; i < equipDSs.length; i++) {
                var equipDS = equipDSs[i];
                if (!GameData.isCopyModeData(equipDS.equip)) return equipDS;
            }
            return null;
        }
    }
    /**
     * 获取道具位置
     * @param item 道具
     * @return [number] 位置，不存在返回null
     */
    static getItemIndex(item: Module_Item): number {
        return ArrayUtils.matchAttributes(Game.player.data.package, { item: item }, true, "==", true)[0];
    }
    /**
     * 获取装备位置
     * @param equip 道具
     * @return [number] 位置，不存在返回null
     */
    static getEquipIndex(equip: Module_Equip): number {
        return ArrayUtils.matchAttributes(Game.player.data.package, { equip: equip }, true, "==", true)[0];
    }
    /**
     * 改变背包中的道具数目（增减道具/装备）
     * @param itemID 道具/装备编号
     * @param v 变更的数目
     * @param isEquip 是否装备
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    static changeItemNumber(itemID: number, v: number, isEquip: boolean, happenEvent: boolean = true): void {
        // 道具不存在的情况：忽略
        var moduleID = isEquip ? 4 : 5;
        if (!GameData.getModuleData(moduleID, itemID)) return;
        // 增加的情况
        if (v > 0) {
            var itemDS = this.getItemDS(itemID, isEquip);
            // 如果不存在道具或加入的是副本装备的话则新增一个
            if (!itemDS) {
                itemDS = new DataStructure_packageItem;
                if (isEquip) {
                    itemDS.equip = GameData.newModuleData(moduleID, itemID);
                }
                else {
                    itemDS.item = GameData.newModuleData(moduleID, itemID);
                }
                itemDS.number = v;
                itemDS.isEquip = isEquip;
                Game.player.data.package.push(itemDS);
            }
            else if (itemDS) {
                itemDS.number += v;
            }
        }
        // 减少的情况
        else {
            var itemDS = this.getItemDS(itemID, isEquip);
            if (itemDS) {
                itemDS.number += v;
                if (itemDS.number <= 0) Game.player.data.package.splice(Game.player.data.package.indexOf(itemDS), 1);
            }
        }
        // 派发事件
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    }

    /**
     * 改变背包中的装备数目：预设的装备
     * @param equipID 装备编号
     * @param v 数目
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    static addEquip(equipID: number, v: number, happenEvent: boolean = true): void {
        this.changeItemNumber(equipID, v, true, happenEvent);
    }
    /**
     * 添加装备实例进入背包（支持非预设属性的装备，如极品装备）
     * 将该装备实例打包成DS数据格式装入背包中，一个实例仅对应一件物品
     * @param equip 装备实例
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    static addEquipByInstance(equip: Module_Equip, happenEvent: boolean = true): void {
        // 如果该装备是副本装备则创建一件独有的装备放入背包
        if (GameData.isCopyModeData(equip)) {
            // 否则直接新增一件背包道具
            var equipDS = new DataStructure_packageItem;
            equipDS.equip = equip;
            equipDS.number = 1;
            equipDS.isEquip = true;
            Game.player.data.package.push(equipDS);
            if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
        }
        // 如果该装备是预设则叠加至列表中
        else {
            ProjectPlayer.changeItemNumber(equip.id, 1, true, happenEvent);
        }
    }
    /**
     * 添加道具实例进入背包（支持非预设属性的道具）
     * @param item 道具实例
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    static addItemByInstance(item: Module_Item, happenEvent: boolean = true): void {
        var itemDS = new DataStructure_packageItem;
        itemDS.item = item;
        itemDS.number = 1;
        itemDS.isEquip = false;
        Game.player.data.package.push(itemDS);
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    }
    //------------------------------------------------------------------------------------------------------
    // 控制的角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 控制的角色
     */
    static get ctrlActorSceneObject() {
        return Game.player.sceneObject;
    }


    /**
     * 根据角色数据创建实际的场景对象
     */
    static createBattlerByActor(inPartyIndex: number): ProjectClientSceneObject {
        if (inPartyIndex < 0) return null;
        var actorDS = Game.player.data.party[inPartyIndex];
        if (actorDS) {
            var presetSceneObjectData = {
                x: Game.player.sceneObject.x,
                y: Game.player.sceneObject.y,
                avatarID: actorDS.actor.avatar,
                avatarOri: Game.player.sceneObject.avatarOri,
                name: actorDS.actor.name
            }
            var battler = Game.currentScene.addNewSceneObject(1, presetSceneObjectData) as ProjectClientSceneObject;
            battler.isBattler = true;
            battler.actor = actorDS.actor;
            battler.isDead = false;
            battler.camp = -1;
            battler.inPartyIndex = inPartyIndex;
            battler.battlerInit(false, false);
            actorDS.sceneObjectIndex = battler.index;
            Game.refreshActorAttribute(actorDS.actor, actorDS.lv, battler);
            battler.setPointFullState();
            battler.refreshPointBar();
            return battler;
        }
    }
    /**
     * 获取角色对应的战斗者
     */
    static getPlayerPartyBattler(inPartyIndex: number): ProjectClientSceneObject {
        if (inPartyIndex < 0) return null;
        var ds = Game.player.data.party[inPartyIndex];
        return Game.currentScene.sceneObjects[ds.sceneObjectIndex];
    }
    //------------------------------------------------------------------------------------------------------
    // 静态方法-角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取成员-DS格式数据：根据成员所在队伍的位置 
     * @param inPartyIndex 成员位置 0~N
     * @return [DataStructure_inPartyActor]
     */
    static getPlayerActorDSByInPartyIndex(inPartyIndex: number): DataStructure_inPartyActor {
        if (inPartyIndex < 0) return null;
        var ds = Game.player.data.party[inPartyIndex];
        return ds;
    }
    /**
     * 获取成员-DS格式数据：根据角色编号，如果存在多个，则返回第一个
     * @param actorID 角色编号
     * @return [DataStructure_inPartyActor] 
     */
    static getPlayerActorDSByActorID(actorID: number): DataStructure_inPartyActor {
        return ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, true)[0];
    }
    /**
     * 获取成员-DS格式数据：根据成员的角色数据
     * @param actor 角色数据 
     * @return [DataStructure_inPartyActor] 
     */
    static getPlayerActorDSByActor(actor: Module_Actor): DataStructure_inPartyActor {
        return ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
    }
    /**
     * 获取成员所在队伍位置：根据成员的角色数据
     * @param actor 角色数据 
     * @return 所在队伍位置
     */
    static getPlayerActorIndexByActor(actor: Module_Actor): number {
        var actorDS = this.getPlayerActorDSByActor(actor);
        if (actorDS) return Game.player.data.party.indexOf(actorDS);
        return -1;
    }
    /**
     * 获取指定角色所在队伍的首个位置
     * @param actorID 角色编号
     * @return [number] -1表示无 0~n 表示所在位置
     */
    static getPlayerActorFirstPositionByActorID(actorID: number): number {
        var actorDS = ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, true)[0];
        if (actorDS) return Game.player.data.party.indexOf(actorDS);
        return -1;
    }
    /**
     * 初始化角色数据
     * -- 修正等级上限
     * -- 根据当前等级习得对应的技能（如果已有则忽略）
     * @param actor 角色数据 
     */
    static initPlayerActor(inPartyIndex: number): void {
        var actorDS: DataStructure_inPartyActor = Game.player.data.party[inPartyIndex];
        // 如果是成长角色的情况下需要修正
        if (actorDS && actorDS.actor.growUpEnabled) {
            actorDS.lv = Math.max(1, Math.min(actorDS.lv, actorDS.actor.MaxLv));
            var classData: Module_Class = GameData.getModuleData(2, actorDS.actor.class);
            for (var i = 0; i < classData.lvUpAutoGetSkills.length; i++) {
                var lvUpAutoGetSkill = classData.lvUpAutoGetSkills[i];
                if (actorDS.lv >= lvUpAutoGetSkill.lv) {
                    this.learnSkillBySkillID(inPartyIndex, lvUpAutoGetSkill.skill);
                }
            }
        }
    }
    /**
     * 增加队伍成员：根据角色编号
     * 相同编号的角色也允许（即存在多名量产型角色）
     * @param actorID 角色编号
     * @param lv [可选] 默认值=1 等级
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [Module_Actor] 
     */
    static addPlayerActorByActorID(actorID: number, lv: number = 1, happenEvent: boolean = true): DataStructure_inPartyActor {
        if (lv < 1) lv = 1;
        // 新建数据，以克隆模式，即读档后数据来自存档而非数据库设定，因为角色数据通常会变化和成长
        var newActor: Module_Actor = GameData.newModuleData(1, actorID, true);
        var ds = new DataStructure_inPartyActor();
        ds.actor = newActor;
        ds.lv = Math.min(lv, newActor.MaxLv);
        Game.player.data.party.push(ds);
        this.initPlayerActor(Game.player.data.party.length - 1);
        ProjectPlayer.createBattlerByActor(Game.player.data.party.length - 1);
        if (happenEvent) EventUtils.happen(this, this.EVENT_ADD_PLAYER_ACTOR, [Game.player.data.party.length - 1, ds]);
        return ds;
    }
    /**
     * 减少队伍成员
     * @param inPartyIndex 队伍成员所在的位置
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [DataStructure_inPartyActor] 
     */
    static removePlayerActorByActorID(actorID: number, happenEvent: boolean = true): DataStructure_inPartyActor {
        var inPartyIndex = ProjectPlayer.getPlayerActorFirstPositionByActorID(actorID);
        if (inPartyIndex != -1) {
            if (inPartyIndex == Game.player.sceneObject.inPartyIndex) return;
            return ProjectPlayer.removePlayerActorByInPartyIndex(inPartyIndex, happenEvent);
        }
    }
    /**
     * 减少队伍成员
     * @param inPartyIndex 队伍成员所在的位置
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [DataStructure_inPartyActor] 
     */
    static removePlayerActorByInPartyIndex(inPartyIndex: number, happenEvent: boolean = true): DataStructure_inPartyActor {
        if (inPartyIndex >= Game.player.data.party.length || inPartyIndex < 0) return null;
        var sceneOjbectIndex = Game.player.data.party[inPartyIndex].sceneObjectIndex;
        var partner = Game.currentScene.sceneObjects[sceneOjbectIndex];
        partner.dispose();
        var actorDS = Game.player.data.party.splice(inPartyIndex, 1)[0]
        if (happenEvent) EventUtils.happen(this, this.EVENT_REMOVE_PLAYER_ACTOR, [inPartyIndex, actorDS]);
        return actorDS;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取玩家角色的技能：根据技能编号
     * @param inPartyIndex 所在队伍的位置
     * @param skillID 技能编号
     * @return [Module_Skill] 
     */
    static getPlayerActorSkillBySkillID(inPartyIndex: number, skillID: number): Module_Skill {
        var actorDS = this.getPlayerActorDSByActorID(inPartyIndex);
        if (actorDS) return ArrayUtils.matchAttributes(actorDS.actor.skills, { id: skillID }, true)[0];
    }
    /**
     * 学习技能
     * @param inPartyIndex 该角色所在队伍的编号
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [boolean] 
     */
    static learnSkillBySkillID(inPartyIndex: number, skillID: number, happenEvent: boolean = true): Module_Skill {
        var actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS) return;
        var newSkill = Game.actorLearnSkill(actorDS.actor, skillID);
        if (newSkill && happenEvent) EventUtils.happen(this, this.EVENT_LEARN_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, newSkill]);
        return newSkill;
    }
    /**
     * 忘记技能
     * @param inPartyIndex 该角色所在队伍的编号
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [boolean] 
     */
    static forgetSkillBySkillID(inPartyIndex: number, skillID: number, happenEvent: boolean = true) {
        var actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS) return;
        var forgetSkill = Game.actorForgetSkill(actorDS.actor, skillID);
        if (forgetSkill && happenEvent) EventUtils.happen(this, this.EVENT_FORGET_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, forgetSkill]);
        return forgetSkill;
    }
    /**
     * 忘记全部技能
     * @param inPartyIndex 该角色所在队伍的编号
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [Module_Skill] 忘记的技能集合
     */
    static forgetAllSkills(inPartyIndex: number, happenEvent: boolean = true): Module_Skill[] {
        var actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS) return;
        var forgetSkills = actorDS.actor.skills.concat();
        for (var i = 0; i < forgetSkills.length; i++) {
            if (happenEvent) EventUtils.happen(this, this.EVENT_FORGET_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, forgetSkills[i]]);
        }
        Game.actorForgetAllSkills(actorDS.actor, happenEvent);
        return forgetSkills;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的装备
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取角色的装备：根据部位编号
     * @param inPartyIndex 该角色所在队伍的索引
     * @param partID 部位ID
     * @return [Module_Equip] 
     */
    static getPlayerActorEquipByPartID(inPartyIndex: number, partID: number): Module_Equip {
        var actorDS = this.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (actorDS) return Game.getActorEquipByPartID(actorDS.actor, partID);
    }
    /**
     * 佩戴角色装备：
     * -- 如果该部位已存在装备则会卸下至背包中
     * -- 新的装备必须已拥有（在背包中）
     * @param inPartyIndex 该角色所在队伍的索引
     * @param newEquip 新的装备
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return success=是否更换成功 removeEquip=更换下来的装备
     */
    static wearPlayerActorEquip(inPartyIndex: number, newEquip: Module_Equip, happenEvent: boolean = true): { success: boolean, takeOffEquip: Module_Equip } {
        if (newEquip) {
            // -- 查找背包该装备
            var newEquipIndex = this.getEquipIndex(newEquip);
            if (newEquipIndex != null) {
                // -- 查找角色
                var actorDS = this.getPlayerActorDSByInPartyIndex(inPartyIndex);
                if (actorDS) {
                    // -- 卸载该部位上的装备
                    var takeOffEquip = this.takeOffPlayerActorEquipByPartID(inPartyIndex, newEquip.partID, happenEvent);
                    // -- 装上来自背包的装备
                    Game.wearActorEquip(actorDS.actor, newEquip);
                    // -- 背包该装备-1
                    this.removePackageItemByItemDS(Game.player.data.package[newEquipIndex], 1, happenEvent);
                    // -- 派发事件
                    if (happenEvent) EventUtils.happen(Game, this.EVENT_WEAR_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip, newEquip]);
                    return { success: true, takeOffEquip: takeOffEquip };
                }
            }
        }
        return { success: false, takeOffEquip: null };
    }
    /**
     * 卸下装备:该装备将会放置回背包（如有）根据角色索引
     * @param inPartyIndex 该角色所在队伍的索引
     * @param partID 部位ID
     * @return [Module_Equip] 卸载出来的装备
     */
    static takeOffPlayerActorEquipByPartID(inPartyIndex: number, partID: number, happenEvent: boolean = true): Module_Equip {
        var actorDS = Game.player.data.party[inPartyIndex];
        if (!actorDS) return null;
        var takeOffEquip = Game.takeOffActorEquipByPartID(actorDS.actor, partID);
        if (takeOffEquip) {
            // 装备移入背包中
            this.addEquipByInstance(takeOffEquip, happenEvent);
            if (happenEvent) EventUtils.happen(Game, this.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip]);
        }
        return takeOffEquip;
    }
    /**
     * 卸下全部装备:这些装备将会放置回背包（如有）根据角色索引
     * @param inPartyIndex 该角色所在队伍的索引
     * @return [Module_Equip] 卸载出来的装备
     */
    static takeOffPlayerActorAllEquips(inPartyIndex: number, happenEvent: boolean = true): Module_Equip[] {
        var actorDS = Game.player.data.party[inPartyIndex];
        if (!actorDS) return null;
        var takeOffEquips = Game.takeOffActorAllEquips(actorDS.actor);
        for (var i = 0; i < takeOffEquips.length; i++) {
            var takeOffEquip = takeOffEquips[i];
            this.addEquipByInstance(takeOffEquip, happenEvent);
            if (happenEvent) EventUtils.happen(Game, this.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip]);
        }
        return takeOffEquips;
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 增加经验值
     */
    static increaseExpByIndex(inPartyIndex: number, exp: number): { isLevelUp: boolean, fromLv: number, toLv: number, fromExp: number, toExp: number, learnSkills: Module_Skill[] } {
        var actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        var actor: Module_Actor = actorDS.actor;
        var classData: Module_Class = GameData.getModuleData(2, actor.class);
        if (!classData) return;
        // 已经最高级则不再允许增加经验值
        if (actorDS.lv >= actor.MaxLv) return;
        // 无法成长的角色
        if (!actor.growUpEnabled) return;
        var fromExp = actor.currentEXP;
        var fromLv = actorDS.lv;
        // 增加经验值
        actor.currentEXP += exp;
        // 升级判定
        var isLevelUp = false;
        var learnSkills: Module_Skill[] = [];
        while (1) {
            var nextExp = Game.getLevelUpNeedExp(actor, actorDS.lv);
            if (actor.currentEXP >= nextExp) {
                actorDS.lv++;
                isLevelUp = true;
                actor.currentEXP -= nextExp;
                for (var i = 0; i < classData.lvUpAutoGetSkills.length; i++) {
                    var lvUpAutoGetSkill = classData.lvUpAutoGetSkills[i];
                    if (actorDS.lv >= lvUpAutoGetSkill.lv) {
                        var learnSkill = this.learnSkillBySkillID(inPartyIndex, lvUpAutoGetSkill.skill);
                        if (learnSkill) learnSkills.push(learnSkill);
                    }
                }
            }
            else {
                break;
            }
        }
        var toLv = actorDS.lv;
        var toExp = actor.currentEXP;
        return { isLevelUp: isLevelUp, fromLv: fromLv, toLv: toLv, fromExp: fromExp, toExp: toExp, learnSkills: learnSkills };
    }

    //------------------------------------------------------------------------------------------------------
    // 内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 改变背包中的道具数目（增减道具/装备）：根据指定的DS数据
     * @param itemDS 道具/装备DS格式数据
     * @param v 变更的数目
     * @param isEquip 是否装备
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    private static removePackageItemByItemDS(itemDS: DataStructure_packageItem, v: number, happenEvent: boolean = true): void {
        var inPackageIdx = Game.player.data.package.indexOf(itemDS);
        if (inPackageIdx == -1) return;
        itemDS.number -= v;
        if (itemDS.number <= 0) Game.player.data.package.splice(inPackageIdx, 1);
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    }

}