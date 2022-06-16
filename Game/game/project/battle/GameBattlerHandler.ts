/**
 * 战斗者处理器
 * 
 * Created by 黑暗之神KDS on 2021-02-07 21:21:56.
 */
class GameBattlerHandler {
    // 战斗者死亡事件
    static EVENT_BATTLER_DEAD: string = "GameBattlerHandlerEVENT_BATTLER_DEAD";
    // 战斗者复活事件
    static EVENT_BATTLER_RESUSCITATE: string = "GameBattlerHandlerEVENT_BATTLER_RESUSCITATE";
    // 战斗者进入战斗的状态 onBattlerInBattle(isInBattle:boolean,battler:ProjectClientSceneObject)
    static EVENT_BATTLER_IN_BATTLE: string = "GameBattlerHandlerEVENT_BATTLER_IN_BATTLE";
    // 状态增加 onStatusChange(battler:ProjectClientSceneObject)
    static EVENT_STATUS_CHANGE: string = "GameBattlerHandlerEVENT_STATUS_CHANGE";


    /**
     * 记录击杀奖励
     */
    static hitReward: {
        gold: number,
        exp: number,
        items: { itemID: number, num: number }[],
        equips: Module_Equip[],
    } = { gold: 0, exp: 0, items: [], equips: [] };


    /**
     * 必须动作播放完成时的同步任务标记
     */
    protected static mustActionCompleteTask = "mustActionCompleteTask";
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    static init(): void {

    }
    /**
     * 开始
     */
    static start() {
        return;
        // 监听场景对象的状态页改变时处理
        // EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
    }
    /**
     * 停止
     */
    static stop() {
        return;
        // 取消监听场景对象的状态页改变时处理
        // EventUtils.removeEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    /**
     * 当战斗者被移除时：不再是战斗者的情况
     * @param battler 战斗者
     */
    static onBattlerRemoved(battler: ProjectClientSceneObject): void {
        // // -- 如果是角色的话还要清理掉记录关系
        // GameBattle.usedPlayerActorRecord.remove(battler.battlerSetting.battleActor);
        // // -- 清理来源是该状态者的状态
        // GameBattlerHandler.removeAllBattlerStatusByFromBattler(battler);
        // // -- 清理战斗者的仇恨
        // this.clearHateList(battler, true);
        // // -- 从战斗者阵营列表中移除
        // ArrayUtils.remove(GameBattle.playerBattlers, battler);
        // ArrayUtils.remove(GameBattle.enemyBattlers, battler);
        // // -- 执行移除事件
        // CommandPage.startTriggerFragmentEvent(WorldData.battlerClearEvent, battler, battler);
    }
    //------------------------------------------------------------------------------------------------------
    // 播放动作
    //------------------------------------------------------------------------------------------------------
    /**
     * 死亡动作
     * @param battler 战斗者
     * @param playMode 是否播放模式，否则是持续停留在最后一帧
     */
    static battlerDeadAnimation(battler: ProjectClientSceneObject, playMode: boolean): void {
        GameBattlerHandler.syncTaskPlayAction(GameBattlerHandler.mustActionCompleteTask, battler, 7, true, playMode, 1, 1034, 1035);
    }
    /**
     * 复活动作
     * @param battler 战斗者
     */
    static resuscitateAction(battler: ProjectClientSceneObject): void {
        GameBattlerHandler.syncTaskPlayAction(GameBattlerHandler.mustActionCompleteTask, battler, 1, false, false, 2, 1034, 1035);
    }
    /**
     * 击退动作
     */
    static backAction(battler: ProjectClientSceneObject): void {

    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新进入战斗的状态
     * @param battler 战斗者
     */
    static refreshInBattleState(battler: ProjectClientSceneObject): void {
        if (!battler || battler.isDisposed) return;
        var lastInBattle = battler.inBattle;
        var nowInBattle = battler.battleAI.hateList.length > 0;
        if (!lastInBattle && nowInBattle) {
            battler.inBattle = true;
            Game.refreshActorAttribute(battler.actor, GameBattleHelper.getLevelByActor(battler.actor), battler);
            // 执行事件-进入战斗
            GameCommand.startCommonCommand(14020, [], null, battler, battler);
            EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, [true, battler]);
        }
        else if (lastInBattle && !nowInBattle) {
            battler.inBattle = false;
            Game.refreshActorAttribute(battler.actor, GameBattleHelper.getLevelByActor(battler.actor), battler);
            // 执行事件-离开战斗
            GameCommand.startCommonCommand(14021, [], null, battler, battler);
            EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_IN_BATTLE, [false, battler]);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 让战斗者死亡
     * @param battler 
     */
    static dead(battler: ProjectClientSceneObject, fromBattler: ProjectClientSceneObject): void {
        if (battler.isDead) return;
        // -- 死亡标记
        GameBattleAction.stopAction(battler);
        battler.isDead = true;
        battler.through = true;
        // -- 置空
        battler.actor.hp = 0;
        battler.actor.sp = 0;
        GameBattlerHandler.removeAllStatus(battler);
        GameBattlerHandler.battlerDeadAnimation(battler, true);
        // -- 清理仇恨
        this.clearHateList(battler, true);
        // -- 派发战斗者死亡事件
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, [battler]);
        // -- 击杀奖励：金币、经验、道具、装备
        var battleActor = battler.actor;
        if (battler.actor.dropEnabled && battler.camp == 0) {
            // 增加掉落的金币
            if (battler.actor.dropGold != 0) {
                ProjectPlayer.increaseGold(battler.actor.dropGold);
                this.effectText(battler, "+" + battler.actor.dropGold.toString() + " G", 1052, 1052);
            }
            // 增加掉落的经验
            if (battler.actor.dropExp != 0) {
                var mainUI = GameUI.get(13) as GUI_Main;
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorBattler = ProjectPlayer.getPlayerPartyBattler(i);
                    if (!actorBattler.actor.growUpEnabled || actorBattler.isDead) continue;
                    var res = ProjectPlayer.increaseExpByIndex(i, battler.actor.dropExp);
                    if (res && res.toLv > res.fromLv) {
                        // 执行升级事件
                        GameCommand.startCommonCommand(14023, [], null, actorBattler, actorBattler);
                        mainUI.refreshActorLv(i);
                    }
                    mainUI.refreshActorExp(i);
                }
                this.effectText(battler, "+" + battler.actor.dropExp.toString() + " exp", 1051, 1053);
            }
            // 掉落物品和装备
            for (var i = 0; i < battleActor.dropItems.length; i++) {
                var dropItemDS = battleActor.dropItems[i];
                if (MathUtils.rand(100) < dropItemDS.dropProbability) {
                    ProjectPlayer.changeItemNumber(dropItemDS.item, dropItemDS.num, false);
                    var presetItem = GameData.getModuleData(5, dropItemDS.item);
                    GUI_Main.showGetItem(presetItem, dropItemDS.num);
                }
            }
            for (var i = 0; i < battleActor.dropEquips.length; i++) {
                var dropEquipDS = battleActor.dropEquips[i];
                if (MathUtils.rand(100) < dropEquipDS.dropProbability) {
                    var newEquip = ObjectUtils.depthClone(dropEquipDS.equip);
                    ProjectPlayer.addEquipByInstance(newEquip);
                    GUI_Main.showGetItem(newEquip, 1);
                }
            }
        }
        // -- 玩家拥有的角色的场合
        if (battler.inPartyIndex >= 0) {
            // 如果主角死亡
            if (Game.player.sceneObject.isDead) {
                // 执行事件-主角阵亡
                GameCommand.startCommonCommand(14022, [], null, Game.player.sceneObject, Game.player.sceneObject);
            }
            // 角色离开队伍
            else if (WorldData.deadPlayerActorLeaveParty) {
                ProjectPlayer.removePlayerActorByInPartyIndex(battler.inPartyIndex);
            }
        }
        // -- 非玩家
        else {
            // -- 死亡时处理：执行对应的事件片段页
            if (battler.actor.whenDeadEvent) {
                CommandPage.startTriggerFragmentEvent(battler.actor.whenDeadEvent, fromBattler, battler);
            }
            // -- 周期性复活
            if (battler.actor.isPeriodicResurrection) {
                var lastScene = Game.currentScene;
                setTimeout((lastScene: ProjectClientScene, battler: ProjectClientSceneObject) => {
                    if (lastScene == Game.currentScene) {
                        if (battler.isDead && GameBattleHelper.isBattler(battler)) {
                            battler.root.visible = false;
                        }
                    }
                }, battler.actor.periodicResurrectionTime * 500, lastScene, battler);
                setTimeout((lastScene: ProjectClientScene, battler: ProjectClientSceneObject) => {
                    if (lastScene == Game.currentScene) {
                        if (battler.isDead && GameBattleHelper.isBattler(battler)) {
                            battler.root.visible = true;
                            battler.setTo(battler.settingX, battler.settingY);
                            this.resuscitate(battler, true);
                        }
                    }
                }, battler.actor.periodicResurrectionTime * 1000, lastScene, battler);
            }
        }
    }
    /**
     * 让战斗者复活
     */
    static resuscitate(battler: ProjectClientSceneObject, isMaxHP: boolean = false): void {
        // 忽略掉战斗者未死亡的情况
        if (!battler || !battler.isDead || !GameBattleHelper.isBattler(battler)) return;
        battler.isDead = false;
        GameBattlerHandler.resuscitateAction(battler);
        battler.through = false;
        var lv: number;
        if (battler.inPartyIndex >= 0) {
            lv = Game.player.data.party[battler.inPartyIndex].lv;
        }
        else {
            lv = 1;
        }
        Game.refreshActorAttribute(battler.actor, lv, battler);
        battler.actor.hp = isMaxHP ? battler.actor.MaxHP : 1;
        // 刷新状态
        this.refreshBattlerActionByStatus(battler);
        battler.refreshPointBar();
        // 派发战斗者复活事件
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_RESUSCITATE, [battler]);
    }

    /**
     * 释放战斗者动作
     * @param battler 战斗者
     * @param actionID 动作
     * @param releaseFrame 释放的帧数 
     * @param whenCompleteActionID 当释放完毕后恢复的动作编号 
     * @param onRelease 当释放完成时回调
     */
    static releaseAction(battler: ProjectClientSceneObject, actionID: number, releaseFrame: number, whenCompleteActionID: number, onRelease: Function): void {
        // 存在该动作的话：播放该动作后进入下一个阶段
        battler.duringRelease = true;
        var avatar = battler.avatar;
        var hasAtkAction = avatar.hasActionID(actionID);
        if (hasAtkAction) {
            var isReleaseAction = false;
            var onRender = () => {
                // 超过击中帧数时则进入「击中阶段」
                if (avatar.currentFrame >= releaseFrame) {
                    //@ts-ignore
                    avatar.off(Avatar.RENDER, avatar, arguments.callee);
                    onRelease();
                    isReleaseAction = true;
                }
            }
            // 监听当动作播放完毕时，播放完毕后的动作
            avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, () => {
                if (battler.isDisposed) return;
                battler.duringRelease = false;
                avatar.off(Avatar.RENDER, avatar, onRender);
                // 如果其动作已经被更改了则忽略
                if (avatar.actionID != actionID) return;
                // 如果发生了一些变更
                if (!GameBattleHelper.isBattler(battler) || battler.isDead) return;
                // 完成后变更的动作
                avatar.actionID = whenCompleteActionID;
                // 如果未能释放则直接释放
                if (!isReleaseAction) onRelease();
            });
            // 监听满足攻击帧数时
            avatar.on(Avatar.RENDER, avatar, onRender);
            // 切换至攻击动作，从第1帧开始播放
            avatar.currentFrame = 1;
            avatar.actionID = actionID;
        }
        // 没有攻击动作时直接进入下一个阶段
        else {
            onRelease();
        }
    }
    /**
     * 同步任务队列播放动作/动画
     * @param taskGroup 任务组名称，同组名称且同一个战斗者视为同步任务队列，需要等待任务逐一完成才能继续后续的任务
     * @param battler 战斗者
     * @param actionID 动作
     * @param isStopLastFrame 停留在最后一帧 
     * @param playMode 动作播放模式
     * @param animationMode 0=无 1=如果没有动作则播放动画 2=停止播放动画
     * @param playAnimationID 如果没有动作时替代播放的动画（一次）
     * @param loopAnimationID 如果没有动作时替代播放的动画（循环，当playAnimationID播放完毕后进入该动画循环播放）
     */
    static syncTaskPlayAction(taskGroup: string, battler: ProjectClientSceneObject, actionID: number, isStopLastFrame: boolean, playMode: boolean
        , animationMode: number, playAnimationID: number, loopAnimationID: number): void {
        var taskName = taskGroup + "_" + battler.index;
        // 使用同步任务执行，以便相同的组按顺序执行
        new SyncTask(taskName, () => {
            // 播放动画模式
            if (playMode) {
                var doPlayAct = () => {
                    if (!battler.isDisposed) {
                        // -- 如果存在该动作则播放该动作
                        if (battler.avatar.hasActionID(actionID)) {
                            if (isStopLastFrame) {
                                battler.autoPlayEnable = true;
                                battler.avatar.currentFrame = battler.avatar.currentFrame % battler.avatar.totalFrame;
                                var lastCurrentStatusPageIndex = battler.currentStatusPageIndex;
                                battler.avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, (battler: ProjectClientSceneObject, lastCurrentStatusPageIndex: number) => {
                                    if (battler.currentStatusPageIndex == lastCurrentStatusPageIndex) {
                                        battler.avatarFrame = battler.avatar.totalFrame;
                                        battler.autoPlayEnable = false;
                                    }
                                    SyncTask.taskOver(taskName);
                                }, [battler, lastCurrentStatusPageIndex]);
                            }
                            else {
                                battler.autoPlayEnable = true;
                            }
                            battler.avatarAct = actionID;
                            battler.avatarFrame = 1;
                            // -- 停止播放动画的情况
                            if (animationMode == 2) {
                                battler.stopAnimation(playAnimationID);
                                battler.stopAnimation(loopAnimationID);
                            }
                            if (!isStopLastFrame) {
                                SyncTask.taskOver(taskName);
                            }
                            return;
                        }
                        // -- 否则如果无动作且使用动画代替的话则播放一次动画1后进入循环动画2
                        else if (animationMode == 1) {
                            var actionAnimation = battler.playAnimation(playAnimationID, false, true);
                            if (loopAnimationID > 0) {
                                actionAnimation.once(GCAnimation.PLAY_COMPLETED, this, () => {
                                    battler.playAnimation(loopAnimationID, true, true);
                                    SyncTask.taskOver(taskName);
                                });
                                return;
                            }
                        }
                    }
                    // -- 停止播放动画的情况
                    if (animationMode == 2) {
                        battler.stopAnimation(playAnimationID);
                        battler.stopAnimation(loopAnimationID);
                    }
                    SyncTask.taskOver(taskName);
                }
                if (battler.avatar.isLoading) {
                    battler.avatar.once(EventObject.LOADED, this, doPlayAct);
                }
                else {
                    doPlayAct.apply(this);
                }
            }
            // 仅设置动画状态
            else {
                var doSetActionLastFrame = () => {
                    if (!battler.isDisposed) {
                        if (battler.avatar.hasActionID(actionID)) {
                            battler.avatarAct = actionID;
                            battler.avatarFrame = isStopLastFrame ? battler.avatar.totalFrame : 1;
                            battler.autoPlayEnable = isStopLastFrame ? false : true;
                        }
                        else if (animationMode == 1) {
                            battler.playAnimation(loopAnimationID, true, true);
                        }
                        if (animationMode == 2) {
                            battler.stopAnimation(playAnimationID);
                            battler.stopAnimation(loopAnimationID);
                        }
                    }
                    SyncTask.taskOver(taskName);
                }
                if (battler.avatar.isLoading) {
                    battler.avatar.once(EventObject.LOADED, this, doSetActionLastFrame);
                }
                else {
                    doSetActionLastFrame.apply(this);
                }
            }
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 仇恨系统
    //------------------------------------------------------------------------------------------------------
    /**
     * 清理指定战斗者的仇恨列表
     * @param so 
     */
    static clearHateList(battler: ProjectClientSceneObject, clearAll: boolean = false): void {
        if (!battler || !battler.battleAI) return;
        battler.battleAI.hateList.length = 0;
        battler.battleAI.myTarget = null;
        if (clearAll) this.removeHateTargetFromAllList(battler);
    }

    /**
     * 从战斗者的仇恨列表中移除仇恨目标
     * @param so 仇恨列表的拥有者
     * @param hateTarget 仇恨目标
     */
    static removeHateTarget(battler: ProjectClientSceneObject, hateTarget: ProjectClientSceneObject): void {
        if (battler.battleAI.myTarget == hateTarget) battler.battleAI.myTarget = null;
        var hateIndex: number = ArrayUtils.matchAttributes(battler.battleAI.hateList, { targetIndex: hateTarget.index }, true, "==", true)[0];
        if (hateIndex == null) return;
        battler.battleAI.hateList.splice(hateIndex, 1);
    }
    /**
     * 从所有仇恨列表中清理指定对象
     * @param hateTarget 
     */
    static removeHateTargetFromAllList(hateTarget: ProjectClientSceneObject): void {
        var allBattler = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattler.length; i++) {
            var battler = allBattler[i];
            this.removeHateTarget(battler, hateTarget);
        }
    }

    /**
     * 增加仇恨
     * @param so 仇恨列表的拥有者
     * @param hateTarget 仇恨目标
     * @param hateValue 仇恨数值
     * @param ignoreNotInHateList [可选] 默认值=false 如果当前不在仇恨列表中则不增加仇恨
     */
    static increaseHate(battler: ProjectClientSceneObject, hateTarget: ProjectClientSceneObject, hateValue: number, ignoreNotInHateList: boolean = false): void {
        // 非敌对势力不允许添加到仇恨列表
        if (!GameBattleHelper.isHostileRelationship(battler, hateTarget)) return;
        // 已死亡无法增加仇恨
        if (battler.isDead || hateTarget.isDead) return;
        // 添加仇恨：不在列表中的话就新建一个
        var hateDS: DataStructure_battlerHate = ArrayUtils.matchAttributes(battler.battleAI.hateList, { targetIndex: hateTarget.index }, true)[0];
        if (hateDS) {
            hateDS.hateValue += hateValue;
        }
        else {
            if (ignoreNotInHateList) return;
            hateDS = new DataStructure_battlerHate;
            hateDS.targetIndex = hateTarget.index;
            hateDS.hateValue = hateValue;
            battler.battleAI.hateList.push(hateDS);
        }
        // 刷新仇恨排序
        this.hateListOrderByDESC(battler);
    }
    /**
     * 增加仇恨：根据技能预设
     * @param fromBattler 来源战斗者
     * @param targetBattler 目标战斗者
     * @param skill 技能
     * @param damageValue [可选] 默认值=0 伤害或治疗数值
     */
    static increaseHateByHit(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, hitFrom: Module_Skill | Module_Status, hitValue: number = 0): void {
        // 根据类型决定数值符号
        hitValue = hitFrom.damageType <= 2 ? -hitValue : hitValue;
        // 伤害：直接对目标增加仇恨值
        var hateValue = hitFrom.fixedHeteValue + Math.abs(hitValue) * hitFrom.damageHatePer / 100;
        if (hitValue < 0) {
            this.increaseHate(targetBattler, fromBattler, hateValue);
        }
        // 恢复：如果是友方的话则会增加敌方的仇恨（需要敌方已存在仇恨列表）
        else {
            if (GameBattleHelper.isFriendlyRelationship(fromBattler, targetBattler)) {
                var enemyCampBattlers: ProjectClientSceneObject[] = [];
                var allBattlers = GameBattleHelper.allBattlers;
                for (var i = 0; i < allBattlers.length; i++) {
                    var battler = allBattlers[i];
                    if (GameBattleHelper.isHostileRelationship(fromBattler, battler)) {
                        enemyCampBattlers.push(battler);
                    }
                }
                for (var i = 0; i < enemyCampBattlers.length; i++) {
                    this.increaseHate(enemyCampBattlers[i], fromBattler, hateValue, true);
                }
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 添加目标状态
     * @param targetBattler 目标战斗者
     * @param statusID 状态
     * @return [boolean] 
     */
    static addStatus(targetBattler: ProjectClientSceneObject, statusID: number, fromBattler: ProjectClientSceneObject = null, force: boolean = false): boolean {
        // 获取系统预设的该状态，如果不存在则无法添加
        var systemStatus: Module_Status = GameData.getModuleData(6, statusID);
        if (!systemStatus) return false;
        // 计算命中率
        if (!force && MathUtils.rand(100) >= systemStatus.statusHit) {
            return false;
        }
        if (fromBattler == null) fromBattler = targetBattler;
        var targetBattlerActor = targetBattler.actor;
        // -- 如果目标免疫该状态的话则忽略
        var targetIsImmuneThisStatus = targetBattlerActor.selfImmuneStatus.indexOf(statusID) != -1;
        if (!force && targetIsImmuneThisStatus) return false;;
        var thisStatus: Module_Status = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true)[0];
        if (thisStatus) {
            thisStatus.currentLayer += 1;
            if (thisStatus.currentLayer > thisStatus.maxlayer) thisStatus.currentLayer = thisStatus.maxlayer;
        }
        else {
            thisStatus = GameData.newModuleData(6, statusID);
            thisStatus.fromBattlerID = fromBattler.index;
            thisStatus.fromSceneID = Game.currentScene.id;
            targetBattlerActor.status.push(thisStatus);
        }
        // -- 自动动画
        if (thisStatus.animation) targetBattler.playAnimation(thisStatus.animation, true, true);
        // -- 刷新状态的时间
        thisStatus.currentDuration = Game.now;
        // -- 刷新战斗者相关行为
        this.refreshBattlerActionByStatus(targetBattler);
        // -- 执行状态附加的事件
        if (systemStatus.whenAddEvent) CommandPage.startTriggerFragmentEvent(systemStatus.whenAddEvent, targetBattler, fromBattler);
        // -- 派发事件
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, [targetBattler]);
        return true;
    }
    /**
     * 移除目标状态
     */
    static removeStatus(targetBattler: ProjectClientSceneObject, statusID: number, refreshBattlerAction: boolean = true): boolean {
        // 获取系统预设的该状态，如果不存在则无法添加
        var systemStatus: Module_Status = GameData.getModuleData(6, statusID);
        if (!systemStatus) return false;
        var targetBattlerActor = targetBattler.actor;
        var thisStatusIdx: number = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true, "==", true)[0];
        if (thisStatusIdx != null) {
            targetBattlerActor.status.splice(thisStatusIdx, 1);
            if (systemStatus.whenRemoveEvent) CommandPage.startTriggerFragmentEvent(systemStatus.whenRemoveEvent, targetBattler, targetBattler);
            // 解除动画
            if (systemStatus.animation) {
                // 如果该动画在其他状态下不存在则直接清除
                if (ArrayUtils.matchAttributes(targetBattlerActor.status, { animation: systemStatus.animation }, true, "==", true).length == 0) {
                    targetBattler.stopAnimation(systemStatus.animation);
                }
            }
            // 刷新战斗者相关行为
            if (refreshBattlerAction) this.refreshBattlerActionByStatus(targetBattler);
            // -- 派发事件
            EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, [targetBattler]);
            return true;
        }
        return false;
    }
    /**
     * 解除全部状态
     */
    static removeAllStatus(battler: ProjectClientSceneObject): void {
        // 动画效果解除
        var statusArr = battler.actor.status;
        for (var i = 0; i < statusArr.length; i++) {
            var status = statusArr[i];
            if (status.animation) battler.stopAnimation(status.animation);
        }
        // 清理状态数据
        battler.actor.status.length = 0;
        // 刷新战斗者相关行为
        this.refreshBattlerActionByStatus(battler);
        // 派发事件
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, [battler]);
    }
    /**
     * 解除所有战斗者中来源是指定某个战斗者的状态
     * @param fromBattler 来源战斗者
     */
    static removeAllBattlerStatusByFromBattler(fromBattler: ProjectClientSceneObject): void {
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            var isRemoved = false;
            if (GameBattleHelper.isBattler(so)) {
                var statusArr = so.actor.status;
                for (var s = 0; s < statusArr.length; s++) {
                    var status = statusArr[s];
                    if (status.fromBattlerID == fromBattler.index) {
                        if (this.removeStatus(so, status.id, false)) {
                            s--;
                            isRemoved = true;
                        }
                    }
                }
                if (isRemoved) {
                    this.refreshBattlerActionByStatus(so);
                }
            }
        }

    }
    /**
     * 刷新战斗者行为根据状态
     * @param battler 
     */
    static refreshBattlerActionByStatus(battler: ProjectClientSceneObject) {
        // 忽略死亡者
        if (battler.isDead) return;
        // 无法移动的情况
        if (!GameBattleHelper.canMove(battler)) {
            if (battler.avatarAct == WorldData.sceneObjectMoveStartAct2 || battler.avatarAct == WorldData.sceneObjectMoveStartAct) {
                battler.stopMove();
            }
        }
        // 是否允许自动播放动作
        battler.autoPlayEnable = GameBattleHelper.canAutoPlayAvatarAction(battler);
        // 是否允许更改朝向
        battler.fixOri = !GameBattleHelper.canChangeOri(battler);
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 当场景对象的状态页更改前
     * @param so 
     */
    private static onChangeSceneObjectStatus(so: ProjectClientSceneObject): void {
        // 如果是战斗者的话则调用移除
        if (GameBattleHelper.isBattler(so)) {
            this.onBattlerRemoved(so);
        }
    }
    /**
     * 仇恨排序-按照仇恨值从大到小降序
     * @param battler 仇恨列表的拥有者
     */
    private static hateListOrderByDESC(battler: ProjectClientSceneObject) {
        battler.battleAI.hateList.sort((a: DataStructure_battlerHate, b: DataStructure_battlerHate): number => {
            return a.hateValue < b.hateValue ? 1 : -1;
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 特效文本，UI中必须含有target容器以及txt文本
     * @param target 目标场景对象
     * @param label 显示的文本
     * @param uiID 使用的界面ID
     * @param aniID 播放的动画ID
     * @return [UIRoot] 界面
     */
    private static effectText(target: ProjectClientSceneObject, label: string, uiID: number, aniID: number): UIRoot {
        var textUI = GameUI.load(uiID, true);
        if (!textUI) return;
        var uiTarget = textUI["target"];
        var uiTxt = textUI["txt"];
        if (!uiTarget || !uiTxt) return;
        uiTxt.text = label;
        Game.currentScene.animationHighLayer.addChild(textUI);
        textUI.x = target.x + MathUtils.rand(30) - 15;
        textUI.y = target.y - Config.SCENE_GRID_SIZE + MathUtils.rand(30) - 15;
        // 给金币文本附加15005号动画
        var ani = new GCAnimation();
        ani.id = aniID;
        ani.addToGameSprite(uiTarget, textUI, textUI);
        uiTarget.addChild(ani);
        ani.once(GCAnimation.PLAY_COMPLETED, this, (ani: GCAnimation, textUI: UIRoot) => {
            ani.dispose();
            textUI.dispose();
        }, [ani, textUI]);
        ani.play();
        return textUI;
    }
}