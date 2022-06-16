;var CommandExecute;
(function (CommandExecute) {
    function customCommand_1(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var _this_1 = this;
        if (p.preloadAssets.length == 0)
            return;
        trigger.pause = true;
        trigger.offset(1);
        var g = getAssetValues;
        var imageArr = g(0);
        var fontArr = g(7);
        if (fontArr.length > 0) {
            var hasFont = true;
        }
        if (p.isShowLoadingUI && p.bindingUI && p.bindingUI.uiID) {
            AssetManager.preLoadUIAsset(p.bindingUI.uiID, Callback.New(function () {
                var loadingUI = GameUI.show(p.bindingUI.uiID);
                doLoadAsset.apply(_this_1, [loadingUI]);
            }, this), true, true, true);
        }
        else {
            doLoadAsset.apply(this);
        }
        function onLoadComplete(displayProgressComp) {
            setProgressUI.apply(this, [displayProgressComp, 100]);
            Callback.New(function () {
                if (p.isShowLoadingUI && p.bindingUI)
                    GameUI.dispose(p.bindingUI.uiID);
                CommandPage.executeEvent(trigger);
            }, this).delayRun(100);
        }
        function doLoadAsset(loadingUI) {
            var _this_1 = this;
            var displayProgressComp = null;
            if (loadingUI && p.bindingUI && p.bindingUI.uiID && p.bindingUI.compName && p.bindingUI.varName) {
                displayProgressComp = loadingUI[p.bindingUI.compName];
                if (!displayProgressComp) {
                    trace("\u9884\u8F7D\u5165\u4E8B\u4EF6\u53C2\u6570\u9519\u8BEF\uFF0C\u627E\u4E0D\u5230\u7EC4\u4EF6\uFF1A" + p.bindingUI.compName);
                }
            }
            AssetManager.batchPreLoadAsset(Callback.New(function () {
                if (hasFont) {
                    AssetManager.preloadFonts(Callback.New(onLoadComplete, _this_1, [displayProgressComp]));
                }
                else {
                    onLoadComplete.apply(_this_1, [displayProgressComp]);
                }
            }, this, [1, true]), Callback.New(function (current, count) {
                if (hasFont)
                    count += 1;
                var progressStr = Math.floor(current * 100 / count).toString();
                setProgressUI.apply(_this_1, [displayProgressComp, progressStr]);
            }, this), imageArr, [], g(2), g(3), g(4), g(5), [], g(1), g(6));
        }
        function getAssetValues(assetType) {
            var dsArr = ArrayUtils.matchAttributes(p.preloadAssets, { assetType: assetType }, false);
            return ArrayUtils.getChildAttributeToCreateArray(dsArr, "asset" + assetType);
        }
        function setProgressUI(displayProgressComp, v) {
            if (!displayProgressComp)
                return;
            v = MathUtils.int(v);
            Tween.clearAll(displayProgressComp);
            var attrObj = {};
            attrObj[p.bindingUI.varName] = v;
            Tween.to(displayProgressComp, attrObj, 100);
        }
    }
    CommandExecute.customCommand_1 = customCommand_1;
    function customCommand_2(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var _this_1 = this;
        if (p.inputUI == 0)
            return;
        var inputUI = GameUI.show(p.inputUI);
        var inputText = inputUI["input"];
        if (inputText) {
            inputText.setTextForce(p.useVar == 1 ? Game.player.variable.getString(p.defTextVarID) : p.defText);
            inputText.focus = true;
            inputText.off(EventObject.ENTER, inputText, ____onInputEnter);
            inputText.on(EventObject.ENTER, inputText, ____onInputEnter, [p.inputUI]);
        }
        trigger.pause = true;
        inputUI.once(EventObject.REMOVED, this, function () {
            trigger.offset(1);
            Callback.CallLaterBeforeRender(function () {
                CommandPage.executeEvent.apply(_this_1, arguments);
            }, CommandPage, [trigger, [inputText ? inputText.text : ""]]);
        }, []);
    }
    CommandExecute.customCommand_2 = customCommand_2;
    function ____onInputEnter(uiID) {
        GameUI.hide(uiID);
    }
    var keyEventSigns = {};
    function customCommand_3(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var evType = (p.isMulKey == 1 || p.isMulKey == 3) ? p.evType2 : p.evType;
        var typeEvent = evType != 1 ? EventObject.KEY_DOWN : EventObject.KEY_UP;
        var f = function (p, trigger, sign, e) {
            var bool = false;
            if (p.isMulKey == 0) {
                bool = e.keyCode == p.key;
            }
            else if (p.isMulKey == 1) {
                bool = p.keys.indexOf(e.keyCode) != -1;
            }
            else if (p.isMulKey == 2) {
                var systemKeyName = GUI_Setting.SYSTEM_KEYS[p.systemKey];
                var systemKeyboardInfo = GUI_Setting.KEY_BOARD[systemKeyName];
                bool = systemKeyboardInfo.keys.indexOf(e.keyCode) != -1;
            }
            else {
                bool = false;
                for (var i = 0; i < p.systemKeys.length; i++) {
                    var systemKeyName = GUI_Setting.SYSTEM_KEYS[p.systemKeys[i]];
                    var systemKeyboardInfo = GUI_Setting.KEY_BOARD[systemKeyName];
                    bool = systemKeyboardInfo.keys.indexOf(e.keyCode) != -1;
                    if (bool)
                        break;
                }
            }
            if (p.isMulKey <= 1) {
                if (((p.CTRL && !e.ctrlKey) || (!p.CTRL && e.ctrlKey)) && e.keyCode != Keyboard.CONTROL)
                    bool = false;
                if (((p.SHIFT && !e.shiftKey) || (!p.SHIFT && e.shiftKey)) && e.keyCode != Keyboard.SHIFT)
                    bool = false;
                if (((p.ALT && !e.altKey) || (!p.ALT && e.altKey)) && e.keyCode != Keyboard.ALTERNATE)
                    bool = false;
            }
            var isNotKeyDown = (!(p.isMulKey == 1 || p.isMulKey == 3) && p.evType == 2);
            if ((isNotKeyDown && !bool) || (!isNotKeyDown && bool)) {
                if (p.type == 1) {
                    stage.off(typeEvent, trigger, arguments.callee);
                    if (sign)
                        delete keyEventSigns[sign];
                }
                CommandPage.startTriggerFragmentEvent(p.eventPage, Game.player.sceneObject, Game.player.sceneObject);
            }
        };
        if (p.recordListen && p.recordListenVar > 0) {
            var sign = ObjectUtils.getRandID();
            keyEventSigns[sign] = { typeEvent: typeEvent, thisPtr: trigger, func: f };
            Game.player.variable.setString(p.recordListenVar, sign);
        }
        stage.on(typeEvent, trigger, f, [p, trigger, sign]);
        if (p.type == 2) {
            EventUtils.addEventListener(trigger, CommandTrigger.EVENT_OVER, Callback.New(function (typeEvent, trigger, f, sign) {
                stage.off(typeEvent, trigger, f);
                if (sign)
                    delete keyEventSigns[sign];
            }, this, [typeEvent, trigger, f, sign]), true);
        }
    }
    CommandExecute.customCommand_3 = customCommand_3;
    var mouseEventSigns = {};
    function customCommand_4(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var typeEvent = MouseControl.mouseEvents[p.mouseType];
        var f = function (typeEvent, p, trigger, sign, e) {
            if (e.type == typeEvent) {
                if (p.type == 1) {
                    stage.off(typeEvent, trigger, arguments.callee);
                    if (sign)
                        delete mouseEventSigns[sign];
                }
                CommandPage.startTriggerFragmentEvent(p.eventPage, Game.player.sceneObject, Game.player.sceneObject);
            }
        };
        if (p.recordListen && p.recordListenVar > 0) {
            var sign = ObjectUtils.getRandID();
            mouseEventSigns[sign] = { typeEvent: typeEvent, thisPtr: trigger, func: f };
            Game.player.variable.setString(p.recordListenVar, sign);
        }
        if (p.onlyInScene) {
            MouseControl.eventDispatcher.on(typeEvent, trigger, f, [typeEvent, p, trigger, sign]);
        }
        else {
            stage.on(typeEvent, trigger, f, [typeEvent, p, trigger, sign]);
        }
        if (p.type == 2) {
            EventUtils.addEventListener(trigger, CommandTrigger.EVENT_OVER, Callback.New(function (onlyInScene, typeEvent, trigger, f, sign) {
                if (p.onlyInScene) {
                    MouseControl.eventDispatcher.off(typeEvent, trigger, f);
                }
                else {
                    stage.off(typeEvent, trigger, f);
                }
                if (sign)
                    delete mouseEventSigns[sign];
            }, this, [p.onlyInScene, typeEvent, trigger, f, sign]), true);
        }
    }
    CommandExecute.customCommand_4 = customCommand_4;
    function customCommand_5(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var uiID = p.useVar ? Game.player.variable.getVariable(p.uiIDvarID) : p.uiID;
        var ui = GameUI.get(uiID);
        if (!ui)
            return;
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
        else {
            var compName = p.compNameUseVar ? Game.player.variable.getString(p.compNameVarID) : p.compName;
            var comp = ui[compName];
            if (!comp)
                return;
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
        function setSafeValue(obj, attrName, newValue) {
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
    CommandExecute.customCommand_5 = customCommand_5;
    var ____uiButtonFocus = {};
    function customCommand_6(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var uiID = p.useVar ? Game.player.variable.getVariable(p.uiIDVarID) : p.uiID;
        var ui = GameUI.get(uiID);
        if (!ui || !ui.stage)
            return;
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
        var btnFocusManager = ____uiButtonFocus[sign];
        if (btnFocusManager) {
            btnFocusManager.shortcutKeyExit = p.shortcutKeyExit;
            btnFocusManager.whenExitBackLastFocus = p.whenExitBackLastFocus;
            btnFocusManager.whenExitEvent = p.whenExitEvent;
        }
        else {
            btnFocusManager = ____uiButtonFocus[sign] = new FocusButtonsManager(ui, p.isAutoFocus, p.isAddButton ? p.addButtons : [], p.isExcludeButton ? p.excludeButtons : [], p.selEffectUI, p.useFocusAnimation, p.shortcutKeyExit, p.whenExitBackLastFocus);
            btnFocusManager.whenExitEvent = p.whenExitEvent;
            ui.once(GameSprite.ON_DISPOSE, this, function (sign, btnFocusManager) {
                delete ____uiButtonFocus[sign];
                btnFocusManager.dispose();
            }, [sign, btnFocusManager]);
        }
        if (btnFocusManager.buttons.length == 0)
            return;
        FocusButtonsManager.focus = btnFocusManager;
        if (p.setSelectedIndex && FocusButtonsManager.focus) {
            FocusButtonsManager.focus.selectedIndex = p.selectedIndex;
        }
    }
    CommandExecute.customCommand_6 = customCommand_6;
    function customCommand_7(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (p.focusType == 0 || p.focusType == 2) {
            FocusButtonsManager.focus = null;
        }
        if (p.focusType == 1 || p.focusType == 2) {
            UIList.focus = null;
        }
    }
    CommandExecute.customCommand_7 = customCommand_7;
    function customCommand_8(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var sign = Game.player.variable.getString(p.recordListenVar);
        if (sign) {
            var keyInfo = keyEventSigns[sign];
            if (keyInfo) {
                stage.off(keyInfo.typeEvent, keyInfo.thisPtr, keyInfo.func);
            }
        }
    }
    CommandExecute.customCommand_8 = customCommand_8;
    function customCommand_9(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var sign = Game.player.variable.getString(p.recordListenVar);
        if (sign) {
            var mouseInfo = mouseEventSigns[sign];
            if (mouseInfo) {
                stage.off(mouseInfo.typeEvent, mouseInfo.thisPtr, mouseInfo.func);
                MouseControl.eventDispatcher.off(mouseInfo.typeEvent, mouseInfo.thisPtr, mouseInfo.func);
            }
        }
    }
    CommandExecute.customCommand_9 = customCommand_9;
    function customCommand_10(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (p.isMulKey == 0) {
            simulateKey(p.key);
        }
        else {
            var systemKeyName = GUI_Setting.SYSTEM_KEYS[p.systemKey];
            var systemKeyboardInfo = GUI_Setting.KEY_BOARD[systemKeyName];
            var realKeyCode = systemKeyboardInfo.keys[0];
            if (!realKeyCode)
                return;
            simulateKey(realKeyCode);
        }
        function simulateKey(key) {
            if (p.evType <= 1) {
                var e = new EventObject;
                e.type = [EventObject.KEY_DOWN, EventObject.KEY_UP][p.evType];
                var oe = new KeyboardEvent(e.type, { ctrlKey: p.CTRL, shiftKey: p.SHIFT, altKey: p.ALT });
                e.nativeEvent = oe;
                e.keyCode = key;
                stage.event(e.type, [e]);
            }
            else if (p.evType == 2) {
                var e = new EventObject;
                e.type = EventObject.KEY_DOWN;
                var oe = new KeyboardEvent(e.type, { ctrlKey: p.CTRL, shiftKey: p.SHIFT, altKey: p.ALT });
                e.nativeEvent = oe;
                e.keyCode = key;
                stage.event(EventObject.KEY_DOWN, [e]);
                setTimeout(function () {
                    var e = new EventObject;
                    e.type = EventObject.KEY_UP;
                    var oe = new KeyboardEvent(e.type, { ctrlKey: p.CTRL, shiftKey: p.SHIFT, altKey: p.ALT });
                    e.nativeEvent = oe;
                    e.keyCode = key;
                    stage.event(e.type, [e]);
                }, p.interval);
            }
        }
    }
    CommandExecute.customCommand_10 = customCommand_10;
    function customCommand_11(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var inputMessages = [];
        for (var i = 0; i < p.messages.length; i++) {
            var d = p.messages[i];
            var f;
            var v;
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
    CommandExecute.customCommand_11 = customCommand_11;
    function customCommand_1001(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth)
            return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight)
            return;
        var state = p.on == 0 ? 1 : 0;
        var dataLayerIndex = p.layer;
        Game.currentScene.setDataGridState(dataLayerIndex, xGrid, yGrid, state);
    }
    CommandExecute.customCommand_1001 = customCommand_1001;
    function customCommand_1002(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layer;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer || !layer.drawMode)
            return;
        var tileData = TileData.getTileData(p.tileID);
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth)
            return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight)
            return;
        var tex = AssetManager.getImage(tileData.url);
        if (!tex)
            return;
        var texGridW = Math.floor(tex.width / Config.SCENE_GRID_SIZE);
        var texGridH = Math.floor(tex.height / Config.SCENE_GRID_SIZE);
        if (p.sourceX < 0 || p.sourceX >= texGridW || p.sourceY < 0 || p.sourceY >= texGridH)
            return;
        layer.drawTile(xGrid, yGrid, { tex: tex, texID: p.tileID, x: p.sourceX * Config.SCENE_GRID_SIZE, y: p.sourceY * Config.SCENE_GRID_SIZE, w: Config.SCENE_GRID_SIZE, h: Config.SCENE_GRID_SIZE });
        Callback.CallLaterBeforeRender(layer.flushTile, layer);
    }
    CommandExecute.customCommand_1002 = customCommand_1002;
    function customCommand_1003(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layer;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer || !layer.drawMode)
            return;
        var tileData = AutoTileData.getAutoTileData(p.autoTileID);
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth)
            return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight)
            return;
        var tex = AssetManager.getImage(tileData.url);
        if (!tex)
            return;
        layer.drawAutoTile(xGrid, yGrid, p.autoTileID, tex);
        Callback.CallLaterBeforeRender(layer.flushTile, layer);
    }
    CommandExecute.customCommand_1003 = customCommand_1003;
    function customCommand_1004(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layer;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer || !layer.drawMode)
            return;
        if (p.type) {
            layer.clearTile();
            return;
        }
        var xGrid = p.useVar ? Game.player.variable.getVariable(p.xVarID) : p.x;
        var yGrid = p.useVar ? Game.player.variable.getVariable(p.yVarID) : p.y;
        if (xGrid < 0 || xGrid >= Game.currentScene.gridWidth)
            return;
        if (yGrid < 0 || yGrid >= Game.currentScene.gridHeight)
            return;
        layer.drawTile(xGrid, yGrid, null);
        Callback.CallLaterBeforeRender(layer.flushTile, layer);
    }
    CommandExecute.customCommand_1004 = customCommand_1004;
    function customCommand_1005(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var layerID = p.layerUseVar ? Game.player.variable.getVariable(p.layerVarID) : p.layerID;
        var layer = Game.currentScene.getLayerByPreset(layerID);
        if (!layer)
            return;
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
    CommandExecute.customCommand_1005 = customCommand_1005;
    function customCommand_1006(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        if (p.useType == 0) {
            var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.soIndex, p.useVar, p.soIndexVarID, trigger);
            if (!soc)
                return;
            soc.playAnimation(p.aniID, false, true);
        }
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
            if (x < 0 || x >= Game.currentScene.width || y < 0 || y >= Game.currentScene.height)
                return;
            var layer = p.layer == 1 ? Game.currentScene.animationHighLayer : Game.currentScene.animationLowLayer;
            var ani = new GCAnimation();
            ani.showHitEffect = true;
            ani.once(GCAnimation.PLAY_COMPLETED, this, function (ani) {
                ani.dispose();
            }, [ani]);
            ani.id = p.aniUseVar ? Game.player.variable.getVariable(p.aniIDVarID) : p.aniID;
            ani.play();
            ani.x = x;
            ani.y = y;
            layer.addChild(ani);
        }
    }
    CommandExecute.customCommand_1006 = customCommand_1006;
    function customCommand_1007(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var _this_1 = this;
        if (!Game.currentScene)
            return;
        if (p.useTrans) {
            var transData_1 = GameUtils.getTransData(p.trans);
            var sx_1 = p.scaleXUseVar == 1 ? Game.player.variable.getVariable(p.scaleX2) : p.scaleX;
            var sy_1 = p.scaleYUseVar == 1 ? Game.player.variable.getVariable(p.scaleY2) : p.scaleY;
            var oldsx_1 = Game.currentScene.camera.scaleX;
            var oldsy_1 = Game.currentScene.camera.scaleY;
            var frameCount_1 = p.time;
            var scene_1 = Game.currentScene;
            var f = void 0;
            os.add_ENTERFRAME(f = function (f) {
                if (Game.pause)
                    return;
                if (scene_1 != Game.currentScene) {
                    os.remove_ENTERFRAME(f, _this_1);
                    return;
                }
                frameCount_1--;
                var per = (p.time - frameCount_1) / p.time;
                var value = GameUtils.getValueByTransData(transData_1, per);
                if (p.useScaleX) {
                    Game.currentScene.camera.scaleX = (sx_1 - oldsx_1) * value + oldsx_1;
                }
                if (p.useScaleY) {
                    Game.currentScene.camera.scaleY = (sy_1 - oldsy_1) * value + oldsy_1;
                }
                if (frameCount_1 == 0) {
                    os.remove_ENTERFRAME(f, _this_1);
                }
            }, this, [f]);
        }
        else {
            if (p.useScaleX) {
                var sx = p.scaleXUseVar == 1 ? Game.player.variable.getVariable(p.scaleX2) : p.scaleX;
                Game.currentScene.camera.scaleX = sx;
            }
            if (p.useScaleY) {
                var sy = p.scaleYUseVar == 1 ? Game.player.variable.getVariable(p.scaleY2) : p.scaleY;
                Game.currentScene.camera.scaleY = sy;
            }
        }
    }
    CommandExecute.customCommand_1007 = customCommand_1007;
    function customCommand_1008(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var _this_1 = this;
        if (!Game.currentScene)
            return;
        var ro = p.useVar ? Game.player.variable.getVariable(p.rotationVarID) : p.rotation;
        if (p.useTrans) {
            var transData_2 = GameUtils.getTransData(p.trans);
            var oldro_1 = Game.currentScene.camera.rotation;
            var frameCount_2 = p.time;
            var scene_2 = Game.currentScene;
            var f = void 0;
            os.add_ENTERFRAME(f = function (f) {
                if (Game.pause)
                    return;
                if (scene_2 != Game.currentScene) {
                    os.remove_ENTERFRAME(f, _this_1);
                    return;
                }
                frameCount_2--;
                var per = (p.time - frameCount_2) / p.time;
                var value = GameUtils.getValueByTransData(transData_2, per);
                Game.currentScene.camera.rotation = (ro - oldro_1) * value + oldro_1;
                if (frameCount_2 == 0) {
                    os.remove_ENTERFRAME(f, _this_1);
                }
            }, this, [f]);
        }
        else {
            Game.currentScene.camera.rotation = ro;
        }
    }
    CommandExecute.customCommand_1008 = customCommand_1008;
    function customCommand_2001(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var v = p.useVar ? Game.player.variable.getVariable(p.goldVarID) : p.gold;
        ProjectPlayer.increaseGold(p.symbol == 0 ? v : -v);
    }
    CommandExecute.customCommand_2001 = customCommand_2001;
    function customCommand_2002(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var itemID = p.useVar1 ? Game.player.variable.getVariable(p.itemIDVarID) : p.itemID;
        var num = p.useVar2 ? Game.player.variable.getVariable(p.numVarID) : p.num;
        ProjectPlayer.changeItemNumber(itemID, p.symbol == 0 ? num : -num, false);
    }
    CommandExecute.customCommand_2002 = customCommand_2002;
    function customCommand_2003(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var _this_1 = this;
        var sceneID = p.sceneID;
        var soIndexID = p.useVar ? Game.player.variable.getVariable(p.noVarID) : p.no;
        var toScene = Game.currentScene;
        if (!toScene)
            return;
        trigger.pause = true;
        var syncState = 0;
        ProjectClientScene.createSceneHelper(sceneID, Callback.New(function (toScene, soIndexID, p, fromScene, isSync) {
            if (Game.currentScene == toScene) {
                var posP = p.posUseVar ? new Point(Game.player.variable.getVariable(p.xVarID), Game.player.variable.getVariable(p.yVarID)) : new Point(p.x, p.y);
                if (p.isGrid) {
                    posP = GameUtils.getGridCenterByGrid(posP);
                }
                var persetSceneObject = {
                    x: posP.x,
                    y: posP.y
                };
                var newSoc = toScene.addSceneObjectFromClone(fromScene.id, soIndexID, true, persetSceneObject);
                if (newSoc instanceof ProjectClientSceneObject) {
                    newSoc.settingX = posP.x;
                    newSoc.settingY = posP.y;
                }
                if (p.newSoIndex > 0)
                    Game.player.variable.setVariable(p.newSoIndex, newSoc.index);
                var eventCB = null;
                if (p.waitEventComplete) {
                    eventCB = Callback.New(function () {
                        continueExecute(trigger);
                    }, _this_1);
                }
                CommandPage.startTriggerFragmentEvent(p.newSoExecuteEvent, trigger.trigger, newSoc, eventCB);
            }
            if (!p.waitEventComplete) {
                continueExecute(trigger);
            }
        }, this, [toScene, soIndexID, p]));
        syncState = 1;
        function continueExecute(trigger) {
            if (syncState == 0) {
                trigger.pause = false;
            }
            else {
                trigger.offset(1);
                CommandPage.executeEvent(trigger);
            }
        }
    }
    CommandExecute.customCommand_2003 = customCommand_2003;
    function customCommand_2004(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType + 1, p.no, p.useVar, p.noVarID, trigger);
        if (soc && soc.isCopy && soc == trigger.executor) {
            trigger.cmdReturn = true;
            trigger["commandScope"].length = 1;
        }
        Callback.CallLaterBeforeRender(function (soc) {
            if (soc && soc.isCopy)
                soc.dispose();
        }, this, [soc]);
    }
    CommandExecute.customCommand_2004 = customCommand_2004;
    function customCommand_2005(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType + 1, p.no, p.useVar, p.noVarID, trigger);
        if (soc && soc.inScene)
            Game.currentScene.removeSceneObject(soc, false);
    }
    CommandExecute.customCommand_2005 = customCommand_2005;
    function customCommand_2006(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc && soc.isMoving)
            soc.stopMove();
    }
    CommandExecute.customCommand_2006 = customCommand_2006;
    function customCommand_2007(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc)
            soc.recordMoveRoadInfo = soc.getRecordMoveState();
    }
    CommandExecute.customCommand_2007 = customCommand_2007;
    function customCommand_2008(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            soc.restoryMove(soc.recordMoveRoadInfo);
            soc.recordMoveRoadInfo = null;
        }
    }
    CommandExecute.customCommand_2008 = customCommand_2008;
    function customCommand_2009(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            if (p.varType == 0) {
                var value = p.valueUseVar == 1 ? Game.player.variable.getVariable(p.value0VarID) : p.value0;
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
    CommandExecute.customCommand_2009 = customCommand_2009;
    function customCommand_2010(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        if (p.varType == 0) {
            var value = p.valueUseVar == 1 ? Game.player.variable.getVariable(p.value0VarID) : p.value0;
        }
        else if (p.varType == 1) {
            value = p.valueUseVar == 1 ? Game.player.variable.getSwitch(p.value1VarID) : p.value1 == 0 ? true : false;
        }
        else {
            value = p.valueUseVar == 1 ? Game.player.variable.getString(p.value2VarID) : p.value2;
        }
        Game.player.data[p.varName] = value;
    }
    CommandExecute.customCommand_2010 = customCommand_2010;
    function customCommand_2011(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            var partID = p.partID;
            var newAvatarID = p.newPartUseVar ? Game.player.variable.getVariable(p.newPartVarID) : p.newPart;
            soc.avatar.changePartByAvatarID(newAvatarID, partID);
        }
    }
    CommandExecute.customCommand_2011 = customCommand_2011;
    function customCommand_2012(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        trigger.pause = true;
        GameUI.load(12);
        var gui = GameUI.get(12);
        gui.shopEventData = p;
        gui.once(EventObject.UNDISPLAY, this, function () {
            gui.shopEventData = null;
            trigger.offset(1);
            CommandPage.executeEvent(trigger);
        });
        GameUI.show(12);
    }
    CommandExecute.customCommand_2012 = customCommand_2012;
    function customCommand_2013(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            soc.clearBehaviors();
            soc.stopBehavior();
        }
    }
    CommandExecute.customCommand_2013 = customCommand_2013;
    function customCommand_4001(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        WorldData.playCtrlEnabled = true;
    }
    CommandExecute.customCommand_4001 = customCommand_4001;
    function customCommand_4002(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        WorldData.playCtrlEnabled = false;
    }
    CommandExecute.customCommand_4002 = customCommand_4002;
    function customCommand_4003(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        WorldData.menuEnabled = true;
    }
    CommandExecute.customCommand_4003 = customCommand_4003;
    function customCommand_4004(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        WorldData.menuEnabled = false;
    }
    CommandExecute.customCommand_4004 = customCommand_4004;
    var callNewGame = false;
    function customCommand_4005(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (callNewGame)
            return;
        callNewGame = true;
        SinglePlayerGame.newGame();
    }
    CommandExecute.customCommand_4005 = customCommand_4005;
    function customCommand_4006(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (p.saveType == 0) {
            trigger.pause = true;
            trigger.offset(1);
            SinglePlayerGame.saveGlobalData(Callback.New(function () {
                CommandPage.executeEvent(trigger);
            }, this));
        }
        else if (p.saveType == 1) {
            if (GUI_SaveFileManager.currentSveFileIndexInfo) {
                trigger.offset(1);
                GUI_SaveFileManager.saveFile(GUI_SaveFileManager.currentSveFileIndexInfo.id, p.silenceMode ? false : true, Callback.New(function () {
                    CommandPage.executeEvent(trigger);
                }, this), true);
                trigger.pause = true;
            }
        }
        else {
            var saveID = p.saveID;
            trigger.offset(1);
            GUI_SaveFileManager.saveFile(saveID, p.silenceMode ? false : true, Callback.New(function () {
                CommandPage.executeEvent(trigger);
            }, this), true);
            trigger.pause = true;
        }
    }
    CommandExecute.customCommand_4006 = customCommand_4006;
    function customCommand_4007(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
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
    CommandExecute.customCommand_4007 = customCommand_4007;
    function customCommand_4008(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        window.location.reload();
    }
    CommandExecute.customCommand_4008 = customCommand_4008;
    function customCommand_4009(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        Game.pause = true;
    }
    CommandExecute.customCommand_4009 = customCommand_4009;
    function customCommand_4010(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        Game.pause = false;
    }
    CommandExecute.customCommand_4010 = customCommand_4010;
    function customCommand_4011(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        os.closeWindow();
    }
    CommandExecute.customCommand_4011 = customCommand_4011;
    function customCommand_4012(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        WorldData.dialogSEEnabled = p.dialogSE == 0 ? true : false;
    }
    CommandExecute.customCommand_4012 = customCommand_4012;
    function customCommand_8001(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.soUseVar, p.noVarID, trigger);
        if (soc) {
            var moduleID = p.valueUseVar ? Game.player.variable.getVariable(p.valueVarID) : p.value;
            if (p.symbol == 0)
                soc.addModuleByID(moduleID);
            else
                soc.removeModuleByID(moduleID);
        }
    }
    CommandExecute.customCommand_8001 = customCommand_8001;
    function customCommand_8002(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        if (!Game.currentScene)
            return;
        var soc = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.noVarID, trigger);
        if (soc) {
            var moduleID = p.moduleIDUseVar ? Game.player.variable.getVariable(p.moduleIDVarID) : p.moduleID;
            var soModule = soc.getModule(moduleID);
            if (soModule) {
                if (p.varType == 0) {
                    var value = p.valueUseVar == 1 ? Game.player.variable.getVariable(p.value0VarID) : p.value0;
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
    CommandExecute.customCommand_8002 = customCommand_8002;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=CustomCommand1.js.map