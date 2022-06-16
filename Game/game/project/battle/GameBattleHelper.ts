/**
 * 战斗相关辅助计算类
 * Created by 黑暗之神KDS on 2021-01-14 13:52:47.
 */
class GameBattleHelper {
    //------------------------------------------------------------------------------------------------------
    // 获取
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取等级根据角色数据
     * 因为战斗者区分玩家拥有的角色和非玩家拥有的角色，储存等级的地方不一样
     * @param actor 角色数据 
     * @return [number] 等级
     */
    static getLevelByActor(actor: Module_Actor): number {
        // -- 如果是玩家拥有的角色时则从玩家队伍的该角色中获取等级
        var playerActorDS: DataStructure_inPartyActor = ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
        if (playerActorDS) {
            return playerActorDS.lv;
        }
        return 1;
    }
    /**
     * 获取所有战斗者
     * @return [ProjectClientSceneObject] 
     */
    static get allBattlers(): ProjectClientSceneObject[] {
        var arr = [];
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                arr.push(so);
            }
        }
        return arr;
    }
    /**
     * 获取指定战斗者，根据角色数据
     * @param actor 角色数据
     */
    static getBattlerByActor(actor: Module_Actor): ProjectClientSceneObject {
        var arr = [];
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (so && so.actor == actor) {
                return so;
            }
        }
        return null;
    }
    //------------------------------------------------------------------------------------------------------
    // 判定
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否战斗者
     * @param so 场景对象
     * @return [boolean]  
     */
    static isBattler(so: ProjectClientSceneObject): boolean {
        return so && so.modelID == 1 && so.isBattler && so.actor != null;
    }
    /**
     * 是否玩家阵营
     * @param so 场景对象
     * @return [boolean] 
     */
    static isPlayerCamp(so: ProjectClientSceneObject): boolean {
        return this.isBattler(so) && so.camp == 1;
    }
    /**
     * 是否敌对阵营
     * @param so 场景对象
     * @return [boolean] 
     */
    static isEnemyCamp(so: ProjectClientSceneObject): boolean {
        return this.isBattler(so) && so.camp == 0 && so.inPartyIndex < 0;
    }
    /**
     * 是否属于玩家队伍
     * @param so 场景对象
     * @return [boolean] 
     */
    static isInPlayerParty(so: ProjectClientSceneObject): boolean {
        return this.isPlayerCamp(so) && ProjectPlayer.getPlayerActorIndexByActor(so.actor) >= 0;
    }
    /**
     * 两个战斗者之间是否队友关系
     * @param so1 战斗者1
     * @param so2 战斗者2
     * @return [boolean] 
     */
    static isFriendlyRelationship(so1: ProjectClientSceneObject, so2: ProjectClientSceneObject): boolean {
        return this.isBattler(so1) && this.isBattler(so2) && so1.camp == so2.camp;
    }
    /**
     * 两个战斗者之间是否敌对关系
     * @param so1 战斗者1
     * @param so2 战斗者2
     * @return [boolean] 
     */
    static isHostileRelationship(so1: ProjectClientSceneObject, so2: ProjectClientSceneObject): boolean {
        return this.isBattler(so1) && this.isBattler(so2) && ((so1.camp == 0 && so2.camp != 0) || (so1.camp != 0 && so2.camp == 0));
    }
    //------------------------------------------------------------------------------------------------------
    // 技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否是作用敌人的技能
     * @param skill 技能
     * @return [boolean] 
     */
    static isHostileSkill(skill: Module_Skill): boolean {
        return skill.skillType <= 1 && (skill.targetType == 2 || skill.targetType == 4 || skill.targetType == 6);
    }
    /**
     * 是否是作用我方的技能
     * @param skill 技能
     * @return [boolean] 
     */
    static isFriendlySkill(skill: Module_Skill): boolean {
        return skill.skillType <= 1 && !this.isHostileSkill(skill);
    }
    //------------------------------------------------------------------------------------------------------
    // 状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取战斗者的状态
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static getBattlerStatus(battler: ProjectClientSceneObject, statusID: number): Module_Status {
        return ArrayUtils.matchAttributes(battler.actor.status, { id: statusID }, true)[0];
    }
    /**
     * 检查战斗者是否包含指定的状态
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static isIncludeStatus(battler: ProjectClientSceneObject, statusID: number): boolean {
        return ArrayUtils.matchAttributes(battler.actor.status, { id: statusID }, true).length == 1;
    }
    /**
     * 检查战斗者是否允许叠加状态，如果已拥有且最大层的话则不允许
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static canSuperpositionLayer(battler: ProjectClientSceneObject, statusID: number): boolean {
        var status: Module_Status = ArrayUtils.matchAttributes(battler.actor.status, { id: statusID }, true)[0];
        if (status && status.currentLayer >= status.maxlayer) return false;
        return true;
    }
    //------------------------------------------------------------------------------------------------------
    // 是否允许行动
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否允许移动
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canMove(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 死亡的话则不允许
        if (battler.isDead) return false;
        // 释放中不允许移动
        if (battler.duringRelease) return false;
        // 移动速度不足不允许移动
        if (battler.moveSpeed <= 0) return false;
        // 存在无法移动的状态则不允许
        return ArrayUtils.matchAttributes(battler.actor.status, { cantMove: true }, true).length == 0;
    }
    /**
     * 是否允许攻击
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canAttack(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 使用技能代替普通攻击的模式下，未配置技能或技能不满足使用的话不允许攻击
        var actor = battler.actor;
        if ((!actor.atkSkill || actor.atkSkill.currentCD != 0 || actor.atkSkill.costSP > actor.sp)) return false;
        // 存在无法攻击的状态则不允许
        return ArrayUtils.matchAttributes(battler.actor.status, { cantAtk: true }, true).length == 0;
    }
    /**
     * 是否允许使用技能
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canUseSkill(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 已待机或死亡的话则不允许
        if (battler.isDead) return false;
        // 释放中不允许使用技能
        if (battler.duringRelease) return false;
        // 存在使用技能的状态则不允许
        if (ArrayUtils.matchAttributes(battler.actor.status, { cantUseSkill: true }, true).length == 1) return false;
        return true;
    }
    /**
     * 是否允许使用技能
     * @param battler 战斗者
     * @param skill 技能
     * @param checkUseSkillCommconCondition [可选] 默认值=true 检查使用技能的通用条件
     * @param recordTargets [可选] 默认值=null 记录目标
     * @param firstTarget 优先参考目标
     * @return [boolean] 
     */
    static canUseOneSkill(battler: ProjectClientSceneObject, skill: Module_Skill, checkUseSkillCommconCondition: boolean = true, recordTargets: ProjectClientSceneObject[] = null, firstTarget: ProjectClientSceneObject = null): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 检查通用技能条件
        var isAtkSkill = skill == battler.actor.atkSkill;
        if (checkUseSkillCommconCondition && !this.canUseSkill(battler)) return false;
        // 被动技能不允许
        if (skill.skillType == 2) return false;
        // 使用条件
        if ((battler.inBattle && skill.useCondition == 2) || (!battler.inBattle && skill.useCondition == 1)) return false;
        // 技能未冷却、不足的消耗情况不允许使用
        if (!this.isSkillCooled(skill) || skill.costSP > battler.actor.sp) return false;
        // 如果是非指向方向的技能则计算目标是否存在
        if (skill.skillReleaseType < 2) {
            var targets = this.getSkillTargets(battler, skill, firstTarget);
            // 没有目标的话则忽略（主角普通攻击除外）
            if (targets.length == 0 && (!isAtkSkill || battler != ProjectPlayer.ctrlActorSceneObject)) return false;
            // 记录目标
            if (recordTargets) { for (var i = 0; i < targets.length; i++) recordTargets.push(targets[i]); }
        }
        // -- 直接技能与指向前方方向则无法使用
        else if (skill.skillType == 0) {
            return false;
        }
        return true;
    }
    /**
     * 技能是否已冷却
     * @param skill 
     * @return [boolean] 
     */
    static isSkillCooled(skill: Module_Skill): boolean {
        if (skill.currentCD == 0) return true;
        return Game.now - skill.currentCD >= skill.totalCD * 1000;
    }
    /**
     * 状态是否超时
     * @param status 
     * @return [boolean] 
     */
    static isStatusOverTime(status: Module_Status): boolean {
        if (status.currentDuration == 0) return false;
        return Game.now - status.currentDuration >= status.totalDuration * 1000;
    }
    /**
     * 是否允许自动播放动作
     */
    static canAutoPlayAvatarAction(battler: ProjectClientSceneObject): boolean {
        // 本身未开启播放的话则不允许播放
        if (!battler.autoPlayEnable) return false;
        // 战斗者已死亡的话不允许
        if (battler.isDead) return false;
        // 非战斗者则允许
        if (!GameBattleHelper.isBattler(battler)) return true;
        // 存在无法自动播放动作的状态则不允许
        return ArrayUtils.matchAttributes(battler.actor.status, { cantAutoPlay: true }, true).length == 0;
    }
    /**
     * 是否允许更改朝向
     * @param battler 战斗者 
     * @return [boolean] 
     */
    static canChangeOri(battler: ProjectClientSceneObject): boolean {
        // 战斗者已死亡的话不允许
        if (battler.isDead) return false;
        // 非战斗者则允许
        if (!GameBattleHelper.isBattler(battler)) return true;
        // 存在禁止更改朝向的状态时则不允许
        return ArrayUtils.matchAttributes(battler.actor.status, { cantChangeOri: true }, true).length == 0;
    }
    /**
     * 是否允许作为目标
     * @return [boolean] 
     */
    static isCanHitBy(targetBattler: ProjectClientSceneObject, fromBattler: ProjectClientSceneObject, fromSkill: Module_Skill): boolean {
        // 目标已死亡的情况
        if (targetBattler.isDead) {
            return false;
        }
        // 同阵营的话直接允许
        if (fromBattler && GameBattleHelper.isFriendlyRelationship(targetBattler, fromBattler)) {
            return true;
        }
        // 无法被击中的情况
        if (ArrayUtils.matchAttributes(targetBattler.actor.status, { cantBeHit: true }, true).length == 1) {
            return false;
        }
        // 其他情况：允许
        return true;
    }
    //------------------------------------------------------------------------------------------------------
    // 获取战斗者
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取技能作用目标
     * @param battler 战斗者 
     * @param skill 技能
     * @param firstTarget 优先参考目标
     * @return [ProjectClientSceneObject] 
     */
    static getSkillTargets(battler: ProjectClientSceneObject, skill: Module_Skill, firstTarget: ProjectClientSceneObject = null): ProjectClientSceneObject[] {
        // 自己的情况则返回自己
        if (skill.targetType == 0) {
            if (this.isCanHitBy(battler, battler, skill)) {
                return [battler];
            }
            else {
                return [];
            }
        }
        // 指向前方方向的技能
        if (skill.skillReleaseType >= 2) return [];
        // 获取使用者的坐标点
        var battlePoint = new Point(battler.x, battler.y);
        // 获取使用者的扫描角度
        var userScanningAngleRange = this.getScanningAngleRange(battler, skill.scanAngle);
        // 遍历战斗者
        var targets: ProjectClientSceneObject[] = [];
        var singleTargetDis: number = Number.MAX_VALUE;
        // -- 我方周围目标默认包含自己
        if (skill.skillReleaseType == 1 && (skill.targetType == 1 || skill.targetType == 3 || skill.targetType == 5)) {
            if (this.isCanHitBy(battler, battler, skill)) {
                targets.push(battler);
            }
            // 单体的情况：已完成
            if (skill.targetType == 1 && targets.length == 1) return targets;
        }
        var sceneObjects = Game.currentScene.sceneObjects;
        var soLen = Game.currentScene.sceneObjects.length;
        for (var i = 0; i < soLen; i++) {
            var target: ProjectClientSceneObject = sceneObjects[i] as any;
            // 忽略不存在的目标或非战斗者
            if (!this.isBattler(target)) continue;
            // 忽略死亡目标
            if (target.isDead) continue;
            // 忽略计算自己
            if (target == battler) continue;
            // 无法被作用为目标
            if (!this.isCanHitBy(target, battler, skill)) continue;
            // 目标群体：根据技能类别列举可作用的目标：我方或敌方
            if ((this.isHostileSkill(skill) && GameBattleHelper.isHostileRelationship(battler, target)) ||
                (!this.isHostileSkill(skill) && GameBattleHelper.isFriendlyRelationship(battler, target))) {
                // 距离以外的不计算在内
                var targetPoint = new Point(target.x, target.y);
                var dis = Point.distance(battlePoint, targetPoint);
                if (skill.distance < dis) continue;
                // 作用类型-锥形区域/周围一圈内区域
                if ((skill.skillReleaseType == 0 && this.isInScanningAngleRange(target, battlePoint, userScanningAngleRange)) ||
                    skill.skillReleaseType == 1) {
                    targets.push(target);
                }
            }
        }
        // 如果非全体技能需要减少目标，根据距离远近剔除掉
        if (!(skill.targetType == 3 || skill.targetType == 4)) {
            var targetNum = (skill.targetType == 5 || skill.targetType == 6) ? skill.targetNum : 1;
            targets.sort((target1: ProjectClientSceneObject, target2: ProjectClientSceneObject) => {
                var dis1 = Point.distanceSquare2(battler.x, battler.y, target1.x, target1.y);
                var dis2 = Point.distanceSquare2(battler.x, battler.y, target2.x, target2.y);
                return dis1 < dis2 ? -1 : 1;
            });
            // 如果有首选目标的话则优先排到前面
            if (firstTarget) {
                var idx = targets.indexOf(firstTarget);
                if (idx != -1) {
                    targets.splice(idx, 1);
                    targets.unshift(firstTarget);
                }
            }
            if (targets.length > targetNum) targets.length = targetNum;
        }
        return targets;
    }
    /**
     * 获取角色的扫描角度范围（扇形角度）
     * @param so 场景对象
     * @param range [可选] 默认值=90 扇形角度
     * @return 起始角度和终点角度（0~360度欧拉角）
     */
    static getScanningAngleRange(so: ProjectClientSceneObject, rangeAngle: number): { start: number, end: number } {
        var dir = so.avatar.orientation;
        var angle = GameUtils.getAngleByOri(dir);
        return { start: angle - rangeAngle / 2, end: angle + rangeAngle / 2 };
    }
    /**
     * 判断目标是否在扫描范围内
     * @param target 目标对象
     * @param scanningPoint 扫描中心点
     * @param scanningRange 扫描角度范围（起点-终点，从左向右计算，end角度必须大于start角度） 
     * @return [boolean] 
     */
    static isInScanningAngleRange(target: ProjectClientSceneObject, scanningPoint: Point, scanningRange: { start: number, end: number }): boolean {
        var targetAngle = MathUtils.direction360(scanningPoint.x, scanningPoint.y, target.x, target.y);
        return MathUtils.inAngleRange(scanningRange.end, scanningRange.start, targetAngle);
    }
    //------------------------------------------------------------------------------------------------------
    // 算法
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取两个战斗者之间的格子距离
     * @param battler1 战斗者1
     * @param battler2 战斗者2
     */
    static getBattlerDistance(battler1: ProjectClientSceneObject, battler2: ProjectClientSceneObject) {
        return Math.abs(battler1.posGrid.x - battler2.posGrid.x) + Math.abs(battler1.posGrid.y - battler2.posGrid.y);
    }
    /**
     * 获取两个格子距离
     * @param battler1 战斗者1
     * @param battler2 战斗者2
     */
    static getGridDistance(grid1: Point, grid2: Point) {
        return Math.abs(grid1.x - grid2.x) + Math.abs(grid1.y - grid2.y);
    }

    /**
     * 计算击中结果
     * -- 状态变更
     * -- 计算伤害
     * -- 计算仇恨
     * -- 死亡判定
     * @param fromBattler 
     * @param targetBattler 
     * @param isHitSuccess 
     * @param actionType 0-普通攻击 1-使用技能 2-使用道具 3-状态
     * @param skill [可选] 默认值=null 
     * @param item [可选] 默认值=null 
     * @param status [可选] 默认值=null
     * @return  damageType=伤害类别（-2-无 -1-Miss 0-物理伤害 1-魔法伤害 2-真实伤害 3-恢复生命值 4-恢复魔法值） damage=伤害 isCrit=是否暴击
    */
    static calculationHitResult(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, isHitSuccess: boolean, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null): {
        damageType: number,
        damage: number,
        isCrit: boolean
    } {
        // 返回值
        var res: {
            damageType: number,
            damage: number,
            isCrit: boolean
        };
        // 来源和目标的角色数据
        var fromActor = fromBattler.actor;
        var targetBattlerActor = targetBattler.actor;
        // 添加的状态组
        var addTargetBattlerStatusArr: number[] = [];
        var addFromBattlerStatusArr: number[] = [];
        var removeTargetBattlerStatusArr: number[] = [];
        // 记录目标原有的状态
        var targetOriStatus = targetBattlerActor.status.concat();
        // 作用类别和相关数值 
        var damageType = -2; // -2-无 -1-MISS 0-物理伤害 1-魔法伤害 2-真实伤害 3-恢复生命值 4-恢复魔法值
        var hpChangeValue = 0;
        var spChangeValue = 0;
        // 击中后移除状态（造成伤害才允许移除）
        var hitRemoveStatus = false;
        // 计算暴击率
        var critPer: number = 1;
        var magCritPer: number = 1;
        var isCrit: boolean;
        var isMagCrit: boolean;
        // 优先计算状态和刷新属性（如技能带有降低对方属性的状态，即当前立刻以降低后的属性来计算伤害）
        if (isHitSuccess) {
            isCrit = MathUtils.rand(100) < fromActor.CRIT ? true : false;
            isMagCrit = MathUtils.rand(100) < fromActor.MagCrit ? true : false;
            critPer = isCrit ? 2 : 1;
            magCritPer = isMagCrit ? 2 : 1;
            // 普通攻击
            if (actionType == 0) {
                // 击中目标后自身附加的状态
                addFromBattlerStatusArr = addFromBattlerStatusArr.concat(fromActor.hitTargetSelfAddStatus);
                // 击中目标后目标附加的状态
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(fromActor.hitTargetStatus);
            }
            // 使用技能
            if (actionType <= 1) {
                // -- 添加的状态
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(skill.addStatus);
                // -- 减少的状态
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(skill.removeStatus);
            }
            // 使用道具
            else if (actionType == 2) {
                // -- 添加的状态
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(item.addStatus);
                // -- 减少的状态
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(item.removeStatus);
            }
            // 添加目标状态
            for (var i = 0; i < addTargetBattlerStatusArr.length; i++) {
                var addStatusID = addTargetBattlerStatusArr[i];
                GameBattlerHandler.addStatus(targetBattler, addStatusID, fromBattler);
            }
            // 移除目标状态
            for (var i = 0; i < removeTargetBattlerStatusArr.length; i++) {
                var removeStatusID = removeTargetBattlerStatusArr[i];
                GameBattlerHandler.removeStatus(targetBattler, removeStatusID);
            }
            // 添加来源的状态
            for (var i = 0; i < addFromBattlerStatusArr.length; i++) {
                var addStatusID = addFromBattlerStatusArr[i];
                GameBattlerHandler.addStatus(fromBattler, addStatusID, fromBattler);
            }
            // 如果目标更新了状态的话则刷新目标属性
            if (addTargetBattlerStatusArr.length > 0 || removeTargetBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level, targetBattler)
            }
            // 如果来源者更新了状态的话刷新来源的属性
            if (addFromBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level, targetBattler)
            }
        }
        // -- MISS
        if (!isHitSuccess) {
            damageType = -1;
            res = { damageType: -1, damage: hpChangeValue, isCrit: false };
        }
        // -- 普通攻击：(攻击者命中率 - 目标躲避率)%
        // else if (actionType == 0 && ) {
        //     damageType = 0;
        //     hpChangeValue = -Math.max(1, fromActor.ATK - targetBattlerActor.DEF) * critPer;
        //     res = { damageType: 0, damage: hpChangeValue, isCrit: isCrit };
        //     hitRemoveStatus = true;
        // }
        // -- 使用技能：else 
        if (isHitSuccess) {
            if (actionType <= 1) {
                var skillDamage = 0;
                // 使用伤害
                if (skill.useDamage) {
                    var damageShowCrit: boolean = false;
                    damageType = skill.damageType;
                    // -- 技能固定伤害
                    skillDamage = skill.damageValue;
                    // -- 技能伤害加成
                    if (skill.useAddition) {
                        var actorAttributeValue = skill.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                        var addDamageValue = skill.additionMultiple / 100 * actorAttributeValue;
                        skillDamage += addDamageValue;
                    }
                    // -- 物理伤害
                    if (damageType == 0) {
                        hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.DEF) * critPer;
                        hitRemoveStatus = true;
                        damageShowCrit = isCrit;
                    }
                    // -- 魔法伤害
                    else if (damageType == 1) {
                        hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.MagDef) * magCritPer;
                        hitRemoveStatus = true;
                        damageShowCrit = isMagCrit;
                    }
                    // -- 真实伤害
                    else if (damageType == 2) {
                        hpChangeValue = -Math.max(1, skillDamage);
                        hitRemoveStatus = true;
                    }
                    // -- 恢复生命值
                    else if (damageType == 3) {
                        hpChangeValue = Math.max(0, skillDamage) * magCritPer;
                        damageShowCrit = isMagCrit;
                    }
                    // -- 恢复魔法值
                    else if (damageType == 4) {
                        spChangeValue = Math.max(0, skillDamage) * magCritPer;
                        damageShowCrit = isMagCrit;
                    }
                    // -- 显示伤害 
                    if (hpChangeValue != 0) {
                        res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                    }
                    else if (spChangeValue != 0) {
                        res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                    }
                }
                // 造成来源技能的仇恨
                if (skill.useHate) {
                    GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, skill, skillDamage);
                }
                // 自己的仇恨列表增加
                if (GameBattleHelper.isHostileRelationship(fromBattler, targetBattler)) {
                    GameBattlerHandler.increaseHate(fromBattler, targetBattler, 1);
                }
            }
            // -- 使用道具
            else if (actionType == 2) {
                if (item.recoveryHP) {
                    damageType = 3;
                    hpChangeValue = item.recoveryHP;
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: false };
                }
                if (item.recoverySP) {
                    spChangeValue = item.recoverySP;
                    if (damageType != 3) {
                        damageType = 4;
                        res = { damageType: damageType, damage: spChangeValue, isCrit: false };
                    }
                }
            }
            // -- 状态:DOT/HOT
            else if (actionType == 3) {
                // 使用伤害
                damageType = status.damageType;
                var damageShowCrit: boolean = false;
                // -- 技能固定伤害
                var statusDamage = status.damageValue;
                // -- 技能伤害加成
                if (status.useAddition) {
                    var actorAttributeValue = status.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                    var addDamageValue = status.additionMultiple / 100 * actorAttributeValue;
                    statusDamage += addDamageValue;
                }
                // -- 物理伤害
                if (damageType == 0) {
                    hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.DEF);
                    hitRemoveStatus = true;
                    damageShowCrit = isCrit;
                }
                // -- 魔法伤害
                else if (damageType == 1) {
                    hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.MagDef);
                    hitRemoveStatus = true;
                    damageShowCrit = isMagCrit;
                }
                // -- 真实伤害
                else if (damageType == 2) {
                    hpChangeValue = -Math.max(1, statusDamage);
                    hitRemoveStatus = true;
                }
                // -- 恢复生命值
                else if (damageType == 3) {
                    hpChangeValue = Math.max(0, statusDamage);
                    damageShowCrit = isMagCrit;
                }
                // -- 恢复魔法值
                else if (damageType == 4) {
                    spChangeValue = Math.max(0, statusDamage);
                    damageShowCrit = isMagCrit;
                }
                // 状态叠加层
                hpChangeValue *= status.currentLayer;
                spChangeValue *= status.currentLayer;
                // -- 显示伤害
                if (hpChangeValue != 0) {
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                }
                else if (spChangeValue != 0) {
                    res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                }
                // 造成来源状态的仇恨
                GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, status, statusDamage);
                // 自己的仇恨列表增加
                if (GameBattleHelper.isHostileRelationship(fromBattler, targetBattler)) {
                    GameBattlerHandler.increaseHate(fromBattler, targetBattler, 1);
                }
            }
        }

        hpChangeValue = Math.floor(hpChangeValue);
        spChangeValue = Math.floor(spChangeValue);
        if (hpChangeValue != 0) targetBattlerActor.hp += hpChangeValue;
        if (spChangeValue != 0) targetBattlerActor.sp += spChangeValue;
        // 修正生命值和魔法值范围
        targetBattlerActor.hp = Math.max(Math.min(targetBattlerActor.hp, targetBattlerActor.MaxHP), 0);
        targetBattlerActor.sp = Math.max(Math.min(targetBattlerActor.sp, targetBattlerActor.MaxSP), 0);
        // 计算受伤害解除的状态
        if (hitRemoveStatus) {
            // 受伤解除状态
            var hitRemoveStatusSuccess = false;
            if ((actionType == 0 || actionType == 1 || actionType == 3) && damageType <= 2) {
                for (var i = 0; i < targetOriStatus.length; i++) {
                    var needRemoveStatus = targetOriStatus[i];
                    if (needRemoveStatus.removeWhenInjured && MathUtils.rand(100) < needRemoveStatus.removePer) {
                        if (GameBattlerHandler.removeStatus(targetBattler, needRemoveStatus.id)) hitRemoveStatusSuccess = true;
                    }
                }
                if (hitRemoveStatusSuccess) {
                    var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                    Game.refreshActorAttribute(targetBattlerActor, level, targetBattler);
                }
            }
        }
        return res;
    }
}