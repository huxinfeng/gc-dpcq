/**
 * 战斗者AI-处理器
 * 
 * Created by 黑暗之神KDS on 2021-01-14 14:26:09.
 */
class GameBattleAI {
    //------------------------------------------------------------------------------------------------------
    // 配置
    //------------------------------------------------------------------------------------------------------
    /**
     * 行动频率，10表示每间隔10帧处理一次
     */
    private static FREQUENCY: number = 15;
    //------------------------------------------------------------------------------------------------------
    // 静态变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 敌人集合
     */
    private static enemys: ProjectClientSceneObject[] = [];
    /**
     * 友军集合（非玩家拥有的角色）
     */
    private static allyBattlers: ProjectClientSceneObject[] = [];
    /**
     * 玩家的战斗者集合
     */
    private static playerBattlers: ProjectClientSceneObject[] = [];
    //------------------------------------------------------------------------------------------------------
    // 实例变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 操作的战斗者
     */
    battler: ProjectClientSceneObject;
    /**
     * 仇恨列表
     */
    hateList: DataStructure_battlerHate[];
    /**
     * 阶段 0-无 1-追击敌人 2-返回
     */
    aiStage: number = 0;
    /**
     * 想达的格子坐标点
     */
    private wantToGoGrid: Point;
    /**
     * 
     */
    private aiUpdateCount: number = 0;
    /**
     * 仅在指定帧中行动：以便分摊帧计算
     */
    private aiUpdateInFrame: number = MathUtils.rand(GameBattleAI.FREQUENCY);
    /**
     * 我的目标
     */
    myTarget: ProjectClientSceneObject;
    /**
     * 
     */
    private aiInBattlePoint: Point;
    /**
     * 回到进入战斗中的位置时标识
     */
    isInBackToInBattlePoint: boolean;

    /**
     * 警戒层
     */
    private vigilanceRangeLayer: Sprite;
    /**
     * 上次所在位置，用于计算移动卡住后更换方式移动
     */
    private lastPosition: Point = new Point();
    /**
     * 滞留次数
     */
    private cantAtkMoveTimes = 0;

    /**
     * 构造函数
     */
    constructor(battler: ProjectClientSceneObject) {
        this.battler = battler;
        this.hateList = [];
        // 警戒层初始化：主动攻击的敌人
        if (GameBattleHelper.isEnemyCamp(battler) && battler.actor.aiType == 0) {
            EventUtils.addEventListenerFunction(Game, Game.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE, this.refreshVigilanceRange, this);
            this.vigilanceRangeLayer = new Sprite();
            Game.currentScene.animationLowLayer.addChildAt(this.vigilanceRangeLayer, 0);
            this.vigilanceRangeLayer.blendMode = "lighter";
        }
        // 监听：战斗者更改朝向事件
        this.battler.on(ProjectClientSceneObject.CHANGE_ORI, this, this.onBattlerChangeOri);
        // 刷新警戒层显示效果
        this.refreshBattlerVigilanceRangeEffect();
    }
    /**
     * 销毁
     */
    dispose(clearBattlerStatus: boolean = true): void {
        if (!this.battler) return;
        if (clearBattlerStatus) {
            // -- 清理来源是该战斗者的状态
            GameBattlerHandler.removeAllBattlerStatusByFromBattler(this.battler);
            // -- 清理自身的状态
            GameBattlerHandler.removeAllStatus(this.battler);
        }
        // -- 清理战斗者的仇恨
        GameBattlerHandler.clearHateList(this.battler, true);
        // -- 刷新进入战斗的状态
        GameBattlerHandler.refreshInBattleState(this.battler);
        // -- 当战斗者更改朝向
        this.battler.off(ProjectClientSceneObject.CHANGE_ORI, this, this.onBattlerChangeOri);
        // -- 清理战斗者的警戒层
        if (this.vigilanceRangeLayer) {
            this.vigilanceRangeLayer.graphics.clear();
            this.vigilanceRangeLayer.removeSelf();
            this.vigilanceRangeLayer = null;
        }
        // -- 清除记录
        this.battler = null;
    }

    //------------------------------------------------------------------------------------------------------
    // 更新
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始
     */
    static start(): void {
        os.add_ENTERFRAME(this.update, this);
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, this.onBattlerDead, this);
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_RESUSCITATE, this.onBattlerResuscitate, this);
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, this.onBattlerInBattle, this);
    }
    /**
     * 停止
     */
    static stop(): void {
        os.remove_ENTERFRAME(this.update, this);
        EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, this.onBattlerDead, this);
        EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_RESUSCITATE, this.onBattlerResuscitate, this);
        EventUtils.removeEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, this.onBattlerInBattle, this);
    }
    /**
     * 刷新
     * @param now 
     * @param updateCount 
     */
    static update(): void {
        if (Game.pause) return;
        var sceneObjects = Game.currentScene.sceneObjects;
        this.enemys.length = 0;
        this.allyBattlers.length = 0;
        this.playerBattlers.length = 0;
        for (var i = 0; i < sceneObjects.length; i++) {
            var so: ProjectClientSceneObject = sceneObjects[i] as any;
            if (!GameBattleHelper.isBattler(so)) continue;
            if (so.camp == 0) {
                if (!so.isDead) {
                    this.enemys.push(so);
                }
            }
            else if (so.camp == 1) {
                if (!so.isDead) {
                    this.allyBattlers.push(so);
                }
            }
            else if (so.camp == -1) {
                this.playerBattlers.push(so);
            }
        }
        // 刷新NPC-AI
        var npcBattlers = this.enemys.concat(this.allyBattlers);
        for (var i = 0; i < npcBattlers.length; i++) {
            var npcBattler = npcBattlers[i];
            this.updateNPCAI(npcBattler);
        }
        // 刷新队友AI（当前控制者除外）
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var teamMember = ProjectPlayer.getPlayerPartyBattler(i);
            if (teamMember != ProjectPlayer.ctrlActorSceneObject) {
                if (!teamMember.isDead) {
                    this.updateTeamMemberAI(teamMember);
                }
            }
        }
        // 刷新警戒范围坐标
        this.refreshBattlerVigilanceRangeEffectPosition();
    }
    //------------------------------------------------------------------------------------------------------
    // NPC-AI
    //------------------------------------------------------------------------------------------------------
    private static updateNPCAI(battler: ProjectClientSceneObject): void {
        var battlerAI = battler.battleAI;
        if (!battlerAI) return;
        // 仅在其指定帧才计算，以便节约性能消耗
        battlerAI.aiUpdateCount++;
        if (battlerAI.aiUpdateCount % this.FREQUENCY != battlerAI.aiUpdateInFrame) return;
        // 不行动者，不采取任何行动
        if (battler.actor.aiType == 2) return;
        // 如果被动模式且没有仇恨列表的话忽略
        if (battler.actor.aiType == 1 && battlerAI.hateList.length == 0) {
            if (battlerAI.aiStage == 2) {
                battlerAI.backToInBattlePostion();
            }
            return;
        }
        // 获取当前敌人的坐标点
        var soPoint = new Point(battler.x, battler.y);

        var btTarget: ProjectClientSceneObject;

        // 当没有仇恨目标时或就近获取目标的模式
        if ((battlerAI.hateList.length == 0)) {
            // 主动搜寻敌人（扇形区域），加入到仇恨列表
            var userScanningAngleRange = GameBattleHelper.getScanningAngleRange(battler, battler.actor.vigilanceAngle);
            // 目标群体
            if (battler.camp == 0) {
                var targetBattlers = this.playerBattlers.concat(this.allyBattlers);
            }
            else {
                targetBattlers = this.enemys;
            }
            for (var i = 0; i < targetBattlers.length; i++) {
                var target = targetBattlers[i];
                // 忽略死亡的目标
                if (target.isDead) continue;
                // 距离判定以及扫描角度
                var dis = Point.distance(new Point(target.x, target.y), soPoint);
                if (dis <= battler.actor.aiVigilanceRange && GameBattleHelper.isInScanningAngleRange(target, soPoint, userScanningAngleRange)) {
                    GameBattlerHandler.increaseHate(battler, target, 0);
                    break;
                }
            }

        }
        // 否则当存在仇恨目标时则获取首个目标
        else if (battlerAI.hateList.length > 0) {
            btTarget = Game.currentScene.sceneObjects[battlerAI.hateList[0].targetIndex];
        }
        // 记录当前的目标
        battlerAI.myTarget = btTarget;

        if (!btTarget) {
            if (battlerAI.aiStage == 2) {
                battlerAI.backToInBattlePostion();
            }
            return;
        }

        // 开始做出战斗行为，记录其原来的行为
        battler.eventStartWait(null, false);

        // 设置阶段：追击敌人
        battlerAI.aiStage = 1;
        // 当处于战斗状态时：
        // 记录进入战斗的坐标
        if (!battlerAI.aiInBattlePoint) battlerAI.aiInBattlePoint = new Point(soPoint.x, soPoint.y);
        // 获取目标

        var targetPoint = new Point(btTarget.x, btTarget.y);
        // 处理丢失目标的情况
        var lostTarget: boolean = false;
        var dis1 = Point.distance(soPoint, targetPoint);
        if (dis1 >= battler.actor.lostTargetRange1) {
            lostTarget = true;
        }
        else {
            var dis2 = Point.distance(battlerAI.aiInBattlePoint, targetPoint);
            if (dis2 >= battler.actor.lostTargetRange2) {
                lostTarget = true;
            }
        }
        if (lostTarget) {
            // 将其从仇恨列表中移除
            GameBattlerHandler.removeHateTarget(battler, btTarget);
            GameBattlerHandler.removeHateTarget(btTarget, battler);
            // 仇恨列表为空则返回
            if (battlerAI.hateList.length == 0) {
                battlerAI.aiStage = 2;
                battlerAI.backToInBattlePostion();
            }
            return;
        }
        // 设置回到进入战斗中的位置时标识
        battlerAI.isInBackToInBattlePoint = false;
        // 攻击目标
        this.attackTarget(battler, btTarget, dis1);
    }
    /**
     * 回到进入战斗的地点
     */
    private backToInBattlePostion() {
        var battler = this.battler;
        var battlerAI = battler.battleAI;
        if (battler.actor.lostTargetBack && (battlerAI.aiInBattlePoint.x != battler.x || battlerAI.aiInBattlePoint.y != battler.y)) {
            if (GameBattleHelper.canMove(battler)) {
                battlerAI.isInBackToInBattlePoint = true;
                battler.autoFindRoadMove(battlerAI.aiInBattlePoint.x, battlerAI.aiInBattlePoint.y, 1, 0, true, false, true, WorldData.moveDir4);
                // -- 监听一次移动完成事件，如果仍然处于返回阶段的话则清空进入战斗的地点
                battler.once(ProjectClientSceneObject.MOVE_OVER, this, () => {
                    if (battlerAI.aiStage == 2) {
                        battlerAI.aiStage = 0;
                        battlerAI.aiInBattlePoint = null;
                        battlerAI.isInBackToInBattlePoint = false;
                        battler.eventCompleteContinue();
                        Game.refreshActorAttribute(battler.actor, GameBattleHelper.getLevelByActor(battler.actor), battler);
                    }
                });
            }
        }
        else {
            battlerAI.aiStage = 0;
            battlerAI.aiInBattlePoint = null;
            battler.eventCompleteContinue();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 玩家队伍的战斗者
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    // 队友-AI
    //------------------------------------------------------------------------------------------------------
    private static updateTeamMemberAI(battler: ProjectClientSceneObject): void {
        var battlerAI = battler.battleAI;
        if (!battlerAI) return;
        // 仅在其指定帧才计算，以便节约性能消耗
        battlerAI.aiUpdateCount++;
        if (battlerAI.aiUpdateCount % this.FREQUENCY != battlerAI.aiUpdateInFrame) return;
        // 获取敌人
        // --被动型：
        if (Game.player.data.aiMode == 0) {
            // 当没有目标时：获取该战斗者的仇恨列表中的最大仇恨者
            if (!battlerAI.myTarget) {
                if (battlerAI.hateList.length > 0) {
                    var hateInfo = battlerAI.hateList[0];
                    battlerAI.myTarget = Game.currentScene.sceneObjects[hateInfo.targetIndex];
                }
            }
            // 当仍然没有目标时：获取控制者仇恨列表中最大仇恨者
            if (!battlerAI.myTarget) {
                // trace("控制者仇恨？", ProjectPlayer.ctrlActorSceneObject.battleAI.hateList.length)
                if (ProjectPlayer.ctrlActorSceneObject.battleAI.hateList.length > 0) {
                    var hateInfo = ProjectPlayer.ctrlActorSceneObject.battleAI.hateList[0];
                    battlerAI.myTarget = Game.currentScene.sceneObjects[hateInfo.targetIndex];
                }
            }
        }
        // -- 主动型
        else {
            // 固定警戒范围内获取最近的目标
            if (!battlerAI.myTarget) {
                var vigilanceRange2 = Math.pow(Game.player.data.aiVigilanceRange, 2);
                var minDis2 = Number.MAX_VALUE;
                for (var i = 0; i < this.enemys.length; i++) {
                    var enemy = this.enemys[i];
                    var dis2 = Point.distanceSquare2(battler.x, battler.y, enemy.x, enemy.y);
                    if (dis2 <= minDis2 && dis2 <= vigilanceRange2) {
                        minDis2 = dis2;
                        battlerAI.myTarget = enemy;
                    }
                }
            }
        }
        // 获取当前敌人的坐标点
        var soPoint = new Point(battler.x, battler.y);
        // 获取与主角的距离
        var dis1 = Point.distance(soPoint, new Point(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y));
        // 脱离战斗的处理：离主角第一距离则脱离战斗，离主角第二距离则瞬移
        var lostTarget: boolean = false;
        // 离操控者超出更远的距离则瞬移至操控者附近
        if (dis1 >= stage.width) {
            GameBattleAction.stopAction(battler);
            GameBattlerHandler.clearHateList(battler);
            GameBattlerHandler.removeHateTargetFromAllList(battler);
            battler.setTo(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y);
            battlerAI.wantToGoGrid = null;
            this.followCtrlActorSceneObject(battler, dis1);
            return;
        }
        // 离操控者超出指定的距离则脱离战斗，清理仇恨列表
        else if (dis1 >= stage.width / 2) {
            GameBattleAction.stopAction(battler);
            GameBattlerHandler.clearHateList(battler);
            GameBattlerHandler.removeHateTargetFromAllList(battler);
            this.followCtrlActorSceneObject(battler, dis1);
            return;
        }
        // 当处于战斗状态时：
        if (battlerAI.myTarget) {
            // 目标的位置
            var targetPoint = new Point(battlerAI.myTarget.x, battlerAI.myTarget.y);
            // 处理丢失目标的情况
            let dis2 = Point.distance(soPoint, targetPoint);
            // 攻击目标
            this.attackTarget(battler, battlerAI.myTarget, dis2);
        }
        // 跟随主角
        else {
            this.followCtrlActorSceneObject(battler, dis1);
        }
    }
    /**
     * 攻击目标--待改进
     * @param so 
     * @param btTarget 
     * @param distance 
     */
    private static attackTarget(so: ProjectClientSceneObject, btTarget: ProjectClientSceneObject, distance: number): void {
        // 移动处理
        var atkSkill = so.actor.atkSkill;
        // 如果移动方式非固定或是玩家角色的话且允许移动时
        if ((so.actor.moveType != 0 || so.camp == -1) && GameBattleHelper.canMove(so)) {
            // 接近目标：保持攻击距离
            var keepingDis: number = Math.max(Config.SCENE_GRID_SIZE, atkSkill.distance);
            if (distance > keepingDis) {
                var posArr = SceneUtils.getAroundPositions(1, btTarget, so);
                // -- 移动目的地
                var moveToDestination: Point;
                if (posArr.length > 0) {
                    moveToDestination = posArr[0];
                    so.autoFindRoadMove(posArr[0].x, posArr[0].y, 1, 0, true, false, true, moveDir4);
                }
                else {
                    moveToDestination = btTarget.pos;
                    so.autoFindRoadMove(btTarget.x, btTarget.y, 1, 0, true, false, true, moveDir4);
                }
                var isCantAtkMove = so.battleAI.lastPosition.x == so.x && so.battleAI.lastPosition.y == so.y;
                var moveDir4 = isCantAtkMove ? true : WorldData.moveDir4;
                if (isCantAtkMove) {
                    so.battleAI.cantAtkMoveTimes++;
                    // 滞留次数过多，至少
                    if (so.battleAI.cantAtkMoveTimes >= 5) {
                        var myAroundPosArr = SceneUtils.getAroundPositions(1, so, btTarget);
                        if (myAroundPosArr.length > 0) moveToDestination = myAroundPosArr[0];
                        so.battleAI.cantAtkMoveTimes = 0;
                    }
                }
                else {
                    so.battleAI.cantAtkMoveTimes = 0;
                }
                so.autoFindRoadMove(moveToDestination.x, moveToDestination.y, 1, 0, true, false, true, moveDir4);
                so.battleAI.lastPosition.x = so.x;
                so.battleAI.lastPosition.y = so.y;
            }
            else if (!so.duringRelease) {
                so.stopMove();
            }
        }
        var isFaceToTarget = false;
        // 使用技能
        if (distance < atkSkill.distance) {
            if (!isFaceToTarget) {
                this.faceToTarget(so, btTarget);
                isFaceToTarget = true;
            }
            var useAtkSuccess: boolean = GameBattleAction.useSkill(so, atkSkill, btTarget);
            if (useAtkSuccess) {
                return;
            }
        }
        for (var i = 0; i < so.actor.skills.length; i++) {
            var skill = so.actor.skills[i];
            if (distance < skill.distance) {
                if (!isFaceToTarget) {
                    this.faceToTarget(so, btTarget);
                    isFaceToTarget = true;
                }
                var useSkillSuccess: boolean = GameBattleAction.useSkill(so, skill, btTarget);
                if (useSkillSuccess) {
                    return;
                }
            }
        }
    }
    private static faceToTarget(battler: ProjectClientSceneObject, target: ProjectClientSceneObject): void {
        if (!battler.duringRelease && !battler.fixOri) {
            var angle = MathUtils.direction360(battler.x, battler.y, target.x, target.y);
            var ori = GameUtils.getOriByAngle(angle);
            battler.avatarOri = ori;
        }
    }
    /**
     * 跟随控制者
     * @param so 
     * @param distance 
     */
    private static followCtrlActorSceneObject(battler: ProjectClientSceneObject, distance: number): void {
        // 不允许移动的场合
        if (!GameBattleHelper.canMove(battler)) return;

        // 距离较远的时候：跟随
        // if (distance > Config.SCENE_GRID_SIZE * 2) {
        var posArr = SceneUtils.getAroundPositions(0, ProjectPlayer.ctrlActorSceneObject, battler);
        if (posArr.length > 0) {
            battler.autoFindRoadMove(posArr[0].x, posArr[0].y, 1, 0, true, false, true, WorldData.moveDir4);
        }
        else {
            battler.autoFindRoadMove(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y, 1, 0, true, false, true, WorldData.moveDir4);
        }
    }

    /**
     * 获取目标
     */
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    private onBattlerChangeOri(): void {
        this.refreshBattlerVigilanceRangeEffect();
    }
    private refreshBattlerVigilanceRangeEffect(): void {
        if (!this.vigilanceRangeLayer) return;
        this.vigilanceRangeLayer.graphics.clear();
        // 忽略掉无法产生
        if (this.battler.isDead || this.battler.inBattle || !WorldData.showVigilanceRange) return;
        // 如果是非战斗
        var oriAngle = GameUtils.getAngleByOri(this.battler.avatarOri) - 90;
        var halfAngle = Math.floor(this.battler.actor.vigilanceAngle / 2);
        var color = WorldData.vigilanceColor;
        this.vigilanceRangeLayer.alpha = WorldData.vigilanceAlpha;
        this.vigilanceRangeLayer.graphics.drawPie(0, 0, this.battler.actor.aiVigilanceRange, oriAngle - halfAngle, oriAngle + halfAngle, color);
    }
    /**
     * 刷新
     */
    private static refreshBattlerVigilanceRangeEffectPosition() {
        for (var i = 0; i < this.enemys.length; i++) {
            var enemy = this.enemys[i];
            if (enemy && enemy.battleAI) {
                var layer = enemy.battleAI.vigilanceRangeLayer;
                if (layer) {
                    layer.x = enemy.x;
                    layer.y = enemy.y;
                }
            }
        }
    }
    /**
     * 当战斗者死亡时
     * @param battler 战斗者
     */
    private static onBattlerDead(battler: ProjectClientSceneObject): void {
        if (battler && battler.battleAI) {
            battler.battleAI.refreshBattlerVigilanceRangeEffect();
        }
    }
    /**
     * 当战斗者复活时
     * @param battler 战斗者
     */
    private static onBattlerResuscitate(battler: ProjectClientSceneObject): void {
        if (battler && battler.battleAI) {
            battler.battleAI.refreshBattlerVigilanceRangeEffect();
        }
    }
    /**
     * 当战斗者进入或离开战斗的情况
     */
    private static onBattlerInBattle(isInBattle: boolean, battler: ProjectClientSceneObject): void {
        if (battler && battler.battleAI) {
            battler.battleAI.refreshBattlerVigilanceRangeEffect();
        }
    }
    private refreshVigilanceRange(): void {
        if (this.vigilanceRangeLayer) {
            this.vigilanceRangeLayer.visible = WorldData.showVigilanceRange;
            if (WorldData.showVigilanceRange) this.refreshBattlerVigilanceRangeEffect();
        }
    }

}