














var ProjectGame = (function (_super) {
    __extends(ProjectGame, _super);
    function ProjectGame() {
        var _this_1 = _super.call(this) || this;
        _this_1.EVENT_REMOVE_ACTOR_ITEM = "GameEVENT_REMOVE_ACTOR_ITEM";
        _this_1.EVENT_CARRY_ACTOR_ITEM = "GameEVENT_CARRY_ACTOR_ITEM";
        _this_1.EVENT_LEARN_SKILL = "GameEVENT_LEARN_SKILL";
        _this_1.EVENT_FORGET_SKILL = "GameEVENT_FORGET_SKILL";
        _this_1.EVENT_WEAR_ACTOR_EQUIP = "GameEVENT_WEAR_ACTOR_EQUIP";
        _this_1.EVENT_TAKE_OFF_ACTOR_EQUIP = "GameEVENT_TAKE_OFF_ACTOR_EQUIP";
        _this_1.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE = "EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE";
        _this_1.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE = "EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE";
        EventUtils.addEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, _this_1.onInSceneStateChange, _this_1);
        return _this_1;
    }
    ProjectGame.prototype.init = function () {
        this.player = new ProjectPlayer();
    };
    ProjectGame.prototype.getActorBySceneObjectIndex = function (soIndex) {
        var soc = Game.currentScene.sceneObjects[soIndex];
        if (GameBattleHelper.isBattler(soc)) {
            return soc.actor;
        }
    };
    ProjectGame.prototype.getActorSkillBySkillID = function (actor, skillID) {
        return ArrayUtils.matchAttributes(actor.skills, { id: skillID }, true)[0];
    };
    ProjectGame.prototype.actorLearnSkill = function (actor, skillID, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var skill = this.getActorSkillBySkillID(actor, skillID);
        if (skill || !GameData.getModuleData(3, skillID))
            return;
        var newSkill = GameData.newModuleData(3, skillID);
        actor.skills.push(newSkill);
        if (happenEvent)
            EventUtils.happen(Game, Game.EVENT_LEARN_SKILL, [actor, newSkill]);
        return newSkill;
    };
    ProjectGame.prototype.actorForgetSkill = function (actor, skillID, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var skill = this.getActorSkillBySkillID(actor, skillID);
        if (!skill || !GameData.getModuleData(3, skillID))
            return;
        actor.skills.splice(actor.skills.indexOf(skill), 1);
        if (happenEvent)
            EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, skill]);
        return skill;
    };
    ProjectGame.prototype.actorForgetAllSkills = function (actor, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var forgetSkills = actor.skills.concat();
        actor.skills.length = 0;
        for (var i = 0; i < forgetSkills.length; i++) {
            if (happenEvent)
                EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, forgetSkills[i]]);
        }
        return forgetSkills;
    };
    ProjectGame.prototype.getActorEquipByPartID = function (actor, partID) {
        return ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true)[0];
    };
    ProjectGame.prototype.getActorEquipByEquipID = function (actor, equipID) {
        return ArrayUtils.matchAttributes(actor.equips, { id: equipID }, true)[0];
    };
    ProjectGame.prototype.wearActorEquip = function (actor, newEquip, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        if (newEquip) {
            var takeOffEquip = this.takeOffActorEquipByPartID(actor, newEquip.partID);
            actor.equips.push(newEquip);
            if (happenEvent)
                EventUtils.happen(Game, Game.EVENT_WEAR_ACTOR_EQUIP, [actor, newEquip.partID, takeOffEquip, newEquip]);
            return { success: true, takeOffEquip: takeOffEquip };
        }
    };
    ProjectGame.prototype.takeOffActorEquipByPartID = function (actor, partID, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var idx = ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true, "==", true)[0];
        if (idx == null)
            return null;
        var takeOffEquip = actor.equips.splice(idx, 1)[0];
        if (takeOffEquip && happenEvent)
            EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, partID, takeOffEquip]);
        return takeOffEquip;
    };
    ProjectGame.prototype.takeOffActorAllEquips = function (actor, happenEvent) {
        if (happenEvent === void 0) { happenEvent = true; }
        var takeOffEquipArr = actor.equips.concat();
        actor.equips.length = 0;
        for (var i = 0; i < takeOffEquipArr.length; i++) {
            var takeOffEquip = takeOffEquipArr[i];
            if (happenEvent)
                EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, takeOffEquip.partID, takeOffEquip]);
        }
        return takeOffEquipArr;
    };
    ProjectGame.prototype.getLevelUpNeedExp = function (actor, lv) {
        return Math.floor(this.getGrowValueByLv(actor, "needEXPGrow", lv));
    };
    ProjectGame.prototype.refreshActorAttribute = function (actor, lv, battler) {
        var res = this.clacActorAttribute(actor, lv);
        if (res) {
            actor.ATK = Math.floor(res.ATK);
            actor.DEF = Math.floor(res.DEF);
            actor.AGI = Math.floor(res.AGI);
            actor.DOD = Math.floor(res.DOD);
            actor.MaxHP = Math.floor(res.MaxHP);
            actor.MaxSP = Math.floor(res.MaxSP);
            actor.POW = Math.floor(res.POW);
            actor.END = Math.floor(res.END);
            actor.MAG = Math.floor(res.MAG);
            actor.MagDef = Math.floor(res.MagDef);
            actor.HIT = Math.floor(res.HIT);
            actor.CRIT = Math.floor(res.CRIT);
            actor.MagCrit = Math.floor(res.MagCrit);
            actor.MoveSpeed = Math.floor(res.MoveSpeed);
        }
        if (battler.inBattle || battler.inPartyIndex >= 0 || (battler.battleAI && battler.battleAI.isInBackToInBattlePoint)) {
        }
        else {
            actor.MoveSpeed = 50;
        }
        var lastMoveSpeed = battler.moveSpeed;
        battler.moveSpeed = actor.MoveSpeed;
        if (actor.hp > actor.MaxHP)
            actor.hp = actor.MaxHP;
        if (actor.sp > actor.MaxSP)
            actor.sp = actor.MaxSP;
        battler.refreshPointBar();
        if (!battler.isDead) {
            if (lastMoveSpeed != battler.moveSpeed) {
            }
        }
    };
    ProjectGame.prototype.clacActorAttribute = function (actor, lv, previewChangeEquipMode, previewChangeEquipIndex, previewChangeEquip) {
        if (previewChangeEquipMode === void 0) { previewChangeEquipMode = false; }
        if (previewChangeEquipIndex === void 0) { previewChangeEquipIndex = 0; }
        if (previewChangeEquip === void 0) { previewChangeEquip = null; }
        var systemActor = GameData.getModuleData(1, actor.id);
        if (!systemActor)
            return;
        var maxhp;
        var maxsp;
        var mag;
        var agi;
        var pow;
        var end;
        var magDef;
        var hit;
        var crit;
        var magCrit;
        var moveSpeed;
        if (actor.growUpEnabled) {
            maxhp = this.getGrowValueByLv(actor, "MaxHPGrow", lv) + actor.increaseMaxHP;
            maxsp = this.getGrowValueByLv(actor, "MaxSPGrow", lv) + actor.increaseMaxSP;
            mag = this.getGrowValueByLv(actor, "MAGGrow", lv) + actor.increaseMag;
            agi = this.getGrowValueByLv(actor, "AGIGrow", lv) + actor.increaseAgi;
            pow = this.getGrowValueByLv(actor, "POWGrow", lv) + actor.increasePow;
            end = this.getGrowValueByLv(actor, "ENDGrow", lv) + actor.increaseEnd;
        }
        else {
            maxhp = systemActor.MaxHP + actor.increaseMaxHP;
            maxsp = systemActor.MaxSP + actor.increaseMaxSP;
            mag = systemActor.MAG + actor.increaseMag;
            agi = systemActor.AGI + actor.increaseAgi;
            pow = systemActor.POW + actor.increasePow;
            end = systemActor.END + actor.increaseEnd;
        }
        magDef = systemActor.MagDef;
        hit = systemActor.HIT;
        crit = 0;
        magCrit = 0;
        moveSpeed = systemActor.MoveSpeed;
        ArrayUtils.removeSameObjectD2(actor.equips, "id", false);
        ArrayUtils.removeSameObjectD2(actor.skills, "id", false);
        ArrayUtils.removeSameObjectD2(actor.status, "id", false);
        var atkIncrease = 0;
        var defIncrease = 0;
        actor.selfStatus.length = 0;
        actor.selfImmuneStatus.length = 0;
        actor.hitTargetStatus.length = 0;
        actor.hitTargetSelfAddStatus.length = 0;
        for (var i = 0; i < 5; i++) {
            if (previewChangeEquipMode && previewChangeEquipIndex == i) {
                var equip = previewChangeEquip;
            }
            else {
                var equip = Game.getActorEquipByPartID(actor, i);
            }
            if (equip) {
                maxhp += equip.maxHP;
                maxsp += equip.maxSP;
                atkIncrease += equip.atk;
                defIncrease += equip.def;
                mag += equip.mag;
                magDef += equip.magDef;
                moveSpeed += equip.moveSpeed;
                hit += equip.hit;
                agi += equip.agi;
                crit += equip.crit;
                magCrit += equip.magCrit;
                actor.selfStatus = actor.selfStatus.concat(equip.selfStatus);
                actor.selfImmuneStatus = actor.selfImmuneStatus.concat(equip.selfImmuneStatus);
                actor.hitTargetStatus = actor.hitTargetStatus.concat(equip.hitTargetStatus);
                actor.hitTargetSelfAddStatus = actor.hitTargetSelfAddStatus.concat(equip.hitTargetSelfAddStatus);
            }
        }
        for (var i_1 = 0; i_1 < actor.skills.length; i_1++) {
            var actorSkill = actor.skills[i_1];
            maxhp += actorSkill.maxHP;
            maxsp += actorSkill.maxSP;
            atkIncrease += actorSkill.atk;
            defIncrease += actorSkill.def;
            mag += actorSkill.mag;
            magDef += actorSkill.magDef;
            moveSpeed += actorSkill.moveSpeed;
            hit += actorSkill.hit;
            agi += actorSkill.agi;
            crit += actorSkill.crit;
            magCrit += actorSkill.magCrit;
            actor.selfStatus = actor.selfStatus.concat(actorSkill.selfStatus);
            actor.selfImmuneStatus = actor.selfImmuneStatus.concat(actorSkill.selfImmuneStatus);
            actor.hitTargetStatus = actor.hitTargetStatus.concat(actorSkill.hitTargetStatus);
            actor.hitTargetSelfAddStatus = actor.hitTargetSelfAddStatus.concat(actorSkill.hitTargetSelfAddStatus);
        }
        var atk = pow * 1.5 + atkIncrease;
        var def = end * 2 + defIncrease;
        var dod = agi * 0.1;
        var stHPPer = 100;
        var stSPPer = 100;
        var stATK = 100;
        var stDEF = 100;
        var stMAG = 100;
        var stMagDef = 100;
        var stMoveGrid = 100;
        for (var i = 0; i < actor.status.length; i++) {
            var status = actor.status[i];
            stHPPer *= Math.pow(status.maxHP / 100, status.currentLayer);
            stSPPer *= Math.pow(status.maxSP / 100, status.currentLayer);
            stATK *= Math.pow(status.atk / 100, status.currentLayer);
            stDEF *= Math.pow(status.def / 100, status.currentLayer);
            stMAG *= Math.pow(status.mag / 100, status.currentLayer);
            stMagDef *= Math.pow(status.magDef / 100, status.currentLayer);
            stMoveGrid *= Math.pow(status.moveSpeed / 100, status.currentLayer);
            hit += status.hit * status.currentLayer;
            crit += status.crit * status.currentLayer;
            magCrit += status.magCrit * status.currentLayer;
        }
        maxhp *= stHPPer / 100;
        maxsp *= stSPPer / 100;
        atk *= stATK / 100;
        def *= stDEF / 100;
        mag *= stMAG / 100;
        magDef *= stMagDef / 100;
        moveSpeed *= stMoveGrid / 100;
        atk = Math.max(atk, 0);
        def = Math.max(def, 0);
        agi = Math.max(agi, 0);
        dod = Math.max(dod, 0);
        maxhp = Math.max(maxhp, 0);
        maxsp = Math.max(maxsp, 0);
        pow = Math.max(pow, 0);
        end = Math.max(end, 0);
        mag = Math.max(mag, 0);
        magDef = Math.max(magDef, 0);
        hit = Math.max(hit, 0);
        crit = Math.max(Math.min(crit, 100), 0);
        magCrit = Math.max(Math.min(magCrit, 100), 0);
        moveSpeed = Math.max(moveSpeed, 0);
        return {
            ATK: Math.floor(atk),
            DEF: Math.floor(def),
            AGI: Math.floor(agi),
            DOD: Math.floor(dod),
            MaxHP: Math.floor(maxhp),
            MaxSP: Math.floor(maxsp),
            POW: Math.floor(pow),
            END: Math.floor(end),
            MAG: Math.floor(mag),
            MagDef: Math.floor(magDef),
            HIT: Math.floor(hit),
            CRIT: Math.floor(crit),
            MagCrit: Math.floor(magCrit),
            MoveSpeed: Math.floor(moveSpeed),
        };
    };
    ProjectGame.prototype.onInSceneStateChange = function (inNewSceneState) {
        if (GameGate.gateState == GameGate.STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT) {
            if (inNewSceneState == 1) {
                ProjectGame.gameStartTime = new Date();
                ProjectPlayer.init();
            }
            else if (inNewSceneState == 2) {
                ProjectGame.gameStartTime = new Date((Date.now() - GUI_SaveFileManager.currentSveFileIndexInfo.indexInfo.gameTime));
            }
            else if (inNewSceneState == 0) {
                this.toNewSceneRecordPlayerBattles = [];
                for (var i = 1; i < Game.player.data.party.length; i++) {
                    var battler = ProjectPlayer.getPlayerPartyBattler(i);
                    Game.currentScene.removeSceneObject(battler);
                    this.toNewSceneRecordPlayerBattles[i] = battler;
                }
            }
        }
        else if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
            if (inNewSceneState == 1) {
                if (Game.player.data.party.length == 0) {
                    throw ("找不到玩家队伍");
                }
                var firstActorDS = Game.player.data.party[0];
                firstActorDS.sceneObjectIndex = Game.player.sceneObject.index;
                Game.player.sceneObject.actor = firstActorDS.actor;
                Game.refreshActorAttribute(Game.player.sceneObject.actor, firstActorDS.lv, Game.player.sceneObject);
                Game.player.sceneObject.inPartyIndex = 0;
                Game.player.sceneObject.camp = -1;
                Game.player.sceneObject.setPointFullState();
                Game.player.sceneObject.refreshPointBar();
                GameData.changeModuleDataToCopyMode(firstActorDS.actor, 1);
                for (var i = 1; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    if (actorDS == null)
                        continue;
                    GameData.changeModuleDataToCopyMode(actorDS.actor, 1);
                    ProjectPlayer.createBattlerByActor(i);
                }
                var guiMain = GameUI.get(13);
                if (guiMain)
                    guiMain.refreshAll();
            }
            else if (inNewSceneState == 2) {
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    GameData.changeModuleDataToCopyMode(actorDS.actor, 1);
                    var battler = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
                    if (!battler || battler.inPartyIndex != i) {
                        battler = ArrayUtils.matchAttributes(Game.currentScene.sceneObjects, { inPartyIndex: i }, true)[0];
                        if (!battler) {
                            throw ("无法找到队友的场景对象。");
                        }
                    }
                    actorDS.sceneObjectIndex = battler.index;
                    battler.inPartyIndex = i;
                    battler.actor = actorDS.actor;
                    GameBattlerHandler.refreshBattlerActionByStatus(battler);
                    battler.refreshPointBar();
                }
            }
            else {
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    var battler;
                    if (i == 0) {
                        battler = Game.player.sceneObject;
                        actorDS.sceneObjectIndex = battler.index;
                    }
                    else {
                        battler = this.toNewSceneRecordPlayerBattles[i];
                        battler.x = Game.player.sceneObject.x;
                        battler.y = Game.player.sceneObject.y;
                        Game.currentScene.addSceneObject(battler, true);
                        actorDS.sceneObjectIndex = battler.index;
                    }
                    battler.battlerInit(false, false);
                }
            }
            function bindPlayerBattlersActor() {
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    var battler = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
                    battler.actor = actorDS.actor;
                }
            }
        }
    };
    ProjectGame.prototype.getGrowValueByLv = function (actor, growAttrName, lv) {
        var cacheGrowName = growAttrName + "_cache";
        var growData = actor[cacheGrowName];
        if (!actor[cacheGrowName])
            growData = actor[cacheGrowName] = GameUtils.getCurveData(actor[growAttrName]);
        var per = lv == 0 ? 0 : (lv - 1) / (actor.MaxLv - 1);
        return GameUtils.getBezierPoint2ByGroupValue(growData, per);
    };
    return ProjectGame;
}(GameBase));
//# sourceMappingURL=ProjectGame.js.map