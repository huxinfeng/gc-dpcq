/**
 * 背包
 * Created by 黑暗之神KDS on 2020-09-17 14:56:35.
 */
class GUI_Package extends GUI_4 {
    /**
     * 当前选中的角色
     */
    static actorSelectedIndex: number;
    /**
     * 使用道具锁定状态，以便在道具的事件执行完毕前不再允许使用
     */
    private useItemLock: boolean;
    /**
     * 当选择确定目标后回调
     */
    private onSelectTargetUseItem: Function;
    /**
     * 构造函数
     */
    constructor() {
        super();
        // 标准化列表
        GUI_Manager.standardList(this.list, false);
        GUI_Manager.standardList(this.actorList, false);
        // 事件监听：当界面显示时
        this.on(EventObject.DISPLAY, this, this.onDisplay);
        // 事件监听：当列表选择项改变时-刷新道具描述
        this.list.on(EventObject.CHANGE, this, this.refreshItemInfo);
        // 事件监听：当项选中时-刷新道具
        this.list.on(UIList.ITEM_CLICK, this, this.onItemClick);
        // 事件监听：当道具更改时
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER, this.onItemChange, this);
        // 事件监听：当创建项对象时
        this.list.on(UIList.ITEM_CREATE, this, this.onCreateItemUI);
        // 事件监听：当角色窗口点击时
        this.actorList.on(UIList.ITEM_CLICK, this, this.onActorItemClick);
        // 事件监听：当创建角色目标项时
        this.actorList.on(UIList.ITEM_CREATE, this, this.onCreateActorItemUI);

    }
    //------------------------------------------------------------------------------------------------------
    // 事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 当界面显示时事件
     */
    private onDisplay() {
        // 设置焦点为道具列表
        UIList.focus = this.list;
        // 刷新道具列表
        this.refreshItems(0);
        // 刷新选中的道具详情
        this.refreshItemInfo();
        // 默认不显示目标窗口
        this.targetPanel.visible = false;
    }
    /**
     * 当道具发生变更时
     */
    private onItemChange() {
        // 刷新道具（优化：延迟到下一帧渲染前执行，以保证连续多次更改道具后仅刷新一次而非多次）
        Callback.CallLaterBeforeRender(this.refreshItems, this, [0]);
    }
    /**
     * 当创建项显示对象时
     */
    private onCreateItemUI(ui: GUI_1002, data: ListItem_1002, index: number) {
        var itemDS: DataStructure_packageItem = data.data;
        // 空数据透明化
        if (!itemDS) ui.alpha = 0;
    }
    //------------------------------------------------------------------------------------------------------
    // 背包操作
    //------------------------------------------------------------------------------------------------------
    /**
     * 当道具点击时
     */
    private onItemClick() {
        // 锁定状态下时不触发使用效果
        if (this.useItemLock) return;
        // 获取当前选中的列表项
        var selectedItem = this.list.selectedItem;
        if (selectedItem && selectedItem.data) {
            // 获取道具DS格式（此结构额外追加储存了道具的数目）
            var itemDS: DataStructure_packageItem = selectedItem.data;
            // 如果是装备的话，无法使用
            if (itemDS.isEquip) {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
            // 获取道具
            var item = itemDS.item;
            // 可使用道具且允许在背包中使用的情况
            if (item.isUse && itemDS.number > 0) {
                // 指定单个目标的话，弹出目标窗口以便选择目标后使用该道具
                if (item.isSingleTarget) {
                    this.startSelectTarget(() => { this.onUseItem(itemDS); });
                }
                // 否则直接使用
                else {
                    this.onUseItem(itemDS);
                }
            }
            // 否则禁止使用的场合播放禁用音效
            else {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
        }
    }
    /**
     * 当使用道具时
     * @param itemDS 
     */
    private onUseItem(itemDS: DataStructure_packageItem): void {
        // 如果没有该道具的情况
        if (itemDS.number <= 0) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        var item = itemDS.item;
        // 获取对应的战斗者
        var triggerSceneObject: ProjectClientSceneObject;
        var executeSceneObject: ProjectClientSceneObject;
        if (item.isSingleTarget) {
            triggerSceneObject = executeSceneObject = ProjectPlayer.getPlayerPartyBattler(this.actorList.selectedIndex);
            // 如果是指向已死亡的目标时目标未死亡则忽略
            if ((item.applyDeadBattler && !triggerSceneObject.isDead) || (!item.applyDeadBattler && triggerSceneObject.isDead)) {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
            // 状态已满的情况不允许使用
            if (!triggerSceneObject.isDead && !item.applyDeadBattler) {
                var targetActor = triggerSceneObject.actor;
                if ((item.recoveryHP > 0 && item.recoverySP > 0 && targetActor.hp == targetActor.MaxHP && targetActor.sp == targetActor.MaxSP) ||
                    (item.recoveryHP > 0 && item.recoverySP == 0 && targetActor.hp == targetActor.MaxHP) ||
                    (item.recoveryHP == 0 && item.recoverySP > 0 && targetActor.sp == targetActor.MaxSP)) {
                    GameAudio.playSE(WorldData.disalbeSE);
                    return;
                }
            }
        }
        else {
            triggerSceneObject = executeSceneObject = Game.player.sceneObject;
        }
        // 播放使用音效
        if (item.se) GameAudio.playSE(item.se);
        // 锁定，在执行完毕事件前不允许再次使用
        this.useItemLock = true;
        // 执行片段事件
        var trigger = CommandPage.startTriggerFragmentEvent(item.callEvent, triggerSceneObject, executeSceneObject, Callback.New(() => {
            // 使用道具
            if (item.isSingleTarget) {
                // -- 复活
                if (item.applyDeadBattler && item.recoveryHP > 0 && executeSceneObject.isDead) {
                    GameBattlerHandler.resuscitate(executeSceneObject);
                }
                // -- 普通效果
                if (item.useAnimation) { triggerSceneObject.playAnimation(item.useAnimation, false, true, null, true); }
                GameBattleAction.hitResult(triggerSceneObject, executeSceneObject, true, 2, null, item, null);
            }
            // -- 刷新目标角色列表（可能队伍发生了变更或角色属性发生变更）
            this.refreshTargetPanel();
            // -- 解锁
            this.useItemLock = false;
        }, this));
        if (!trigger) this.useItemLock = false;
        // 消耗品的情况：道具-1
        if (item.isConsumables) ProjectPlayer.changeItemNumber(item.id, -1, false);
    }
    //------------------------------------------------------------------------------------------------------
    // 角色目标窗口
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件监听：当创建角色目标项时
     */
    private onCreateActorItemUI(ui: GUI_1010, data: ListItem_1010, index: number) {
        // 获取对应的战斗者
        var battler = ProjectPlayer.getPlayerPartyBattler(index);
        ui.deadSign.visible = battler.isDead;
    }
    /**
     * 当角色项确认时：使用道具
     */
    private onActorItemClick() {
        // 记录使用者角色索引
        GUI_Package.actorSelectedIndex = this.actorList.selectedIndex;
        // 使用道具
        this.onSelectTargetUseItem.apply(this);
    }
    /**
      * 开始选择目标
      * @param onSelectTargetUseItem 当选择角色时回调
      */
    private startSelectTarget(onSelectTargetUseItem: Function) {
        // 播放确定音效
        GameAudio.playSE(WorldData.sureSE);
        // 打开目标窗口
        this.targetPanel.visible = true;
        // 刷新目标窗口数值显示
        this.refreshTargetPanel();
        // 焦点指向目标窗口的角色列表
        UIList.focus = this.actorList;
        // 记录当选择角色时回调
        this.onSelectTargetUseItem = onSelectTargetUseItem;
    }
    //------------------------------------------------------------------------------------------------------
    // 刷新
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新道具列表
     * @param state 
     */
    private refreshItems(state: number) {
        if (state != 0) return;
        var arr = [];
        // 遍历玩家自定义数据-背包
        for (var i = 0; i < Game.player.data.package.length; i++) {
            // 创建对应的背包物品项数据，该项数据由系统自动生成
            var d = new ListItem_1002;
            // 获取背包的道具DS格式
            var itemDS = Game.player.data.package[i];
            // 绑定项数据，项显示对象会自动根据项数据设置对应的值，参考UIList.api头部注释（CTRL+SHIFT+R搜索UIList.api）
            d.data = itemDS; // 项数据记录对应的道具，以便能够通过项数据找到其对应的道具
            if (itemDS.isEquip) {
                d.icon = itemDS.equip.icon; // 设置图标
                d.itemName = itemDS.equip.name; // 设置名称
            }
            else {
                d.icon = itemDS.item.icon; // 设置图标
                d.itemName = itemDS.item.name; // 设置名称
            }
            d.itemNum = "x" + itemDS.number.toString(); // 设置道具数目
            arr.push(d);
        }
        // 如果没有道具的话：追加一个空项
        if (Game.player.data.package.length == 0) {
            var emptyItem = new ListItem_1002;
            emptyItem.icon = "";
            emptyItem.itemName = "";
            emptyItem.itemNum = "";
            arr.push(emptyItem)
        }
        // 刷新列表
        this.list.items = arr;
    }
    /**
     * 刷新道具详情
     */
    private refreshItemInfo() {
        // 获取选中的项数据
        var selectedItem = this.list.selectedItem;
        // 未选中任何道具的情况
        if (!selectedItem || !selectedItem.data) {
            this.itemName.text = "";
            this.itemIntro.text = "";
        }
        // 已选中道具的情况：显示该道具详情
        else {
            var itemDS: DataStructure_packageItem = selectedItem.data;
            // 如果是装备，则显示为装备的名称和介绍
            if (itemDS.isEquip) {
                this.itemName.text = itemDS.equip.name;
                this.itemIntro.text = GUI_Manager.equipDesc(itemDS.equip);
            }
            // 否则显示道具的名称和介绍
            else {
                this.itemName.text = itemDS.item.name;
                this.itemIntro.text = itemDS.item.intro;
            }
        }
        this.itemIntro.height = this.itemIntro.textHeight;
        this.itemIntroRoot.refresh();
    }
    /**
     * 刷新目标界面
     */
    private refreshTargetPanel() {
        // 创建队伍成员界面
        var items = [];
        // 刷新队伍成员界面的信息
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var d = new ListItem_1010;
            var actorDS = Game.player.data.party[i];
            var actor = actorDS.actor;
            var actorClass: Module_Class = GameData.getModuleData(2, actor.class);
            var battler = ProjectPlayer.getPlayerPartyBattler(i);
            Game.refreshActorAttribute(actor, actorDS.lv, battler);
            d.actorFace = actor.smallFace;
            d.actorName = actor.name;
            d.actorLv = actorDS.actor.growUpEnabled ? actorDS.lv.toString() : "--";
            d.hpText = actor.hp.toString();
            d.spText = actor.sp.toString();
            d.actorClassIcon = actorClass ? actorClass.icon : "";
            d.hpSlider = actor.hp * 100 / actor.MaxHP;
            d.spSlider = actor.sp * 100 / actor.MaxSP;
            items.push(d);
        }
        this.actorList.items = items;
    }
}