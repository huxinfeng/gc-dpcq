/**
 * Created by 黑暗之神KDS on 2021-03-11 10:24:08.
 */
module CustomGameString {
    /**
     * 场景
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f1(trigger: CommandTrigger, p: CustomGameStringParams_1): string {
        switch (p.type) {
            case 0:
                return Game.currentScene.name;
        }
        return "";
    }
    /**
     * 场景对象
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f2(trigger: CommandTrigger, p: CustomGameStringParams_2): string {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return "";
        // 获取对象
        var so: ProjectClientSceneObject = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.varID, trigger);
        if (!(so instanceof ProjectClientSceneObject) && p.type != 1) return "";
        // 属性
        if (p.type == 0) return so.name;
        if (p.type == 1) {
            var attrValue = so[p.customAttrName];
            return attrValue == null ? "" : attrValue.toString();
        }
    }
    /**
     * 玩家
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f3(trigger: CommandTrigger, p: CustomGameStringParams_3): string {
        switch (p.type) {
            case 0:
                var attrValue = Game.player.data[p.customAttrName];
                return attrValue == null ? "" : attrValue.toString();
        }
        return "";
    }
    /**
     * 界面
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f4(trigger: CommandTrigger, p: CustomGameStringParams_4): string {
        // 获取界面
        var uiID = p.uiComp.uiID;
        // 界面ID
        var ui: GUI_BASE = GameUI.get(uiID) as any;
        if (!ui) return "";
        // 根据组件唯一ID找到该组件
        var comp = ui.compsIDInfo[p.uiComp.compID];
        if (!comp) return "";
        var value = comp[p.uiComp.varName];
        return value == null ? "" : value.toString();
    }
    /**
     * 模块
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f5(trigger: CommandTrigger, p: CustomGameStringParams_5): string {
        var dataID = p.useDataVar ? Game.player.variable.getVariable(p.dataVarID) : p.dataID;
        var moduleData = GameData.getModuleData(p.moduleID, dataID);
        if (!moduleData) return "";
        var value = moduleData[p.attrName];
        return value == null ? "" : value.toString();
    }
    /**
     * 世界
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f6(trigger: CommandTrigger, p: CustomGameStringParams_6): string {
        var value = WorldData[p.customAttrName];
        return value == null ? "" : value.toString();
    }
    /**
     * 系统
     */
    export function f7(trigger: CommandTrigger, p: CustomGameStringParams_7): string {
        switch (p.type) {
            case 0:
                return GUI_Setting.getSystemKeyDesc(GUI_Setting.SYSTEM_KEYS[p.systemKeys]);
            case 1:
                return `${GameAudio.lastBgmURL},${GameAudio.lastBGMVolume},${GameAudio.lastBGMPitch}`
            case 2:
                return `${GameAudio.lastBgsURL},${GameAudio.lastBGSVolume},${GameAudio.lastBGSPitch}`
        }
    }
}