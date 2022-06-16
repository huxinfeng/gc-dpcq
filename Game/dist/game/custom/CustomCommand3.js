(function (CommandExecute) {
    function customCommand_5003(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var bool = cp.value == 0 ? true : false;
        switch (cp.paramType) {
            case 0:
                WorldData.deadPlayerActorLeaveParty = bool;
                return;
            case 1:
                Game.player.data.aiMode = bool ? 1 : 0;
                return;
            case 2:
                WorldData.displayBattlerPointBar = bool;
                EventUtils.happen(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE);
                return;
            case 3:
                WorldData.whenDeadContinue = bool;
                return;
            case 4:
                WorldData.showVigilanceRange = bool;
                EventUtils.happen(Game, Game.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE);
                return;
        }
    }
    CommandExecute.customCommand_5003 = customCommand_5003;
    function customCommand_5004(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || soc.isDead)
            return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.actor;
        actor.hp += cp.symbol == 0 ? value : -value;
        actor.hp = Math.max(Math.min(actor.hp, actor.MaxHP), 0);
        soc.refreshPointBar();
        if (actor.hp == 0) {
            GameBattlerHandler.dead(soc, soc);
        }
    }
    CommandExecute.customCommand_5004 = customCommand_5004;
    function customCommand_5005(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || soc.isDead)
            return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.actor;
        actor.sp += cp.symbol == 0 ? value : -value;
        actor.sp = Math.max(Math.min(actor.sp, actor.MaxSP), 0);
        soc.refreshPointBar();
    }
    CommandExecute.customCommand_5005 = customCommand_5005;
    function customCommand_5006(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || soc.isDead)
            return;
        var statusID = MathUtils.int(cp.statusUseVar ? Game.player.variable.getVariable(cp.statusIDVarID) : cp.statusID);
        var actor = soc.actor;
        if (cp.symbol == 0) {
            GameBattlerHandler.addStatus(soc, statusID, soc, cp.force);
        }
        else if (cp.symbol == 1) {
            GameBattlerHandler.removeStatus(soc, statusID);
        }
        else if (cp.symbol == 2) {
            GameBattlerHandler.removeAllStatus(soc);
        }
        var level = GameBattleHelper.getLevelByActor(actor);
        Game.refreshActorAttribute(actor, level, soc);
    }
    CommandExecute.customCommand_5006 = customCommand_5006;
    function customCommand_5007(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc)
            return;
        var actor = soc.actor;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        if (cp.type <= 2)
            value = -value;
        GameBattleAction.showDamage(soc, cp.type, value, cp.isCrit);
    }
    CommandExecute.customCommand_5007 = customCommand_5007;
    function customCommand_6001(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var equipID = p.useVar1 ? Game.player.variable.getVariable(p.equipIDVarID) : p.equipID;
        var num = p.useVar2 ? Game.player.variable.getVariable(p.numVarID) : p.num;
        if (!GameData.getModuleData(4, equipID))
            return;
        if (p.attributeRand && p.equipRandSetting.length > 0 && p.symbol == 0) {
            var equipAttributeNames = ["maxHP", "maxSP", "atk", "def", "mag", "magDef", "agi", "moveGrid", "hit", "crit", "magCrit"];
            var probabilityCount = 0;
            for (var i = 0; i < p.equipRandSetting.length; i++) {
                probabilityCount += p.equipRandSetting[i].probability;
            }
            if (probabilityCount < 100)
                probabilityCount = 100;
            for (var n = 0; n < num; n++) {
                var newEquip = GameData.newModuleData(4, equipID, true);
                for (var i = 0; i < p.equipRandSetting.length; i++) {
                    var thisSetting = p.equipRandSetting[i];
                    var thisPer = thisSetting.probability / probabilityCount;
                    if (Math.random() < thisPer) {
                        for (var s = 0; s < equipAttributeNames.length; s++) {
                            var per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                            var newValue = newEquip[equipAttributeNames[s]] * per;
                            newEquip[equipAttributeNames[s]] = Math.ceil(newValue);
                        }
                        break;
                    }
                }
                ProjectPlayer.addEquipByInstance(newEquip);
            }
        }
        else {
            ProjectPlayer.changeItemNumber(equipID, p.symbol == 0 ? num : -num, true);
        }
    }
    CommandExecute.customCommand_6001 = customCommand_6001;
    function customCommand_6002(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actorID = MathUtils.int(cp.useVar ? Game.player.variable.getVariable(cp.actorIDVarID) : cp.actorID);
        if (!GameData.getModuleData(1, actorID))
            return;
        if (cp.type == 0) {
            var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
            ProjectPlayer.addPlayerActorByActorID(actorID, lv);
        }
        else if (cp.type == 1) {
            ProjectPlayer.removePlayerActorByActorID(actorID);
        }
        else {
            var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
            var newActor = GameData.newModuleData(1, actorID, true);
            var newActorDS = new DataStructure_inPartyActor();
            newActorDS.actor = newActor;
            newActorDS.lv = Math.min(lv, newActor.MaxLv);
            Game.player.data.party.splice(Game.player.sceneObject.inPartyIndex, 1, newActorDS);
            Game.player.sceneObject.actor = newActorDS.actor;
            newActorDS.sceneObjectIndex = Game.player.sceneObject.index;
            Game.refreshActorAttribute(Game.player.sceneObject.actor, newActorDS.lv, Game.player.sceneObject);
            Game.player.sceneObject.setPointFullState();
            Game.player.sceneObject.refreshPointBar();
            GameData.changeModuleDataToCopyMode(newActorDS.actor, 1);
            ProjectPlayer.initPlayerActor(Game.player.sceneObject.inPartyIndex);
            Game.player.sceneObject.avatarID = newActor.avatar;
            Game.player.sceneObject.avatarFrame = 1;
            var guiMain = GameUI.get(13);
            if (guiMain)
                guiMain.refreshAll();
        }
    }
    CommandExecute.customCommand_6002 = customCommand_6002;
    function customCommand_6003(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS)
                return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor)
            return;
        var battler = GameBattleHelper.getBattlerByActor(actor);
        if (!battler)
            return;
        var skillID = MathUtils.int(cp.skillUseVar ? Game.player.variable.getVariable(cp.skillIDVarID) : cp.skillID);
        if (cp.symbol == 0) {
            if (battler.inPartyIndex >= 0) {
                ProjectPlayer.learnSkillBySkillID(battler.inPartyIndex, skillID);
            }
            else {
                Game.actorLearnSkill(actor, skillID);
            }
        }
        else if (cp.symbol == 1) {
            Game.actorForgetSkill(actor, skillID);
        }
        else if (cp.symbol == 2) {
            Game.actorForgetAllSkills(actor);
        }
    }
    CommandExecute.customCommand_6003 = customCommand_6003;
    function customCommand_6004(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS)
                return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor)
            return;
        var equipID = MathUtils.int(cp.equipUseVar ? Game.player.variable.getVariable(cp.equipIDVarID) : cp.equipID);
        var inPartyActorDS = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        var takeOffEquip;
        if (cp.symbol == 0) {
            if (inPartyActorDS && cp.fromPlayerPackage) {
                var fromPackageEquip = ProjectPlayer.getItemDS(equipID, true);
                if (fromPackageEquip)
                    ProjectPlayer.wearPlayerActorEquip(inPartyActorIndex, fromPackageEquip.equip);
            }
            else {
                if (GameData.getModuleData(4, equipID)) {
                    var newEquip = GameData.newModuleData(4, equipID);
                    Game.wearActorEquip(actorDS.actor, newEquip);
                }
            }
        }
        else if (cp.symbol == 1 || cp.symbol == 3) {
            if (cp.usePartID) {
                if (inPartyActorDS && cp.symbol == 1)
                    takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, cp.partID);
                else
                    takeOffEquip = Game.takeOffActorEquipByPartID(actor, cp.partID);
            }
            else {
                var thisEquip = Game.getActorEquipByEquipID(actor, equipID);
                if (thisEquip) {
                    var thisEquipPartID = thisEquip.partID;
                    if (inPartyActorDS && cp.symbol == 1)
                        takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, thisEquipPartID);
                    else
                        takeOffEquip = Game.takeOffActorEquipByPartID(actor, thisEquipPartID);
                }
            }
        }
        else if (cp.symbol == 2 || cp.symbol == 4) {
            if (inPartyActorDS && cp.symbol == 2)
                ProjectPlayer.takeOffPlayerActorAllEquips(inPartyActorIndex);
            else
                Game.takeOffActorAllEquips(actor);
        }
        var battler = GameBattleHelper.getBattlerByActor(actor);
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor), battler);
        if (cp.isTakeOffEquipSaveToVar) {
            var takeOffEquipID = takeOffEquip ? takeOffEquip.id : -1;
            Game.player.variable.setVariable(cp.takeOffEquipSaveToVar, takeOffEquipID);
        }
    }
    CommandExecute.customCommand_6004 = customCommand_6004;
    function customCommand_6005(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS)
                return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor)
            return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var inPartyActorDS = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        switch (cp.attributeType) {
            case 0:
                actor.increaseMaxHP += value;
                break;
            case 1:
                actor.increaseMaxSP += value;
                break;
            case 2:
                actor.increasePow += value;
                break;
            case 3:
                actor.increaseMag += value;
                break;
            case 4:
                actor.increaseEnd += value;
                break;
            case 5:
                actor.increaseAgi += value;
                break;
            case 6:
                if (inPartyActorIndex != -1) {
                    ProjectPlayer.increaseExpByIndex(inPartyActorIndex, value);
                }
                break;
            case 7:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv += value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
            case 8:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv -= value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
        }
        var battler = GameBattleHelper.getBattlerByActor(actor);
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor), battler);
    }
    CommandExecute.customCommand_6005 = customCommand_6005;
    function customCommand_6006(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        if (cp.actorCheckType < 3) {
            var actor;
            if (cp.actorCheckType <= 1) {
                var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
                if (!actorDS)
                    return;
                actor = actorDS.actor;
            }
            else {
                actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            }
            if (!actor)
                return;
            var battler = GameBattleHelper.getBattlerByActor(actor);
            if (battler && battler.inPartyIndex >= 0) {
                GameBattlerHandler.resuscitate(battler);
            }
        }
        else if (cp.actorCheckType == 3) {
            for (var i = 0; i < Game.player.data.party.length; i++) {
                var actorDS = Game.player.data.party[i];
                if (!actorDS)
                    continue;
                var sceneObjectIndex = actorDS.sceneObjectIndex;
                var battler = Game.currentScene.sceneObjects[sceneObjectIndex];
                if (battler && battler.inPartyIndex >= 0) {
                    GameBattlerHandler.resuscitate(battler);
                }
            }
        }
    }
    CommandExecute.customCommand_6006 = customCommand_6006;
    var changeActorNameInfo = {};
    function customCommand_6007(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, null, null, null, null, trigger);
        if (!actorDS)
            return;
        actor = actorDS.actor;
        if (!actor)
            return;
        var newName = cp.valueUseVar ? Game.player.variable.getString(cp.valueVarID) : cp.value;
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var inPartyActor = Game.player.data.party[i];
            var actorID = inPartyActor.actor.id;
            if (actorID == actor.id) {
                inPartyActor.actor.name = newName;
            }
        }
        changeActorNameInfo[actor.id] = newName;
    }
    CommandExecute.customCommand_6007 = customCommand_6007;
    if (!Config.BEHAVIOR_EDIT_MODE) {
        SinglePlayerGame.regSaveCustomData("___changeActorName", Callback.New(function () {
            return changeActorNameInfo;
        }, null));
        EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(function () {
            EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(function () {
                if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                    var restoryChangeActorNameInfo = SinglePlayerGame.getSaveCustomData("___changeActorName");
                    if (restoryChangeActorNameInfo) {
                        changeActorNameInfo = restoryChangeActorNameInfo;
                        for (var i = 0; i < Game.player.data.party.length; i++) {
                            var actorID = Game.player.data.party[i].actor.id;
                            if (changeActorNameInfo[actorID]) {
                                Game.player.data.party[i].actor.name = changeActorNameInfo[actorID];
                            }
                        }
                    }
                }
            }, null));
        }, null), true);
    }
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=CustomCommand3.js.map