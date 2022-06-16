/**
 * 队伍编成
 * Created by 黑暗之神KDS on 2021-01-09 07:08:31.
 */
class GUI_Party extends GUI_11 {
    /**
     * 构造函数
     */
    constructor() {
        super();
        // 当显示该界面时触发的事件
        this.on(EventObject.DISPLAY, this, this.onDisplay);
        // 当选中角色项时刷新角色数据
        this.actorList.on(EventObject.CHANGE, this, this.onActorListChange);
        // 当操作角色时
        this.actorList.on(UIList.ITEM_CLICK, this, this.onActorItemClick);
        // 标准化List
        GUI_Manager.standardList(this.actorList);
        GUI_Manager.standardList(this.actorEquipList);
        GUI_Manager.standardList(this.equipPackageList, false);
        // 当角色功能标签栏切换时
        this.actorPanelTab.on(EventObject.CHANGE, this, this.onActorPanelTabChange);
        // 当创建角色列表项时
        this.actorList.on(UIList.ITEM_CREATE, this, this.onCreateActorItem);
        // 当创建可装备栏项时（玩家背包中的装备）
        this.equipPackageList.on(UIList.ITEM_CREATE, this, this.onCreateEquipPackageItem);
        // 当技能栏选中项更改时
        this.actorSkillList.on(EventObject.CHANGE, this, this.onActorSkillChange);
        // 当角色装备栏选中项更改时
        this.actorEquipList.on(EventObject.CHANGE, this, this.onActorEquipChange);
        // 当角色装备栏确定时
        this.actorEquipList.on(UIList.ITEM_CLICK, this, this.onActorEquipItemClick);
        // 当玩家可装备栏选中项更改时
        this.equipPackageList.on(EventObject.CHANGE, this, this.onEquipPackageChage);
        // 当玩家可装备栏确定时
        this.equipPackageList.on(UIList.ITEM_CLICK, this, this.onEquipPackageItemClick);
        // 按键
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        // 鼠标激活列表
        GUI_Manager.regHitAreaFocusList(this.actorPanel, this.actorList, true, FocusButtonsManager.closeFocus);
        GUI_Manager.regHitAreaFocusList(this.skillPanel, this.actorSkillList);
        GUI_Manager.regHitAreaFocusList(this.actorEquipPanel, this.actorEquipList);
        GUI_Manager.regHitAreaFocusList(this.equipPackagePanel, this.equipPackageList, false);
        // 当列表焦点改变时事件
        EventUtils.addEventListenerFunction(UIList, UIList.EVENT_FOCUS_CHANGE, this.onListFocusChange, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 接口
    //------------------------------------------------------------------------------------------------------
    /**
     * 快捷键：返回
     */
    static onBack(): boolean {
        var uiParty = GameUI.get(11) as GUI_Party;
        // 关闭界面
        if (UIList.focus == uiParty.actorList) {
            return true;
        }
        // 回到角色装备界面
        else if (UIList.focus == uiParty.equipPackageList) {
            UIList.focus = uiParty.actorEquipList;
            // 刷新装备变更时的属性差预览
            uiParty.refreshPreEquipChangeInfo();
        }
        // 回到角色界面
        else if (UIList.focus != uiParty.actorList) {
            FocusButtonsManager.closeFocus();
            UIList.focus = uiParty.actorList;
        }
        // 刷新描述
        uiParty.refreshDescribe();
        return false;
    }
    /**
     * 解散选定的角色
     */
    static dissolutionPartyActor(): void {
        var uiParty = GameUI.get(11) as GUI_Party;
        if (!uiParty) return;
        if (!uiParty.selectedActorDS) return;
        if (Game.player.data.party.length == 1 || !uiParty.selectedActorDS.dissolutionEnabled) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        GameAudio.playSE(WorldData.sureSE);
        ProjectPlayer.removePlayerActorByInPartyIndex(uiParty.actorList.selectedIndex);
        uiParty.refreshActorList();
        FocusButtonsManager.closeFocus();
        UIList.focus = uiParty.actorList;
    }
    //------------------------------------------------------------------------------------------------------
    // 通常
    //------------------------------------------------------------------------------------------------------
    /**
     * 当按键按下时
     * @param e 
     */
    private onKeyDown(e: EventObject) {
        if (!this.stage) return;
        // 切换标签按键按下时切换对应的标签
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.L1)) {
            this.actorPanelTab.selectedIndex = Math.max(this.actorPanelTab.selectedIndex - 1, 0);
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.R1)) {
            this.actorPanelTab.selectedIndex = Math.min(this.actorPanelTab.length - 1, this.actorPanelTab.selectedIndex + 1);
        }
    }
    /**
     * 当列表焦点改变时事件
     * @param lastFocus 上一个焦点
     * @param currentFocus 当前焦点
     */
    private onListFocusChange(lastFocus: UIList, currentFocus: UIList) {
        if (this.stage) {
            // 刷新焦点栏显示
            this.refreshFocusBarVisible();
            // 刷新装备变更时的属性差预览
            this.refreshPreEquipChangeInfo();
            // 刷新描述栏
            this.refreshDescribe();
            // 刷新焦点按钮
            if (UIList.focus == this.actorList) {
                FocusButtonsManager.closeFocus();
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 角色列表
    //------------------------------------------------------------------------------------------------------
    /**
     * 当角色列表选中发生变更时
     * @param state state=0 表示selectedIndex改变，否则是overIndex
     */
    private onActorListChange(state: number) {
        // 忽略掉悬停时触发的CHANGE事件
        if (state != 0) return;
        this.refreshActorPanels(true);
    }
    /**
     * 确认操作该角色时处理
     */
    private onActorItemClick() {
        this.refreshOperactionActorFocus();
    }
    /**
     * 当角色功能标签栏切换时
     */
    private onActorPanelTabChange() {
        if (WorldData.selectSE) GameAudio.playSE(WorldData.selectSE);
        this.refreshOperactionActorFocus();
    }
    /**
     * 刷新操作角色焦点
     */
    private refreshOperactionActorFocus() {
        // 技能
        if (this.actorPanelTab.selectedIndex == 0) {
            UIList.focus = this.actorSkillList;
        }
        // 装备
        else if (this.actorPanelTab.selectedIndex == 1) {
            UIList.focus = this.actorEquipList;
        }
        // 设置
        else if (this.actorPanelTab.selectedIndex == 2) {
            if (this.actorPanelTab.onChangeFragEvent)
                CommandPage.startTriggerFragmentEvent(this.actorPanelTab.onChangeFragEvent, Game.player.sceneObject, Game.player.sceneObject);
        }
        // 刷新描述
        this.refreshDescribe();
    }
    /**
     * 刷新焦点栏显示
     */
    private refreshFocusBarVisible() {
        this.actorSkillList.selectedImage.visible = UIList.focus == this.actorSkillList;
        this.actorEquipList.selectedImage.visible = UIList.focus == this.actorEquipList || UIList.focus == this.equipPackageList;
        this.equipPackageList.selectedImage.visible = UIList.focus == this.equipPackageList;
    }
    //------------------------------------------------------------------------------------------------------
    // 数据
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取当前选中的角色DS
     * @return [DataStructure_inPartyActor] 
     */
    private get selectedActorDS(): DataStructure_inPartyActor {
        var d = this.actorList.selectedItem as ListItem_1004;
        if (!d) return;
        var actorDS: DataStructure_inPartyActor = d.data;
        if (!actorDS) return;
        return actorDS;
    }
    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    private onDisplay() {
        // 刷新队伍成员列表
        this.refreshActorList();
        // 焦点
        UIList.focus = this.actorList;
        // 刷新描述
        this.refreshDescribe();
        // 不显示装备属性变更预览
        this.attributeChangeBox.visible = false;
        // 刷新焦点栏显示
        this.refreshFocusBarVisible();
    }
    //------------------------------------------------------------------------------------------------------
    // 队伍成员
    //------------------------------------------------------------------------------------------------------
    /**
     * 当创建可装备的道具栏项时
     */
    private onCreateActorItem(ui: GUI_1004, data: ListItem_1004, index: number) {
        var actorDS: DataStructure_inPartyActor = data.data;
        if (actorDS) {
            var battler = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
            ui.deadSign.visible = battler.isDead ? true : false;
        }
    }
    /**
     * 刷新角色列表
     */
    private refreshActorList() {
        var arr = [];
        // 遍历我的队伍
        for (var i = 0; i < Game.player.data.party.length; i++) {
            // 获取角色DS格式数据
            var actorDS: DataStructure_inPartyActor = Game.player.data.party[i];
            // 获取角色模块数据
            var actor: Module_Actor = actorDS.actor;
            // 创建列表的项数据
            var d = new ListItem_1004;
            // 行走图
            d.avatar = actor.avatar;
            // 绑定数据，以免后面直接访问
            d.data = actorDS;
            // 添加至数组中
            arr.push(d);
        }
        this.actorList.items = arr;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色面板
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新角色面板
     * @param needRefreshPackage 需要刷新玩家背包（物品、装备）
     */
    private refreshActorPanels(needRefreshPlayerPackage: boolean) {
        // 获取角色数据
        var d = this.actorList.selectedItem as ListItem_1004;
        if (!d) return;
        var actorDS: DataStructure_inPartyActor = d.data;
        if (!actorDS) return;
        // 计算并刷新角色属性
        var battler = ProjectPlayer.getPlayerPartyBattler(this.actorList.selectedIndex);
        Game.refreshActorAttribute(actorDS.actor, actorDS.lv, battler);
        // 刷新角色数据面板显示
        this.refreshActorDataPanel();
        // 刷新角色技能
        this.refreshActorSkillPanel();
        // 刷新角色装备
        this.refreshActorEquips();
        // 刷新角色设置
        this.refreshActorSetting();
        // 需要刷新玩家背包（物品、装备）的情况
        if (needRefreshPlayerPackage) {
            // 刷新可装备栏
            this.refreshEquipPackageList();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新角色数据面板
     */
    private refreshActorDataPanel() {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        var selectedActor = selectedActorDS.actor;
        // 基本信息
        this.actorFace.image = selectedActor.face;
        this.actorName.text = selectedActor.name;
        this.smallAvatar.avatarID = selectedActor.avatar;
        var classData: Module_Class = GameData.getModuleData(2, selectedActor.class);
        this.actorClass.text = classData.name;
        // 等级和经验
        if (selectedActor.growUpEnabled) {
            this.actorLv.text = "Lv." + selectedActorDS.lv;
            var nextExp = Game.getLevelUpNeedExp(selectedActor, selectedActorDS.lv);
            this.actorExpInfo.text = `${selectedActor.currentEXP}/${nextExp}`;
            this.actorExpSlider.value = selectedActor.currentEXP * 100 / nextExp;
        }
        else {
            this.actorLv.text = "-----";
            this.actorExpInfo.text = "-----";
            this.actorExpSlider.value = 100;
        }
        // 属性
        this.atk.text = selectedActor.ATK.toString();
        this.def.text = selectedActor.DEF.toString();
        this.agi.text = selectedActor.AGI.toString();
        this.mag.text = selectedActor.MAG.toString();
        this.magDef.text = selectedActor.MagDef.toString();
        this.pow.text = selectedActor.POW.toString();
        this.end.text = selectedActor.END.toString();
        this.moveSpeed.text = selectedActor.MoveSpeed.toString();
        this.hit.text = selectedActor.HIT.toString();
        this.crit.text = selectedActor.CRIT.toString();
        this.magCrit.text = selectedActor.MagCrit.toString();
        this.dod.text = selectedActor.DOD.toString();
        this.refreshActorDataPanelEnergyValue();
    }
    /**
     * 刷新角色数据-能量类数值
     */
    private refreshActorDataPanelEnergyValue() {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        var selectedActor = selectedActorDS.actor;
        this.maxHP.text = selectedActor.hp + "/" + selectedActor.MaxHP.toString();
        this.maxSP.text = selectedActor.sp + "/" + selectedActor.MaxSP.toString();
    }
    //------------------------------------------------------------------------------------------------------
    // 角色面板-技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新角色技能面板
     */
    private refreshActorSkillPanel() {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        var arr = [];
        // 遍历角色的技能
        for (var i = 0; i < selectedActorDS.actor.skills.length; i++) {
            // 创建对应的背包物品项数据，该项数据由系统自动生成
            var d = new ListItem_1006;
            // 获取背包的道具DS格式
            var skill: Module_Skill = selectedActorDS.actor.skills[i];
            // 绑定项数据，项显示对象会自动根据项数据设置对应的值，参考UIList.api头部注释（CTRL+SHIFT+R搜索UIList.api）
            d.data = skill; // 项数据记录对应的道具，以便能够通过项数据找到其对应的道具
            d.icon = skill.icon; // 设置图标
            arr.push(d);
        }
        // 如果没有技能则给与一个空的项
        if (selectedActorDS.actor.skills.length == 0) {
            var emptyItem = new ListItem_1006;
            emptyItem.icon = "";
            arr.push(emptyItem)
        }
        this.actorSkillList.items = arr;
    }
    /**
     * 当技能选中发生改变时处理
     */
    private onActorSkillChange() {
        this.refreshDescribe();
    }
    //------------------------------------------------------------------------------------------------------
    // 角色面板-装备
    //------------------------------------------------------------------------------------------------------
    /**
     * 当创建可装备的背包道具栏项时
     */
    private onCreateEquipPackageItem(ui: GUI_1007, data: ListItem_1007, index: number) {
        var equipDS: DataStructure_packageItem = data.data;
        if (equipDS) {
            ui.unequipBtn.visible = false;
            ui.equipBox.visible = true;
        }
        else {
            ui.unequipBtn.visible = true;
            ui.equipBox.visible = false;
        }
    }
    /**
     * 刷新角色装备
     */
    private refreshActorEquips() {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        var arr = [];
        var lastSelectedIndex = this.actorEquipList.selectedIndex;
        if (lastSelectedIndex == -1) lastSelectedIndex = 0;
        // 遍历部件
        for (var i = 0; i < 5; i++) {
            var equip: Module_Equip = Game.getActorEquipByPartID(selectedActorDS.actor, i);
            // 创建对应的背包物品项数据，该项数据由系统自动生成
            var d = new ListItem_1005;
            // 该部件存在装备的情况下
            if (equip) {
                d.data = equip;
                d.icon = equip.icon;
            }
            else {
                d.icon = "";
            }
            arr.push(d);
        }
        this.actorEquipList.items = arr;
        this.actorEquipList.selectedIndex = lastSelectedIndex;
    }
    /**
     * 刷新可装备列表
     * -- 进入编成界面时刷新
     * -- 携带/卸下装备时刷新
     */
    private refreshEquipPackageList() {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        var equipSelectIndex = this.actorEquipList.selectedIndex;
        if (equipSelectIndex < 0) return;
        var partID = equipSelectIndex;
        // 筛选出背包的全部装备
        var allEquips: DataStructure_packageItem[] = ArrayUtils.matchAttributes(Game.player.data.package, { isEquip: true }, false) as any;
        // 筛选出指定部件的装备
        var partEquips: DataStructure_packageItem[] = ArrayUtils.matchAttributesD2(allEquips, "equip", { partID: partID }, false);
        // 筛选出可职业可佩带的装备
        var classID = selectedActorDS.actor.class;
        var classData: Module_Class = GameData.getModuleData(2, classID);
        if (!classData) return;
        for (var i = 0; i < partEquips.length; i++) {
            if (classData.canWearEquips.indexOf(partEquips[i].equip.id) == -1) {
                partEquips.splice(i, 1);
                i--;
            }
        }
        // 刷新可装备的列表
        var items = [new ListItem_1007];
        for (var i = 0; i < partEquips.length; i++) {
            var d = new ListItem_1007;
            var packageEquip: DataStructure_packageItem = partEquips[i];
            d.data = packageEquip;
            d.itemName = packageEquip.equip.name;
            d.icon = packageEquip.equip.icon;
            d.itemNum = "x" + packageEquip.number;
            items.push(d);
        }
        this.equipPackageList.items = items;
    }
    /**
     * 当角色装备栏选项发生改变时
     */
    private onActorEquipChange(): void {
        // 刷新可佩戴的装备列表
        this.refreshEquipPackageList();
        // 刷新描述
        this.refreshDescribe();
    }
    /**
     * 当角色装备栏确定时
     */
    private onActorEquipItemClick(): void {
        // 焦点设置为可装备栏
        UIList.focus = this.equipPackageList;
        // 刷新描述
        this.refreshDescribe();
        // 刷新装备变更时的属性差预览
        this.refreshPreEquipChangeInfo();
    }
    /**
     * 当可装备栏选项发生改变时
     */
    private onEquipPackageChage(): void {
        // 刷新描述
        this.refreshDescribe();
        // 刷新装备变更时的属性差预览
        this.refreshPreEquipChangeInfo();
    }
    /**
     * 当可装备栏确定时
     */
    private onEquipPackageItemClick(): void {
        var selectedActorDS = this.selectedActorDS;
        var actor = selectedActorDS.actor;
        var index = this.equipPackageList.selectedIndex;
        var actorInPartyIndex = this.actorList.selectedIndex;
        var equipPartID = this.actorEquipList.selectedIndex;
        // 卸下
        if (index == 0) {
            var takeOffEuqip = ProjectPlayer.takeOffPlayerActorEquipByPartID(actorInPartyIndex, equipPartID);
            if (takeOffEuqip) GameAudio.playSE(ClientWorld.data.unequipSE);
            else GameAudio.playSE(ClientWorld.data.disalbeSE);
        }
        else {
            var itemData = this.equipPackageList.selectedItem;
            var equipDS = itemData.data as DataStructure_packageItem;
            if (equipDS && equipDS.equip) {
                var equip = equipDS.equip;
                var res = ProjectPlayer.wearPlayerActorEquip(actorInPartyIndex, equip);
            }
            if (res.success) GameAudio.playSE(ClientWorld.data.equipSE);
            else GameAudio.playSE(ClientWorld.data.disalbeSE);
        }
        // 计算并刷新角色属性
        var battler = ProjectPlayer.getPlayerPartyBattler(this.actorList.selectedIndex);
        Game.refreshActorAttribute(actor, selectedActorDS.lv, battler);
        // 刷新角色属性显示
        this.refreshActorDataPanel();
        // 刷新列表
        this.refreshActorEquips();
        this.refreshEquipPackageList();
        // 焦点回到角色装备栏
        UIList.focus = this.actorEquipList;
        // 刷新装备更换预览
        this.refreshPreEquipChangeInfo();
        // 刷新描述
        this.refreshDescribe();
    }
    /**
     * 刷新装备变更时的属性差预览
     */
    private refreshPreEquipChangeInfo(): void {
        if (UIList.focus == this.equipPackageList) {
            var actor = this.selectedActorDS.actor;
            this.attributeChangeBox.visible = true;
            // 计算更换装备的属性变更预览
            var previewChangeEquipDS: DataStructure_packageItem = this.equipPackageList.selectedItem.data;
            var previewChangeEquip = previewChangeEquipDS ? previewChangeEquipDS.equip : null;
            var previewChangeEquipIndex = this.actorEquipList.selectedIndex;
            var attributeRes = Game.clacActorAttribute(actor, this.selectedActorDS.lv, true, previewChangeEquipIndex, previewChangeEquip);
            // 属性变更显示
            this.setEquipChangePreviewAttributeLabel(this.atkChange, attributeRes.ATK - actor.ATK);
            this.setEquipChangePreviewAttributeLabel(this.defChange, attributeRes.DEF - actor.DEF);
            this.setEquipChangePreviewAttributeLabel(this.dodChange, attributeRes.DOD - actor.DOD);
            this.setEquipChangePreviewAttributeLabel(this.maxHPChange, attributeRes.MaxHP - actor.MaxHP);
            this.setEquipChangePreviewAttributeLabel(this.maxSPChange, attributeRes.MaxSP - actor.MaxSP);
            this.setEquipChangePreviewAttributeLabel(this.powChange, attributeRes.POW - actor.POW);
            this.setEquipChangePreviewAttributeLabel(this.magChange, attributeRes.MAG - actor.MAG);
            this.setEquipChangePreviewAttributeLabel(this.magDefChange, attributeRes.MagDef - actor.MagDef);
            this.setEquipChangePreviewAttributeLabel(this.hitChange, attributeRes.HIT - actor.HIT);
            this.setEquipChangePreviewAttributeLabel(this.critChange, attributeRes.CRIT - actor.CRIT);
            this.setEquipChangePreviewAttributeLabel(this.magCritChange, attributeRes.MagCrit - actor.MagCrit);
            this.setEquipChangePreviewAttributeLabel(this.moveSpeedChange, attributeRes.MoveSpeed - actor.MoveSpeed);
            this.setEquipChangePreviewAttributeLabel(this.endChange, attributeRes.END - actor.END);
            this.setEquipChangePreviewAttributeLabel(this.agiChange, attributeRes.AGI - actor.AGI);
        }
        else {
            this.attributeChangeBox.visible = false;
        }
    }
    /**
     * 设置属性变更颜色和文本显示
     * @param label 
     * @param changeValue 
     */
    private setEquipChangePreviewAttributeLabel(label: UIString, changeValue: number): void {
        label.visible = changeValue != 0;
        if (changeValue > 0) {
            label.color = "#6576d6";
            label.text = "+" + changeValue.toString();
        }
        else if (changeValue < 0) {
            label.color = "#b7462c";
            label.text = changeValue.toString();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 角色面板-设置
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新角色
     */
    refreshActorSetting() {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        this.dissolutionBtn.visible = selectedActorDS.dissolutionEnabled;
    }
    /**
     * 更改角色AI
     */
    onChangeActorAI(): void {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        var actorItemUI = this.actorList.getItemUI(this.actorList.selectedIndex);
        // 刷新角色列表的单项（此处优化，无需刷新全部列表）
        this.onCreateActorItem(actorItemUI as GUI_1004, this.actorList.selectedItem as ListItem_1004, this.actorList.selectedIndex);
    }
    //------------------------------------------------------------------------------------------------------
    // 描述
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新描述
     */
    private refreshDescribe(): void {
        var name = "";
        var desc = "";
        // 焦点在技能栏的情况下
        if (UIList.focus == this.actorSkillList) {
            var itemData = this.actorSkillList.selectedItem;
            var skill = itemData.data as Module_Skill;
            if (skill) {
                name = skill.name;
                desc = GUI_Manager.skillDesc(skill, this.selectedActorDS.actor);
            }
        }
        // 焦点在装备栏的情况下
        else if (UIList.focus == this.actorEquipList) {
            var equip: Module_Equip = this.actorEquipList.selectedItem.data;
            if (equip) {
                name = equip.name;
                desc = GUI_Manager.equipDesc(equip);
            }
        }
        // 焦点在可装备栏的情况下
        else if (UIList.focus == this.equipPackageList) {
            var itemData = this.equipPackageList.selectedItem;
            var equipDS = itemData.data as DataStructure_packageItem;
            if (equipDS && equipDS.equip) {
                var equip = equipDS.equip;
                name = equip.name;
                desc = GUI_Manager.equipDesc(equip);
            }
        }
        this.descName.text = name;
        this.descText.text = desc;
        this.descText.height = this.descText.textHeight;
        this.descRoot.refresh();
    }
}