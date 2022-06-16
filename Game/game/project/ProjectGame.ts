/**
 * 项目层游戏管理器实现类
 * -- 为了让系统API属性的类别直接指向项目层的实现类
 *    游戏内会经常用到Game.player以及Game.currentScene，实现此类可指向项目层自定义的「玩家类」和「场景类」
 *    
 * 
 * Created by 黑暗之神KDS on 2020-09-08 17:00:46.
 */
class ProjectGame extends GameBase {
    //------------------------------------------------------------------------------------------------------
    // 事件：角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：卸下了角色的道具 onRemoveActorItem(actor: Module_Actor, itemIndex: number, item: Module_Item);
     */
    EVENT_REMOVE_ACTOR_ITEM: string = "GameEVENT_REMOVE_ACTOR_ITEM";
    /**
     * 事件：安装了角色的道具 onCarryActorItem(actor: Module_Actor, itemIndex: number, removeItem: Module_Item, newItem: Module_Item);
     */
    EVENT_CARRY_ACTOR_ITEM: string = "GameEVENT_CARRY_ACTOR_ITEM";
    /**
     * 事件：学习了技能 onLearnSkill(actor: Module_Actor, newSkill: Module_Skill);
     */
    EVENT_LEARN_SKILL: string = "GameEVENT_LEARN_SKILL";
    /**
     * 事件：忘记了技能 onForgetSkill(actor: Module_Actor, forgetSkill: Module_Skill);
     */
    EVENT_FORGET_SKILL: string = "GameEVENT_FORGET_SKILL";
    /**
     * 事件：穿戴了装备 onWearActorEquip(actor: Module_Actor, partID: number, takeOffEquip: Module_Equip, newEquip: Module_Equip);
     */
    EVENT_WEAR_ACTOR_EQUIP: string = "GameEVENT_WEAR_ACTOR_EQUIP";
    /**
     * 事件：卸下了装备 onTakeOffActorEquip(actor: Module_Actor, partID: number, takeOffEquip: Module_Equip);
     */
    EVENT_TAKE_OFF_ACTOR_EQUIP: string = "GameEVENT_TAKE_OFF_ACTOR_EQUIP";
    //------------------------------------------------------------------------------------------------------
    // 事件：其他
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：显示战斗者血条
     */
    EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE: string = "EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE";
    /**
     * 事件：显示警戒范围
     */
    EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE: string = "EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE";
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 游戏开始时间（新游戏时记录，读档后记录档案的时间会计算差值以便获得游戏总游玩时间）
     */
    static gameStartTime: Date;
    /**
    * 当前的场景对象：重写，以便类别能够对应项目层自定义的子类
    */
    declare currentScene: ProjectClientScene;
    /**
     * 玩家对象：重写，便类别能够对应项目层自定义的子类
     */
    declare player: ProjectPlayer;
    /**
     * 切换新场景时记录的玩家战斗者
     */
    private toNewSceneRecordPlayerBattles: ProjectClientSceneObject[];

    /**
     * 构造函数
     */
    constructor() {
        super();
        EventUtils.addEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.onInSceneStateChange, this);
    }
    /**
     * 初始化
     */
    init() {
        // 创建的玩家是这个项目层自定义类的实例
        this.player = new ProjectPlayer();
    }

    //------------------------------------------------------------------------------------------------------
    // 角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 根据场景对象（战斗者）的编号获取其对应的角色数据
     * @param soIndex 场景对象编号
     * @return [Module_Actor] 
     */
    getActorBySceneObjectIndex(soIndex: number): Module_Actor {
        var soc = Game.currentScene.sceneObjects[soIndex];
        if (GameBattleHelper.isBattler(soc)) {
            return soc.actor;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取角色的技能：根据技能编号
     * @param actor 角色
     * @param skillID 技能编号
     * @return [Module_Skill] 
     */
    getActorSkillBySkillID(actor: Module_Actor, skillID: number): Module_Skill {
        return ArrayUtils.matchAttributes(actor.skills, { id: skillID }, true)[0];
    }
    /**
     * 角色学习技能
     * @param actor 角色
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Skill] 
     */
    actorLearnSkill(actor: Module_Actor, skillID: number, happenEvent: boolean = true): Module_Skill {
        var skill = this.getActorSkillBySkillID(actor, skillID);
        if (skill || !GameData.getModuleData(3, skillID)) return;
        var newSkill = GameData.newModuleData(3, skillID);
        actor.skills.push(newSkill);
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_LEARN_SKILL, [actor, newSkill]);
        return newSkill;
    }
    /**
     * 角色忘记技能
     * @param actor 角色
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Skill] 忘却的技能
     */
    actorForgetSkill(actor: Module_Actor, skillID: number, happenEvent: boolean = true): Module_Skill {
        var skill = this.getActorSkillBySkillID(actor, skillID);
        if (!skill || !GameData.getModuleData(3, skillID)) return;
        actor.skills.splice(actor.skills.indexOf(skill), 1);
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, skill]);
        return skill;
    }
    /**
     * 角色忘记全部技能
     * @param actor 角色
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Skill] 忘却的技能集合
     */
    actorForgetAllSkills(actor: Module_Actor, happenEvent: boolean = true): Module_Skill[] {
        var forgetSkills = actor.skills.concat();
        actor.skills.length = 0;
        for (var i = 0; i < forgetSkills.length; i++) {
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, forgetSkills[i]]);
        }
        return forgetSkills;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的装备
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取角色的装备：根据装备部位
     * @param actor 角色
     * @param partID 装备部位
     * @return [Module_Equip] 
     */
    getActorEquipByPartID(actor: Module_Actor, partID: number): Module_Equip {
        return ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true)[0];
    }
    /**
     * 获取角色的装备：根据装备的编号
     * @param actor 角色
     * @param equipID 装备编号
     * @return [Module_Equip] 
     */
    getActorEquipByEquipID(actor: Module_Actor, equipID: number): Module_Equip {
        return ArrayUtils.matchAttributes(actor.equips, { id: equipID }, true)[0];
    }
    /**
     * 穿戴角色装备
     * @param actor 角色数据
     * @param newEquip 新的装备
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return success=是否更换成功 removeEquip=更换下来的装备
     */
    wearActorEquip(actor: Module_Actor, newEquip: Module_Equip, happenEvent: boolean = true): { success: boolean, takeOffEquip: Module_Equip } {
        if (newEquip) {
            var takeOffEquip = this.takeOffActorEquipByPartID(actor, newEquip.partID);
            actor.equips.push(newEquip);
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_WEAR_ACTOR_EQUIP, [actor, newEquip.partID, takeOffEquip, newEquip]);
            return { success: true, takeOffEquip: takeOffEquip };
        }
    }
    /**
     * 卸下装备
     * @param actor 角色
     * @param partID 部位
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Equip] 
     */
    takeOffActorEquipByPartID(actor: Module_Actor, partID: number, happenEvent: boolean = true): Module_Equip {
        var idx = ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true, "==", true)[0];
        if (idx == null) return null;
        var takeOffEquip = actor.equips.splice(idx, 1)[0];
        if (takeOffEquip && happenEvent) EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, partID, takeOffEquip]);
        return takeOffEquip;
    }
    /**
     * 卸下全部装备
     * @param actor 角色
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Equip] 
     */
    takeOffActorAllEquips(actor: Module_Actor, happenEvent: boolean = true): Module_Equip[] {
        var takeOffEquipArr = actor.equips.concat();
        actor.equips.length = 0;
        for (var i = 0; i < takeOffEquipArr.length; i++) {
            var takeOffEquip = takeOffEquipArr[i];
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, takeOffEquip.partID, takeOffEquip]);
        }
        return takeOffEquipArr;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取下一等级所需经验值
     * @param actor 角色数据
     * @param lv 当前等级
     * @return [number] 
     */
    getLevelUpNeedExp(actor: Module_Actor, lv: number): number {
        return Math.floor(this.getGrowValueByLv(actor, "needEXPGrow", lv));
    }
    /**
     * 刷新角色属性
     * -- 基础属性
     * -- 加点属性
     * -- 装备加成
     * -- 状态加成
     */
    refreshActorAttribute(actor: Module_Actor, lv: number, battler: ProjectClientSceneObject): void {
        // 获取数据库预设的数据
        var res = this.clacActorAttribute(actor, lv);
        // 写入属性至该角色数据里
        if (res) {
            actor.ATK = Math.floor(res.ATK);
            actor.DEF = Math.floor(res.DEF);
            actor.AGI = Math.floor(res.AGI);
            actor.DOD = Math.floor(res.DOD);
            actor.MaxHP = Math.floor(res.MaxHP);
            actor.MaxSP = Math.floor(res.MaxSP);
            actor.POW = Math.floor(res.POW);
            actor.END = Math.floor(res.END);
            actor.MAG = Math.floor(res.MAG);
            actor.MagDef = Math.floor(res.MagDef);
            actor.HIT = Math.floor(res.HIT);
            actor.CRIT = Math.floor(res.CRIT);
            actor.MagCrit = Math.floor(res.MagCrit);
            actor.MoveSpeed = Math.floor(res.MoveSpeed);
        }
        // 如果进入战斗中或是玩家拥有的角色的话
        if (battler.inBattle || battler.inPartyIndex >= 0 || (battler.battleAI && battler.battleAI.isInBackToInBattlePoint)) {

        }
        else {
            actor.MoveSpeed = 50;
        }
        var lastMoveSpeed = battler.moveSpeed;
        battler.moveSpeed = actor.MoveSpeed;
        // 血量修正
        if (actor.hp > actor.MaxHP) actor.hp = actor.MaxHP;
        if (actor.sp > actor.MaxSP) actor.sp = actor.MaxSP;
        battler.refreshPointBar();
        // 未死亡的情况
        if (!battler.isDead) {
            // 速度不相等的话重新计算剩余路程以新的移动速度
            if (lastMoveSpeed != battler.moveSpeed) {

            }
        }
    }
    /**
     * 计算角色属性
     * @param actor 角色
     * @param lv 等级
     * @param previewChangeEquipMode [可选] 默认值=false 是否预览替换的装备模式
     * @param previewChangeEquipIndex [可选] 默认值=0 预览替换的装备部位
     * @param previewChangeEquip [可选] 默认值=null 预览替换的装备属性
     */
    clacActorAttribute(actor: Module_Actor, lv: number, previewChangeEquipMode: boolean = false, previewChangeEquipIndex: number = 0, previewChangeEquip: Module_Equip = null) {
        // 获取数据库预设的数据
        var systemActor = GameData.getModuleData(1, actor.id) as Module_Actor;
        if (!systemActor) return;
        // 获取原始属性
        var maxhp: number;
        var maxsp: number;
        var mag: number;
        var agi: number;
        var pow: number;
        var end: number;
        var magDef: number;
        var hit: number;
        var crit: number;
        var magCrit: number;
        var moveSpeed: number;
        // -- 成长型的角色
        if (actor.growUpEnabled) {
            maxhp = this.getGrowValueByLv(actor, "MaxHPGrow", lv) + actor.increaseMaxHP;
            maxsp = this.getGrowValueByLv(actor, "MaxSPGrow", lv) + actor.increaseMaxSP;
            mag = this.getGrowValueByLv(actor, "MAGGrow", lv) + actor.increaseMag;
            agi = this.getGrowValueByLv(actor, "AGIGrow", lv) + actor.increaseAgi;
            pow = this.getGrowValueByLv(actor, "POWGrow", lv) + actor.increasePow;
            end = this.getGrowValueByLv(actor, "ENDGrow", lv) + actor.increaseEnd;
        }
        // -- 非成长型角色（固定值）
        else {
            maxhp = systemActor.MaxHP + actor.increaseMaxHP;
            maxsp = systemActor.MaxSP + actor.increaseMaxSP;
            mag = systemActor.MAG + actor.increaseMag;
            agi = systemActor.AGI + actor.increaseAgi;
            pow = systemActor.POW + actor.increasePow;
            end = systemActor.END + actor.increaseEnd;
        }
        // 其他战斗属性（通用固定值）
        magDef = systemActor.MagDef;
        hit = systemActor.HIT;
        crit = 0;
        magCrit = 0;
        moveSpeed = systemActor.MoveSpeed;
        // 刷新装备和技能以及状态，剔除相同的元素
        ArrayUtils.removeSameObjectD2(actor.equips, "id", false);
        ArrayUtils.removeSameObjectD2(actor.skills, "id", false);
        ArrayUtils.removeSameObjectD2(actor.status, "id", false);
        // 追加来自装备的属性和状态：加法
        var atkIncrease = 0;
        var defIncrease = 0;
        actor.selfStatus.length = 0;
        actor.selfImmuneStatus.length = 0;
        actor.hitTargetStatus.length = 0;
        actor.hitTargetSelfAddStatus.length = 0;
        for (var i = 0; i < 5; i++) {
            // 预览模式下该部件使用指定的装备（可能无装备）
            if (previewChangeEquipMode && previewChangeEquipIndex == i) {
                var equip = previewChangeEquip;
            }
            // 否则使用当前该部位上已佩戴的装备
            else {
                var equip = Game.getActorEquipByPartID(actor, i);
            }
            // 存在装备的话，属性加成
            if (equip) {
                maxhp += equip.maxHP;
                maxsp += equip.maxSP;
                atkIncrease += equip.atk;
                defIncrease += equip.def;
                mag += equip.mag;
                magDef += equip.magDef;
                moveSpeed += equip.moveSpeed;
                hit += equip.hit;
                agi += equip.agi;
                crit += equip.crit;
                magCrit += equip.magCrit;
                // 状态刷新
                actor.selfStatus = actor.selfStatus.concat(equip.selfStatus);
                actor.selfImmuneStatus = actor.selfImmuneStatus.concat(equip.selfImmuneStatus);
                actor.hitTargetStatus = actor.hitTargetStatus.concat(equip.hitTargetStatus);
                actor.hitTargetSelfAddStatus = actor.hitTargetSelfAddStatus.concat(equip.hitTargetSelfAddStatus);
            }
        }
        // 追加来自技能的属性和状态
        for (let i = 0; i < actor.skills.length; i++) {
            let actorSkill = actor.skills[i];
            maxhp += actorSkill.maxHP;
            maxsp += actorSkill.maxSP;
            atkIncrease += actorSkill.atk;
            defIncrease += actorSkill.def;
            mag += actorSkill.mag;
            magDef += actorSkill.magDef;
            moveSpeed += actorSkill.moveSpeed;
            hit += actorSkill.hit;
            agi += actorSkill.agi;
            crit += actorSkill.crit;
            magCrit += actorSkill.magCrit;
            // 状态刷新
            actor.selfStatus = actor.selfStatus.concat(actorSkill.selfStatus);
            actor.selfImmuneStatus = actor.selfImmuneStatus.concat(actorSkill.selfImmuneStatus);
            actor.hitTargetStatus = actor.hitTargetStatus.concat(actorSkill.hitTargetStatus);
            actor.hitTargetSelfAddStatus = actor.hitTargetSelfAddStatus.concat(actorSkill.hitTargetSelfAddStatus);
        }
        // 转换计算
        var atk = pow * 1.5 + atkIncrease;
        var def = end * 2 + defIncrease;
        var dod = agi * 0.1;
        // 追加来自状态的属性 %
        var stHPPer = 100;
        var stSPPer = 100;
        var stATK = 100;
        var stDEF = 100;
        var stMAG = 100;
        var stMagDef = 100;
        var stMoveGrid = 100;
        for (var i = 0; i < actor.status.length; i++) {
            var status = actor.status[i];
            stHPPer *= Math.pow(status.maxHP / 100, status.currentLayer);
            stSPPer *= Math.pow(status.maxSP / 100, status.currentLayer);
            stATK *= Math.pow(status.atk / 100, status.currentLayer);
            stDEF *= Math.pow(status.def / 100, status.currentLayer);
            stMAG *= Math.pow(status.mag / 100, status.currentLayer);
            stMagDef *= Math.pow(status.magDef / 100, status.currentLayer);
            stMoveGrid *= Math.pow(status.moveSpeed / 100, status.currentLayer);
            hit += status.hit * status.currentLayer;
            crit += status.crit * status.currentLayer;
            magCrit += status.magCrit * status.currentLayer;
        }
        maxhp *= stHPPer / 100;
        maxsp *= stSPPer / 100;
        atk *= stATK / 100;
        def *= stDEF / 100;
        mag *= stMAG / 100;
        magDef *= stMagDef / 100;
        moveSpeed *= stMoveGrid / 100;
        // 限制
        atk = Math.max(atk, 0);
        def = Math.max(def, 0);
        agi = Math.max(agi, 0);
        dod = Math.max(dod, 0);
        maxhp = Math.max(maxhp, 0);
        maxsp = Math.max(maxsp, 0);
        pow = Math.max(pow, 0);
        end = Math.max(end, 0);
        mag = Math.max(mag, 0);
        magDef = Math.max(magDef, 0);
        hit = Math.max(hit, 0);
        crit = Math.max(Math.min(crit, 100), 0);
        magCrit = Math.max(Math.min(magCrit, 100), 0);
        moveSpeed = Math.max(moveSpeed, 0);
        // 返回结果
        return {
            ATK: Math.floor(atk),
            DEF: Math.floor(def),
            AGI: Math.floor(agi),
            DOD: Math.floor(dod),
            MaxHP: Math.floor(maxhp),
            MaxSP: Math.floor(maxsp),
            POW: Math.floor(pow),
            END: Math.floor(end),
            MAG: Math.floor(mag),
            MagDef: Math.floor(magDef),
            HIT: Math.floor(hit),
            CRIT: Math.floor(crit),
            MagCrit: Math.floor(magCrit),
            MoveSpeed: Math.floor(moveSpeed),
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 私有实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 监听事件：进入场景的状态改变时派发事件
     * @param inNewSceneState 0-切换游戏场景 1-新游戏 2-读取存档
     */
    private onInSceneStateChange(inNewSceneState: number) {
        // 状态：离开场景时（标题时视为离开空场景）
        if (GameGate.gateState == GameGate.STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT) {
            // 新游戏的话：记录当前时间为启动时间
            if (inNewSceneState == 1) {
                ProjectGame.gameStartTime = new Date();
                ProjectPlayer.init();
            }
            // 读取存档的情况：以当前的时间减去已游戏时间来记录
            else if (inNewSceneState == 2) {
                ProjectGame.gameStartTime = new Date((Date.now() - GUI_SaveFileManager.currentSveFileIndexInfo.indexInfo.gameTime));
            }
            // 切换场景
            else if (inNewSceneState == 0) {
                // 遍历队伍中除首个角色外的玩家角色，从场景上移除并记录它
                this.toNewSceneRecordPlayerBattles = [];
                for (var i = 1; i < Game.player.data.party.length; i++) {
                    var battler = ProjectPlayer.getPlayerPartyBattler(i);
                    Game.currentScene.removeSceneObject(battler);
                    this.toNewSceneRecordPlayerBattles[i] = battler;
                }
            }
        }
        // 状态：加载场景完毕
        else if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
            // -- 新游戏：创建队友的场景对象以及战斗者和角色的数据
            if (inNewSceneState == 1) {
                // 没有队伍设置的情况
                if (Game.player.data.party.length == 0) {
                    throw ("找不到玩家队伍");
                }
                // 绑定主角数据
                var firstActorDS = Game.player.data.party[0];
                firstActorDS.sceneObjectIndex = Game.player.sceneObject.index;
                Game.player.sceneObject.actor = firstActorDS.actor;
                Game.refreshActorAttribute(Game.player.sceneObject.actor, firstActorDS.lv, Game.player.sceneObject);
                Game.player.sceneObject.inPartyIndex = 0;
                Game.player.sceneObject.camp = -1;
                Game.player.sceneObject.setPointFullState();
                Game.player.sceneObject.refreshPointBar();
                GameData.changeModuleDataToCopyMode(firstActorDS.actor, 1);
                // 创建其他队友的场景对象
                for (var i = 1; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    if (actorDS == null) continue;
                    // 将队友强制转化为副本
                    GameData.changeModuleDataToCopyMode(actorDS.actor, 1);
                    // 创建场景对象
                    ProjectPlayer.createBattlerByActor(i);
                }
                // 刷新主界面
                var guiMain = GameUI.get(13) as GUI_Main;
                if (guiMain) guiMain.refreshAll();
            }
            // -- 读取存档
            else if (inNewSceneState == 2) {
                // -- 指向数据
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    // 将队友强制转化为副本
                    GameData.changeModuleDataToCopyMode(actorDS.actor, 1);
                    var battler: ProjectClientSceneObject = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
                    // 如果没有找到对应的队友战斗者的话（说明游戏版本更新了，改动了地图的场景对象）
                    if (!battler || battler.inPartyIndex != i) {
                        battler = ArrayUtils.matchAttributes(Game.currentScene.sceneObjects, { inPartyIndex: i }, true)[0];
                        if (!battler) {
                            throw ("无法找到队友的场景对象。");
                        }
                    }
                    actorDS.sceneObjectIndex = battler.index;
                    battler.inPartyIndex = i;
                    battler.actor = actorDS.actor;
                    GameBattlerHandler.refreshBattlerActionByStatus(battler);
                    battler.refreshPointBar();
                }
                // for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
                //     var so = Game.currentScene.sceneObjects[i]
                //     GameBattlerHandler.refreshBattlerActionByStatus(so);
                // }

            }
            // -- 切换场景
            else {
                // 玩家的战斗者加入
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    var battler: ProjectClientSceneObject;
                    if (i == 0) {
                        battler = Game.player.sceneObject;
                        actorDS.sceneObjectIndex = battler.index;
                    }
                    else {
                        battler = this.toNewSceneRecordPlayerBattles[i];
                        battler.x = Game.player.sceneObject.x;
                        battler.y = Game.player.sceneObject.y;
                        Game.currentScene.addSceneObject(battler, true);
                        actorDS.sceneObjectIndex = battler.index;
                    }
                    // -- 初始化战斗者
                    battler.battlerInit(false, false);
                }
            }
            //@ts-ignore
            function bindPlayerBattlersActor() {
                // 绑定Actor数据
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    var battler: ProjectClientSceneObject = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
                    battler.actor = actorDS.actor;
                }
            }

        }
    }
    /**
     * 获取成长数据根据等级
     * @param actor 角色数据 
     * @param growAttrName 属性名称 
     * @param lv 等级
     * @return [number] 
     */
    private getGrowValueByLv(actor: Module_Actor, growAttrName: string, lv: number): number {
        // -- 获取属性
        var cacheGrowName = growAttrName + "_cache";
        var growData = actor[cacheGrowName];
        if (!actor[cacheGrowName]) growData = actor[cacheGrowName] = GameUtils.getCurveData(actor[growAttrName]);
        var per = lv == 0 ? 0 : (lv - 1) / (actor.MaxLv - 1); // 转为0-1的空间
        return GameUtils.getBezierPoint2ByGroupValue(growData, per);
    }
}