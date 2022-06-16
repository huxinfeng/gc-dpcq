var GUI_Manager = (function () {
    function GUI_Manager() {
    }
    GUI_Manager.setWarning = function (v, inputMessage, onCommandExecuteOver) {
        if (inputMessage === void 0) { inputMessage = []; }
        if (onCommandExecuteOver === void 0) { onCommandExecuteOver = null; }
    };
    GUI_Manager.standardList = function (list, useItemClickSe) {
        if (useItemClickSe === void 0) { useItemClickSe = true; }
        list.on(EventObject.CHANGE, this, function (list, state) {
            if (state == 0)
                list.scrollTo(list.selectedIndex, true, true, 300, Ease.strongOut);
        }, [list]);
        if (useItemClickSe) {
            list.on(UIList.ITEM_CLICK, this, function (list) {
                GameAudio.playSE(ClientWorld.data.sureSE);
            }, [list]);
        }
    };
    GUI_Manager.standardTab = function (tab) {
        stage.on(EventObject.KEY_DOWN, tab, GUI_Manager.onStandardTabKeyDown, [tab]);
        tab["__lastIdx"] = tab.selectedIndex;
        tab.on(EventObject.CHANGE, this, function (tab) {
            var lastIndex = tab["__lastIdx"];
            if (lastIndex >= 0) {
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
            tab["__lastIdx"] = tab.selectedIndex;
        }, [tab]);
    };
    GUI_Manager.regHitAreaFocusList = function (area, list, playSureSE, onFocus, thisPtr) {
        if (playSureSE === void 0) { playSureSE = true; }
        if (onFocus === void 0) { onFocus = null; }
        if (thisPtr === void 0) { thisPtr = null; }
        list.on(UIList.ITEM_CREATE, this, hitAreaFocusListCallback);
        function hitAreaFocusListCallback(ui, data, index) {
            ui.on(EventObject.MOUSE_DOWN, this, function (e) { e.stopPropagation(); });
        }
        area.on(EventObject.MOUSE_DOWN, GUI_Manager, function (list, playSureSE) {
            onFocus && onFocus.apply(thisPtr);
            GUI_Manager.focusList(list, playSureSE);
        }, [list, playSureSE]);
    };
    GUI_Manager.focusList = function (list, playSureSE) {
        if (playSureSE === void 0) { playSureSE = true; }
        if (UIList.focus == list)
            return;
        UIList.focus = list;
        for (var i = 0; i < list.length; i++) {
            var itemBox = list.getItemUI(i);
            if (itemBox.mouseX >= 0 && itemBox.mouseX <= list.itemWidth && itemBox.mouseY >= 0 && itemBox.mouseY <= list.itemHeight) {
                list.selectedIndex = i;
                break;
            }
        }
        if (playSureSE)
            GameAudio.playSE(WorldData.sureSE);
    };
    GUI_Manager.skillDesc = function (skill, actor) {
        var intro = skill.intro;
        var systemIntro = "";
        var reg = /\${.*?}/g;
        var m = intro.match(reg);
        if (m && m.length > 0) {
            var s = skill;
            var a = actor;
            for (var i in m) {
                var varKeyInfo = m[i];
                var varKeyCode = varKeyInfo.substr(2, varKeyInfo.length - 3);
                try {
                    var res = eval(varKeyCode);
                }
                catch (e) {
                    var res = "[error]";
                }
                intro = intro.replace(varKeyInfo, res);
            }
        }
        if (skill.costSP > 0) {
            systemIntro += "[消耗" + skill.costSP + "点魔法值]\n";
        }
        return systemIntro + intro;
    };
    GUI_Manager.equipDesc = function (equip) {
        var introArr = [];
        for (var i = 0; i < GUI_Manager.attributeNameMapping.length; i++) {
            var attributeInfo = GUI_Manager.attributeNameMapping[i];
            var attribute = attributeInfo[0];
            var attributeName = attributeInfo[1];
            var value = equip[attribute];
            if (value) {
                var intro = "";
                if (value > 0) {
                    intro += "+";
                }
                intro += value + " " + attributeName;
                introArr.push(intro);
            }
        }
        introArr.push(equip.intro);
        return introArr.join("\n");
    };
    GUI_Manager.itemDesc = function (item) {
        return item.intro;
    };
    GUI_Manager.statusDesc = function (status) {
        var intro = status.intro;
        var soIndex = status.fromBattlerID;
        if (soIndex >= 0) {
            var battler = Game.currentScene.sceneObjects[soIndex];
            if (GameBattleHelper.isBattler(battler)) {
                var s = status;
                var a = battler.actor;
                var reg = /\${.*?}/g;
                var m = status.intro.match(reg);
                if (m && m.length > 0) {
                    for (var i in m) {
                        var varKeyInfo = m[i];
                        var varKeyCode = varKeyInfo.substr(2, varKeyInfo.length - 3);
                        try {
                            var res = eval(varKeyCode);
                        }
                        catch (e) {
                            var res = "[error]";
                        }
                        intro = intro.replace(varKeyInfo, res);
                    }
                }
            }
        }
        return intro;
    };
    GUI_Manager.onStandardTabKeyDown = function (tab, e) {
        if (!tab.stage || !tab.mouseEnabled) {
            return;
        }
        var keyCode = e.keyCode;
        var index = tab.selectedIndex;
        if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.L1)) {
            index--;
        }
        else if ((GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.R1))) {
            index++;
        }
        else {
            return;
        }
        index = Math.min(tab.length - 1, Math.max(index, 0));
        tab.selectedIndex = index;
    };
    GUI_Manager.attributeNameMapping = [
        ["maxHP", "最大生命值"],
        ["maxSP", "最大魔法值"],
        ["atk", "攻击力"],
        ["def", "防御"],
        ["mag", "魔力"],
        ["magDef", "魔法防御力"],
        ["agi", "敏捷"],
        ["hit", "命中"],
        ["crit", "暴击"],
        ["magCrit", "魔法暴击率"],
        ["moveGrid", "移动力"]
    ];
    return GUI_Manager;
}());
//# sourceMappingURL=GUI_Manager.js.map