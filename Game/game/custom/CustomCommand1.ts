/**
 * 自定义事件命令
 * Created by 黑暗之神KDS on 2020-09-09 19:47:24.
 */
module CommandExecute {
    //------------------------------------------------------------------------------------------------------
    // 交互
    //------------------------------------------------------------------------------------------------------
    /**
     * 预加载
     * @param commandPage 事件页
     * @param cmd 当前的事件命令
     * @param trigger 触发器
     * @param triggerPlayer 触发器对应的玩家
     * @param playerInput 玩家输入值（如有）
     * @param p 自定义命令参数
     */
    export function customCommand_1(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1): void {
        // 如果不存在预加载则忽略掉
        if (p.preloadAssets.length == 0) return;
        // 暂停当前触发线的事件推进，当加载资源完毕时再继续执行
        trigger.pause = true;
        // 推进一行，以便下次执行时执行下一行事件
        trigger.offset(1);
        var g = getAssetValues;
        // 图集
        var imageArr = g(0);
        // 判断是否存在字体加载
        var fontArr = g(7);
        if (fontArr.length > 0) {
            var hasFont = true;
        }
        // 如果需要显示加载界面的话则打开界面
        if (p.isShowLoadingUI && p.bindingUI && p.bindingUI.uiID) {
            // 该界面本身要加载（使用了自动释放模式的预载入，所以会自动清空此次预加载的引用）
            AssetManager.preLoadUIAsset(p.bindingUI.uiID, Callback.New(() => {
                var loadingUI = GameUI.show(p.bindingUI.uiID)
                doLoadAsset.apply(this, [loadingUI]);
            }, this), true, true, true);
        }
        else {
            doLoadAsset.apply(this);
        }
        // 加载完毕时处理
        function onLoadComplete(displayProgressComp: UIBase) {
            setProgressUI.apply(this, [displayProgressComp, 100]);
            Callback.New(() => {
                if (p.isShowLoadingUI && p.bindingUI) GameUI.dispose(p.bindingUI.uiID);
                CommandPage.executeEvent(trigger);
            }, this).delayRun(100);
        }
        // 加载资源
        function doLoadAsset(loadingUI: UIRoot) {
            // 如果存在需要显示加载进度效果的话则准备显示
            var displayProgressComp: UIBase = null;
            if (loadingUI && p.bindingUI && p.bindingUI.uiID && p.bindingUI.compName && p.bindingUI.varName) {
                displayProgressComp = loadingUI[p.bindingUI.compName];
                if (!displayProgressComp) {
                    trace(`预载入事件参数错误，找不到组件：${p.bindingUI.compName}`);
                }
            }
            // 加载资源
            AssetManager.batchPreLoadAsset(Callback.New(() => {
                if (hasFont) {
                    AssetManager.preloadFonts(Callback.New(onLoadComplete, this, [displayProgressComp]));
                }
                else {
                    onLoadComplete.apply(this, [displayProgressComp]);
                }
            }, this, [1, true]),
                Callback.New((current: number, count: number) => {
                    // 若存在字体文件
                    if (hasFont) count += 1;
                    // 显示加载进度效果
                    var progressStr = Math.floor(current * 100 / count).toString();
                    setProgressUI.apply(this, [displayProgressComp, progressStr]);
                }, this), imageArr, [], g(2), g(3), g(4), g(5), [], g(1), g(6));
        }
        // 根据资源类别筛选数组
        function getAssetValues(assetType: number): any[] {
            // -- 筛选对应assetType的资源组，如获取所有需要预加载的图像组DataStructure格式数据
            var dsArr: DataStructure_preloadAsset[] = ArrayUtils.matchAttributes(p.preloadAssets, { assetType: assetType }, false);
            // -- 获取DataStructure格式数组内对象的资源属性值重新组成一个新的数组
            return ArrayUtils.getChildAttributeToCreateArray(dsArr, "asset" + assetType);
        }
        // 进度条
        function setProgressUI(displayProgressComp: UIBase, v: number) {
            if (!displayProgressComp) return;
            v = MathUtils.int(v);
            Tween.clearAll(displayProgressComp);
            var attrObj = {};
            attrObj[p.bindingUI.varName] = v;
            Tween.to(displayProgressComp, attrObj, 100);
        }
    }
    /**
     * 等待玩家输入文本
     */
    export function customCommand_2(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2): void {
        if (p.inputUI == 0) return;
        var inputUI: GUI_BASE = GameUI.show(p.inputUI);
        var inputText: UIInput = inputUI["input"];
        if (inputText) {
            inputText.setTextForce(p.useVar == 1 ? Game.player.variable.getString(p.defTextVarID) : p.defText);
            inputText.focus = true;
            inputText.off(EventObject.ENTER, inputText, ____onInputEnter);
            inputText.on(EventObject.ENTER, inputText, ____onInputEnter, [p.inputUI]);
        }
        trigger.pause = true;
        inputUI.once(EventObject.REMOVED, this, () => {
            trigger.offset(1);
            Callback.CallLaterBeforeRender(() => {
                // @ts-ignore
                CommandPage.executeEvent.apply(this, arguments);
            }, CommandPage, [trigger, [inputText ? inputText.text : ""]]);
        }, []);
    }
    function ____onInputEnter(uiID: number) {
        GameUI.hide(uiID);
    }
    /**
     * 按键事件
     */
    var keyEventSigns: { [key: string]: { typeEvent: string, thisPtr: any, func: Function } } = {}
    export function customCommand_3(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_3): void {
        // 永久,执行一次,调用该命令时执行的事件完毕为止
        var evType = (p.isMulKey == 1 || p.isMulKey == 3) ? p.evType2 : p.evType;
        var typeEvent = evType != 1 ? EventObject.KEY_DOWN : EventObject.KEY_UP;
        // 根据执行一次与否决定使用on或once
        var f = (p: CustomCommandParams_3, trigger: CommandTrigger, sign: string, e: EventObject) => {
            var bool = false;
            // 普通单按键
            if (p.isMulKey == 0) {
                bool = e.keyCode == p.key;
            }
            // 普通多按键
            else if (p.isMulKey == 1) {
                bool = p.keys.indexOf(e.keyCode) != -1;
            }
            // 系统单按键
            else if (p.isMulKey == 2) {
                var systemKeyName = GUI_Setting.SYSTEM_KEYS[p.systemKey];
                var systemKeyboardInfo: { index: number, name: string, keys: number[] } = GUI_Setting.KEY_BOARD[systemKeyName];
                bool = systemKeyboardInfo.keys.indexOf(e.keyCode) != -1;
            }
            // 系统多按键
            else {
                bool = false;
                for (var i = 0; i < p.systemKeys.length; i++) {
                    var systemKeyName = GUI_Setting.SYSTEM_KEYS[p.systemKeys[i]];
                    var systemKeyboardInfo: { index: number, name: string, keys: number[] } = GUI_Setting.KEY_BOARD[systemKeyName];
                    bool = systemKeyboardInfo.keys.indexOf(e.keyCode) != -1;
                    if (bool) break;
                }
            }
            // 组合键判定
            if (p.isMulKey <= 1) {
                if (((p.CTRL && !e.ctrlKey) || (!p.CTRL && e.ctrlKey)) && e.keyCode != Keyboard.CONTROL) bool = false;
                if (((p.SHIFT && !e.shiftKey) || (!p.SHIFT && e.shiftKey)) && e.keyCode != Keyboard.SHIFT) bool = false;
                if (((p.ALT && !e.altKey) || (!p.ALT && e.altKey)) && e.keyCode != Keyboard.ALTERNATE) bool = false;
            }
            // 是否未按下的模式
            var isNotKeyDown = (!(p.isMulKey == 1 || p.isMulKey == 3) && p.evType == 2);
            // 未按下模式下未按下或满足按下条件
            if ((isNotKeyDown && !bool) || (!isNotKeyDown && bool)) {
                if (p.type == 1) {
                    // @ts-ignore
                    stage.off(typeEvent, trigger, arguments.callee);
                    if (sign) delete keyEventSigns[sign];
                }
                CommandPage.startTriggerFragmentEvent(p.eventPage, Game.player.sceneObject, Game.player.sceneObject);
            }
        };
        // 记录按键标识
        if (p.recordListen && p.recordListenVar > 0) {
            var sign = ObjectUtils.getRandID();
            keyEventSigns[sign] = { typeEvent: typeEvent, thisPtr: trigger, func: f };
            Game.player.variable.setString(p.recordListenVar, sign);
        }
        // 注册按键事件
        stage.on(typeEvent, trigger, f, [p, trigger, sign]);
        // 调用该命令时执行的事件完毕为止：监听当前事件完毕，完毕则清除掉该次按键事件
        if (p.type == 2) {
            EventUtils.addEventListener(trigger, CommandTrigger.EVENT_OVER, Callback.New((typeEvent: string, trigger: CommandTrigger, f: Function, sign: string) => {
                stage.off(typeEvent, trigger, f);
                if (sign) delete keyEventSigns[sign];
            }, this, [typeEvent, trigger, f, sign]), true);
        }
    }
    /**
     * 鼠标事件
     */
    var mouseEventSigns: { [key: string]: { typeEvent: string, thisPtr: any, func: Function } } = {}
    export function customCommand_4(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4): void {
        // 永久,执行一次,调用该命令时执行的事件完毕为止
        var typeEvent = MouseControl.mouseEvents[p.mouseType];
        // 根据执行一次与否决定使用on或once
        var f = (typeEvent: string, p: CustomCommandParams_4, trigger: CommandTrigger, sign: string, e: EventObject) => {
            if (e.type == typeEvent) {
                if (p.type == 1) {
                    // @ts-ignore
                    stage.off(typeEvent, trigger, arguments.callee);
                    if (sign) delete mouseEventSigns[sign];
                }
                CommandPage.startTriggerFragmentEvent(p.eventPage, Game.player.sceneObject, Game.player.sceneObject);
            }
        };
        // 记录鼠标标识
        if (p.recordListen && p.recordListenVar > 0) {
            var sign = ObjectUtils.getRandID();
            mouseEventSigns[sign] = { typeEvent: typeEvent, thisPtr: trigger, func: f };
            Game.player.variable.setString(p.recordListenVar, sign);
        }
        // 仅限于场景上使用
        if (p.onlyInScene) {
            MouseControl.eventDispatcher.on(typeEvent, trigger, f, [typeEvent, p, trigger, sign]);
        }
        else {
            stage.on(typeEvent, trigger, f, [typeEvent, p, trigger, sign]);
        }
        // 调用该命令时执行的事件完毕为止：监听当前事件完毕，完毕则清除掉该次按键事件
        if (p.type == 2) {
            EventUtils.addEventListener(trigger, CommandTrigger.EVENT_OVER, Callback.New((onlyInScene: boolean, typeEvent: string, trigger: CommandTrigger, f: Function, sign: string) => {
                if (p.onlyInScene) {
                    MouseControl.eventDispatcher.off(typeEvent, trigger, f);
                }
                else {
                    stage.off(typeEvent, trigger, f);
                }
                if (sign) delete mouseEventSigns[sign];
            }, this, [p.onlyInScene, typeEvent, trigger, f, sign]), true);
        }
    }
    /**
     * 设置界面属性
     */
    export function customCommand_5(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_5): void {
        // 获取界面
        var uiID = p.useVar ? Game.player.variable.getVariable(p.uiIDvarID) : p.uiID;
        var ui = GameUI.get(uiID);
        if (!ui) return;
        // 修改本体属性
        if (p.type == 0) {
            var uiAttrName = p.uiAttrNameUseVar ? Game.player.variable.getString(p.uiAttrNameVarID) : p.uiAttrName;
            var uiAttrValue;
            if (p.uiAttrValueUseVar == 0) {
                uiAttrValue = p.uiAttrValue;
            }
            else if (p.uiAttrValueUseVar == 1) {
                uiAttrValue = Game.player.variable.getVariable(p.uiAttrValueVarID1);
            }
            else if (p.uiAttrValueUseVar == 2) {
                uiAttrValue = Game.player.variable.getSwitch(p.uiAttrValueVarID2) ? true : false;
            }
            else if (p.uiAttrValueUseVar == 3) {
                uiAttrValue = Game.player.variable.getString(p.uiAttrValueVarID3);
            }
            setSafeValue(ui, uiAttrName, uiAttrValue);
        }
        // 修改元件属性
        else {
            var compName = p.compNameUseVar ? Game.player.variable.getString(p.compNameVarID) : p.compName;
            var comp = ui[compName];
            if (!comp) return;
            var compAttrName = p.compAttrNameUseVar ? Game.player.variable.getString(p.compAttrNameVarID) : p.compAttrName;
            var compAttrValue;
            if (p.compAttrValueUseVar == 0) {
                compAttrValue = p.compAttrValue;
            }
            else if (p.compAttrValueUseVar == 1) {
                compAttrValue = Game.player.variable.getVariable(p.compAttrValueVarID1);
            }
            else if (p.compAttrValueUseVar == 2) {
                compAttrValue = Game.player.variable.getSwitch(p.compAttrValueVarID2) ? true : false;
            }
            else if (p.compAttrValueUseVar == 3) {
                compAttrValue = Game.player.variable.getString(p.compAttrValueVarID3);
            }
            setSafeValue(comp, compAttrName, compAttrValue);
        }
        function setSafeValue(obj: any, attrName: string, newValue: any) {
            var attrType = obj[attrName];
            if (typeof attrType == "string") {
                obj[attrName] = String(newValue);
            }
            else if (typeof attrType == "number") {
                obj[attrName] = MathUtils.float(newValue);
            }
            else if (typeof attrType == "boolean") {
                obj[attrName] = newValue == "true" ? true : (newValue != "false" && newValue != "0" ? true : false);
            }
            else {
                obj[attrName] = newValue;
            }
        }
    }
    /**
     * 按钮按键焦点设置
     */
    var ____uiButtonFocus: { [sign: string]: FocusButtonsManager } = {};
    export function customCommand_6(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_6): void {
        var uiID = p.useVar ? Game.player.variable.getVariable(p.uiIDVarID) : p.uiID;
        var ui = GameUI.get(uiID);
        if (!ui || !ui.stage) return;
        // 根据参数记录标识
        var sign = "";
        sign += uiID + "_";
        sign += p.isAutoFocus ? "1_" : "0_";
        sign += p.isAddButton ? "1_" : "0_";
        sign += p.isExcludeButton ? "1_" : "0_";
        if (p.isAddButton) {
            sign += p.addButtons.join("+");
        }
        if (p.isExcludeButton) {
            sign += p.excludeButtons.join("-");
        }
        sign += p.selEffectUI + "_";
        sign += p.useFocusAnimation ? "1_" : "0_";
        // 获取
        var btnFocusManager = ____uiButtonFocus[sign];
        if (btnFocusManager) {
            btnFocusManager.shortcutKeyExit = p.shortcutKeyExit;
            btnFocusManager.whenExitBackLastFocus = p.whenExitBackLastFocus;
            btnFocusManager.whenExitEvent = p.whenExitEvent;
        }
        else {
            btnFocusManager = ____uiButtonFocus[sign] = new FocusButtonsManager(ui, p.isAutoFocus, p.isAddButton ? p.addButtons : [], p.isExcludeButton ? p.excludeButtons : [], p.selEffectUI, p.useFocusAnimation, p.shortcutKeyExit, p.whenExitBackLastFocus);
            btnFocusManager.whenExitEvent = p.whenExitEvent;
            // 监听销毁事件，如果界面被销毁则此处也清理掉引用记录
            ui.once(GameSprite.ON_DISPOSE, this, (sign: string, btnFocusManager: FocusButtonsManager) => {
                delete ____uiButtonFocus[sign];
                btnFocusManager.dispose();
            }, [sign, btnFocusManager]);
        }
        if (btnFocusManager.buttons.length == 0) return;
        // 设置焦点
        FocusButtonsManager.focus = btnFocusManager;
        // 设置焦点索引
        if (p.setSelectedIndex && FocusButtonsManager.focus) {
            FocusButtonsManager.focus.selectedIndex = p.selectedIndex;
        }
    }
    /**
     * 关闭界面焦点
     */
    export function customCommand_7(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_7): void {
        if (p.focusType == 0 || p.focusType == 2) {
            FocusButtonsManager.focus = null;
        }
        if (p.focusType == 1 || p.focusType == 2) {
            UIList.focus = null;
        }
    }
    /**
     * 取消按键事件
     */
    export function customCommand_8(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_8): void {
        var sign = Game.player.variable.getString(p.recordListenVar);
        if (sign) {
            var keyInfo = keyEventSigns[sign];
            if (keyInfo) {
                stage.off(keyInfo.typeEvent, keyInfo.thisPtr, keyInfo.func);
            }
        }
    }
    /**
     * 取消鼠标事件
     */
    export function customCommand_9(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_9): void {
        var sign = Game.player.variable.getString(p.recordListenVar);
        if (sign) {
            var mouseInfo = mouseEventSigns[sign];
            if (mouseInfo) {
                stage.off(mouseInfo.typeEvent, mouseInfo.thisPtr, mouseInfo.func);
                MouseControl.eventDispatcher.off(mouseInfo.typeEvent, mouseInfo.thisPtr, mouseInfo.func);
            }
        }
    }
    /**
     * 模拟按键
     */
    export function customCommand_10(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_10): void {
        // 键盘按键
        if (p.isMulKey == 0) {
            simulateKey(p.key);
        }
        // 系统按键
        else {
            let systemKeyName = GUI_Setting.SYSTEM_KEYS[p.systemKey];
            let systemKeyboardInfo: { index: number, name: string, keys: number[] } = GUI_Setting.KEY_BOARD[systemKeyName];
            let realKeyCode = systemKeyboardInfo.keys[0];
            if (!realKeyCode) return;
            simulateKey(realKeyCode);
        }
        // 模拟按键
        function simulateKey(key: number) {
            // -- 按下/弹起
            if (p.evType <= 1) {
                let e = new EventObject;
                e.type = [EventObject.KEY_DOWN, EventObject.KEY_UP][p.evType];
                let oe: KeyboardEvent = new KeyboardEvent(e.type, { ctrlKey: p.CTRL, shiftKey: p.SHIFT, altKey: p.ALT }) as any;
                e.nativeEvent = oe;
                e.keyCode = key;
                stage.event(e.type, [e]);
            }
            // -- 按下并弹起
            else if (p.evType == 2) {
                let e = new EventObject;
                e.type = EventObject.KEY_DOWN;
                let oe: KeyboardEvent = new KeyboardEvent(e.type, { ctrlKey: p.CTRL, shiftKey: p.SHIFT, altKey: p.ALT }) as any;
                e.nativeEvent = oe;
                e.keyCode = key;
                stage.event(EventObject.KEY_DOWN, [e]);
                setTimeout(() => {
                    let e = new EventObject;
                    e.type = EventObject.KEY_UP;
                    let oe: KeyboardEvent = new KeyboardEvent(e.type, { ctrlKey: p.CTRL, shiftKey: p.SHIFT, altKey: p.ALT }) as any;
                    e.nativeEvent = oe;
                    e.keyCode = key;
                    stage.event(e.type, [e]);
                }, p.interval);
            }
        }
    }
    /**
     * 提交信息
     */
    export function customCommand_11(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_11): void {
        var inputMessages = [];
        for (var i = 0; i < p.messages.length; i++) {
            var d = p.messages[i];
            var f: Function;
            var v: any;
            if (d.type == 0) {
                f = CustomGameNumber["f" + d.numberValue[0]];
                v = f ? f(null, d.numberValue[1]) : null;
                inputMessages.push(v);
            }
            else if (d.type == 1) {
                f = CustomCondition["f" + d.booleanValue[0]];
                v = f ? f(null, d.booleanValue[1]) : null;
                inputMessages.push(v);
            }
            else if (d.type == 2) {
                f = CustomGameString["f" + d.stringValue[0]];
                v = f ? f(null, d.stringValue[1]) : null;
                inputMessages.push(v);
            }
        }
        GameCommand.inputMessageAndContinueExecute(inputMessages);
    }
    //------------------------------------------------------------------------------------------------------
    // 效果
    //------------------------------------------------------------------------------------------------------
    /**
     * 设置数据层
     */
    export function customCommand_1001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1001): void {
        if (!Game.currentScene) return;
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth) return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight) return;
        var state = p.on == 0 ? 1 : 0;
        var dataLayerIndex = p.layer;
        Game.currentScene.setDataGridState(dataLayerIndex, xGrid, yGrid, state);
    }
    /**
     * 绘制图块
     */
    export function customCommand_1002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1002): void {
        if (!Game.currentScene) return;
        // 图块
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layer;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer || !layer.drawMode) return;
        var tileData = TileData.getTileData(p.tileID);
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth) return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight) return;
        // 如果贴图不存在于内存中则忽略
        var tex = AssetManager.getImage(tileData.url);
        if (!tex) return;
        // 贴图图源超出范围的话则忽略
        var texGridW = Math.floor(tex.width / Config.SCENE_GRID_SIZE);
        var texGridH = Math.floor(tex.height / Config.SCENE_GRID_SIZE);
        if (p.sourceX < 0 || p.sourceX >= texGridW || p.sourceY < 0 || p.sourceY >= texGridH) return;
        layer.drawTile(xGrid, yGrid, { tex: tex, texID: p.tileID, x: p.sourceX * Config.SCENE_GRID_SIZE, y: p.sourceY * Config.SCENE_GRID_SIZE, w: Config.SCENE_GRID_SIZE, h: Config.SCENE_GRID_SIZE });
        // 到下一次渲染前调用flushTile，以便优化性能
        Callback.CallLaterBeforeRender(layer.flushTile, layer);
    }
    /**
     * 绘制自动元件
     */
    export function customCommand_1003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1003): void {
        if (!Game.currentScene) return;
        // 图块
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layer;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer || !layer.drawMode) return;
        var tileData = AutoTileData.getAutoTileData(p.autoTileID);
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth) return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight) return;
        // 如果贴图不存在于内存中则忽略
        var tex = AssetManager.getImage(tileData.url);
        if (!tex) return;
        layer.drawAutoTile(xGrid, yGrid, p.autoTileID, tex);
        // 到下一次渲染前调用flushTile，以便优化性能
        Callback.CallLaterBeforeRender(layer.flushTile, layer);
    }
    /**
     * 清除图块
     */
    export function customCommand_1004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1004): void {
        if (!Game.currentScene) return;
        // 图块
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layer;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer || !layer.drawMode) return;
        if (p.type) {
            layer.clearTile();
            return;
        }
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth) return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight) return;
        // 贴图图源超出范围的话则忽略
        layer.drawTile(xGrid, yGrid, null);
        // 到下一次渲染前调用flushTile，以便优化性能
        Callback.CallLaterBeforeRender(layer.flushTile, layer);
    }
    /**
     * 设置图层属性
     */
    export function customCommand_1005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1005): void {
        if (!Game.currentScene) return;
        // 图块
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layerID;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer) return;
        if (p.offsetEnabled) {
            layer.dx = p.dxUseVar ? Game.player.variable.getVariable(p.dxVarID) : p.dx;
            layer.dy = p.dyUseVar ? Game.player.variable.getVariable(p.dyVarID) : p.dy;
        }
        if (p.scaleEnabled) {
            layer.scaleX = p.scaleXUseVar ? Game.player.variable.getVariable(p.scaleXVarID) : p.scaleX;
            layer.scaleY = p.scaleYUseVar ? Game.player.variable.getVariable(p.scaleYVarID) : p.scaleY;
        }
        if (p.autoMoveEnabled) {
            layer.xMove = p.xMoveUseVar ? Game.player.variable.getVariable(p.xMoveVarID) : p.xMove;
            layer.yMove = p.yMoveUseVar ? Game.player.variable.getVariable(p.yMoveVarID) : p.yMove;
        }
        if (p.alphaEnabled) {
            layer.alpha = p.alphaUseVar ? Game.player.variable.getVariable(p.alphaVarID) : p.alpha;
        }
        if (p.visibleEnabled) {
            layer.visible = p.visibleUseVar ? Game.player.variable.getSwitch(p.visibleVarID) == 1 : (p.visible == 0);
        }
    }
    /**
     * 显示动画
     */
    export function customCommand_1006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1006): void {
        if (!Game.currentScene) return;
        // 场景对象
        if (p.useType == 0) {
            var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.soIndex, p.useVar, p.soIndexVarID, trigger);
            if (!soc) return;
            soc.playAnimation(p.aniID, false, true);
        }
        // 场景坐标
        else if (p.useType == 1) {
            if (p.posUseVar) {
                var x = Game.player.variable.getVariable(p.xVarID);
                var y = Game.player.variable.getVariable(p.yVarID);
            }
            else {
                x = p.x;
                y = p.y;
            }
            if (p.isGrid) {
                x = x * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
                y = y * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
            }
            if (x < 0 || x >= Game.currentScene.width || y < 0 || y >= Game.currentScene.height) return;
            var layer = p.layer == 1 ? Game.currentScene.animationHighLayer : Game.currentScene.animationLowLayer;
            var ani = new GCAnimation();
            ani.showHitEffect = true;
            ani.once(GCAnimation.PLAY_COMPLETED, this, (ani: GCAnimation) => {
                ani.dispose();
            }, [ani]);
            ani.id = p.aniUseVar ? Game.player.variable.getVariable(p.aniIDVarID) : p.aniID;
            ani.play();
            ani.x = x;
            ani.y = y;
            layer.addChild(ani);
        }
    }
    /**
     * 镜头缩放
     */
    export function customCommand_1007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1007): void {
        if (!Game.currentScene) return;
        if (p.useTrans) {
            let transData = GameUtils.getTransData(p.trans);
            let sx = p.scaleXUseVar == 1 ? Game.player.variable.getVariable(p.scaleX2) : p.scaleX;
            let sy = p.scaleYUseVar == 1 ? Game.player.variable.getVariable(p.scaleY2) : p.scaleY;
            let oldsx = Game.currentScene.camera.scaleX;
            let oldsy = Game.currentScene.camera.scaleY;
            let frameCount = p.time;
            let scene = Game.currentScene;
            let f: Function;
            os.add_ENTERFRAME(f = (f: Function) => {
                if (Game.pause) return;
                if (scene != Game.currentScene) {
                    os.remove_ENTERFRAME(f, this);
                    return;
                }
                frameCount--;
                let per = (p.time - frameCount) / p.time;
                let value = GameUtils.getValueByTransData(transData, per);
                if (p.useScaleX) {
                    Game.currentScene.camera.scaleX = (sx - oldsx) * value + oldsx;
                }
                if (p.useScaleY) {
                    Game.currentScene.camera.scaleY = (sy - oldsy) * value + oldsy;
                }
                if (frameCount == 0) {
                    os.remove_ENTERFRAME(f, this);
                }
            }, this, [f]);
        }
        else {
            if (p.useScaleX) {
                let sx = p.scaleXUseVar == 1 ? Game.player.variable.getVariable(p.scaleX2) : p.scaleX;
                Game.currentScene.camera.scaleX = sx;
            }
            if (p.useScaleY) {
                let sy = p.scaleYUseVar == 1 ? Game.player.variable.getVariable(p.scaleY2) : p.scaleY;
                Game.currentScene.camera.scaleY = sy;
            }
        }
    }
    /**
     * 镜头旋转
     */
    export function customCommand_1008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1008): void {
        if (!Game.currentScene) return;
        var ro = p.useVar ? Game.player.variable.getVariable(p.rotationVarID) : p.rotation;
        if (p.useTrans) {
            let transData = GameUtils.getTransData(p.trans);
            let oldro = Game.currentScene.camera.rotation;
            let frameCount = p.time;
            let scene = Game.currentScene;
            let f: Function;
            os.add_ENTERFRAME(f = (f: Function) => {
                if (Game.pause) return;
                if (scene != Game.currentScene) {
                    os.remove_ENTERFRAME(f, this);
                    return;
                }
                frameCount--;
                let per = (p.time - frameCount) / p.time;
                let value = GameUtils.getValueByTransData(transData, per);
                Game.currentScene.camera.rotation = (ro - oldro) * value + oldro;
                if (frameCount == 0) {
                    os.remove_ENTERFRAME(f, this);
                }
            }, this, [f]);
        }
        else {
            Game.currentScene.camera.rotation = ro;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 玩法
    //------------------------------------------------------------------------------------------------------
    /**
     * 金币
     */
    export function customCommand_2001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2001): void {
        var v = p.useVar ? Game.player.variable.getVariable(p.goldVarID) : p.gold;
        ProjectPlayer.increaseGold(p.symbol == 0 ? v : -v);
    }
    /**
     * 道具
     */
    export function customCommand_2002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2002): void {
        var itemID = p.useVar1 ? Game.player.variable.getVariable(p.itemIDVarID) : p.itemID;
        var num = p.useVar2 ? Game.player.variable.getVariable(p.numVarID) : p.num;
        ProjectPlayer.changeItemNumber(itemID, p.symbol == 0 ? num : -num, false);
    }
    /**
     * 克隆对象
     */
    export function customCommand_2003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2003): void {
        var sceneID = p.sceneID;
        var soIndexID = p.useVar ? Game.player.variable.getVariable(p.noVarID) : p.no;
        var toScene = Game.currentScene;
        if (!toScene) return;
        // 暂停事件，等待完成后再继续
        trigger.pause = true;
        var syncState = 0;
        // 加载第一个场景，作为存放队伍成员模型
        ProjectClientScene.createSceneHelper(sceneID, Callback.New((toScene: ProjectClientScene, soIndexID: number, p: CustomCommandParams_2003, fromScene: ClientScene, isSync: boolean) => {
            // 由于可能异步加载，此时已经切换了新的场景，场景符合的话才设置
            if (Game.currentScene == toScene) {
                // 创建到坐标
                var posP = p.posUseVar ? new Point(Game.player.variable.getVariable(p.xVarID), Game.player.variable.getVariable(p.yVarID)) : new Point(p.x, p.y);
                if (p.isGrid) {
                    posP = GameUtils.getGridCenterByGrid(posP);
                }
                var persetSceneObject = {
                    x: posP.x,
                    y: posP.y
                }
                // 创建对象
                var newSoc: ClientSceneObject = toScene.addSceneObjectFromClone(fromScene.id, soIndexID, true, persetSceneObject);
                if (newSoc instanceof ProjectClientSceneObject) {
                    newSoc.settingX = posP.x;
                    newSoc.settingY = posP.y;
                }
                // 将新创建出来的对象编号储存至变量，以便其他事件访问到该对象
                if (p.newSoIndex > 0) Game.player.variable.setVariable(p.newSoIndex, newSoc.index);
                // 执行事件
                var eventCB = null;
                if (p.waitEventComplete) {
                    eventCB = Callback.New(() => {
                        continueExecute(trigger);
                    }, this);
                }
                CommandPage.startTriggerFragmentEvent(p.newSoExecuteEvent, trigger.trigger, newSoc, eventCB);
            }
            // 如果已暂停的话说明是异步回调需要恢复执行
            if (!p.waitEventComplete) {
                continueExecute(trigger);
            }
        }, this, [toScene, soIndexID, p]));
        syncState = 1;
        function continueExecute(trigger: CommandTrigger) {
            if (syncState == 0) {
                trigger.pause = false;
            }
            else {
                trigger.offset(1);
                CommandPage.executeEvent(trigger);
            }
        }
    }
    /**
     * 销毁克隆的对象
     */
    export function customCommand_2004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2004): void {
        if (!Game.currentScene) return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType + 1, p.no, p.useVar, p.noVarID, trigger);
        // 终止并表示需要强行完成事件执行
        if (soc && soc.isCopy && soc == trigger.executor) {
            trigger.cmdReturn = true;
            trigger["commandScope"].length = 1;
        }
        // 下一帧渲染前销毁掉对象，以避免先销毁对象后事件无法完成的问题
        Callback.CallLaterBeforeRender((soc: ProjectClientSceneObject) => {
            if (soc && soc.isCopy) soc.dispose();
        }, this, [soc])
    }
    /**
     * 暂时隐藏对象，从场景上移除但记录列表中仍然存在，可以通过index获取到该对象
     */
    export function customCommand_2005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2005): void {
        if (!Game.currentScene) return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType + 1, p.no, p.useVar, p.noVarID, trigger);
        if (soc && soc.inScene) Game.currentScene.removeSceneObject(soc, false);
    }
    /**
     * 停止移动
     */
    export function customCommand_2006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2006): void {
        if (!Game.currentScene) return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc && soc.isMoving) soc.stopMove();
    }
    /**
     * 记录移动路径
     */
    export function customCommand_2007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2007): void {
        if (!Game.currentScene) return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) soc.recordMoveRoadInfo = soc.getRecordMoveState();
    }
    /**
     * 恢复移动路径
     */
    export function customCommand_2008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2008): void {
        if (!Game.currentScene) return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            soc.restoryMove(soc.recordMoveRoadInfo);
            soc.recordMoveRoadInfo = null;
        }
    }
    /**
     * 修改场景对象的自定义属性
     */
    export function customCommand_2009(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2009): void {
        if (!Game.currentScene) return;
        // 获取对象
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            if (p.varType == 0) {
                var value: any = p.valueUseVar == 1 ? Game.player.variable.getVariable(p.value0VarID) : p.value0;
            }
            else if (p.varType == 1) {
                value = p.valueUseVar == 1 ? Game.player.variable.getSwitch(p.value1VarID) : p.value1 == 0 ? true : false;
            }
            else {
                value = p.valueUseVar == 1 ? Game.player.variable.getString(p.value2VarID) : p.value2;
            }
            soc[p.varName] = value;
        }
    }
    /**
     * 修改玩家的自定义属性
     */
    export function customCommand_2010(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2010): void {
        if (!Game.currentScene) return;
        if (p.varType == 0) {
            var value: any = p.valueUseVar == 1 ? Game.player.variable.getVariable(p.value0VarID) : p.value0;
        }
        else if (p.varType == 1) {
            value = p.valueUseVar == 1 ? Game.player.variable.getSwitch(p.value1VarID) : p.value1 == 0 ? true : false;
        }
        else {
            value = p.valueUseVar == 1 ? Game.player.variable.getString(p.value2VarID) : p.value2;
        }
        Game.player.data[p.varName] = value;
    }
    /**
     * 修改场景对象的行走图的部件
     */
    export function customCommand_2011(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2011): void {
        if (!Game.currentScene) return;
        // 获取对象
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            var partID = p.partID;
            var newAvatarID = p.newPartUseVar ? Game.player.variable.getVariable(p.newPartVarID) : p.newPart;
            soc.avatar.changePartByAvatarID(newAvatarID, partID)
        }
    }
    /**
     * 商店
     */
    export function customCommand_2012(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2012): void {
        // 暂停事件，等待完成后再继续
        trigger.pause = true;
        // 加载商店界面
        GameUI.load(12);
        let gui: GUI_Shop = GameUI.get(12) as any;
        // 存入数据
        gui.shopEventData = p;
        // 恢复执行事件
        gui.once(EventObject.UNDISPLAY, this, () => {
            gui.shopEventData = null;
            trigger.offset(1);
            CommandPage.executeEvent(trigger);
        });
        // 打开商店界面
        GameUI.show(12);
    }
    /**
     * 清除对象行为
     */
    export function customCommand_2013(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_2013): void {
        if (!Game.currentScene) return;
        // 获取对象
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            soc.clearBehaviors();
            soc.stopBehavior();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 系统
    //------------------------------------------------------------------------------------------------------
    /**
     * 允许玩家控制
     */
    export function customCommand_4001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4001): void {
        WorldData.playCtrlEnabled = true;
    }
    /**
     * 禁止玩家控制
     */
    export function customCommand_4002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4002): void {
        WorldData.playCtrlEnabled = false;
    }
    /**
     * 允许使用菜单
     */
    export function customCommand_4003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4003): void {
        WorldData.menuEnabled = true;
    }
    /**
     * 禁止使用菜单
     */
    export function customCommand_4004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4004): void {
        WorldData.menuEnabled = false;
    }
    /**
     * 开始游戏
     */
    var callNewGame = false;
    export function customCommand_4005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4005): void {
        if (callNewGame) return;
        callNewGame = true;
        SinglePlayerGame.newGame();
    }
    /**
     * 存档
     */
    export function customCommand_4006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4006): void {
        if (p.saveType == 0) {
            trigger.pause = true;
            trigger.offset(1);
            SinglePlayerGame.saveGlobalData(Callback.New(() => {
                CommandPage.executeEvent(trigger);
            }, this));
        }
        else if (p.saveType == 1) {
            if (GUI_SaveFileManager.currentSveFileIndexInfo) {
                // 命令偏移一行，以便下次恢复执行时执行下一行而不是本行
                trigger.offset(1);
                GUI_SaveFileManager.saveFile(GUI_SaveFileManager.currentSveFileIndexInfo.id, p.silenceMode ? false : true, Callback.New(() => {
                    CommandPage.executeEvent(trigger);
                }, this), true);
                // 暂停必须放在存档后面，否则存档将正在执行的该事件暂停状态也一起保存了
                trigger.pause = true;
            }
        }
        else {
            var saveID = p.saveID;
            // 命令偏移一行，以便下次恢复执行时执行下一行而不是本行
            trigger.offset(1);
            GUI_SaveFileManager.saveFile(saveID, p.silenceMode ? false : true, Callback.New(() => {
                CommandPage.executeEvent(trigger);
            }, this), true);
            // 暂停必须放在存档后面，否则存档将正在执行的该事件暂停状态也一起保存了
            trigger.pause = true;
        }
    }
    /**
     *  音量
     */
    export function customCommand_4007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4007): void {
        var v = p.useVar ? Game.player.variable.getVariable(p.volumeVarID) : p.volume;
        if (p.type == 0) {
            GameAudio.bgmVolume = v / 100;
            return;
        }
        if (p.type == 1) {
            GameAudio.bgsVolume = v / 100;
            return;
        }
        if (p.type == 2) {
            GameAudio.seVolume = v / 100;
            return;
        }
        if (p.type == 3) {
            GameAudio.tsVolume = v / 100;
            return;
        }
    }
    /**
     *  返回标题
     */
    export function customCommand_4008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4008): void {
        window.location.reload();
    }
    /**
     *  暂停游戏
     */
    export function customCommand_4009(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4009): void {
        Game.pause = true;
    }
    /**
     *  恢复游戏
     */
    export function customCommand_4010(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4010): void {
        Game.pause = false;
    }
    /**
     *  关闭窗口
     */
    export function customCommand_4011(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4011): void {
        os.closeWindow();
    }
    /**
     *  对话框音效设置
     */
    export function customCommand_4012(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_4012): void {
        WorldData.dialogSEEnabled = p.dialogSE == 0 ? true : false;
    }
    //------------------------------------------------------------------------------------------------------
    //  场景对象模块
    //------------------------------------------------------------------------------------------------------
    /**
     * 增减场景对象模块
     */
    export function customCommand_8001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_8001): void {
        if (!Game.currentScene) return;
        // -- 获取目标对象
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.soUseVar, p.noVarID, trigger);
        if (soc) {
            // -- 获取指定的模块添加或移除
            var moduleID = p.valueUseVar ? Game.player.variable.getVariable(p.valueVarID) : p.value;
            if (p.symbol == 0) soc.addModuleByID(moduleID);
            else soc.removeModuleByID(moduleID);
        }
    }
    /**
     * 设置场景对象模块的属性
     */
    export function customCommand_8002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_8002): void {
        if (!Game.currentScene) return;
        // -- 获取目标对象
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            // -- 获取指定的模块添加或移除
            var moduleID = p.moduleIDUseVar ? Game.player.variable.getVariable(p.moduleIDVarID) : p.moduleID;
            var soModule = soc.getModule(moduleID);
            if (soModule) {
                if (p.varType == 0) {
                    var value: any = p.valueUseVar == 1 ? Game.player.variable.getVariable(p.value0VarID) : p.value0;
                }
                else if (p.varType == 1) {
                    value = p.valueUseVar == 1 ? Game.player.variable.getSwitch(p.value1VarID) : p.value1 == 0 ? true : false;
                }
                else {
                    value = p.valueUseVar == 1 ? Game.player.variable.getString(p.value2VarID) : p.value2;
                }
                soModule[p.varName] = value;
                soModule.refresh();
            }
        }
    }
}