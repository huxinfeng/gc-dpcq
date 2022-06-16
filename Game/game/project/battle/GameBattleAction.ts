/**
 * 战斗行为
 * 
 * Created by 黑暗之神KDS on 2021-01-16 02:10:21.
 */
class GameBattleAction {
    //------------------------------------------------------------------------------------------------------
    // 变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 弹幕列表
     */
    private static bullets: GameBullet[] = [];
    /**
     * 刷新计数
     */
    private static updateCount: number = 0;
    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    static init(): void {

    }
    /**
     * 开始
     */
    static start(): void {
        os.add_ENTERFRAME(this.update, this);
    }
    /**
     * 结束
     */
    static stop(): void {
        // 停止战斗者移动
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            this.stopAction(allBattlers[i]);
        }
        // 销毁全部弹幕
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].dispose();
        }
        this.bullets = [];
        os.remove_ENTERFRAME(this.update, this);
    }

    private static update() {
        if (Game.pause) return;
        this.updateCount++;
        var now = Game.now;
        // 刷新弹幕
        this.updateBullets(now);
    }
    /**
     * 刷新弹幕
     */
    private static updateBullets(now: number): void {
        // 遍历全部弹幕，击中后计算伤害并移除
        for (var i = 0; i < this.bullets.length; i++) {
            var bullet = this.bullets[i];
            var bulletState = bullet.update(now);
            if (bulletState.isHit) {
                for (var s in bulletState.targets) {
                    var target = bulletState.targets[s];
                    if (target.isDisposed || target.isDead) continue;
                    this.hitTarget(bullet.from, target, 1, bullet.skill);
                }
            }
            if (bulletState.isOver) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 战斗者：行为
    //------------------------------------------------------------------------------------------------------
    static stopAction(battler: ProjectClientSceneObject): void {
        if (!battler.isDead) {
            battler.stopMove();
        }
    }
    /**
     * 使用技能
     * @param fromBattler 战斗者
     * @param skill 技能
     * @param firstTarget 优先参考目标
     * @return [boolean] 是否使用成功 
     */
    static useSkill(fromBattler: ProjectClientSceneObject, skill: Module_Skill, firstTarget: ProjectClientSceneObject = null): boolean {
        // 参数验证
        if (!fromBattler || !skill) return false;
        // 无法使用技能的场合判定（同时获取可被作用的目标）
        var recordTargets = [];
        if (!GameBattleHelper.canUseOneSkill(fromBattler, skill, true, recordTargets, firstTarget)) return false;
        // 替换
        // trace("作用目标", recordTargets.length, skill.name, skill.releaseActionID);
        // 技能消耗
        fromBattler.actor.sp -= skill.costSP;
        if (skill.costSP != 0 && fromBattler.inPartyIndex >= 0) {
            fromBattler.refreshPointBar();
        }
        // 技能冷却计时
        skill.currentCD = Game.now;
        // skill.currentCD = 0;

        // 实际使用函数
        var doUseSkill = () => {
            // 存在释放动作的话：播放攻击释放后进入下一个阶段
            if (skill.useAction2 && Math.random() < 0.5) {
                var releaseActionID = skill.releaseActionID2;
                var releaseFrame = skill.releaseFrame2;
            }
            else {
                var releaseActionID = skill.releaseActionID;
                var releaseFrame = skill.releaseFrame;
            }
            fromBattler.stopMove();
            // 单体技能变更朝向？
            // if (recordTargets.length == 1) {
            //     var angle = MathUtils.direction360(fromBattler.x, fromBattler.y, recordTargets[0].x, recordTargets[0].y);
            //     var ori = GameUtils.getOriByAngle(angle);
            //     fromBattler.avatarOri = ori;
            // }
            var angle = null;
            if (skill.skillType == 1 && (skill.skillReleaseType == 3 && ProjectUtils.lastControl != 2)) {
                if (ProjectPlayer.ctrlActorSceneObject == fromBattler) {
                    angle = MathUtils.direction360(fromBattler.x, fromBattler.y, Game.currentScene.localX, Game.currentScene.localY);
                }
                else if (fromBattler.battleAI.myTarget) {
                    angle = MathUtils.direction360(fromBattler.x, fromBattler.y, fromBattler.battleAI.myTarget.x, fromBattler.battleAI.myTarget.y);
                }
                else {
                    angle = GameUtils.getAngleByOri(fromBattler.avatarOri);
                }
                // 面朝该方向
                var ori = GameUtils.getOriByAngle(angle);
                fromBattler.avatarOri = ori;
            }

            GameBattlerHandler.releaseAction(fromBattler, releaseActionID, releaseFrame, 1, () => {
                this.releaseSkill(fromBattler, skill, recordTargets, angle);
            });
            // 播放释放动画
            if (skill.releaseAnimation) {
                fromBattler.playAnimation(skill.releaseAnimation, false, true);
            }
        }
        // 技能使用时事件
        if (skill.releaseEvent) CommandPage.startTriggerFragmentEvent(skill.releaseEvent, fromBattler, fromBattler, Callback.New(doUseSkill, this));
        else doUseSkill.apply(this);
        return true;
    }
    //------------------------------------------------------------------------------------------------------
    // 内部行为流程实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 释放技能
     * @param fromBattler 来源战斗者
     * @param skill 施放的技能
     * @param gridPos 施放的格子坐标
     * @param targets 包含的目标集
     */
    private static releaseSkill(fromBattler: ProjectClientSceneObject, skill: Module_Skill, targets: ProjectClientSceneObject[], angle: number) {
        // 直接技能：
        if (skill.skillType == 0) {
            for (var i = 0; i < targets.length; i++) {
                this.hitTarget(fromBattler, targets[i], 1, skill);
            }
        }
        // 弹幕技能：
        else if (skill.skillType == 1) {
            // 指向方向的技能
            if (skill.skillReleaseType >= 2) {
                this.releaseBullet(fromBattler, skill, null, angle);
            }
            // 指向目标的技能
            else {
                for (var i = 0; i < targets.length; i++) {
                    this.releaseBullet(fromBattler, skill, targets[i], angle);
                }
            }
        }
    }
    /**
     * 发射子弹
     * @param skill 技能
     * @param posGrid 目的地所在格子位置
     * @param targetBattler 战斗者
     */
    private static releaseBullet(fromBattler: ProjectClientSceneObject, skill: Module_Skill, targetBattler: ProjectClientSceneObject = null, angle: number = null) {
        var bullet = new GameBullet(Game.now, fromBattler, targetBattler, skill, angle);
        this.bullets.push(bullet);
    }
    /**
     * 击中目标：攻击、技能、道具、状态
     * -- 计算命中率
     * -- 播放击中动画
     * -- 调用击中片段事件
     * -- 进入伤害结算
     * @param fromBattler 来源战斗者
     * @param targetBattler 目标战斗者
     * @param actionType 0-普通攻击 1-使用技能 2-使用道具 3-状态
     * @param skill [可选] 默认值=null 使用的技能
     * @param item [可选] 默认值=null 使用的道具
     * @param status [可选] 默认值=null 使用的状态
     */
    static hitTarget(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null): void {
        if (actionType == 1 && fromBattler.actor.atkSkill == skill) actionType = 0;
        // 获取战斗者的角色数据
        var fromActor = fromBattler.actor;
        var battleActor = targetBattler.actor;
        // 是否命中标识，根据对应行为计算命中率
        var isHitSuccess = true;
        // 击中动画
        var hitAniID = 0;
        // 是否显示目标受伤动作
        var showTargetHurtAnimation = false;
        // 普通攻击：(攻击者命中率 - 目标躲避率)%
        if (actionType == 0) {
            isHitSuccess = MathUtils.rand(100) < (fromActor.HIT - battleActor.DOD);
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = true;
        }
        // 使用技能：(技能命中率)%
        else if (actionType == 1) {
            isHitSuccess = MathUtils.rand(100) < skill.hit;
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = GameBattleHelper.isHostileRelationship(fromBattler, targetBattler);
        }
        // 使用道具：100%
        else if (actionType == 2) {
            isHitSuccess = true;
            hitAniID = item.useAnimation;
        }
        // 状态:DOT/HOT
        else if (actionType == 3) {
            showTargetHurtAnimation = false;
        }
        // 内部函数
        var callNextStep = () => {
            // 如果目标允许被击中的话
            if (GameBattleHelper.isCanHitBy(targetBattler, fromBattler, skill)) {
                this.hitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status);
            }
        }
        var callHitEvent = () => {
            // 执行片段事件-战斗过程：击中事件
            if (actionType <= 1 && isHitSuccess && skill.hitEvent) CommandPage.startTriggerFragmentEvent(skill.hitEvent, fromBattler, targetBattler, Callback.New(callNextStep, this));
            else if (actionType == 2 && item.callEvent) CommandPage.startTriggerFragmentEvent(item.callEvent, fromBattler, targetBattler, Callback.New(callNextStep, this));
            else callNextStep.apply(this);
        }
        // 存在击中动画：显示击中动画
        if (hitAniID) {
            // 已进入伤害显示阶段标识
            var alreadyInShowDamageStage = false;
            // 命中的话显示受伤动作和动画
            if (isHitSuccess && showTargetHurtAnimation) {
                // -- 受伤动画
                // if (WorldData.hurtAni) targetBattler.playAnimation(WorldData.hurtAni, true, true);
            }
            // 播放击中动画
            var hitAni = targetBattler.playAnimation(hitAniID, false, isHitSuccess, null, true);
            // hitAni.offsetX = 0;
            // hitAni.offsetY = -100;
            callHitEvent.apply(this);
        }
        // 不存在时：直接进入下一个阶段
        else {
            callHitEvent.apply(this);
        }
    }
    /**
     * 计算击中后的效果
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
     * @param playEffect [可选] 默认值=true 播放效果 
     */
    static hitResult(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, isHitSuccess: boolean, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null): void {
        if (!GameBattleHelper.isBattler(targetBattler)) {
            return;
        }
        // 计算击中结果
        var res = GameBattleHelper.calculationHitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status)
        if (res) {
            // 血条刷新
            targetBattler.pointBar.hpBar.value = targetBattler.actor.hp * 100 / targetBattler.actor.MaxHP;
            this.showDamage(targetBattler, res.damageType, res.damage, res.isCrit);
        }
        // 检查是否死亡   
        GameBattle.checkBattlerIsDead(targetBattler, fromBattler);
        // 刷新
        targetBattler.refreshPointBar();
    }
    //------------------------------------------------------------------------------------------------------
    // 其他演出效果显示
    //------------------------------------------------------------------------------------------------------
    /**
     * 显示伤害
     * @param targetBattler 目标战斗者
     * @param damageType  -2-无 -1-Miss 0-物理伤害 1-魔法伤害 2-真实伤害 3-恢复生命值 4-恢复魔法值
     * @param damage [可选] 默认值=0 伤害
     * @param isCrit [可选] 默认值=false 是否暴击
     * @param onFin [可选] 默认值=null 回调
     */
    static showDamage(targetBattler: ProjectClientSceneObject, damageType: number, damage: number = 0, isCrit: boolean = false, onFin: Callback = null): void {
        if (!Game.currentScene) return;
        var lastRelease = true;
        // 取整
        damage = Math.floor(damage);
        // 伤害显示对应的界面
        var uiID: number;
        switch (damageType) {
            case -2:
                uiID = 0;
                break;
            case -1:
                uiID = 1041;
                break;
            default:
                uiID = 1042 + damageType;
                break;
        }
        // 显示伤害（治疗）文字效果
        if (uiID != 0) {
            var damageUI = GameUI.load(uiID, true);
            damageUI.x = targetBattler.x;
            damageUI.y = targetBattler.y;
            Game.currentScene.animationHighLayer.addChild(damageUI);
            var targetUI = damageUI["target"];
            if (!targetUI) targetUI = damageUI.getChildAt(0);
            if (targetUI) {
                if (damageType >= 0) {
                    var damageLabel: UIString = damageUI["damage"];
                    if (damageLabel && damageLabel instanceof UIString) {
                        damageLabel.text = (damage > 0 ? "+" : "") + damage.toString();
                    }
                }
                var damageAni = new GCAnimation();
                damageAni.target = targetUI;
                damageAni.once(GCAnimation.PLAY_COMPLETED, this, () => {
                    damageAni.dispose();
                    damageUI.dispose();
                    if (lastRelease) {
                        onFin && onFin.run();
                    }
                });
                damageAni.id = (isCrit ? 1049 : 1046) + MathUtils.rand(3);
                damageAni.play();
                if (!lastRelease) {
                    onFin && onFin.run();
                }
                return;
            }
        }
        onFin && onFin.run();
    }
}