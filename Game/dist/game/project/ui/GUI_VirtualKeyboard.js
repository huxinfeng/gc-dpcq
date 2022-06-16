














var GUI_VirtualKeyboard = (function (_super) {
    __extends(GUI_VirtualKeyboard, _super);
    function GUI_VirtualKeyboard() {
        var _this_1 = _super.call(this) || this;
        _this_1.rockerCenterPoint = new Point;
        _this_1.lastMenuDir = 0;
        _this_1.init();
        return _this_1;
    }
    GUI_VirtualKeyboard.prototype.init = function () {
        var _this_1 = this;
        if (!this.rocker || !this.rockerBg)
            return;
        this.rockerCenterPoint = new Point(Math.floor(this.rockerBg.width / 2), Math.floor(this.rockerBg.height / 2));
        this.rockerR = this.rockerBg.width / 2;
        this.stopDragRocker(null);
        this.rocker.on(EventObject.MOUSE_DOWN, this, this.startDragRocker);
        this.rockerBg.on(EventObject.MOUSE_DOWN, this, this.startDragRocker);
        this.on(GUI_VirtualKeyboard.VIRTUALKEYBOARD_DIR4_CHANGE, this, this.onVirtualKeyboardMenuDirChange);
        EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_OPEN_SYSTEM_UI, function (uiID) {
            if (uiID != 30) {
                if (_this_1.stage)
                    GameUI.show(30);
            }
        }, this);
        EventUtils.addEventListenerFunction(GameDialog, GameDialog.EVENT_DIALOG_START, function (isOption, content, options, name, head, expression, audioURL, speed) {
            if (_this_1.stage)
                GameUI.show(30);
        }, this);
    };
    GUI_VirtualKeyboard.prototype.startDragRocker = function (e) {
        this.stopDragRocker(null);
        this.touchId = e.touchId;
        os.add_ENTERFRAME(this.updateRocker, this);
        stage.on(EventObject.MOUSE_UP, this, this.stopDragRocker);
    };
    GUI_VirtualKeyboard.prototype.stopDragRocker = function (e) {
        Game.player.variable.setVariable(2, e ? e.touchId : -1);
        if (e && e.touchId != this.touchId)
            return;
        this.touchId = null;
        os.remove_ENTERFRAME(this.updateRocker, this);
        stage.off(EventObject.MOUSE_UP, this, this.stopDragRocker);
        this.rocker.x = this.rockerCenterPoint.x;
        this.rocker.y = this.rockerCenterPoint.y;
        Controller.stopJoy();
        if (this.lastMenuDir != 0) {
            this.lastMenuDir = 0;
            this.event(GUI_VirtualKeyboard.VIRTUALKEYBOARD_DIR4_CHANGE, [0]);
        }
    };
    GUI_VirtualKeyboard.prototype.updateRocker = function (e) {
        if (e && e.touchId != this.touchId)
            return;
        var localMouseX = this.rockerBg.mouseX;
        var localMouseY = this.rockerBg.mouseY;
        var dis = Point.distance2(this.rockerCenterPoint.x, this.rockerCenterPoint.y, localMouseX, localMouseY);
        var per = this.rockerR / dis;
        if (per > 1)
            per = 1;
        var currentP = Point.interpolate2(localMouseX, localMouseY, this.rockerCenterPoint.x, this.rockerCenterPoint.y, per);
        this.rocker.x = currentP[0];
        this.rocker.y = currentP[1];
        if (dis < this.rockerR * 0.4)
            return;
        var angle = MathUtils.direction360(this.rockerCenterPoint.x, this.rockerCenterPoint.y, localMouseX, localMouseY);
        if (ClientWorld.data.moveDir4) {
            angle = GameUtils.getAngleByOri(GameUtils.getAssetOri(GameUtils.getOriByAngle(angle), 4));
        }
        var menuDir;
        if (angle <= 45 || angle >= 315) {
            menuDir = 8;
        }
        else if (angle >= 45 && angle <= 135) {
            menuDir = 6;
        }
        else if (angle >= 135 && angle <= 225) {
            menuDir = 2;
        }
        else if (angle >= 225 && angle <= 315) {
            menuDir = 4;
        }
        if (this.lastMenuDir != menuDir) {
            this.lastMenuDir = menuDir;
            this.event(GUI_VirtualKeyboard.VIRTUALKEYBOARD_DIR4_CHANGE, [menuDir]);
        }
        Controller.startJoy(angle);
    };
    GUI_VirtualKeyboard.prototype.onVirtualKeyboardMenuDirChange = function (dir) {
        if (Controller.inSceneEnabled)
            return;
        var m = {
            2: GUI_Setting.KEY_BOARD.DOWN.keys[0], 4: GUI_Setting.KEY_BOARD.LEFT.keys[0],
            6: GUI_Setting.KEY_BOARD.RIGHT.keys[0], 8: GUI_Setting.KEY_BOARD.UP.keys[0]
        };
        var transKeyCode = m[dir];
        if (transKeyCode)
            stage.event(EventObject.KEY_DOWN, [{ keyCode: transKeyCode }]);
    };
    GUI_VirtualKeyboard.VIRTUALKEYBOARD_DIR4_CHANGE = "VIRTUALKEYBOARD_DIR4_CHANGE";
    return GUI_VirtualKeyboard;
}(GUI_30));
//# sourceMappingURL=GUI_VirtualKeyboard.js.map