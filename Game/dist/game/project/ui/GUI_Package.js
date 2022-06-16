














var GUI_Package = (function (_super) {
    __extends(GUI_Package, _super);
    function GUI_Package() {
        var _this_1 = _super.call(this) || this;
        GUI_Manager.standardList(_this_1.list, false);
        GUI_Manager.standardList(_this_1.actorList, false);
        _this_1.on(EventObject.DISPLAY, _this_1, _this_1.onDisplay);
        _this_1.list.on(EventObject.CHANGE, _this_1, _this_1.refreshItemInfo);
        _this_1.list.on(UIList.ITEM_CLICK, _this_1, _this_1.onItemClick);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER, _this_1.onItemChange, _this_1);
        _this_1.list.on(UIList.ITEM_CREATE, _this_1, _this_1.onCreateItemUI);
        _this_1.actorList.on(UIList.ITEM_CLICK, _this_1, _this_1.onActorItemClick);
        _this_1.actorList.on(UIList.ITEM_CREATE, _this_1, _this_1.onCreateActorItemUI);
        return _this_1;
    }
    GUI_Package.prototype.onDisplay = function () {
        UIList.focus = this.list;
        this.refreshItems(0);
        this.refreshItemInfo();
        this.targetPanel.visible = false;
    };
    GUI_Package.prototype.onItemChange = function () {
        Callback.CallLaterBeforeRender(this.refreshItems, this, [0]);
    };
    GUI_Package.prototype.onCreateItemUI = function (ui, data, index) {
        var itemDS = data.data;
        if (!itemDS)
            ui.alpha = 0;
    };
    GUI_Package.prototype.onItemClick = function () {
        var _this_1 = this;
        if (this.useItemLock)
            return;
        var selectedItem = this.list.selectedItem;
        if (selectedItem && selectedItem.data) {
            var itemDS = selectedItem.data;
            if (itemDS.isEquip) {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
            var item = itemDS.item;
            if (item.isUse && itemDS.number > 0) {
                if (item.isSingleTarget) {
                    this.startSelectTarget(function () { _this_1.onUseItem(itemDS); });
                }
                else {
                    this.onUseItem(itemDS);
                }
            }
            else {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
        }
    };
    GUI_Package.prototype.onUseItem = function (itemDS) {
        var _this_1 = this;
        if (itemDS.number <= 0) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        var item = itemDS.item;
        var triggerSceneObject;
        var executeSceneObject;
        if (item.isSingleTarget) {
            triggerSceneObject = executeSceneObject = ProjectPlayer.getPlayerPartyBattler(this.actorList.selectedIndex);
            if ((item.applyDeadBattler && !triggerSceneObject.isDead) || (!item.applyDeadBattler && triggerSceneObject.isDead)) {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
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
        if (item.se)
            GameAudio.playSE(item.se);
        this.useItemLock = true;
        var trigger = CommandPage.startTriggerFragmentEvent(item.callEvent, triggerSceneObject, executeSceneObject, Callback.New(function () {
            if (item.isSingleTarget) {
                if (item.applyDeadBattler && item.recoveryHP > 0 && executeSceneObject.isDead) {
                    GameBattlerHandler.resuscitate(executeSceneObject);
                }
                if (item.useAnimation) {
                    triggerSceneObject.playAnimation(item.useAnimation, false, true, null, true);
                }
                GameBattleAction.hitResult(triggerSceneObject, executeSceneObject, true, 2, null, item, null);
            }
            _this_1.refreshTargetPanel();
            _this_1.useItemLock = false;
        }, this));
        if (!trigger)
            this.useItemLock = false;
        if (item.isConsumables)
            ProjectPlayer.changeItemNumber(item.id, -1, false);
    };
    GUI_Package.prototype.onCreateActorItemUI = function (ui, data, index) {
        var battler = ProjectPlayer.getPlayerPartyBattler(index);
        ui.deadSign.visible = battler.isDead;
    };
    GUI_Package.prototype.onActorItemClick = function () {
        GUI_Package.actorSelectedIndex = this.actorList.selectedIndex;
        this.onSelectTargetUseItem.apply(this);
    };
    GUI_Package.prototype.startSelectTarget = function (onSelectTargetUseItem) {
        GameAudio.playSE(WorldData.sureSE);
        this.targetPanel.visible = true;
        this.refreshTargetPanel();
        UIList.focus = this.actorList;
        this.onSelectTargetUseItem = onSelectTargetUseItem;
    };
    GUI_Package.prototype.refreshItems = function (state) {
        if (state != 0)
            return;
        var arr = [];
        for (var i = 0; i < Game.player.data.package.length; i++) {
            var d = new ListItem_1002;
            var itemDS = Game.player.data.package[i];
            d.data = itemDS;
            if (itemDS.isEquip) {
                d.icon = itemDS.equip.icon;
                d.itemName = itemDS.equip.name;
            }
            else {
                d.icon = itemDS.item.icon;
                d.itemName = itemDS.item.name;
            }
            d.itemNum = "x" + itemDS.number.toString();
            arr.push(d);
        }
        if (Game.player.data.package.length == 0) {
            var emptyItem = new ListItem_1002;
            emptyItem.icon = "";
            emptyItem.itemName = "";
            emptyItem.itemNum = "";
            arr.push(emptyItem);
        }
        this.list.items = arr;
    };
    GUI_Package.prototype.refreshItemInfo = function () {
        var selectedItem = this.list.selectedItem;
        if (!selectedItem || !selectedItem.data) {
            this.itemName.text = "";
            this.itemIntro.text = "";
        }
        else {
            var itemDS = selectedItem.data;
            if (itemDS.isEquip) {
                this.itemName.text = itemDS.equip.name;
                this.itemIntro.text = GUI_Manager.equipDesc(itemDS.equip);
            }
            else {
                this.itemName.text = itemDS.item.name;
                this.itemIntro.text = itemDS.item.intro;
            }
        }
        this.itemIntro.height = this.itemIntro.textHeight;
        this.itemIntroRoot.refresh();
    };
    GUI_Package.prototype.refreshTargetPanel = function () {
        var items = [];
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var d = new ListItem_1010;
            var actorDS = Game.player.data.party[i];
            var actor = actorDS.actor;
            var actorClass = GameData.getModuleData(2, actor.class);
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
    };
    return GUI_Package;
}(GUI_4));
//# sourceMappingURL=GUI_Package.js.map