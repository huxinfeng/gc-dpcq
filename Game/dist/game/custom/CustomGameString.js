var CustomGameString;
(function (CustomGameString) {
    function f1(trigger, p) {
        switch (p.type) {
            case 0:
                return Game.currentScene.name;
        }
        return "";
    }
    CustomGameString.f1 = f1;
    function f2(trigger, p) {
        if (!Game.currentScene)
            return "";
        var so = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.varID, trigger);
        if (!(so instanceof ProjectClientSceneObject) && p.type != 1)
            return "";
        if (p.type == 0)
            return so.name;
        if (p.type == 1) {
            var attrValue = so[p.customAttrName];
            return attrValue == null ? "" : attrValue.toString();
        }
    }
    CustomGameString.f2 = f2;
    function f3(trigger, p) {
        switch (p.type) {
            case 0:
                var attrValue = Game.player.data[p.customAttrName];
                return attrValue == null ? "" : attrValue.toString();
        }
        return "";
    }
    CustomGameString.f3 = f3;
    function f4(trigger, p) {
        var uiID = p.uiComp.uiID;
        var ui = GameUI.get(uiID);
        if (!ui)
            return "";
        var comp = ui.compsIDInfo[p.uiComp.compID];
        if (!comp)
            return "";
        var value = comp[p.uiComp.varName];
        return value == null ? "" : value.toString();
    }
    CustomGameString.f4 = f4;
    function f5(trigger, p) {
        var dataID = p.useDataVar ? Game.player.variable.getVariable(p.dataVarID) : p.dataID;
        var moduleData = GameData.getModuleData(p.moduleID, dataID);
        if (!moduleData)
            return "";
        var value = moduleData[p.attrName];
        return value == null ? "" : value.toString();
    }
    CustomGameString.f5 = f5;
    function f6(trigger, p) {
        var value = WorldData[p.customAttrName];
        return value == null ? "" : value.toString();
    }
    CustomGameString.f6 = f6;
    function f7(trigger, p) {
        switch (p.type) {
            case 0:
                return GUI_Setting.getSystemKeyDesc(GUI_Setting.SYSTEM_KEYS[p.systemKeys]);
            case 1:
                return GameAudio.lastBgmURL + "," + GameAudio.lastBGMVolume + "," + GameAudio.lastBGMPitch;
            case 2:
                return GameAudio.lastBgsURL + "," + GameAudio.lastBGSVolume + "," + GameAudio.lastBGSPitch;
        }
    }
    CustomGameString.f7 = f7;
})(CustomGameString || (CustomGameString = {}));
//# sourceMappingURL=CustomGameString.js.map