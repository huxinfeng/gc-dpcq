














var GUI_Main = (function (_super) {
    __extends(GUI_Main, _super);
    function GUI_Main() {
        var _this_1 = _super.call(this) || this;
        _this_1.partyMemberIDs = [];
        _this_1.HPSlider.value = 0;
        _this_1.SPSlider.value = 0;
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_ADD_PLAYER_ACTOR, Callback.New(_this_1.refreshParty, _this_1));
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_REMOVE_PLAYER_ACTOR, Callback.New(_this_1.refreshParty, _this_1));
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_CTRL_ACTOR, Callback.New(_this_1.refreshAll, _this_1));
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_LEARN_PLAYER_ACTOR_SKILL, Callback.New(_this_1.onSkillChange, _this_1));
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_FORGET_PLAYER_ACTOR_SKILL, Callback.New(_this_1.onSkillChange, _this_1));
        EventUtils.addEventListenerFunction(GameBattlerHandler, GameBattlerHandler.EVENT_STATUS_CHANGE, _this_1.onStatusChange, _this_1);
        _this_1.skillList.on(UIList.ITEM_CREATE, _this_1, _this_1.onCreateSkillItem);
        _this_1.skillList.mouseEnabled = true;
        _this_1.stateList.on(UIList.ITEM_CREATE, _this_1, _this_1.onCreateMainActorStatusItem);
        _this_1.stateList.mouseEnabled = true;
        _this_1.refreshAll();
        _this_1.tipsUI.visible = false;
        return _this_1;
    }
    GUI_Main.prototype.refreshActorHP = function (inPartyIndex) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorHP();
        }
        else {
            this.refreshPartyMemberHP(inPartyIndex);
        }
    };
    GUI_Main.prototype.refreshActorSP = function (inPartyIndex) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorSP();
        }
        else {
            this.refreshPartyMemberSP(inPartyIndex);
        }
    };
    GUI_Main.prototype.refreshActorLv = function (inPartyIndex) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorLevel();
        }
        else {
            this.refreshPartyMemberLevel(inPartyIndex);
        }
    };
    GUI_Main.prototype.refreshActorExp = function (inPartyIndex) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorExp();
        }
    };
    GUI_Main.prototype.refreshActorStatus = function (inPartyIndex) {
        if (inPartyIndex == ProjectPlayer.ctrlActorSceneObject.inPartyIndex) {
            this.refreshMainActorStatus();
        }
        else {
            this.refreshPartyMemberStatus(inPartyIndex);
        }
    };
    GUI_Main.prototype.refreshAll = function () {
        if (!ProjectPlayer.ctrlActorSceneObject || ProjectPlayer.ctrlActorSceneObject.inPartyIndex < 0)
            return;
        this.refreshMainActor();
        this.refreshParty();
    };
    GUI_Main.prototype.refreshMainActor = function () {
        this.refreshMainActorFace();
        this.refreshMainActorHP();
        this.refreshMainActorSP();
        this.refreshMainActorStatus();
        this.refreshMainActorSkillBar();
        this.refreshMainActorLevel();
        this.refreshMainActorExp();
    };
    GUI_Main.prototype.refreshMainActorFace = function () {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actor = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex).actor;
        this.mainFace.image = actor.face;
    };
    GUI_Main.prototype.refreshMainActorLevel = function () {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        this.mainLevel.text = "Lv." + actorDS.lv.toString();
    };
    GUI_Main.prototype.refreshMainActorExp = function () {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        if (actorDS.lv >= actorDS.actor.MaxLv) {
            this.EXPSlider.value = 1;
        }
        else {
            this.EXPSlider.value = actorDS.actor.currentEXP / Game.getLevelUpNeedExp(actorDS.actor, actorDS.lv);
        }
    };
    GUI_Main.prototype.refreshMainActorHP = function () {
        var so = ProjectPlayer.ctrlActorSceneObject;
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(so.inPartyIndex);
        var actor = actorDS.actor;
        var toSliderValue = actor.hp / actor.MaxHP;
        var toValue = actor.hp;
        var nowValue = MathUtils.int(this.HPText.text);
        var _this = this;
        var tobj = {
            get value() { return nowValue; },
            set value(v) {
                nowValue = v;
                _this.HPText.text = MathUtils.int(v).toString();
            }
        };
        Tween.clearAll(this.HPSlider);
        Tween.clearAll(this.HPText);
        Tween.to(this.HPSlider, { value: toSliderValue }, 300, Ease.strongOut);
        Tween.to(tobj, { value: toValue }, 300, Ease.strongOut);
    };
    GUI_Main.prototype.refreshMainActorSP = function () {
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
    };
    GUI_Main.prototype.refreshMainActorStatus = function () {
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
    };
    GUI_Main.prototype.refreshMainActorSkillBar = function () {
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
            var ui = this.skillList.getItemUI(i);
            ui.setData(skills[i]);
        }
        if (this.tipsPostionIndex == 1) {
            this.tipsUI.visible = false;
            this.tipsPostionIndex = null;
        }
    };
    GUI_Main.prototype.refreshParty = function () {
        var items = [];
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var d = new ListItem_1024;
            var partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index)
                continue;
            d.HPSlider = 0;
            d.SPSlider = 0;
            items.push(d);
        }
        this.partyList.items = items;
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index)
                continue;
            this.refreshPartyMember(i);
        }
    };
    GUI_Main.prototype.refreshPartyMember = function (inPartyIndex) {
        this.refreshPartyMemberName(inPartyIndex);
        this.refreshPartyMemberHP(inPartyIndex);
        this.refreshPartyMemberSP(inPartyIndex);
        this.refreshPartyMemberStatus(inPartyIndex);
        this.refreshPartyMemberLevel(inPartyIndex);
    };
    GUI_Main.prototype.refreshPartyMemberName = function (inPartyIndex) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        var ui = this.getPartyItemUI(inPartyIndex);
        var actor = partyMember.actor;
        ui.actorName.text = actor.name;
    };
    GUI_Main.prototype.refreshPartyMemberLevel = function (inPartyIndex) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        var ui = this.getPartyItemUI(inPartyIndex);
        var actor = partyMember.actor;
        ui.levelLabel.text = "Lv." + partyMember.lv.toString();
    };
    GUI_Main.prototype.refreshPartyMemberHP = function (inPartyIndex) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember)
            return;
        var ui = this.getPartyItemUI(inPartyIndex);
        if (!ui)
            return;
        var actor = partyMember.actor;
        ui.HPSlider.value = partyMember.actor.hp / partyMember.actor.MaxHP;
    };
    GUI_Main.prototype.refreshPartyMemberSP = function (inPartyIndex) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember)
            return;
        var ui = this.getPartyItemUI(inPartyIndex);
        if (!ui)
            return;
        var actor = partyMember.actor;
        if (partyMember.actor.MaxSP == 0) {
            ui.SPSlider.value = 0;
        }
        else {
            ui.SPSlider.value = partyMember.actor.sp / partyMember.actor.MaxSP;
        }
    };
    GUI_Main.prototype.refreshPartyMemberStatus = function (inPartyIndex) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember)
            return;
        var ui = this.getPartyItemUI(inPartyIndex);
        if (!ui)
            return;
        var actor = partyMember.actor;
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
    };
    GUI_Main.prototype.getPartyItemUI = function (inPartyIndex) {
        var partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        for (var i = 0, s = 0; i < Game.player.data.party.length; i++) {
            var partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index)
                continue;
            if (i == inPartyIndex)
                return this.partyList.getItemUI(s);
            s++;
        }
        return null;
    };
    GUI_Main.showGetItem = function (item, num) {
        var _this_1 = this;
        var ui = new GUI_1053;
        ui.itemIcon.image = item.icon;
        ui.itemTxt.text = "获得「" + item.name + "」" + (num > 1 ? "x" + num.toString() : "");
        new SyncTask(GUI_Main.syncGetItemTipsTask, function (ui) {
            GameAudio.playSE(ClientWorld.data.getItemSE);
            Game.layer.uiLayer.addChild(ui);
            var ani = new GCAnimation();
            ani.id = 1017;
            ani.addToGameSprite(ui, ui, ui);
            ui.addChild(ani);
            ani.play();
            ani.once(GCAnimation.PLAY_COMPLETED, _this_1, function (ani, ui) {
                ani.dispose();
                ui.dispose();
            }, [ani, ui]);
            ani.once(GCAnimation.SIGNAL, _this_1, function (signID) {
                if (signID == 2) {
                    SyncTask.taskOver(GUI_Main.syncGetItemTipsTask);
                }
            });
        }, [ui]);
    };
    GUI_Main.prototype.onSkillChange = function (inPartyIndex, actorDS, skill) {
        if (ProjectPlayer.ctrlActorSceneObject.inPartyIndex == inPartyIndex)
            this.refreshMainActorSkillBar();
    };
    GUI_Main.prototype.onStatusChange = function (battler) {
        if (battler.inPartyIndex >= 0)
            this.refreshActorStatus(battler.inPartyIndex);
    };
    GUI_Main.prototype.onCreateSkillItem = function (ui, data, index) {
        ui.iconBg.on(EventObject.MOUSE_OVER, this, this.onSkillItemMouseOver, [ui]);
        ui.iconBg.on(EventObject.MOUSE_OUT, this, this.onSkillItemMouseOut, [ui]);
        ui.iconBg.on(EventObject.CLICK, this, this.onSkillClick, [ui]);
    };
    GUI_Main.prototype.onSkillItemMouseOver = function (ui) {
        var skill = ui.skill;
        if (skill) {
            this.tipsUI.descName.text = skill.name;
            this.tipsUI.descText.text = GUI_Manager.skillDesc(skill, ProjectPlayer.ctrlActorSceneObject.actor);
            this.tipsUI.visible = true;
            this.tipsUI.x = 642;
            this.tipsUI.y = 455;
            this.tipsPostionIndex = 1;
        }
    };
    GUI_Main.prototype.onSkillItemMouseOut = function () {
        this.tipsUI.visible = false;
        this.tipsPostionIndex = null;
    };
    GUI_Main.prototype.onSkillClick = function (ui) {
        GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, ui.skill);
    };
    GUI_Main.prototype.onCreateMainActorStatusItem = function (ui, data, index) {
        ui.icon.on(EventObject.MOUSE_OVER, this, this.onMainActorStatusItemMouseOver, [data.data]);
        ui.icon.on(EventObject.MOUSE_OUT, this, this.onMainActorStatusItemMouseOut);
    };
    GUI_Main.prototype.onMainActorStatusItemMouseOver = function (status) {
        this.tipsUI.descName.text = status.name;
        this.tipsUI.descText.text = GUI_Manager.statusDesc(status);
        this.tipsUI.visible = true;
        this.tipsUI.x = 561;
        this.tipsUI.y = 53;
        this.tipsPostionIndex = 2;
    };
    GUI_Main.prototype.onMainActorStatusItemMouseOut = function () {
        this.tipsUI.visible = false;
        this.tipsPostionIndex = null;
    };
    GUI_Main.syncGetItemTipsTask = "syncGetItemTipsTask";
    return GUI_Main;
}(GUI_13));
//# sourceMappingURL=GUI_Main.js.map