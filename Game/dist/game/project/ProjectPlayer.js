














var ProjectPlayer = (function (_super) {
    __extends(ProjectPlayer, _super);
    function ProjectPlayer() {
        return _super.call(this, true) || this;
    }
    ProjectPlayer.init = function () {
        for (var i = 0; i < Game.player.data.party.length; i++) {
            this.initPlayerActor(i);
        }
    };
    ProjectPlayer.increaseGold = function (v, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var oldGold = Game.player.data.gold;
        Game.player.data.gold = Math.floor(Math.max(Game.player.data.gold + v, 0));
        if (happenEvent)
            EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_GOLD_NUMBER, [oldGold, Game.player.data.gold]);
    };
    ProjectPlayer.getItem = function (itemID) {
        var itemDS = this.getItemDS(itemID, false);
        if (itemDS)
            return itemDS.item;
        return null;
    };
    ProjectPlayer.getItemDS = function (itemID, isEquip) {
        var itemDSs = ArrayUtils.matchAttributes(Game.player.data.package, { isEquip: isEquip }, false);
        if (!isEquip) {
            return ArrayUtils.matchAttributesD2(itemDSs, "item", { id: itemID }, true)[0];
        }
        else {
            var equipDSs = ArrayUtils.matchAttributesD2(itemDSs, "equip", { id: itemID }, false);
            for (var i = 0; i < equipDSs.length; i++) {
                var equipDS = equipDSs[i];
                if (!GameData.isCopyModeData(equipDS.equip))
                    return equipDS;
            }
            return null;
        }
    };
    ProjectPlayer.getItemIndex = function (item) {
        return ArrayUtils.matchAttributes(Game.player.data.package, { item: item }, true, "==", true)[0];
    };
    ProjectPlayer.getEquipIndex = function (equip) {
        return ArrayUtils.matchAttributes(Game.player.data.package, { equip: equip }, true, "==", true)[0];
    };
    ProjectPlayer.changeItemNumber = function (itemID, v, isEquip, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var moduleID = isEquip ? 4 : 5;
        if (!GameData.getModuleData(moduleID, itemID))
            return;
        if (v > 0) {
            var itemDS = this.getItemDS(itemID, isEquip);
            if (!itemDS) {
                itemDS = new DataStructure_packageItem;
                if (isEquip) {
                    itemDS.equip = GameData.newModuleData(moduleID, itemID);
                }
                else {
                    itemDS.item = GameData.newModuleData(moduleID, itemID);
                }
                itemDS.number = v;
                itemDS.isEquip = isEquip;
                Game.player.data.package.push(itemDS);
            }
            else if (itemDS) {
                itemDS.number += v;
            }
        }
        else {
            var itemDS = this.getItemDS(itemID, isEquip);
            if (itemDS) {
                itemDS.number += v;
                if (itemDS.number <= 0)
                    Game.player.data.package.splice(Game.player.data.package.indexOf(itemDS), 1);
            }
        }
        if (happenEvent)
            EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    };
    ProjectPlayer.addEquip = function (equipID, v, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        this.changeItemNumber(equipID, v, true, happenEvent);
    };
    ProjectPlayer.addEquipByInstance = function (equip, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        if (GameData.isCopyModeData(equip)) {
            var equipDS = new DataStructure_packageItem;
            equipDS.equip = equip;
            equipDS.number = 1;
            equipDS.isEquip = true;
            Game.player.data.package.push(equipDS);
            if (happenEvent)
                EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
        }
        else {
            ProjectPlayer.changeItemNumber(equip.id, 1, true, happenEvent);
        }
    };
    ProjectPlayer.addItemByInstance = function (item, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var itemDS = new DataStructure_packageItem;
        itemDS.item = item;
        itemDS.number = 1;
        itemDS.isEquip = false;
        Game.player.data.package.push(itemDS);
        if (happenEvent)
            EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    };
    Object.defineProperty(ProjectPlayer, "ctrlActorSceneObject", {
        get: function () {
            return Game.player.sceneObject;
        },
        enumerable: false,
        configurable: true
    });
    ProjectPlayer.createBattlerByActor = function (inPartyIndex) {
        if (inPartyIndex < 0)
            return null;
        var actorDS = Game.player.data.party[inPartyIndex];
        if (actorDS) {
            var presetSceneObjectData = {
                x: Game.player.sceneObject.x,
                y: Game.player.sceneObject.y,
                avatarID: actorDS.actor.avatar,
                avatarOri: Game.player.sceneObject.avatarOri,
                name: actorDS.actor.name
            };
            var battler = Game.currentScene.addNewSceneObject(1, presetSceneObjectData);
            battler.isBattler = true;
            battler.actor = actorDS.actor;
            battler.isDead = false;
            battler.camp = -1;
            battler.inPartyIndex = inPartyIndex;
            battler.battlerInit(false, false);
            actorDS.sceneObjectIndex = battler.index;
            Game.refreshActorAttribute(actorDS.actor, actorDS.lv, battler);
            battler.setPointFullState();
            battler.refreshPointBar();
            return battler;
        }
    };
    ProjectPlayer.getPlayerPartyBattler = function (inPartyIndex) {
        if (inPartyIndex < 0)
            return null;
        var ds = Game.player.data.party[inPartyIndex];
        return Game.currentScene.sceneObjects[ds.sceneObjectIndex];
    };
    ProjectPlayer.getPlayerActorDSByInPartyIndex = function (inPartyIndex) {
        if (inPartyIndex < 0)
            return null;
        var ds = Game.player.data.party[inPartyIndex];
        return ds;
    };
    ProjectPlayer.getPlayerActorDSByActorID = function (actorID) {
        return ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, true)[0];
    };
    ProjectPlayer.getPlayerActorDSByActor = function (actor) {
        return ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
    };
    ProjectPlayer.getPlayerActorIndexByActor = function (actor) {
        var actorDS = this.getPlayerActorDSByActor(actor);
        if (actorDS)
            return Game.player.data.party.indexOf(actorDS);
        return -1;
    };
    ProjectPlayer.getPlayerActorFirstPositionByActorID = function (actorID) {
        var actorDS = ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, true)[0];
        if (actorDS)
            return Game.player.data.party.indexOf(actorDS);
        return -1;
    };
    ProjectPlayer.initPlayerActor = function (inPartyIndex) {
        var actorDS = Game.player.data.party[inPartyIndex];
        if (actorDS && actorDS.actor.growUpEnabled) {
            actorDS.lv = Math.max(1, Math.min(actorDS.lv, actorDS.actor.MaxLv));
            var classData = GameData.getModuleData(2, actorDS.actor.class);
            for (var i = 0; i < classData.lvUpAutoGetSkills.length; i++) {
                var lvUpAutoGetSkill = classData.lvUpAutoGetSkills[i];
                if (actorDS.lv >= lvUpAutoGetSkill.lv) {
                    this.learnSkillBySkillID(inPartyIndex, lvUpAutoGetSkill.skill);
                }
            }
        }
    };
    ProjectPlayer.addPlayerActorByActorID = function (actorID, lv, happenEvent) {
        if (lv === void 0) { lv = 1; }
        if (happenEvent === void 0) { happenEvent = true; }
        if (lv < 1)
            lv = 1;
        var newActor = GameData.newModuleData(1, actorID, true);
        var ds = new DataStructure_inPartyActor();
        ds.actor = newActor;
        ds.lv = Math.min(lv, newActor.MaxLv);
        Game.player.data.party.push(ds);
        this.initPlayerActor(Game.player.data.party.length - 1);
        ProjectPlayer.createBattlerByActor(Game.player.data.party.length - 1);
        if (happenEvent)
            EventUtils.happen(this, this.EVENT_ADD_PLAYER_ACTOR, [Game.player.data.party.length - 1, ds]);
        return ds;
    };
    ProjectPlayer.removePlayerActorByActorID = function (actorID, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var inPartyIndex = ProjectPlayer.getPlayerActorFirstPositionByActorID(actorID);
        if (inPartyIndex != -1) {
            if (inPartyIndex == Game.player.sceneObject.inPartyIndex)
                return;
            return ProjectPlayer.removePlayerActorByInPartyIndex(inPartyIndex, happenEvent);
        }
    };
    ProjectPlayer.removePlayerActorByInPartyIndex = function (inPartyIndex, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        if (inPartyIndex >= Game.player.data.party.length || inPartyIndex < 0)
            return null;
        var sceneOjbectIndex = Game.player.data.party[inPartyIndex].sceneObjectIndex;
        var partner = Game.currentScene.sceneObjects[sceneOjbectIndex];
        partner.dispose();
        var actorDS = Game.player.data.party.splice(inPartyIndex, 1)[0];
        if (happenEvent)
            EventUtils.happen(this, this.EVENT_REMOVE_PLAYER_ACTOR, [inPartyIndex, actorDS]);
        return actorDS;
    };
    ProjectPlayer.getPlayerActorSkillBySkillID = function (inPartyIndex, skillID) {
        var actorDS = this.getPlayerActorDSByActorID(inPartyIndex);
        if (actorDS)
            return ArrayUtils.matchAttributes(actorDS.actor.skills, { id: skillID }, true)[0];
    };
    ProjectPlayer.learnSkillBySkillID = function (inPartyIndex, skillID, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS)
            return;
        var newSkill = Game.actorLearnSkill(actorDS.actor, skillID);
        if (newSkill && happenEvent)
            EventUtils.happen(this, this.EVENT_LEARN_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, newSkill]);
        return newSkill;
    };
    ProjectPlayer.forgetSkillBySkillID = function (inPartyIndex, skillID, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS)
            return;
        var forgetSkill = Game.actorForgetSkill(actorDS.actor, skillID);
        if (forgetSkill && happenEvent)
            EventUtils.happen(this, this.EVENT_FORGET_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, forgetSkill]);
        return forgetSkill;
    };
    ProjectPlayer.forgetAllSkills = function (inPartyIndex, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS)
            return;
        var forgetSkills = actorDS.actor.skills.concat();
        for (var i = 0; i < forgetSkills.length; i++) {
            if (happenEvent)
                EventUtils.happen(this, this.EVENT_FORGET_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, forgetSkills[i]]);
        }
        Game.actorForgetAllSkills(actorDS.actor, happenEvent);
        return forgetSkills;
    };
    ProjectPlayer.getPlayerActorEquipByPartID = function (inPartyIndex, partID) {
        var actorDS = this.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (actorDS)
            return Game.getActorEquipByPartID(actorDS.actor, partID);
    };
    ProjectPlayer.wearPlayerActorEquip = function (inPartyIndex, newEquip, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        if (newEquip) {
            var newEquipIndex = this.getEquipIndex(newEquip);
            if (newEquipIndex != null) {
                var actorDS = this.getPlayerActorDSByInPartyIndex(inPartyIndex);
                if (actorDS) {
                    var takeOffEquip = this.takeOffPlayerActorEquipByPartID(inPartyIndex, newEquip.partID, happenEvent);
                    Game.wearActorEquip(actorDS.actor, newEquip);
                    this.removePackageItemByItemDS(Game.player.data.package[newEquipIndex], 1, happenEvent);
                    if (happenEvent)
                        EventUtils.happen(Game, this.EVENT_WEAR_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip, newEquip]);
                    return { success: true, takeOffEquip: takeOffEquip };
                }
            }
        }
        return { success: false, takeOffEquip: null };
    };
    ProjectPlayer.takeOffPlayerActorEquipByPartID = function (inPartyIndex, partID, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var actorDS = Game.player.data.party[inPartyIndex];
        if (!actorDS)
            return null;
        var takeOffEquip = Game.takeOffActorEquipByPartID(actorDS.actor, partID);
        if (takeOffEquip) {
            this.addEquipByInstance(takeOffEquip, happenEvent);
            if (happenEvent)
                EventUtils.happen(Game, this.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip]);
        }
        return takeOffEquip;
    };
    ProjectPlayer.takeOffPlayerActorAllEquips = function (inPartyIndex, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var actorDS = Game.player.data.party[inPartyIndex];
        if (!actorDS)
            return null;
        var takeOffEquips = Game.takeOffActorAllEquips(actorDS.actor);
        for (var i = 0; i < takeOffEquips.length; i++) {
            var takeOffEquip = takeOffEquips[i];
            this.addEquipByInstance(takeOffEquip, happenEvent);
            if (happenEvent)
                EventUtils.happen(Game, this.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip]);
        }
        return takeOffEquips;
    };
    ProjectPlayer.increaseExpByIndex = function (inPartyIndex, exp) {
        var actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        var actor = actorDS.actor;
        var classData = GameData.getModuleData(2, actor.class);
        if (!classData)
            return;
        if (actorDS.lv >= actor.MaxLv)
            return;
        if (!actor.growUpEnabled)
            return;
        var fromExp = actor.currentEXP;
        var fromLv = actorDS.lv;
        actor.currentEXP += exp;
        var isLevelUp = false;
        var learnSkills = [];
        while (1) {
            var nextExp = Game.getLevelUpNeedExp(actor, actorDS.lv);
            if (actor.currentEXP >= nextExp) {
                actorDS.lv++;
                isLevelUp = true;
                actor.currentEXP -= nextExp;
                for (var i = 0; i < classData.lvUpAutoGetSkills.length; i++) {
                    var lvUpAutoGetSkill = classData.lvUpAutoGetSkills[i];
                    if (actorDS.lv >= lvUpAutoGetSkill.lv) {
                        var learnSkill = this.learnSkillBySkillID(inPartyIndex, lvUpAutoGetSkill.skill);
                        if (learnSkill)
                            learnSkills.push(learnSkill);
                    }
                }
            }
            else {
                break;
            }
        }
        var toLv = actorDS.lv;
        var toExp = actor.currentEXP;
        return { isLevelUp: isLevelUp, fromLv: fromLv, toLv: toLv, fromExp: fromExp, toExp: toExp, learnSkills: learnSkills };
    };
    ProjectPlayer.removePackageItemByItemDS = function (itemDS, v, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var inPackageIdx = Game.player.data.package.indexOf(itemDS);
        if (inPackageIdx == -1)
            return;
        itemDS.number -= v;
        if (itemDS.number <= 0)
            Game.player.data.package.splice(inPackageIdx, 1);
        if (happenEvent)
            EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    };
    ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER = "ProjectPlayerCHANGE_ITEM_NUMBER";
    ProjectPlayer.EVENT_CHANGE_GOLD_NUMBER = "ProjectPlayerCHANGE_GOLD_NUMBER";
    ProjectPlayer.EVENT_ADD_PLAYER_ACTOR = "ProjectPlayerEVENT_ADD_PLAYER_ACTOR";
    ProjectPlayer.EVENT_REMOVE_PLAYER_ACTOR = "ProjectPlayerEVENT_REMOVE_PLAYER_ACTOR";
    ProjectPlayer.EVENT_CHANGE_CTRL_ACTOR = "ProjectPlayerEVENT_CHANGE_CTRL_ACTOR";
    ProjectPlayer.EVENT_REMOVE_PLAYER_ACTOR_ITEM = "ProjectPlayerEVENT_REMOVE_PLAYER_ACTOR_ITEM";
    ProjectPlayer.EVENT_CARRY_PLAYER_ACTOR_ITEM = "ProjectPlayerEVENT_CARRY_PLAYER_ACTOR_ITEM";
    ProjectPlayer.EVENT_LEARN_PLAYER_ACTOR_SKILL = "ProjectPlayerEVENT_LEARN_PLAYER_ACTOR_SKILL";
    ProjectPlayer.EVENT_FORGET_PLAYER_ACTOR_SKILL = "ProjectPlayerEVENT_FORGET_PLAYER_ACTOR_SKILL";
    ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP = "ProjectPlayerEVENT_WEAR_PLAYER_ACTOR_EQUIP";
    ProjectPlayer.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP = "ProjectPlayerEVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP";
    return ProjectPlayer;
}(ClientPlayer));
//# sourceMappingURL=ProjectPlayer.js.map