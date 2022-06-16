














var GUI_Setting = (function (_super) {
    __extends(GUI_Setting, _super);
    function GUI_Setting() {
        var _this_1 = _super.call(this) || this;
        GUI_Manager.standardTab(_this_1.typeTab);
        GUI_Manager.standardList(_this_1.keyboardList);
        GUI_Manager.standardList(_this_1.gamepadList);
        _this_1.initKeyboardSetting();
        _this_1.initGamepadSetting();
        _this_1.typeTab.on(EventObject.CHANGE, _this_1, _this_1.refreshFocus);
        _this_1.on(EventObject.DISPLAY, _this_1, _this_1.onDisplay);
        return _this_1;
    }
    GUI_Setting.prototype.onDisplay = function () {
        this.refreshFocus();
        this.cancelInputKey();
    };
    GUI_Setting.getSystemKeyDesc = function (key) {
        if (ProjectUtils.lastControl <= 1) {
            var keyInfo = GUI_Setting.KEY_BOARD[key];
            if (!GUI_Setting.KEY_BOARD)
                return "";
            return Keyboard.getKeyName(keyInfo.keys[0]);
        }
        else {
            return key;
        }
    };
    GUI_Setting.initHotKeySetting = function () {
        for (var i = 0; i < WorldData.keyboards.length; i++) {
            var keyboardInfo = WorldData.keyboards[i];
            var sysKeyName = GUI_Setting.SYSTEM_KEYS[keyboardInfo.gameKey];
            var keySetting = GUI_Setting.KEY_BOARD[sysKeyName];
            if (keyboardInfo.keyCode1)
                keySetting.keys.push(keyboardInfo.keyCode1);
            if (keyboardInfo.keyCode2)
                keySetting.keys.push(keyboardInfo.keyCode2);
            if (keyboardInfo.keyCode3)
                keySetting.keys.push(keyboardInfo.keyCode3);
            if (keyboardInfo.keyCode4)
                keySetting.keys.push(keyboardInfo.keyCode4);
        }
        GUI_Setting.KEY_BOARD_DEFAULT = ObjectUtils.depthClone(GUI_Setting.KEY_BOARD);
        var settingData = SinglePlayerGame.getSaveCustomGlobalData("Setting");
        if (settingData) {
            GameAudio.bgmVolume = settingData.bgmVolume;
            GameAudio.bgsVolume = settingData.bgsVolume;
            GameAudio.seVolume = settingData.seVolume;
            GameAudio.tsVolume = settingData.tsVolume;
            if (settingData.KEY_BOARD)
                ObjectUtils.clone(settingData.KEY_BOARD, GUI_Setting.KEY_BOARD);
            if (settingData.GAMEPAD)
                ObjectUtils.clone(settingData.GAMEPAD, GUI_Setting.GAMEPAD);
        }
        this.syncListKeyDownSetting();
        SinglePlayerGame.regSaveCustomGlobalData("Setting", Callback.New(this.getGlobalData, this));
    };
    GUI_Setting.getGlobalData = function () {
        return {
            KEY_BOARD: GUI_Setting.KEY_BOARD,
            GAMEPAD: GUI_Setting.GAMEPAD,
            bgmVolume: GameAudio.bgmVolume,
            bgsVolume: GameAudio.bgsVolume,
            seVolume: GameAudio.seVolume,
            tsVolume: GameAudio.tsVolume
        };
    };
    GUI_Setting.IS_KEY = function (keyCode, keyInfo) {
        return keyInfo.keys.indexOf(keyCode) != -1;
    };
    Object.defineProperty(GUI_Setting, "IS_KEY_DOWN_DirectionKey", {
        get: function () {
            if (!ProjectUtils.keyboardEvent)
                return;
            var keyCode = ProjectUtils.keyboardEvent.keyCode;
            if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.UP) ||
                GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.DOWN) ||
                GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.LEFT) ||
                GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    GUI_Setting.prototype.initKeyboardSetting = function () {
        var _this_1 = this;
        this.keyboardList.onCreateItem = Callback.New(function (ui, data, index) {
            var keyBoardInfo = data.data;
            ui.key1.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[0]);
            ui.key2.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[1]);
            ui.key3.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[2]);
            ui.key4.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[3]);
            ui.key1.on(EventObject.CLICK, _this_1, _this_1.openWaitInputKeyboard, [0]);
            ui.key2.on(EventObject.CLICK, _this_1, _this_1.openWaitInputKeyboard, [1]);
            ui.key3.on(EventObject.CLICK, _this_1, _this_1.openWaitInputKeyboard, [2]);
            ui.key4.on(EventObject.CLICK, _this_1, _this_1.openWaitInputKeyboard, [3]);
        }, this);
        this.refreshKeyboardList();
        stage.on(EventObject.KEY_DOWN, this, this.onSetKeyboardByHotKey);
        this.keyboardReset.on(EventObject.CLICK, this, this.resetKeyboard);
    };
    GUI_Setting.prototype.refreshKeyboardList = function () {
        var keyBoards = [];
        for (var i in GUI_Setting.KEY_BOARD) {
            var kInfo = GUI_Setting.KEY_BOARD[i];
            keyBoards.push(kInfo);
        }
        keyBoards.sort(function (a, b) { return a.index < b.index ? -1 : 1; });
        var items = [];
        for (var s = 0; s < keyBoards.length; s++) {
            var d = new ListItem_1018;
            var keyBoardInfo = keyBoards[s];
            d.data = keyBoardInfo;
            d.keyName = keyBoardInfo.name;
            items.push(d);
        }
        this.keyboardList.items = items;
    };
    GUI_Setting.prototype.openWaitInputKeyboard = function (keyIndex) {
        if (!this.keyboardList.selectedItem || this.needInputKeyPanel.visible)
            return;
        var keyBoardInfo = this.keyboardList.selectedItem.data;
        if (!keyBoardInfo)
            return;
        this.typeTab.mouseEnabled = false;
        this.needInputKeyPanel.visible = true;
        this.needInputKeyLabel.text = keyBoardInfo.name + " 第" + (keyIndex + 1) + "个键位：请按下键位...";
        this.refreshFocus();
        GUI_Setting.IS_INPUT_KEY_MODE = true;
        stage.once(EventObject.KEY_DOWN, this, this.onSetKeyboard, [keyBoardInfo, keyIndex]);
        stage.once(EventObject.MOUSE_DOWN, this, this.cancelInputKey);
    };
    GUI_Setting.prototype.closeWaitInputKeyboard = function () {
        stage.off(EventObject.KEY_DOWN, this, this.onSetKeyboard);
        GUI_Setting.IS_INPUT_KEY_MODE = false;
        this.needInputKeyPanel.visible = false;
        this.typeTab.mouseEnabled = true;
        this.refreshFocus();
    };
    GUI_Setting.prototype.onSetKeyboard = function (keyBoardInfo, keyIndex, e) {
        keyBoardInfo.keys[keyIndex] = e.keyCode;
        var ui = this.keyboardList.getItemUI(this.keyboardList.selectedIndex);
        ui["key" + (keyIndex + 1)].label = GUI_Setting.getKeyBoardName(e.keyCode);
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.UP)
            UIList.KEY_UP[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.DOWN)
            UIList.KEY_DOWN[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.LEFT)
            UIList.KEY_LEFT[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.RIGHT)
            UIList.KEY_RIGHT[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.A)
            UIList.KEY_ENTER[keyIndex] = e.keyCode;
        this.closeWaitInputKeyboard();
        EventUtils.happen(GUI_Setting, GUI_Setting.EVENT_CHANGE_HOT_KEY);
        GameAudio.playSE(ClientWorld.data.sureSE);
    };
    GUI_Setting.prototype.onSetKeyboardByHotKey = function (e) {
        if (UIList.focus != this.keyboardList || !this.keyboardList.stage || UIList.focus != this.keyboardList)
            return;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            this.openWaitInputKeyboard(0);
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            this.openWaitInputKeyboard(1);
        }
    };
    GUI_Setting.prototype.resetKeyboard = function () {
        GUI_Setting.KEY_BOARD = ObjectUtils.depthClone(GUI_Setting.KEY_BOARD_DEFAULT);
        this.refreshKeyboardList();
        GUI_Setting.syncListKeyDownSetting();
    };
    GUI_Setting.prototype.initGamepadSetting = function () {
        var _this_1 = this;
        this.gamepadList.onCreateItem = Callback.New(function (ui, data, index) {
            var gamepadInfo = data.data;
            ui.key1.label = _this_1.getGamepadName(gamepadInfo.key);
            ui.key1.on(EventObject.CLICK, _this_1, _this_1.openWaitInputGamepad);
        }, this);
        this.refreshGamepadList();
        stage.on(EventObject.KEY_DOWN, this, this.onSetGamepadByHotKey);
        this.gamepadReset.on(EventObject.CLICK, this, this.resetGamepad);
    };
    GUI_Setting.prototype.refreshGamepadList = function () {
        var gamepads = [];
        for (var i in GUI_Setting.GAMEPAD) {
            var kInfo = GUI_Setting.GAMEPAD[i];
            gamepads.push(kInfo);
        }
        gamepads.sort(function (a, b) { return a.index < b.index ? -1 : 1; });
        var items = [];
        for (var s = 0; s < gamepads.length; s++) {
            var d = new ListItem_1019;
            var gamepadInfo = gamepads[s];
            d.data = gamepadInfo;
            d.keyName = gamepadInfo.name;
            items.push(d);
        }
        this.gamepadList.items = items;
    };
    GUI_Setting.prototype.getGamepadName = function (keyIndex) {
        if (keyIndex == -1)
            return "--/--";
        var name = "[" + keyIndex + "]" + GCGamepad.keyNames[keyIndex];
        return name ? name : "--/--";
    };
    GUI_Setting.prototype.openWaitInputGamepad = function (keyIndex) {
        if (!this.gamepadList.selectedItem || this.needInputKeyPanel.visible || UIList.focus != this.gamepadList)
            return;
        var gamepadInfo = this.gamepadList.selectedItem.data;
        if (!gamepadInfo)
            return;
        this.typeTab.mouseEnabled = false;
        this.needInputKeyPanel.visible = true;
        this.needInputKeyLabel.text = gamepadInfo.name + "：请按下游戏手柄键位...";
        this.refreshFocus();
        GUI_Setting.IS_INPUT_KEY_MODE = true;
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onSetGamepad, [gamepadInfo]);
        stage.once(EventObject.MOUSE_DOWN, this, this.cancelInputKey);
    };
    GUI_Setting.prototype.closeWaitInputGamepad = function () {
        GUI_Setting.IS_INPUT_KEY_MODE = false;
        GCGamepad.pad1.off(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onSetGamepad);
        this.needInputKeyPanel.visible = false;
        this.typeTab.mouseEnabled = true;
        this.refreshFocus();
    };
    GUI_Setting.prototype.onSetGamepad = function (gamepadInfo, keyCode, lastCtrlEnabled) {
        var keyIndex = GCGamepad.pad1.getKeyIndex(keyCode);
        for (var i in GUI_Setting.GAMEPAD) {
            if (GUI_Setting.GAMEPAD[i].key == keyIndex)
                GUI_Setting.GAMEPAD[i].key = -1;
        }
        gamepadInfo.key = keyIndex;
        this.closeWaitInputGamepad();
        GameAudio.playSE(ClientWorld.data.sureSE);
        this.refreshGamepadList();
    };
    GUI_Setting.prototype.onSetGamepadByHotKey = function (e) {
        if (UIList.focus != this.gamepadList || !this.gamepadList.stage)
            return;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            this.openWaitInputGamepad(0);
        }
    };
    GUI_Setting.prototype.resetGamepad = function () {
        GUI_Setting.GAMEPAD = ObjectUtils.depthClone(GUI_Setting.GAMEPAD_DEFAULT);
        this.refreshGamepadList();
    };
    GUI_Setting.syncListKeyDownSetting = function () {
        UIList.KEY_UP = GUI_Setting.KEY_BOARD.UP.keys;
        UIList.KEY_DOWN = GUI_Setting.KEY_BOARD.DOWN.keys;
        UIList.KEY_LEFT = GUI_Setting.KEY_BOARD.LEFT.keys;
        UIList.KEY_RIGHT = GUI_Setting.KEY_BOARD.RIGHT.keys;
        UIList.KEY_ENTER = GUI_Setting.KEY_BOARD.A.keys;
    };
    GUI_Setting.getKeyBoardName = function (key) {
        if (key != null) {
            for (var s in Keyboard) {
                if (Keyboard[s] == key)
                    return s;
            }
        }
        return "--/--";
    };
    GUI_Setting.prototype.refreshFocus = function () {
        if (this.needInputKeyPanel.visible) {
            UIList.focus = null;
            return;
        }
        switch (this.typeTab.selectedIndex) {
            case 0:
                break;
            case 1:
                UIList.focus = this.keyboardList;
                break;
            case 2:
                UIList.focus = this.gamepadList;
                break;
            case 3:
                UIList.focus = null;
                break;
        }
    };
    GUI_Setting.prototype.cancelInputKey = function () {
        GUI_Setting.IS_INPUT_KEY_MODE = false;
        stage.off(EventObject.KEY_DOWN, this, this.onSetKeyboard);
        GCGamepad.pad1.off(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onSetGamepad);
        this.needInputKeyPanel.visible = false;
        this.typeTab.mouseEnabled = true;
        this.refreshFocus();
    };
    GUI_Setting.EVENT_CHANGE_HOT_KEY = "GUI_SettingEVENT_CHANGE_HOT_KEY";
    GUI_Setting.SYSTEM_KEYS = ["UP", "DOWN", "LEFT", "RIGHT", "A", "B", "X", "Y", "START", "BACK", "L1", "L2", "R1", "R2"];
    GUI_Setting.KEY_BOARD = {
        "UP": { index: 1, name: "上", keys: [] },
        "DOWN": { index: 2, name: "下", keys: [] },
        "LEFT": { index: 3, name: "左", keys: [] },
        "RIGHT": { index: 4, name: "右", keys: [] },
        "A": { index: 5, name: "确定", keys: [] },
        "B": { index: 17, name: "取消", keys: [] },
        "X": { index: 18, name: "X", keys: [] },
        "Y": { index: 19, name: "Y", keys: [] },
        "START": { index: 20, name: "开始", keys: [] },
        "BACK": { index: 21, name: "菜单", keys: [] },
        "L1": { index: 22, name: "L1", keys: [] },
        "L2": { index: 23, name: "L2", keys: [] },
        "R1": { index: 24, name: "R1", keys: [] },
        "R2": { index: 25, name: "R2", keys: [] }
    };
    GUI_Setting.GAMEPAD = {
        "X": { index: 1, name: "X", key: GCGamepad.xKeyIndex },
        "Y": { index: 2, name: "Y", key: GCGamepad.yKeyIndex },
        "A": { index: 3, name: "确定", key: GCGamepad.aKeyIndex },
        "B": { index: 4, name: "取消", key: GCGamepad.bKeyIndex },
        "START": { index: 5, name: "开始", key: GCGamepad.startKeyIndex },
        "BACK": { index: 6, name: "菜单", key: GCGamepad.backKeyIndex },
        "L1": { index: 7, name: "L1", key: GCGamepad.LBKeyIndex },
        "L2": { index: 8, name: "L2", key: GCGamepad.LTKeyIndex },
        "R1": { index: 9, name: "R1", key: GCGamepad.RBKeyIndex },
        "R2": { index: 10, name: "R2", key: GCGamepad.RTKeyIndex }
    };
    GUI_Setting.GAMEPAD_DEFAULT = ObjectUtils.depthClone(GUI_Setting.GAMEPAD);
    return GUI_Setting;
}(GUI_6));
//# sourceMappingURL=GUI_Setting.js.map