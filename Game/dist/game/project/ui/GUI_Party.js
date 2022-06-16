














var GUI_Party = (function (_super) {
    __extends(GUI_Party, _super);
    function GUI_Party() {
        var _this_1 = _super.call(this) || this;
        _this_1.on(EventObject.DISPLAY, _this_1, _this_1.onDisplay);
        _this_1.actorList.on(EventObject.CHANGE, _this_1, _this_1.onActorListChange);
        _this_1.actorList.on(UIList.ITEM_CLICK, _this_1, _this_1.onActorItemClick);
        GUI_Manager.standardList(_this_1.actorList);
        GUI_Manager.standardList(_this_1.actorEquipList);
        GUI_Manager.standardList(_this_1.equipPackageList, false);
        _this_1.actorPanelTab.on(EventObject.CHANGE, _this_1, _this_1.onActorPanelTabChange);
        _this_1.actorList.on(UIList.ITEM_CREATE, _this_1, _this_1.onCreateActorItem);
        _this_1.equipPackageList.on(UIList.ITEM_CREATE, _this_1, _this_1.onCreateEquipPackageItem);
        _this_1.actorSkillList.on(EventObject.CHANGE, _this_1, _this_1.onActorSkillChange);
        _this_1.actorEquipList.on(EventObject.CHANGE, _this_1, _this_1.onActorEquipChange);
        _this_1.actorEquipList.on(UIList.ITEM_CLICK, _this_1, _this_1.onActorEquipItemClick);
        _this_1.equipPackageList.on(EventObject.CHANGE, _this_1, _this_1.onEquipPackageChage);
        _this_1.equipPackageList.on(UIList.ITEM_CLICK, _this_1, _this_1.onEquipPackageItemClick);
        stage.on(EventObject.KEY_DOWN, _this_1, _this_1.onKeyDown);
        GUI_Manager.regHitAreaFocusList(_this_1.actorPanel, _this_1.actorList, true, FocusButtonsManager.closeFocus);
        GUI_Manager.regHitAreaFocusList(_this_1.skillPanel, _this_1.actorSkillList);
        GUI_Manager.regHitAreaFocusList(_this_1.actorEquipPanel, _this_1.actorEquipList);
        GUI_Manager.regHitAreaFocusList(_this_1.equipPackagePanel, _this_1.equipPackageList, false);
        EventUtils.addEventListenerFunction(UIList, UIList.EVENT_FOCUS_CHANGE, _this_1.onListFocusChange, _this_1);
        return _this_1;
    }
    GUI_Party.onBack = function () {
        var uiParty = GameUI.get(11);
        if (UIList.focus == uiParty.actorList) {
            return true;
        }
        else if (UIList.focus == uiParty.equipPackageList) {
            UIList.focus = uiParty.actorEquipList;
            uiParty.refreshPreEquipChangeInfo();
        }
        else if (UIList.focus != uiParty.actorList) {
            FocusButtonsManager.closeFocus();
            UIList.focus = uiParty.actorList;
        }
        uiParty.refreshDescribe();
        return false;
    };
    GUI_Party.dissolutionPartyActor = function () {
        var uiParty = GameUI.get(11);
        if (!uiParty)
            return;
        if (!uiParty.selectedActorDS)
            return;
        if (Game.player.data.party.length == 1 || !uiParty.selectedActorDS.dissolutionEnabled) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        GameAudio.playSE(WorldData.sureSE);
        ProjectPlayer.removePlayerActorByInPartyIndex(uiParty.actorList.selectedIndex);
        uiParty.refreshActorList();
        FocusButtonsManager.closeFocus();
        UIList.focus = uiParty.actorList;
    };
    GUI_Party.prototype.onKeyDown = function (e) {
        if (!this.stage)
            return;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.L1)) {
            this.actorPanelTab.selectedIndex = Math.max(this.actorPanelTab.selectedIndex - 1, 0);
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.R1)) {
            this.actorPanelTab.selectedIndex = Math.min(this.actorPanelTab.length - 1, this.actorPanelTab.selectedIndex + 1);
        }
    };
    GUI_Party.prototype.onListFocusChange = function (lastFocus, currentFocus) {
        if (this.stage) {
            this.refreshFocusBarVisible();
            this.refreshPreEquipChangeInfo();
            this.refreshDescribe();
            if (UIList.focus == this.actorList) {
                FocusButtonsManager.closeFocus();
            }
        }
    };
    GUI_Party.prototype.onActorListChange = function (state) {
        if (state != 0)
            return;
        this.refreshActorPanels(true);
    };
    GUI_Party.prototype.onActorItemClick = function () {
        this.refreshOperactionActorFocus();
    };
    GUI_Party.prototype.onActorPanelTabChange = function () {
        if (WorldData.selectSE)
            GameAudio.playSE(WorldData.selectSE);
        this.refreshOperactionActorFocus();
    };
    GUI_Party.prototype.refreshOperactionActorFocus = function () {
        if (this.actorPanelTab.selectedIndex == 0) {
            UIList.focus = this.actorSkillList;
        }
        else if (this.actorPanelTab.selectedIndex == 1) {
            UIList.focus = this.actorEquipList;
        }
        else if (this.actorPanelTab.selectedIndex == 2) {
            if (this.actorPanelTab.onChangeFragEvent)
                CommandPage.startTriggerFragmentEvent(this.actorPanelTab.onChangeFragEvent, Game.player.sceneObject, Game.player.sceneObject);
        }
        this.refreshDescribe();
    };
    GUI_Party.prototype.refreshFocusBarVisible = function () {
        this.actorSkillList.selectedImage.visible = UIList.focus == this.actorSkillList;
        this.actorEquipList.selectedImage.visible = UIList.focus == this.actorEquipList || UIList.focus == this.equipPackageList;
        this.equipPackageList.selectedImage.visible = UIList.focus == this.equipPackageList;
    };
    Object.defineProperty(GUI_Party.prototype, "selectedActorDS", {
        get: function () {
            var d = this.actorList.selectedItem;
            if (!d)
                return;
            var actorDS = d.data;
            if (!actorDS)
                return;
            return actorDS;
        },
        enumerable: false,
        configurable: true
    });
    GUI_Party.prototype.onDisplay = function () {
        this.refreshActorList();
        UIList.focus = this.actorList;
        this.refreshDescribe();
        this.attributeChangeBox.visible = false;
        this.refreshFocusBarVisible();
    };
    GUI_Party.prototype.onCreateActorItem = function (ui, data, index) {
        var actorDS = data.data;
        if (actorDS) {
            var battler = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
            ui.deadSign.visible = battler.isDead ? true : false;
        }
    };
    GUI_Party.prototype.refreshActorList = function () {
        var arr = [];
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var actorDS = Game.player.data.party[i];
            var actor = actorDS.actor;
            var d = new ListItem_1004;
            d.avatar = actor.avatar;
            d.data = actorDS;
            arr.push(d);
        }
        this.actorList.items = arr;
    };
    GUI_Party.prototype.refreshActorPanels = function (needRefreshPlayerPackage) {
        var d = this.actorList.selectedItem;
        if (!d)
            return;
        var actorDS = d.data;
        if (!actorDS)
            return;
        var battler = ProjectPlayer.getPlayerPartyBattler(this.actorList.selectedIndex);
        Game.refreshActorAttribute(actorDS.actor, actorDS.lv, battler);
        this.refreshActorDataPanel();
        this.refreshActorSkillPanel();
        this.refreshActorEquips();
        this.refreshActorSetting();
        if (needRefreshPlayerPackage) {
            this.refreshEquipPackageList();
        }
    };
    GUI_Party.prototype.refreshActorDataPanel = function () {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS)
            return;
        var selectedActor = selectedActorDS.actor;
        this.actorFace.image = selectedActor.face;
        this.actorName.text = selectedActor.name;
        this.smallAvatar.avatarID = selectedActor.avatar;
        var classData = GameData.getModuleData(2, selectedActor.class);
        this.actorClass.text = classData.name;
        if (selectedActor.growUpEnabled) {
            this.actorLv.text = "Lv." + selectedActorDS.lv;
            var nextExp = Game.getLevelUpNeedExp(selectedActor, selectedActorDS.lv);
            this.actorExpInfo.text = selectedActor.currentEXP + "/" + nextExp;
            this.actorExpSlider.value = selectedActor.currentEXP * 100 / nextExp;
        }
        else {
            this.actorLv.text = "-----";
            this.actorExpInfo.text = "-----";
            this.actorExpSlider.value = 100;
        }
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
    };
    GUI_Party.prototype.refreshActorDataPanelEnergyValue = function () {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS)
            return;
        var selectedActor = selectedActorDS.actor;
        this.maxHP.text = selectedActor.hp + "/" + selectedActor.MaxHP.toString();
        this.maxSP.text = selectedActor.sp + "/" + selectedActor.MaxSP.toString();
    };
    GUI_Party.prototype.refreshActorSkillPanel = function () {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS)
            return;
        var arr = [];
        for (var i = 0; i < selectedActorDS.actor.skills.length; i++) {
            var d = new ListItem_1006;
            var skill = selectedActorDS.actor.skills[i];
            d.data = skill;
            d.icon = skill.icon;
            arr.push(d);
        }
        if (selectedActorDS.actor.skills.length == 0) {
            var emptyItem = new ListItem_1006;
            emptyItem.icon = "";
            arr.push(emptyItem);
        }
        this.actorSkillList.items = arr;
    };
    GUI_Party.prototype.onActorSkillChange = function () {
        this.refreshDescribe();
    };
    GUI_Party.prototype.onCreateEquipPackageItem = function (ui, data, index) {
        var equipDS = data.data;
        if (equipDS) {
            ui.unequipBtn.visible = false;
            ui.equipBox.visible = true;
        }
        else {
            ui.unequipBtn.visible = true;
            ui.equipBox.visible = false;
        }
    };
    GUI_Party.prototype.refreshActorEquips = function () {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS)
            return;
        var arr = [];
        var lastSelectedIndex = this.actorEquipList.selectedIndex;
        if (lastSelectedIndex == -1)
            lastSelectedIndex = 0;
        for (var i = 0; i < 5; i++) {
            var equip = Game.getActorEquipByPartID(selectedActorDS.actor, i);
            var d = new ListItem_1005;
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
    };
    GUI_Party.prototype.refreshEquipPackageList = function () {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS)
            return;
        var equipSelectIndex = this.actorEquipList.selectedIndex;
        if (equipSelectIndex < 0)
            return;
        var partID = equipSelectIndex;
        var allEquips = ArrayUtils.matchAttributes(Game.player.data.package, { isEquip: true }, false);
        var partEquips = ArrayUtils.matchAttributesD2(allEquips, "equip", { partID: partID }, false);
        var classID = selectedActorDS.actor.class;
        var classData = GameData.getModuleData(2, classID);
        if (!classData)
            return;
        for (var i = 0; i < partEquips.length; i++) {
            if (classData.canWearEquips.indexOf(partEquips[i].equip.id) == -1) {
                partEquips.splice(i, 1);
                i--;
            }
        }
        var items = [new ListItem_1007];
        for (var i = 0; i < partEquips.length; i++) {
            var d = new ListItem_1007;
            var packageEquip = partEquips[i];
            d.data = packageEquip;
            d.itemName = packageEquip.equip.name;
            d.icon = packageEquip.equip.icon;
            d.itemNum = "x" + packageEquip.number;
            items.push(d);
        }
        this.equipPackageList.items = items;
    };
    GUI_Party.prototype.onActorEquipChange = function () {
        this.refreshEquipPackageList();
        this.refreshDescribe();
    };
    GUI_Party.prototype.onActorEquipItemClick = function () {
        UIList.focus = this.equipPackageList;
        this.refreshDescribe();
        this.refreshPreEquipChangeInfo();
    };
    GUI_Party.prototype.onEquipPackageChage = function () {
        this.refreshDescribe();
        this.refreshPreEquipChangeInfo();
    };
    GUI_Party.prototype.onEquipPackageItemClick = function () {
        var selectedActorDS = this.selectedActorDS;
        var actor = selectedActorDS.actor;
        var index = this.equipPackageList.selectedIndex;
        var actorInPartyIndex = this.actorList.selectedIndex;
        var equipPartID = this.actorEquipList.selectedIndex;
        if (index == 0) {
            var takeOffEuqip = ProjectPlayer.takeOffPlayerActorEquipByPartID(actorInPartyIndex, equipPartID);
            if (takeOffEuqip)
                GameAudio.playSE(ClientWorld.data.unequipSE);
            else
                GameAudio.playSE(ClientWorld.data.disalbeSE);
        }
        else {
            var itemData = this.equipPackageList.selectedItem;
            var equipDS = itemData.data;
            if (equipDS && equipDS.equip) {
                var equip = equipDS.equip;
                var res = ProjectPlayer.wearPlayerActorEquip(actorInPartyIndex, equip);
            }
            if (res.success)
                GameAudio.playSE(ClientWorld.data.equipSE);
            else
                GameAudio.playSE(ClientWorld.data.disalbeSE);
        }
        var battler = ProjectPlayer.getPlayerPartyBattler(this.actorList.selectedIndex);
        Game.refreshActorAttribute(actor, selectedActorDS.lv, battler);
        this.refreshActorDataPanel();
        this.refreshActorEquips();
        this.refreshEquipPackageList();
        UIList.focus = this.actorEquipList;
        this.refreshPreEquipChangeInfo();
        this.refreshDescribe();
    };
    GUI_Party.prototype.refreshPreEquipChangeInfo = function () {
        if (UIList.focus == this.equipPackageList) {
            var actor = this.selectedActorDS.actor;
            this.attributeChangeBox.visible = true;
            var previewChangeEquipDS = this.equipPackageList.selectedItem.data;
            var previewChangeEquip = previewChangeEquipDS ? previewChangeEquipDS.equip : null;
            var previewChangeEquipIndex = this.actorEquipList.selectedIndex;
            var attributeRes = Game.clacActorAttribute(actor, this.selectedActorDS.lv, true, previewChangeEquipIndex, previewChangeEquip);
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
    };
    GUI_Party.prototype.setEquipChangePreviewAttributeLabel = function (label, changeValue) {
        label.visible = changeValue != 0;
        if (changeValue > 0) {
            label.color = "#6576d6";
            label.text = "+" + changeValue.toString();
        }
        else if (changeValue < 0) {
            label.color = "#b7462c";
            label.text = changeValue.toString();
        }
    };
    GUI_Party.prototype.refreshActorSetting = function () {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS)
            return;
        this.dissolutionBtn.visible = selectedActorDS.dissolutionEnabled;
    };
    GUI_Party.prototype.onChangeActorAI = function () {
        var selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS)
            return;
        var actorItemUI = this.actorList.getItemUI(this.actorList.selectedIndex);
        this.onCreateActorItem(actorItemUI, this.actorList.selectedItem, this.actorList.selectedIndex);
    };
    GUI_Party.prototype.refreshDescribe = function () {
        var name = "";
        var desc = "";
        if (UIList.focus == this.actorSkillList) {
            var itemData = this.actorSkillList.selectedItem;
            var skill = itemData.data;
            if (skill) {
                name = skill.name;
                desc = GUI_Manager.skillDesc(skill, this.selectedActorDS.actor);
            }
        }
        else if (UIList.focus == this.actorEquipList) {
            var equip = this.actorEquipList.selectedItem.data;
            if (equip) {
                name = equip.name;
                desc = GUI_Manager.equipDesc(equip);
            }
        }
        else if (UIList.focus == this.equipPackageList) {
            var itemData = this.equipPackageList.selectedItem;
            var equipDS = itemData.data;
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
    };
    return GUI_Party;
}(GUI_11));
//# sourceMappingURL=GUI_Party.js.map