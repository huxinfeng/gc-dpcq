/**
 * 游戏主界面
 * Created by 黑暗之神KDS on 2020-03-11 18:04:16.
 */
class GUI_Main extends GUI_13 {
    /**
     * 主角色
     */
    mainSceneObjectID: number;
    /**
     * 队伍成员
     */
    partyMemberIDs: number[] = [];
    /**
     * 获得道具提示
     */
    private static syncGetItemTipsTask: string = "syncGetItemTipsTask";
    /**
     * tips所在地点分类 1=技能 2=状态
     */
    private tipsPostionIndex: number;

    /**
     * 构造函数
     */
    constructor() {
        super();
        // 初始化界面
        this.HPSlider.value = 0;
        this.SPSlider.value = 0;
        // 监听队伍成员改变
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_ADD_PLAYER_ACTOR, Callback.New(this.refreshParty, this));
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_REMOVE_PLAYER_ACTOR, Callback.New(this.refreshParty, this));
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_CTRL_ACTOR, Callback.New(this.refreshAll, this));

        // 监听技能改变
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_LEARN_PLAYER_ACTOR_SKILL, Callback.New(this.onSkillChange, this));
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_FORGET_PLAYER_ACTOR_SKILL, Callback.New(this.onSkillChange, this));

        // 监听状态改变
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, this.onStatusChange, this);

        // 当创建技能项时
        this.skillList.on(UIList.ITEM_CREATE, this, this.onCreateSkillItem);
        this.skillList.mouseEnabled = true;
        // 当创建状态项时
        this.stateList.on(UIList.ITEM_CREATE, this, this.onCreateMainActorStatusItem);
        this.stateList.mouseEnabled = true;
        // 刷新全信息
        this.refreshAll();
        this.tipsUI.visible = false;
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新角色HP
     * @param inPartyIndex 
     */
    refreshActorHP(inPartyIndex: number) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorHP();
        }
        else {
            this.refreshPartyMemberHP(inPartyIndex);
        }
    }
    /**
     * 刷新角色SP
     * @param inPartyIndex 
     */
    refreshActorSP(inPartyIndex: number) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorSP();
        }
        else {
            this.refreshPartyMemberSP(inPartyIndex);
        }
    }
    /**
     * 刷新角色等级
     * @param inPartyIndex 
     */
    refreshActorLv(inPartyIndex: number) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorLevel();
        }
        else {
            this.refreshPartyMemberLevel(inPartyIndex);
        }
    }
    /**
     * 刷新角色经验值
     */
    refreshActorExp(inPartyIndex: number) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorExp();
        }
    }
    /**
     * 刷新角色状态
     */
    refreshActorStatus(inPartyIndex: number) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorStatus();
        }
        else {
            this.refreshPartyMemberStatus(inPartyIndex);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    refreshAll() {
        if (!ProjectPlayer.ctrlActorSceneObject || ProjectPlayer.ctrlActorSceneObject.inPartyIndex < 0) return;
        // 刷新主角色信息（玩家控制的角色）
        this.refreshMainActor();
        // 刷新队伍成员界面
        this.refreshParty();
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新主角色信息
     */
    refreshMainActor() {
        this.refreshMainActorFace();
        this.refreshMainActorHP();
        this.refreshMainActorSP();
        this.refreshMainActorStatus();
        this.refreshMainActorSkillBar();
        this.refreshMainActorLevel();
        this.refreshMainActorExp();
    }
    /**
     * 刷新主角色的头像
     */
    refreshMainActorFace() {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actor: Module_Actor = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex).actor;
        this.mainFace.image = actor.face;
    }
    /**
     * 刷新主角色的等级
     */
    refreshMainActorLevel() {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        this.mainLevel.text = "Lv." + actorDS.lv.toString();
    }
    /**
     * 刷新主角的HP
     */
    refreshMainActorExp() {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        if (actorDS.lv >= actorDS.actor.MaxLv) {
            this.EXPSlider.value = 1;
        }
        else {
            this.EXPSlider.value = actorDS.actor.currentEXP / Game.getLevelUpNeedExp(actorDS.actor, actorDS.lv);
        }
    }
    /**
     * 刷新主角色的生命值
     */
    refreshMainActorHP() {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        var actor = actorDS.actor;
        var toSliderValue = actor.hp / actor.MaxHP;
        var toValue = actor.hp;
        var nowValue = MathUtils.int(this.HPText.text);
        var _this = this;
        var tobj = {
            get value() { return nowValue; },
            set value(v: number) {
                nowValue = v;
                _this.HPText.text = MathUtils.int(v).toString();
            }
        };
        Tween.clearAll(this.HPSlider);
        Tween.clearAll(this.HPText);
        Tween.to(this.HPSlider, { value: toSliderValue }, 300, Ease.strongOut);
        Tween.to(tobj, { value: toValue }, 300, Ease.strongOut);
    }
    /**
     * 刷新主角色的魔法值
     */
    refreshMainActorSP() {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        var actor = actorDS.actor;
        if (actor.MaxSP == 0) {
            this.SPSlider.value = 0;
        }
        else {
            this.SPSlider.value = actor.sp / actor.MaxSP;
        }
        this.SPText.text = actor.sp.toString();
    }
    /**
     * 刷新主角色的状态
     */
    refreshMainActorStatus() {
        var items = [];
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        var actor = actorDS.actor;
        var status = actor.status;
        for (var i = 0; i < status.length; i++) {
            var d = new ListItem_1028;
            var st = status[i];
            d.icon = st.icon;
            d.layer = st.currentLayer == 1 ? "" : st.currentLayer.toString();
            d.data = st;
            items.push(d);
        }
        this.stateList.items = items;
        if (this.tipsPostionIndex == 2) {
            this.tipsUI.visible = false;
            this.tipsPostionIndex = null;
        }
    }
    /**
     * 刷新技能栏
     */
    refreshMainActorSkillBar() {
        var items = [];
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        var actor = actorDS.actor;
        var skills = actor.skills;
        for (var i = 0; i < skills.length; i++) {
            var d = new ListItem_1030;
            items.push(d);
        }
        this.skillList.items = items;
        for (var i = 0; i < skills.length; i++) {
            var ui = this.skillList.getItemUI(i) as GUI_SkillIcon;
            ui.setData(skills[i]);
        }
        if (this.tipsPostionIndex == 1) {
            this.tipsUI.visible = false;
            this.tipsPostionIndex = null;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 队伍
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新队伍信息
     */
    refreshParty() {
        // 创建队伍成员界面
        var items = [];
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var d = new ListItem_1024;
            var partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index) continue;
            d.HPSlider = 0;
            d.SPSlider = 0;
            items.push(d);
        }
        this.partyList.items = items;
        // 刷新队伍成员界面的信息
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index) continue;
            this.refreshPartyMember(i);
        }
    }
    /**
     * 刷新队伍成员
     * @param so 队伍成员场景对象
     */
    refreshPartyMember(inPartyIndex: number) {
        this.refreshPartyMemberName(inPartyIndex);
        this.refreshPartyMemberHP(inPartyIndex);
        this.refreshPartyMemberSP(inPartyIndex);
        this.refreshPartyMemberStatus(inPartyIndex);
        this.refreshPartyMemberLevel(inPartyIndex);
    }
    /**
     * 刷新队伍成员的名称
     * @param inPartyIndex 
     */
    refreshPartyMemberName(inPartyIndex: number) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        var ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        var actor: Module_Actor = partyMember.actor
        ui.actorName.text = actor.name;
    }
    /**
     * 刷新队伍成员的名称
     * @param inPartyIndex 
     */
    refreshPartyMemberLevel(inPartyIndex: number) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        var ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        var actor: Module_Actor = partyMember.actor
        ui.levelLabel.text = "Lv." + partyMember.lv.toString();
    }
    /**
     * 刷新队伍成员的生命值
     * @param inPartyIndex 
     */
    refreshPartyMemberHP(inPartyIndex: number) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;
        var ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;
        var actor: Module_Actor = partyMember.actor
        ui.HPSlider.value = partyMember.actor.hp / partyMember.actor.MaxHP;
    }
    /**
     * 刷新队伍成员的魔法值
     * @param inPartyIndex 
     */
    refreshPartyMemberSP(inPartyIndex: number) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;
        var ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;
        var actor: Module_Actor = partyMember.actor;
        if (partyMember.actor.MaxSP == 0) {
            ui.SPSlider.value = 0;
        }
        else {
            ui.SPSlider.value = partyMember.actor.sp / partyMember.actor.MaxSP;
        }
    }
    /**
     * 刷新队伍成员的状态
     * @param inPartyIndex 
     */
    refreshPartyMemberStatus(inPartyIndex: number) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;
        var ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;
        var actor: Module_Actor = partyMember.actor;
        var items = [];
        var status = actor.status;
        for (var i = 0; i < status.length; i++) {
            var d = new ListItem_1029;
            var st = status[i];
            d.icon = st.icon;
            d.layer = st.currentLayer == 1 ? "" : st.currentLayer.toString();
            items.push(d);
        }
        ui.stateList.items = items;
    }
    /**
     * 获取队伍成员对应的界面
     */
    private getPartyItemUI(inPartyIndex: number): GUI_1024 {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        for (var i = 0, s = 0; i < Game.player.data.party.length; i++) {
            var partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index) continue;
            if (i == inPartyIndex) return this.partyList.getItemUI(s) as any;
            s++;
        }
        return null;
    }
    //------------------------------------------------------------------------------------------------------
    // 获得道具
    //------------------------------------------------------------------------------------------------------
    static showGetItem(item: Module_Equip | Module_Item, num: number): void {
        var ui = new GUI_1053;
        ui.itemIcon.image = item.icon;
        ui.itemTxt.text = "获得「" + item.name + "」" + (num > 1 ? "x" + num.toString() : "");
        // 同步任务，保证任务按照顺序执行，即使一次性调用多次该函数也可以逐步演示效果。
        new SyncTask(GUI_Main.syncGetItemTipsTask, (ui: GUI_1053) => {
            GameAudio.playSE(ClientWorld.data.getItemSE);
            Game.layer.uiLayer.addChild(ui);
            var ani = new GCAnimation();
            ani.id = 1017;
            ani.addToGameSprite(ui, ui, ui);
            ui.addChild(ani);
            ani.play();
            ani.once(GCAnimation.PLAY_COMPLETED, this, (ani: GCAnimation, ui: UIRoot) => {
                ani.dispose();
                ui.dispose();
            }, [ani, ui]);
            ani.once(GCAnimation.SIGNAL, this, (signID: number) => {
                if (signID == 2) {
                    SyncTask.taskOver(GUI_Main.syncGetItemTipsTask);
                }
            });
        }, [ui]);
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 当技能更改时
     * @param inPartyIndex 
     * @param so 
     */
    private onSkillChange(inPartyIndex: number, actorDS: DataStructure_inPartyActor, skill: Module_Skill) {
        if (ProjectPlayer.ctrlActorSceneObject.inPartyIndex == inPartyIndex) this.refreshMainActorSkillBar();
    }

    private onStatusChange(battler: ProjectClientSceneObject) {
        if (battler.inPartyIndex >= 0) this.refreshActorStatus(battler.inPartyIndex);
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 当技能项创建时
     * @param ui 
     * @param data 
     * @param index 
     */
    private onCreateSkillItem(ui: GUI_SkillIcon, data: ListItem_1030, index: number): void {
        ui.iconBg.on(EventObject.MOUSE_OVER, this, this.onSkillItemMouseOver, [ui]);
        ui.iconBg.on(EventObject.MOUSE_OUT, this, this.onSkillItemMouseOut, [ui]);
        ui.iconBg.on(EventObject.CLICK, this, this.onSkillClick, [ui]);
    }
    /**
     * 当鼠标悬停在技能图标上时
     * @param ui 
     */
    private onSkillItemMouseOver(ui: GUI_SkillIcon) {
        var skill = ui.skill;
        if (skill) {
            this.tipsUI.descName.text = skill.name;
            this.tipsUI.descText.text = GUI_Manager.skillDesc(skill, ProjectPlayer.ctrlActorSceneObject.actor);
            this.tipsUI.visible = true;
            this.tipsUI.x = 642;
            this.tipsUI.y = 455;
            this.tipsPostionIndex = 1;
        }
    }
    /**
     * 当鼠标从技能图标上移开时
     * @param ui 
     */
    private onSkillItemMouseOut() {
        this.tipsUI.visible = false;
        this.tipsPostionIndex = null;
    }
    /**
     * 当技能点击时
     */
    private onSkillClick(ui: GUI_SkillIcon) {
        GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, ui.skill);
    }
    //------------------------------------------------------------------------------------------------------
    // 私有实现：控制的角色状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 当状态项创建时
     * @param ui 
     * @param data 
     * @param index 
     */
    private onCreateMainActorStatusItem(ui: GUI_1028, data: ListItem_1028, index: number): void {
        ui.icon.on(EventObject.MOUSE_OVER, this, this.onMainActorStatusItemMouseOver, [data.data]);
        ui.icon.on(EventObject.MOUSE_OUT, this, this.onMainActorStatusItemMouseOut);
    }
    /**
     * 当鼠标悬停在技能图标上时
     * @param ui 
     */
    private onMainActorStatusItemMouseOver(status: Module_Status) {
        this.tipsUI.descName.text = status.name;
        this.tipsUI.descText.text = GUI_Manager.statusDesc(status);
        this.tipsUI.visible = true;
        this.tipsUI.x = 561;
        this.tipsUI.y = 53;
        this.tipsPostionIndex = 2;
    }
    /**
     * 当鼠标从技能图标上移开时
     * @param ui 
     */
    private onMainActorStatusItemMouseOut() {
        this.tipsUI.visible = false;
        this.tipsPostionIndex = null;
    }

}