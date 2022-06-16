/**
 * 游戏UI管理器
 * Created by 黑暗之神KDS on 2020-03-17 02:20:53.
 */
class GUI_Manager {
    /**
     * 装备/状态属性面板映射
     */
    private static attributeNameMapping = [
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
    //------------------------------------------------------------------------------------------------------
    // 通用
    //------------------------------------------------------------------------------------------------------
    /**
     * 警告文本
     * @param v 0-该角色必须上场 1-是否准备完毕 2-所有人员就位，要开始战斗吗
     * @param inputMessage [可选] 默认值=null 玩家输入值（等同调用事件时传递的参数）
     * @param onCommandExecuteOver [可选] 默认值=null 当命令执行完毕时回调
     */
    static setWarning(v: number, inputMessage: any[] = [], onCommandExecuteOver: Callback = null): void {
        // var lastKeyBoardEnabled = UIList.KEY_BOARD_ENABLED;
        // UIList.KEY_BOARD_ENABLED = WorldData.hotKeyListEnabled;
        // Game.player.variable.setVariable(15008, v);
        // GameCommand.startCommonCommand(15009, inputMessage, Callback.New(() => {
        //     UIList.KEY_BOARD_ENABLED = lastKeyBoardEnabled;
        //     onCommandExecuteOver && onCommandExecuteOver.run();
        // }, this));
    }
    //------------------------------------------------------------------------------------------------------
    // 标准化组件
    //------------------------------------------------------------------------------------------------------
    /**
     * 标准化列表LIST
     * -- 键位滚动至可见区域
     */
    static standardList(list: UIList, useItemClickSe: boolean = true): void {
        list.on(EventObject.CHANGE, this, (list: UIList, state: number) => {
            if (state == 0) list.scrollTo(list.selectedIndex, true, true, 300, Ease.strongOut);
        }, [list]);
        if (useItemClickSe) {
            list.on(UIList.ITEM_CLICK, this, (list: UIList) => {
                GameAudio.playSE(ClientWorld.data.sureSE);
            }, [list]);
        }
    }
    /**
     * 标准化标签栏
     * -- 快捷键
     * @param tab 
     */
    static standardTab(tab: UITabBox): void {
        stage.on(EventObject.KEY_DOWN, tab, GUI_Manager.onStandardTabKeyDown, [tab]);
        tab["__lastIdx"] = tab.selectedIndex;
        tab.on(EventObject.CHANGE, this, (tab: UITabBox) => {
            var lastIndex = tab["__lastIdx"];
            if (lastIndex >= 0) {
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
            tab["__lastIdx"] = tab.selectedIndex;
        }, [tab]);
    }
    /**
     * 注册鼠标点击区域后激活指定的列表
     * @param area 区域 
     * @param list 列表
     * @param playSureSE [可选] 默认值=true 是否播放确认音效
     * @param onFocus [可选] 默认值=null 当产生焦点时回调
     * @param thisPtr [可选] 默认值=null 当产生焦点时回调的作用域
     */
    static regHitAreaFocusList(area: UIBase, list: UIList, playSureSE: boolean = true, onFocus: Function = null, thisPtr: any = null): void {
        list.on(UIList.ITEM_CREATE, this, hitAreaFocusListCallback);
        function hitAreaFocusListCallback(ui: UIRoot, data: UIListItemData, index: number) {
            ui.on(EventObject.MOUSE_DOWN, this, (e: EventObject) => { e.stopPropagation(); })
        }
        area.on(EventObject.MOUSE_DOWN, GUI_Manager, (list: UIList, playSureSE: boolean) => {
            onFocus && onFocus.apply(thisPtr);
            GUI_Manager.focusList(list, playSureSE);
        }, [list, playSureSE]);
    }
    /**
     * 激活List并选中
     * @param list 列表
     * @param playSureSE [可选] 默认值=true 是否播放确认音效
     */
    private static focusList(list: UIList, playSureSE: boolean = true): void {
        if (UIList.focus == list) return;
        UIList.focus = list;
        for (var i = 0; i < list.length; i++) {
            var itemBox = list.getItemUI(i);
            if (itemBox.mouseX >= 0 && itemBox.mouseX <= list.itemWidth && itemBox.mouseY >= 0 && itemBox.mouseY <= list.itemHeight) {
                list.selectedIndex = i;
                break;
            }
        }
        if (playSureSE) GameAudio.playSE(WorldData.sureSE);
    }
    //------------------------------------------------------------------------------------------------------
    // 技能面板相关
    //------------------------------------------------------------------------------------------------------
    /**
     * 技能描述：支持技能的属性和角色的属性
     * @param skill 技能
     * @param actor 角色
     * @return [string] 
     */
    static skillDesc(skill: Module_Skill, actor: Module_Actor): string {
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
                    var res = eval(varKeyCode) as string;
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
    }
    //------------------------------------------------------------------------------------------------------
    // 装备面板相关
    //------------------------------------------------------------------------------------------------------
    /**
     * 装备描述：支持技能的属性和角色的属性
     * @param equip 技能
     * @return [string] 
     */
    static equipDesc(equip: Module_Equip): string {
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
    }
    //------------------------------------------------------------------------------------------------------
    // 道具面板相关
    //------------------------------------------------------------------------------------------------------
    /**
     * 道具说明
     * @param item 
     * @return [string] 
     */
    static itemDesc(item: Module_Item): string {
        return item.intro;
    }
    //------------------------------------------------------------------------------------------------------
    // 状态面板相关
    //------------------------------------------------------------------------------------------------------
    /**
     * 道具说明
     * @param item 
     * @return [string] 
     */
    static statusDesc(status: Module_Status): string {
        var intro: string = status.intro;
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
                            var res = eval(varKeyCode) as string;
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
    }
    //------------------------------------------------------------------------------------------------------
    // 标准化标签栏-内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 按键更改标签索引
     */
    private static onStandardTabKeyDown(tab: UITabBox, e: EventObject): void {
        if (!tab.stage || !tab.mouseEnabled) {
            return;
        }
        var keyCode: number = e.keyCode
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
    }
}