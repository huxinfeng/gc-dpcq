/**
 * 战斗核心流程类
 * 
 * Created by 黑暗之神KDS on 2021-01-14 09:47:28.
 */
class GameBattle {
    //------------------------------------------------------------------------------------------------------
    // 配置
    //------------------------------------------------------------------------------------------------------
    /**
     * 镜头指向场景对象的缓动时间帧数
     */
    static cameraTweenFrame: number = 20;
    /**
     * 每次行动思考时间
     */
    static actionReflectionTime: number = 200;
    /**
     * 无行动者等待时间
     */
    static noActionWaitTime: number = 1000;
    //------------------------------------------------------------------------------------------------------
    // 系统
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗参数设定
     */
    static setting: CustomCommandParams_5001;
    //------------------------------------------------------------------------------------------------------
    // 流程相关
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗回合
     */
    static battleRound: number = 0;
    /**
     * 先行方
     */
    static firstCamp: number;
    /**
     * 回合内阶段步骤
     */
    static inTurnStage: number;
    /**
     * 玩家自由操作标识
     */
    static playerControlEnabled: boolean;
    /**
     * 我方战斗成员
     */
    static playerBattlers: ProjectClientSceneObject[] = [];
    /**
     * 敌方战斗成员
     */
    static enemyBattlers: ProjectClientSceneObject[] = [];
    //------------------------------------------------------------------------------------------------------
    // 结果
    //------------------------------------------------------------------------------------------------------
    /**
     * 上次战斗胜负
     */
    static resultIsWin: boolean;
    /**
     * 是否游戏结束
     */
    static resultIsGameOver: boolean;
    //------------------------------------------------------------------------------------------------------
    // 实现用变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 已使用的玩家角色记录：[playerActor] => battler
     */
    static usedPlayerActorRecord: Dictionary = new Dictionary();
    /**
     * 
     */
    private static nextStepCB: Callback;
    /**
     * 刷新计数
     */
    private static updateCount: number = 0;
    //------------------------------------------------------------------------------------------------------
    // 开始
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始战斗
     */
    static start(): void {
        // AI管理启动
        GameBattleAI.start();
        // 行为管理启动
        GameBattleAction.start();
        // 战斗者处理器启动
        GameBattlerHandler.start();
        // 启动帧刷
        os.add_ENTERFRAME(this.update, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 结束
    //------------------------------------------------------------------------------------------------------
    /**
     * 停止战斗：通常来自结束战斗指令的调用（无论是主动结束战斗或是满足条件自动结束战斗）
     * -- 满足胜负条件：GameBattle.checkBattleIsComplete => WorldData.reachBattleCompelteConditionEvent => 调用结束战斗指令
     * -- 主动结束：调用结束战斗指令
     */
    static stop(): void {
        // AI管理结束
        GameBattleAI.stop();
        // 行为管理启动
        GameBattleAction.stop();
        // 战斗者处理器启动
        GameBattlerHandler.stop();
        // 关闭帧刷
        os.remove_ENTERFRAME(this.update, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    private static update(): void {
        // 暂停中时忽略
        if (Game.pause) return;
        this.updateCount++;
        // 刷新状态
        this.updateStatus();
        // 刷新进入战斗的状态
        this.refreshInBattleState();
    }
    /**
     * 刷新状态
     */
    private static updateStatus(): void {
        var now = Game.now;
        // 6帧刷新一次，（约100ms）以便减少计算量
        if (this.updateCount % 6 == 0) {
            var allBattlers = GameBattleHelper.allBattlers;
            for (var i = 0; i < allBattlers.length; i++) {
                var battler: ProjectClientSceneObject = allBattlers[i] as any;
                var status = battler.actor.status;
                var hasRemoveStatus = false;
                var overtimeHit: { fromBattler: ProjectClientSceneObject, battler: ProjectClientSceneObject, status: Module_Status }[] = [];
                for (var s = 0; s < status.length; s++) {
                    var st = status[s];
                    if (!st) continue;
                    // 获得状态已过去的时间
                    var intervalTime = now - st.currentDuration;
                    //  DOT/HOT 效果 （来源必须同场景）
                    if (st.overtime && st.intervalTime != 0 && st.fromSceneID == Game.currentScene.id) {
                        // 获得状态应该作用的次数
                        var needEffectTimes = Math.floor(intervalTime / (st.intervalTime * 1000));
                        // 开始作用：
                        for (var t = st.effectTimes; t < needEffectTimes; t++) {
                            var fromBattler = Game.currentScene.sceneObjects[st.fromBattlerID] as ProjectClientSceneObject;
                            if (GameBattleHelper.isBattler(fromBattler)) {
                                overtimeHit.push({ fromBattler: fromBattler, battler: battler, status: st });
                            }
                        }
                        st.effectTimes = needEffectTimes;
                    }
                    // 持续时间结束：非自动状态需要结束掉
                    if (GameBattleHelper.isStatusOverTime(st)) {
                        var isRemoved = GameBattlerHandler.removeStatus(battler, st.id, false);
                        if (isRemoved) {
                            i--;
                            hasRemoveStatus = true;
                        }
                    }
                }
                // 存在移除状态的话则刷新属性和行为状态
                if (hasRemoveStatus) {
                    var lv = GameBattleHelper.getLevelByActor(battler.actor);
                    Game.refreshActorAttribute(battler.actor, lv, battler);
                    GameBattlerHandler.refreshBattlerActionByStatus(battler);
                }
                // 结算来自状态的伤害
                for (var s = 0; s < overtimeHit.length; s++) {
                    var o = overtimeHit[s];
                    GameBattleAction.hitTarget(o.fromBattler, o.battler, 3, null, null, o.status);
                }
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 战场判定处理
    //------------------------------------------------------------------------------------------------------
    /**
     * 检查战斗者是否死亡
     * @param battler 战斗者 
     * @param onFin 
     */
    static checkBattlerIsDead(battler: ProjectClientSceneObject, fromBattler: ProjectClientSceneObject): void {
        // 当生命值归零的时候
        if (!battler.isDisposed && GameBattleHelper.isBattler(battler) && !battler.isDead && battler.actor.hp == 0) {
            // -- 仍然是战斗者且死亡的话则进行死亡处理
            GameBattlerHandler.dead(battler, fromBattler);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新进入战斗的状态
     */
    private static refreshInBattleState(): void {
        var sceneObjects = Game.currentScene.sceneObjects;
        for (var i = 0; i < sceneObjects.length; i++) {
            var so: ProjectClientSceneObject = sceneObjects[i] as any;
            if (!GameBattleHelper.isBattler(so)) continue;
            GameBattlerHandler.refreshInBattleState(so);
        }
    }
}