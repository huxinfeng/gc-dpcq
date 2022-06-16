/**
 * 系统设置
 * Created by 黑暗之神KDS on 2020-03-12 13:55:53.
 */
class GUI_Setting extends GUI_6 {
    /**
     * 是否输入按键模式
     */
    static IS_INPUT_KEY_MODE: boolean;
    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    constructor() {
        super();
        // 标准化TAB
        GUI_Manager.standardTab(this.typeTab);
        // 标准化LIST
        GUI_Manager.standardList(this.keyboardList);
        GUI_Manager.standardList(this.gamepadList);
        // 初始化按键设定
        this.initKeyboardSetting();
        // 初始化手柄设定
        this.initGamepadSetting();
        // 监听标签改变
        this.typeTab.on(EventObject.CHANGE, this, this.refreshFocus);
        // 刷新
        this.on(EventObject.DISPLAY, this, this.onDisplay);
    }
    /**
     * 界面显示时
     */
    private onDisplay(): void {
        this.refreshFocus();
        this.cancelInputKey();
    }
    //------------------------------------------------------------------------------------------------------
    // 静态
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：改变快捷键
     */
    static EVENT_CHANGE_HOT_KEY: string = "GUI_SettingEVENT_CHANGE_HOT_KEY";
    /**
     * 系统按键集
     */
    static SYSTEM_KEYS: string[] = ["UP", "DOWN", "LEFT", "RIGHT", "A", "B", "X", "Y", "START", "BACK", "L1", "L2", "R1", "R2"];
    /**
     * 当前键盘按键设定
     */
    static KEY_BOARD = {
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
    }
    static GAMEPAD = {
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
    /**
     * 获取系统键位描述
     * @param key 系统键位名，对应GUI_Setting.KEY_BOARD的键
     */
    static getSystemKeyDesc(key: string) {
        if (ProjectUtils.lastControl <= 1) {
            var keyInfo = GUI_Setting.KEY_BOARD[key];
            if (!GUI_Setting.KEY_BOARD) return "";
            return Keyboard.getKeyName(keyInfo.keys[0]);
        }
        else {
            return key;
        }
    }
    /**
     * 默认键位设定
     */
    private static KEY_BOARD_DEFAULT; // 装载世界设定的初始值后再记录默认值
    private static GAMEPAD_DEFAULT = ObjectUtils.depthClone(GUI_Setting.GAMEPAD);
    //------------------------------------------------------------------------------------------------------
    // 载入设定
    //------------------------------------------------------------------------------------------------------
    static initHotKeySetting() {
        // 默认键盘键位设置
        for (var i = 0; i < WorldData.keyboards.length; i++) {
            let keyboardInfo = WorldData.keyboards[i];
            let sysKeyName = GUI_Setting.SYSTEM_KEYS[keyboardInfo.gameKey];
            let keySetting: { index: number; name: string; keys: number[]; } = GUI_Setting.KEY_BOARD[sysKeyName];
            if (keyboardInfo.keyCode1) keySetting.keys.push(keyboardInfo.keyCode1);
            if (keyboardInfo.keyCode2) keySetting.keys.push(keyboardInfo.keyCode2);
            if (keyboardInfo.keyCode3) keySetting.keys.push(keyboardInfo.keyCode3);
            if (keyboardInfo.keyCode4) keySetting.keys.push(keyboardInfo.keyCode4);
        }
        GUI_Setting.KEY_BOARD_DEFAULT = ObjectUtils.depthClone(GUI_Setting.KEY_BOARD);
        // 载入配置
        var settingData = SinglePlayerGame.getSaveCustomGlobalData("Setting");
        if (settingData) {
            GameAudio.bgmVolume = settingData.bgmVolume;
            GameAudio.bgsVolume = settingData.bgsVolume;
            GameAudio.seVolume = settingData.seVolume;
            GameAudio.tsVolume = settingData.tsVolume;
            if (settingData.KEY_BOARD) ObjectUtils.clone(settingData.KEY_BOARD, GUI_Setting.KEY_BOARD);
            if (settingData.GAMEPAD) ObjectUtils.clone(settingData.GAMEPAD, GUI_Setting.GAMEPAD);
        }
        // 同步LIST内置按键
        this.syncListKeyDownSetting();
        // 注册自定义储存信息
        SinglePlayerGame.regSaveCustomGlobalData("Setting", Callback.New(this.getGlobalData, this));
    }
    /**
     * 获取全局数据
     */
    static getGlobalData() {
        return {
            KEY_BOARD: GUI_Setting.KEY_BOARD,
            GAMEPAD: GUI_Setting.GAMEPAD,
            bgmVolume: GameAudio.bgmVolume,
            bgsVolume: GameAudio.bgsVolume,
            seVolume: GameAudio.seVolume,
            tsVolume: GameAudio.tsVolume
        };
    }
    //------------------------------------------------------------------------------------------------------
    // 功能
    //------------------------------------------------------------------------------------------------------
    /**
     * 判断系统按键是否按下
     * @param keyCode 按键值
     * @param keyInfo 对应 GUI_Setting.KEY_BOARD
     * @return [boolean] 
     */
    static IS_KEY(keyCode: number, keyInfo: { name: string, keys: number[] }): boolean {
        return keyInfo.keys.indexOf(keyCode) != -1;
    }
    /**
     * 判断系统方向键是否已按下
     * @return [boolean] 
     */
    static get IS_KEY_DOWN_DirectionKey(): boolean {
        if (!ProjectUtils.keyboardEvent) return;
        var keyCode = ProjectUtils.keyboardEvent.keyCode;
        if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.UP) ||
            GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.DOWN) ||
            GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.LEFT) ||
            GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            return true;
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    // 快捷键设定-键盘
    //------------------------------------------------------------------------------------------------------
    private initKeyboardSetting() {
        // 创建每个项对象时
        this.keyboardList.onCreateItem = Callback.New((ui: GUI_1018, data: ListItem_1018, index: number) => {
            var keyBoardInfo: { name: string, keys: number[] } = data.data;
            ui.key1.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[0]);
            ui.key2.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[1]);
            ui.key3.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[2]);
            ui.key4.label = GUI_Setting.getKeyBoardName(keyBoardInfo.keys[3]);
            ui.key1.on(EventObject.CLICK, this, this.openWaitInputKeyboard, [0]);
            ui.key2.on(EventObject.CLICK, this, this.openWaitInputKeyboard, [1]);
            ui.key3.on(EventObject.CLICK, this, this.openWaitInputKeyboard, [2]);
            ui.key4.on(EventObject.CLICK, this, this.openWaitInputKeyboard, [3]);
        }, this);
        // 显示全部按键
        this.refreshKeyboardList();
        // 用快捷键操作设置键位
        stage.on(EventObject.KEY_DOWN, this, this.onSetKeyboardByHotKey);
        // 还原默认值
        this.keyboardReset.on(EventObject.CLICK, this, this.resetKeyboard);
    }
    /**
     * 刷新显示全部按键信息列表
     */
    private refreshKeyboardList() {
        // 显示全部按键
        var keyBoards: { name: string, keys: number[], index: number }[] = []
        for (var i in GUI_Setting.KEY_BOARD) {
            let kInfo = GUI_Setting.KEY_BOARD[i];
            keyBoards.push(kInfo);
        }
        keyBoards.sort((a: any, b: any): number => { return a.index < b.index ? -1 : 1 });
        var items = [];
        for (var s = 0; s < keyBoards.length; s++) {
            var d = new ListItem_1018;
            var keyBoardInfo = keyBoards[s];
            d.data = keyBoardInfo;
            d.keyName = keyBoardInfo.name;
            items.push(d);
        }
        this.keyboardList.items = items;
    }
    /**
     * 等待输入按键
     * @param keyIndex 按键位置 0-第一个按键 1-第二个按键
     */
    private openWaitInputKeyboard(keyIndex: number) {
        if (!this.keyboardList.selectedItem || this.needInputKeyPanel.visible) return;
        var keyBoardInfo: { name: string, keys: number[] } = this.keyboardList.selectedItem.data;
        if (!keyBoardInfo) return;
        this.typeTab.mouseEnabled = false;
        this.needInputKeyPanel.visible = true;
        this.needInputKeyLabel.text = keyBoardInfo.name + " 第" + (keyIndex + 1) + "个键位：请按下键位...";
        this.refreshFocus();
        GUI_Setting.IS_INPUT_KEY_MODE = true;
        stage.once(EventObject.KEY_DOWN, this, this.onSetKeyboard, [keyBoardInfo, keyIndex]);
        stage.once(EventObject.MOUSE_DOWN, this, this.cancelInputKey);
    }
    /**
     * 关闭等待输入按键
     */
    private closeWaitInputKeyboard() {
        stage.off(EventObject.KEY_DOWN, this, this.onSetKeyboard);
        GUI_Setting.IS_INPUT_KEY_MODE = false;
        this.needInputKeyPanel.visible = false;
        this.typeTab.mouseEnabled = true;
        this.refreshFocus();
    }
    /**
     * 当设置按键按下时
     */
    private onSetKeyboard(keyBoardInfo: { name: string, keys: number[] }, keyIndex: number, e: EventObject) {
        keyBoardInfo.keys[keyIndex] = e.keyCode;
        var ui = this.keyboardList.getItemUI(this.keyboardList.selectedIndex) as GUI_1013;
        ui["key" + (keyIndex + 1)].label = GUI_Setting.getKeyBoardName(e.keyCode);
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.UP) UIList.KEY_UP[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.DOWN) UIList.KEY_DOWN[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.LEFT) UIList.KEY_LEFT[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.RIGHT) UIList.KEY_RIGHT[keyIndex] = e.keyCode;
        if (keyBoardInfo == GUI_Setting.KEY_BOARD.A) UIList.KEY_ENTER[keyIndex] = e.keyCode;
        this.closeWaitInputKeyboard();
        EventUtils.happen(GUI_Setting, GUI_Setting.EVENT_CHANGE_HOT_KEY);
        GameAudio.playSE(ClientWorld.data.sureSE);
    }
    /**
     * 当设置按键按下时（快捷键呼出）
     * @param e 
     */
    private onSetKeyboardByHotKey(e: EventObject): void {
        // 焦点不在设置键位上或该界面未显示则忽略
        if (UIList.focus != this.keyboardList || !this.keyboardList.stage || UIList.focus != this.keyboardList) return;
        // 左键设置第一个键位，右键设置第二个键位
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            this.openWaitInputKeyboard(0);
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            this.openWaitInputKeyboard(1);
        }
    }
    /**
     * 重置按键
     */
    private resetKeyboard() {
        GUI_Setting.KEY_BOARD = ObjectUtils.depthClone(GUI_Setting.KEY_BOARD_DEFAULT);
        this.refreshKeyboardList();
        GUI_Setting.syncListKeyDownSetting();
    }
    //------------------------------------------------------------------------------------------------------
    // 快捷键设定-手柄
    //------------------------------------------------------------------------------------------------------
    private initGamepadSetting() {
        // 创建每个项对象时
        this.gamepadList.onCreateItem = Callback.New((ui: GUI_1019, data: ListItem_1019, index: number) => {
            var gamepadInfo: { name: string, key: number } = data.data;
            ui.key1.label = this.getGamepadName(gamepadInfo.key);
            ui.key1.on(EventObject.CLICK, this, this.openWaitInputGamepad);
        }, this);
        // 显示全部按键
        this.refreshGamepadList();
        // 用快捷键操作设置键位
        stage.on(EventObject.KEY_DOWN, this, this.onSetGamepadByHotKey);
        // 还原默认值
        this.gamepadReset.on(EventObject.CLICK, this, this.resetGamepad);
    }
    /**
     * 刷新显示全部按键信息列表
     */
    private refreshGamepadList() {
        // 显示全部按键
        var gamepads: { name: string, key: number, index: number }[] = []
        for (var i in GUI_Setting.GAMEPAD) {
            let kInfo = GUI_Setting.GAMEPAD[i];
            gamepads.push(kInfo);
        }
        gamepads.sort((a: any, b: any): number => { return a.index < b.index ? -1 : 1 });
        var items = [];
        for (var s = 0; s < gamepads.length; s++) {
            var d = new ListItem_1019;
            var gamepadInfo = gamepads[s];
            d.data = gamepadInfo;
            d.keyName = gamepadInfo.name;
            items.push(d);
        }
        this.gamepadList.items = items;
    }
    /**
     * 获取键盘按键名
     * @param key 键位 
     * @return [string] 
     */
    private getGamepadName(keyIndex: number): string {
        if (keyIndex == -1) return "--/--";
        var name = "[" + keyIndex + "]" + GCGamepad.keyNames[keyIndex];
        return name ? name : "--/--";
    }
    /**
     * 等待输入按键
     * @param keyIndex 按键位置 0-第一个按键 1-第二个按键
     */
    private openWaitInputGamepad(keyIndex: number) {
        if (!this.gamepadList.selectedItem || this.needInputKeyPanel.visible || UIList.focus != this.gamepadList) return;
        var gamepadInfo: { name: string, key: number } = this.gamepadList.selectedItem.data;
        if (!gamepadInfo) return;
        this.typeTab.mouseEnabled = false;
        this.needInputKeyPanel.visible = true;
        this.needInputKeyLabel.text = gamepadInfo.name + "：请按下游戏手柄键位...";
        this.refreshFocus();
        GUI_Setting.IS_INPUT_KEY_MODE = true;
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onSetGamepad, [gamepadInfo]);
        stage.once(EventObject.MOUSE_DOWN, this, this.cancelInputKey);
    }
    /**
     * 关闭等待输入按键
     */
    private closeWaitInputGamepad() {
        GUI_Setting.IS_INPUT_KEY_MODE = false;
        GCGamepad.pad1.off(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onSetGamepad);
        this.needInputKeyPanel.visible = false;
        this.typeTab.mouseEnabled = true;
        this.refreshFocus();
    }
    /**
     * 当设置按键按下时
     */
    private onSetGamepad(gamepadInfo: { name: string, key: number }, keyCode: number, lastCtrlEnabled: boolean) {
        var keyIndex = GCGamepad.pad1.getKeyIndex(keyCode);
        // 将其他的同键位清空
        for (var i in GUI_Setting.GAMEPAD) {
            if (GUI_Setting.GAMEPAD[i].key == keyIndex) GUI_Setting.GAMEPAD[i].key = -1;
        }
        gamepadInfo.key = keyIndex;
        this.closeWaitInputGamepad();
        GameAudio.playSE(ClientWorld.data.sureSE);
        this.refreshGamepadList();
    }
    /**
     * 当设置按键按下时（快捷键呼出）
     * @param e 
     */
    private onSetGamepadByHotKey(e: EventObject): void {
        // 焦点不在设置键位上或该界面未显示则忽略
        if (UIList.focus != this.gamepadList || !this.gamepadList.stage) return;
        // 左键设置第一个键位，右键设置第二个键位
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            this.openWaitInputGamepad(0);
        }
    }
    /**
     * 重置按键
     */
    private resetGamepad() {
        GUI_Setting.GAMEPAD = ObjectUtils.depthClone(GUI_Setting.GAMEPAD_DEFAULT);
        this.refreshGamepadList();
    }
    //------------------------------------------------------------------------------------------------------
    // 内部
    //------------------------------------------------------------------------------------------------------
    /**
     * 同步LIST内置按键
     */
    private static syncListKeyDownSetting() {
        UIList.KEY_UP = GUI_Setting.KEY_BOARD.UP.keys;
        UIList.KEY_DOWN = GUI_Setting.KEY_BOARD.DOWN.keys;
        UIList.KEY_LEFT = GUI_Setting.KEY_BOARD.LEFT.keys;
        UIList.KEY_RIGHT = GUI_Setting.KEY_BOARD.RIGHT.keys;
        UIList.KEY_ENTER = GUI_Setting.KEY_BOARD.A.keys;
    }
    /**
     * 获取键盘按键名
     * @param key 键位 
     * @return [string] 
     */
    static getKeyBoardName(key: number): string {
        if (key != null) {
            for (var s in Keyboard) {
                if (Keyboard[s] == key) return s;
            }
        }
        return "--/--";
    }
    /**
        * 根据标签类别刷新焦点
        */
    private refreshFocus() {
        if (this.needInputKeyPanel.visible) {
            UIList.focus = null;
            return;
        }
        switch (this.typeTab.selectedIndex) {
            case 0:
                // UIList.focus = this.audioSettingList;
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
    }
    /**
     * 取消输入
     */
    private cancelInputKey(): void {
        GUI_Setting.IS_INPUT_KEY_MODE = false;
        stage.off(EventObject.KEY_DOWN, this, this.onSetKeyboard);
        GCGamepad.pad1.off(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onSetGamepad);
        this.needInputKeyPanel.visible = false;
        this.typeTab.mouseEnabled = true;
        this.refreshFocus();
    }
}