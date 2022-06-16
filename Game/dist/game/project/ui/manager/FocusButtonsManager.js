var FocusButtonsManager = (function () {
    function FocusButtonsManager(ui, isAutoFocus, addButtons, excludeButtons, selEffectUIID, useFocusAnimation, shortcutKeyExit, whenExitBackLastFocus) {
        if (shortcutKeyExit === void 0) { shortcutKeyExit = false; }
        if (whenExitBackLastFocus === void 0) { whenExitBackLastFocus = false; }
        this.keyDownEnter = false;
        this.keyDownEsc = false;
        this.buttons = [];
        this.btnInfos = [];
        this.ui = ui;
        var buttons = this.buttons;
        if (isAutoFocus) {
            for (var i = 0; i < ui.numChildren; i++) {
                var comp = ui.getChildAt(i);
                if (comp instanceof UIButton && comp.visible)
                    buttons.push(comp);
            }
        }
        for (var i = 0; i < addButtons.length; i++) {
            var buttonName = addButtons[i];
            comp = ui[buttonName];
            if (comp && comp instanceof UIButton && comp.visible)
                buttons.push(comp);
        }
        for (var i = 0; i < excludeButtons.length; i++) {
            var buttonName = excludeButtons[i];
            comp = ui[buttonName];
            if (comp && comp instanceof UIButton) {
                var idx = buttons.indexOf(comp);
                if (idx != -1)
                    buttons.splice(idx, 1);
            }
        }
        ArrayUtils.removeSameObject(buttons);
        if (buttons.length == 0)
            return;
        this.selEffectUI = GameUI.load(selEffectUIID, true);
        if (this.selEffectUI) {
            if (this.selEffectUI["target"])
                this.selEffectTargetComp = this.selEffectUI["target"];
            for (var i = 0; i < this.selEffectUI.numChildren; i++) {
                if (this.selEffectUI.getChildAt(i) instanceof UIBase) {
                    this.selEffectUI = this.selEffectUI.getChildAt(i);
                    break;
                }
            }
        }
        if (this.selEffectUI && this.selEffectTargetComp && useFocusAnimation && WorldData.uiCompFocusAnimation) {
            var uiCompFocusAnimation = this.uiCompFocusAnimation = new GCAnimation;
            uiCompFocusAnimation.id = WorldData.uiCompFocusAnimation;
            uiCompFocusAnimation.target = this.selEffectTargetComp;
            uiCompFocusAnimation.loop = true;
        }
        if (this.selEffectUI)
            this.selEffectUI.mouseEnabled = false;
        this.shortcutKeyExit = shortcutKeyExit;
        this.whenExitBackLastFocus = whenExitBackLastFocus;
    }
    FocusButtonsManager.init = function () {
        if (this.inited)
            return;
        this.inited = true;
        EventUtils.addEventListener(UIList, UIList.EVENT_FOCUS_CHANGE, Callback.New(function (lastFocus, currentFocus) {
            if (currentFocus && FocusButtonsManager._focus) {
                FocusButtonsManager._focus.deactivate();
                FocusButtonsManager._focus = null;
            }
        }, this));
    };
    Object.defineProperty(FocusButtonsManager, "focus", {
        get: function () {
            return FocusButtonsManager._focus;
        },
        set: function (btnFocusManager) {
            if (!WorldData.focusEnabled)
                return;
            FocusButtonsManager.init();
            UIList.focus = null;
            var lastFocus = FocusButtonsManager._focus;
            if (lastFocus) {
                lastFocus.deactivate();
                FocusButtonsManager._focus = null;
            }
            if (btnFocusManager) {
                FocusButtonsManager._focus = btnFocusManager;
                btnFocusManager.activate(lastFocus);
            }
        },
        enumerable: false,
        configurable: true
    });
    FocusButtonsManager.closeFocus = function () {
        if (FocusButtonsManager.focus) {
            if (FocusButtonsManager.focus.selEffectUI)
                FocusButtonsManager.focus.selEffectUI.removeSelf();
            FocusButtonsManager.focus.selBtn = null;
            FocusButtonsManager.focus.deactivate();
            FocusButtonsManager.focus = null;
        }
    };
    FocusButtonsManager.inFocusState = function (btn) {
        if (!FocusButtonsManager.focus || FocusButtonsManager.focus.buttons.indexOf(btn) == -1)
            return 0;
        return FocusButtonsManager.focus.selBtn.btn == btn ? 2 : 1;
    };
    FocusButtonsManager.setFocusButton = function (btn) {
        if (!FocusButtonsManager.focus)
            return true;
        var selBtnInfo = ArrayUtils.matchAttributes(FocusButtonsManager.focus.btnInfos, { btn: btn }, true)[0];
        if (selBtnInfo)
            FocusButtonsManager.focus.selectButton(selBtnInfo);
    };
    FocusButtonsManager.prototype.dispose = function () {
        if (this.uiCompFocusAnimation)
            this.uiCompFocusAnimation.dispose();
        if (this.selEffectUI)
            this.selEffectUI.dispose();
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
    };
    Object.defineProperty(FocusButtonsManager.prototype, "selectedIndex", {
        get: function () {
            if (!this.selBtn)
                return -1;
            return this.realButtons.indexOf(this.selBtn.btn);
        },
        set: function (v) {
            if (FocusButtonsManager.focus != this)
                return;
            this.selectButton(this.btnInfos[v]);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FocusButtonsManager.prototype, "realButtons", {
        get: function () {
            var buttons = this.buttons.concat();
            for (var i = 0; i < buttons.length; i++) {
                var btn = buttons[i];
                if (!btn.stage || !btn.visible) {
                    buttons.splice(i, 1);
                    continue;
                }
            }
            return buttons;
        },
        enumerable: false,
        configurable: true
    });
    FocusButtonsManager.prototype.selectButton = function (selBtnInfo) {
        if (this.selBtn) {
            var e = new EventObject;
            e.type = EventObject.MOUSE_OUT;
            e.target = this.selBtn.btn;
            this.selBtn.btn.event(EventObject.MOUSE_OUT, [e]);
        }
        this.selBtn = selBtnInfo;
        if (!selBtnInfo || !selBtnInfo.btn)
            return;
        if (this.selEffectTargetComp) {
            this.selEffectTargetComp.width = selBtnInfo.btn.width;
            this.selEffectTargetComp.height = selBtnInfo.btn.height;
        }
        else if (this.selEffectUI) {
            this.selEffectUI.width = selBtnInfo.btn.width;
            this.selEffectUI.height = selBtnInfo.btn.height;
        }
        if (this.selEffectUI) {
            selBtnInfo.btn.addChildAt(this.selEffectUI, 1);
        }
        var e = new EventObject;
        e.type = EventObject.MOUSE_OVER;
        e.target = selBtnInfo.btn;
        selBtnInfo.btn.event(EventObject.MOUSE_OVER, [e]);
    };
    FocusButtonsManager.prototype.activate = function (lastFocus) {
        var _this_1 = this;
        if (lastFocus === void 0) { lastFocus = null; }
        var buttons = this.realButtons;
        var ui = this.ui;
        if (ui.isDisposed || !ui.stage)
            return;
        var btnInfos = this.btnInfos = [];
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var btnPos = ui.globalToLocal(btn.localToGlobal(new Point(0, 0)));
            btnInfos.push({ btn: btn, btnPos: btnPos });
        }
        if (!this.selBtn || !this.selBtn.btn.isInherit(ui)) {
            btnInfos.sort(function (a, b) {
                if (a.btnPos.y == b.btnPos.y)
                    return a.btnPos.x < b.btnPos.x ? -1 : 1;
                return a.btnPos.y < b.btnPos.y ? -1 : 1;
            });
            var selBtnInfo = btnInfos[0];
            this.selectButton(selBtnInfo);
        }
        var idx = ArrayUtils.matchAttributes(btnInfos, { btn: this.selBtn.btn }, true, "==", true)[0];
        this.selBtn = btnInfos[idx];
        if (this.uiCompFocusAnimation)
            this.uiCompFocusAnimation.play();
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        stage.off(EventObject.KEY_UP, this, this.onKeyUp);
        stage.on(EventObject.KEY_UP, this, this.onKeyUp);
        if (lastFocus && this.whenExitBackLastFocus) {
            this.lastFocus = lastFocus;
            this.onExitBackLastFocusCB = Callback.New(function (myUI, lastFocus, uiID) {
                if (uiID == myUI.guiID) {
                    _this_1.recoveryLastFocus();
                    EventUtils.removeEventListener(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, _this_1.onExitBackLastFocusCB);
                }
            }, this, [this.ui, lastFocus]);
            EventUtils.addEventListener(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, this.onExitBackLastFocusCB);
        }
    };
    FocusButtonsManager.prototype.deactivate = function () {
        if (this.uiCompFocusAnimation)
            this.uiCompFocusAnimation.stop(this.uiCompFocusAnimation.currentFrame);
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
    };
    FocusButtonsManager.prototype.onKeyDown = function (e) {
        if (!this.selBtn || !this.ui.stage || GameDialog.isInDialog)
            return;
        var realButtons = this.realButtons;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            var idx = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 4);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            var idx = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 6);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.UP)) {
            var idx = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 8);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.DOWN)) {
            var idx = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 2);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            if (!this.keyDownEnter) {
                this.keyDownEnter = true;
                this.selBtn.btn.event(EventObject.CLICK);
            }
        }
        else if (this.shortcutKeyExit && GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            if (!this.keyDownEsc) {
                this.keyDownEsc = true;
                var recoverySuccess = this.recoveryLastFocus();
                if (recoverySuccess)
                    GameAudio.playSE(WorldData.cancelSE);
            }
        }
    };
    FocusButtonsManager.prototype.onKeyUp = function (e) {
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            this.keyDownEnter = false;
        }
        else if (this.shortcutKeyExit && GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            this.keyDownEsc = false;
        }
    };
    FocusButtonsManager.prototype.recoveryLastFocus = function () {
        if (FocusButtonsManager.focus != this)
            return false;
        if (!this.whenExitBackLastFocus || (this.lastFocus && this.lastFocus.ui && this.lastFocus.ui.stage)) {
            if (FocusButtonsManager._focus) {
                if (FocusButtonsManager._focus.selEffectUI) {
                    FocusButtonsManager._focus.selEffectUI.removeSelf();
                }
                FocusButtonsManager._focus.selBtn = null;
                FocusButtonsManager._focus.deactivate();
            }
            FocusButtonsManager._focus = this.lastFocus;
            if (this.lastFocus)
                this.lastFocus.activate();
            if (this.whenExitEvent) {
                CommandPage.startTriggerFragmentEvent(this.whenExitEvent, Game.player.sceneObject, Game.player.sceneObject);
            }
            return true;
        }
        return false;
    };
    return FocusButtonsManager;
}());
//# sourceMappingURL=FocusButtonsManager.js.map