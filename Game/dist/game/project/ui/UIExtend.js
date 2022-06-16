EventUtils.addEventListener(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, Callback.New(uiComponentInit, this, [false]));
function uiComponentInit(isRoot, uiComp) {
    var hasMouseEvent = false;
    var hasCommandName = isRoot ? "hasRootCommand" : "hasCommand";
    var allEvents = [
        EventObject.CLICK,
        EventObject.MOUSE_OVER,
        EventObject.MOUSE_OUT,
        EventObject.DISPLAY,
        EventObject.UNDISPLAY,
        EventObject.MOUSE_DOWN,
        EventObject.MOUSE_UP,
        EventObject.DOUBLE_CLICK,
        EventObject.MOUSE_MOVE,
        EventObject.RIGHT_MOUSE_DOWN,
        EventObject.RIGHT_MOUSE_UP,
        EventObject.RIGHT_CLICK
    ];
    for (var i = 0; i < 12; i++) {
        var hasCommand = uiComp[hasCommandName][i];
        if (hasCommand) {
            if (i != 3 && i != 4) {
                hasMouseEvent = true;
            }
            if (i == 1)
                continue;
            var evType = allEvents[i];
            uiComp.on(evType, uiComp, function (uiComp, i) {
                if (i == 3 && !uiComp.visible)
                    return;
                else if (i == 4 && !uiComp.visible)
                    return;
                var commandInputMessage;
                if (uiComp.commandInputMessage instanceof Callback) {
                    commandInputMessage = uiComp.commandInputMessage.run();
                }
                else {
                    commandInputMessage = uiComp.commandInputMessage;
                }
                GameCommand.startUICommand(uiComp, i, commandInputMessage);
            }, [uiComp, i]);
        }
    }
    if (hasMouseEvent) {
        var p = uiComp;
        while (p) {
            p.mouseEnabled = true;
            if (p == uiComp.guiRoot) {
                break;
            }
            p = p.parent;
        }
    }
    if (uiComp instanceof UIButton || uiComp[hasCommandName][1]) {
        uiComp.on(EventObject.MOUSE_OVER, uiComp, function (uiComp) {
            if (uiComp instanceof UIButton && FocusButtonsManager.inFocusState(uiComp) == 1) {
                GameAudio.playSE(ClientWorld.data.selectSE);
                FocusButtonsManager.setFocusButton(uiComp);
            }
            if (uiComp[hasCommandName][1]) {
                var commandInputMessage;
                if (uiComp.commandInputMessage instanceof Callback) {
                    commandInputMessage = uiComp.commandInputMessage.run();
                }
                else {
                    commandInputMessage = uiComp.commandInputMessage;
                }
                GameCommand.startUICommand(uiComp, 1, commandInputMessage);
            }
        }, [uiComp]);
    }
    if (uiComp[hasCommandName][3] || uiComp[hasCommandName][4]) {
        uiComp.on(UIBase.ON_VISIBLE_CHANGE, uiComp, function () {
            var commandInputMessage;
            if (uiComp.commandInputMessage instanceof Callback) {
                commandInputMessage = uiComp.commandInputMessage.run();
            }
            else {
                commandInputMessage = uiComp.commandInputMessage;
            }
            if (uiComp[hasCommandName][3] && uiComp.visible) {
                GameCommand.startUICommand(uiComp, 3, commandInputMessage);
            }
            else if (uiComp[hasCommandName][4] && !uiComp.visible) {
                GameCommand.startUICommand(uiComp, 4, commandInputMessage);
            }
        });
    }
}
EventUtils.addEventListener(GameUI, GameUI.EVENT_CREATE_UI, Callback.New(function (ui) {
    uiComponentInit.apply(ui, [true, ui]);
}, this));
var ___lastListFocus;
var ___lastButtonsFocus;
var ___lastFocusIsList = false;
var ___isRecordFoucs = false;
var playDialogSEEnabled = false;
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_DIALOG_START, Callback.New(function (isOption, content, options, name, head, expression, audioURL, speed) {
    if (!___isRecordFoucs) {
        if (UIList.focus) {
            ___lastListFocus = UIList.focus;
            UIList.focus = null;
            ___lastFocusIsList = true;
            ___isRecordFoucs = true;
        }
        else if (FocusButtonsManager.focus) {
            ___lastFocusIsList = false;
            ___isRecordFoucs = true;
            ___lastButtonsFocus = FocusButtonsManager.focus;
        }
    }
    playDialogSEEnabled = !isOption && speed != 5;
}, this));
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_AFTER_DIALOG_START, Callback.New(function (isOption) {
    if (isOption) {
        var optionList = GameDialog.lastDialog.optionList;
        optionList.selectedImageAlpha = 1;
        optionList.overImageAlpha = 1;
        if (optionList["___onSelected"])
            optionList.off(EventObject.CHANGE, optionList, optionList["___onSelected"]);
        var f = function (state) {
            if (state == 0) {
                var optionBtns = GameDialog.lastDialog.optionUIs;
                if (!optionBtns)
                    return;
                for (var i = 0; i < optionBtns.length; i++) {
                    var optionSp = optionList.getItemUI(i);
                    var btn = optionBtns[i];
                    var e = new EventObject();
                    e.target = btn;
                    if (i == optionList.selectedIndex) {
                        optionSp.event(EventObject.MOUSE_OVER, [i]);
                        btn.event(EventObject.MOUSE_OVER, [e]);
                    }
                    else {
                        optionSp.event(EventObject.MOUSE_OUT, [i]);
                        btn.event(EventObject.MOUSE_OUT, [e]);
                    }
                }
            }
        };
        optionList.on(EventObject.CHANGE, optionList, f);
        optionList["___onSelected"] = f;
        f(0);
    }
}, this));
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_DIALOG_END, Callback.New(function (gameDialog) {
    if (___lastFocusIsList) {
        UIList.focus = ___lastListFocus;
        ___lastListFocus = null;
    }
    else {
        FocusButtonsManager.focus = ___lastButtonsFocus;
        ___lastButtonsFocus = null;
    }
    ___isRecordFoucs = false;
}, this));
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_DIALOG_WORD_PLAY, Callback.New(function () {
    if (playDialogSEEnabled && WorldData.dialogSEEnabled)
        GameAudio.playSE(ClientWorld.data.dialogSE);
}, this));
(function () {
    var ani = null;
    EventUtils.addEventListener(UIList, UIList.EVENT_FOCUS_CHANGE, Callback.New(function (lastFocus, currentFocus) {
        if (!ani && WorldData.uiCompFocusAnimation) {
            ani = new GCAnimation;
            ani.id = WorldData.uiCompFocusAnimation;
            ani.loop = true;
        }
        if (!ani)
            return;
        if (currentFocus && (!GameDialog.lastDialog || (GameDialog.lastDialog && !currentFocus.isInherit(GameDialog.lastDialog)))) {
            ani.target = currentFocus.selectedImage;
            ani.play();
        }
        else {
            ani.stop(ani.currentFrame);
        }
    }, this));
})();
var UIListOnListKeyDown = UIList["onListKeyDown"];
UIList["onListKeyDown"] = function (e) {
    if (!this._focus || !this._focus.stage)
        return;
    var keyCode = e.keyCode;
    var lastIndex = this._focus.selectedIndex;
    UIListOnListKeyDown.apply(this, arguments);
    if (UIList.KEY_LEFT.indexOf(keyCode) != -1 || UIList.KEY_RIGHT.indexOf(keyCode) != -1 ||
        UIList.KEY_UP.indexOf(keyCode) != -1 || UIList.KEY_DOWN.indexOf(keyCode) != -1) {
        if (lastIndex != this._focus.selectedIndex) {
            GameAudio.playSE(ClientWorld.data.selectSE);
        }
    }
};
var UIListitemInit = UIList.prototype["itemInit"];
UIList.prototype["itemInit"] = function (ui, data, index) {
    var _this_1 = this;
    ui.on(EventObject.MOUSE_DOWN, this, function (ui, data, index) {
        if (_this_1.selectedItem != data) {
            GameAudio.playSE(ClientWorld.data.selectSE);
        }
    }, [ui, data, index]);
    UIListitemInit.apply(this, arguments);
};
//# sourceMappingURL=UIExtend.js.map