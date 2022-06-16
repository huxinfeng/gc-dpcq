














var GCGamepad = (function (_super) {
    __extends(GCGamepad, _super);
    function GCGamepad(index) {
        var _this_1 = _super.call(this) || this;
        _this_1.leftJoy1 = 0;
        _this_1.leftJoy2 = 1;
        _this_1.leftKey = 9;
        _this_1.rightJoy1 = 2;
        _this_1.rightJoy2 = 3;
        _this_1.keyMappings = [0, 1, 2, 3, 4, 6, 5, 7, 8, 9, 10, 11];
        _this_1.xKey = 2;
        _this_1.yKey = 3;
        _this_1.aKey = 0;
        _this_1.bKey = 1;
        _this_1.LBKey = 4;
        _this_1.LTKey = 6;
        _this_1.RBKey = 5;
        _this_1.RTKey = 7;
        _this_1.backKey = 8;
        _this_1.startKey = 9;
        _this_1.leftJoyDownKey = 10;
        _this_1.rightJoyDownKey = 11;
        _this_1.joyDefValue = 0.003921627998352051;
        _this_1.dirKeyMapping = {
            "1": 7, "-1": 8, "-0.7142857313156128": 9, "-0.4285714030265808": 6, "-0.1428571343421936": 3, "0.14285719394683838": 2, "0.4285714626312256": 1, "0.7142857313156128": 4
        };
        _this_1.leftJoyPoint = new Point();
        _this_1.rightJoyPoint = new Point();
        _this_1.leftKeyDir = 0;
        _this_1.buttons = [false, false, false, false, false, false, false, false, false, false, false, false];
        _this_1.tempPoint = new Point();
        _this_1.lastDir4Info = [
            { lastMenuJoyTime: 0, lastMenuClick: null, lastJoy: [0, 0] },
            { lastMenuJoyTime: 0, lastMenuClick: null, lastJoy: [0, 0] }
        ];
        _this_1.index = index;
        os.add_ENTERFRAME(_this_1.update, _this_1);
        return _this_1;
    }
    GCGamepad.getPad = function (index) {
        var pad = GCGamepad.pads[index];
        if (!pad)
            pad = GCGamepad.pads[index] = new GCGamepad(index);
        return pad;
    };
    Object.defineProperty(GCGamepad, "pad1", {
        get: function () {
            return this.getPad(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GCGamepad, "pad2", {
        get: function () {
            return this.getPad(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GCGamepad, "pad3", {
        get: function () {
            return this.getPad(2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GCGamepad, "pad4", {
        get: function () {
            return this.getPad(3);
        },
        enumerable: false,
        configurable: true
    });
    GCGamepad.prototype.getKeyIndex = function (keyCode) {
        return this.keyMappings.indexOf(MathUtils.int(keyCode));
    };
    GCGamepad.prototype.getJoyPointAngle = function (joyPoint) {
        if (joyPoint.x <= 0 && joyPoint.y <= 0) {
            return (joyPoint.x - joyPoint.y) * 45 + 315;
        }
        else if (joyPoint.x <= 0 && joyPoint.y >= 0) {
            return (-joyPoint.x - joyPoint.y) * 45 + 225;
        }
        else if (joyPoint.x >= 0 && joyPoint.y <= 0) {
            return (joyPoint.x + joyPoint.y) * 45 + 45;
        }
        else if (joyPoint.x >= 0 && joyPoint.y >= 0) {
            return (-joyPoint.x + joyPoint.y) * 45 + 135;
        }
        return 0;
    };
    GCGamepad.prototype.dispose = function () {
        this.offAll();
        os.remove_ENTERFRAME(this.update, this);
    };
    GCGamepad.prototype.update = function () {
        var gamepads = navigator.getGamepads();
        var pad;
        for (var i = 0, index = 0; i < gamepads.length; i++) {
            pad = gamepads[i];
            if (!pad || pad.id.indexOf("Unknown") != -1)
                continue;
            if (index == this.index)
                break;
            index++;
        }
        if (!pad)
            return;
        var now = new Date().getTime();
        this.getJoyValue(pad, this.leftJoy1, this.leftJoy2, this.tempPoint);
        if (this.tempPoint.x != this.leftJoyPoint.x || this.tempPoint.y != this.leftJoyPoint.y) {
            this.leftJoyPoint.x = this.tempPoint.x;
            this.leftJoyPoint.y = this.tempPoint.y;
            this.leftJoyStartTime = now;
            this.leftJoyFirstChangeTimes = true;
            this.onGamepadJoyChange(true, this.leftJoyPoint.x, this.leftJoyPoint.y);
            this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [true, this.leftJoyPoint.x, this.leftJoyPoint.y, true]);
        }
        else {
            if (((this.leftJoyFirstChangeTimes && now - this.leftJoyStartTime > GCGamepad.firstContinuityDelayTime) ||
                (!this.leftJoyFirstChangeTimes && now - this.leftJoyStartTime > GCGamepad.continuityDelayTime)) &&
                (this.leftJoyPoint.x != 0 || this.leftJoyPoint.y != 0)) {
                this.leftJoyStartTime = now;
                this.leftJoyFirstChangeTimes = false;
                this.onGamepadJoyChange(true, this.leftJoyPoint.x, this.leftJoyPoint.y);
                this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [true, this.leftJoyPoint.x, this.leftJoyPoint.y, false]);
            }
        }
        this.getJoyValue(pad, this.rightJoy1, this.rightJoy2, this.tempPoint);
        if (this.tempPoint.x != this.rightJoyPoint.x || this.tempPoint.y != this.rightJoyPoint.y) {
            this.rightJoyPoint.x = this.tempPoint.x;
            this.rightJoyPoint.y = this.tempPoint.y;
            this.rightJoyStartTime = now;
            this.rightJoyFirstChangeTimes = true;
            this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [false, this.rightJoyPoint.x, this.rightJoyPoint.y, true]);
        }
        else {
            if (((this.rightJoyFirstChangeTimes && now - this.rightJoyStartTime > GCGamepad.firstContinuityDelayTime) ||
                (!this.rightJoyFirstChangeTimes && now - this.rightJoyStartTime > GCGamepad.continuityDelayTime)) &&
                (this.rightJoyPoint.x != 0 || this.rightJoyPoint.y != 0)) {
                this.rightJoyStartTime = now;
                this.rightJoyFirstChangeTimes = false;
                this.onGamepadJoyChange(false, this.rightJoyPoint.x, this.rightJoyPoint.y);
                this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [false, this.rightJoyPoint.x, this.rightJoyPoint.y, false]);
            }
        }
        var leftKeyDir = this.getDirectionKey(pad, this.leftKey);
        if (leftKeyDir != this.leftKeyDir) {
            this.leftKeyDir = leftKeyDir;
            this.leftKeyStartTime = now;
            this.leftKeyFirstChangeTimes = true;
            this.event(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, [leftKeyDir]);
        }
        else {
            if (((this.leftKeyFirstChangeTimes && now - this.leftKeyStartTime > GCGamepad.firstContinuityDelayTime) ||
                (!this.leftKeyFirstChangeTimes && now - this.leftKeyStartTime > GCGamepad.continuityDelayTime)) &&
                (this.leftKeyDir != 0)) {
                this.leftKeyStartTime = now;
                this.leftKeyFirstChangeTimes = false;
                this.event(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, [leftKeyDir]);
            }
        }
        for (var s in pad.buttons) {
            var padpressed = pad.buttons[s].pressed;
            if (padpressed != this.buttons[s]) {
                this.buttons[s] = padpressed;
                if (padpressed)
                    this.event(GCGamepad.GAMEPAD_KEY_DOWN, [s]);
                else
                    this.event(GCGamepad.GAMEPAD_KEY_UP, [s]);
            }
        }
    };
    GCGamepad.prototype.getJoyValue = function (pad, joy1Index, joy2Index, p) {
        var joyValue1 = pad.axes[joy1Index];
        var joyValue2 = pad.axes[joy2Index];
        if (joyValue1 != this.joyDefValue || joyValue2 != this.joyDefValue) {
            var joyX = parseFloat(joyValue1.toFixed(2));
            var joyY = parseFloat(joyValue2.toFixed(2));
            if (Math.abs(joyX) <= 0.3)
                joyX = 0;
            if (Math.abs(joyY) <= 0.3)
                joyY = 0;
            p.x = joyX;
            p.y = joyY;
        }
        else {
            p.x = 0;
            p.y = 0;
        }
    };
    GCGamepad.prototype.getDirectionKey = function (pad, keyIndex) {
        var dir = this.dirKeyMapping[pad.axes[this.leftKey]];
        if (dir == null)
            dir = 0;
        return dir;
    };
    GCGamepad.prototype.onGamepadJoyChange = function (isleft, joyX, joyY) {
        if (isleft) {
            if (!this.hasListener(GCGamepad.GAMEPAD_LEFT_JOY_DIR4_CHANGE))
                return;
        }
        else {
            if (!this.hasListener(GCGamepad.GAMEPAD_RIGHT_JOY_DIR4_CHANGE))
                return;
        }
        var helpInfo = this.lastDir4Info[isleft ? 0 : 1];
        var GAMEPAD_JOY_DIR4_CHANGE = isleft ? GCGamepad.GAMEPAD_LEFT_JOY_DIR4_CHANGE : GCGamepad.GAMEPAD_RIGHT_JOY_DIR4_CHANGE;
        var lastJoyX = helpInfo.lastJoy[0];
        var lastJoyY = helpInfo.lastJoy[1];
        helpInfo.lastJoy = [joyX, joyY];
        var p = 0.8;
        if (Math.abs(joyX) < p && Math.abs(joyY) < p) {
            helpInfo.lastJoy = [0, 0];
            helpInfo.lastMenuJoyTime = 0;
            if (lastJoyX != 0 || lastJoyY != 0) {
                this.event(GAMEPAD_JOY_DIR4_CHANGE, [0]);
            }
            return;
        }
        var now = new Date().getTime();
        var menuClick;
        if (Math.abs(joyX) > Math.abs(joyY)) {
            if (Math.abs(joyX) < p)
                return;
            if (joyX < 0)
                menuClick = 4;
            else
                menuClick = 6;
        }
        else {
            if (Math.abs(joyY) < p)
                return;
            if (joyY < 0)
                menuClick = 8;
            else
                menuClick = 2;
        }
        if ((lastJoyX == joyX && lastJoyY == joyY) || (helpInfo.lastMenuClick != menuClick && now - helpInfo.lastMenuJoyTime > 150)
            || (helpInfo.lastMenuClick == menuClick && now - helpInfo.lastMenuJoyTime > 300)) {
        }
        else {
            return;
        }
        helpInfo.lastMenuJoyTime = now;
        helpInfo.lastMenuClick = menuClick;
        helpInfo.lastJoy = [joyX, joyY];
        this.event(GAMEPAD_JOY_DIR4_CHANGE, [helpInfo.lastMenuClick]);
    };
    GCGamepad.GAMEPAD_KEY_DOWN = "GCGamepad1";
    GCGamepad.GAMEPAD_KEY_UP = "GCGamepad2";
    GCGamepad.GAMEPAD_JOY_CHANGE = "GCGamepad3";
    GCGamepad.GAMEPAD_LEFT_KEY_CHANGE = "GCGamepad4";
    GCGamepad.GAMEPAD_LEFT_JOY_DIR4_CHANGE = "GCGamepad5";
    GCGamepad.GAMEPAD_RIGHT_JOY_DIR4_CHANGE = "GCGamepad6";
    GCGamepad.keyNames = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "BACK", "START", "LEFT_JOY_DOWN", "RIGHT_JOY_DOWN"];
    GCGamepad.xKeyIndex = 2;
    GCGamepad.yKeyIndex = 3;
    GCGamepad.aKeyIndex = 0;
    GCGamepad.bKeyIndex = 1;
    GCGamepad.LBKeyIndex = 4;
    GCGamepad.LTKeyIndex = 6;
    GCGamepad.RBKeyIndex = 5;
    GCGamepad.RTKeyIndex = 7;
    GCGamepad.backKeyIndex = 8;
    GCGamepad.startKeyIndex = 9;
    GCGamepad.leftJoyDownKeyIndex = 10;
    GCGamepad.rightJoyDownKeyIndex = 11;
    GCGamepad.leftKeyIndex = 14;
    GCGamepad.rightKeyIndex = 15;
    GCGamepad.upKeyIndex = 12;
    GCGamepad.downKeyIndex = 13;
    GCGamepad.pads = [];
    GCGamepad.firstContinuityDelayTime = 500;
    GCGamepad.continuityDelayTime = 30;
    return GCGamepad;
}(EventDispatcher));
//# sourceMappingURL=GCGamepad.js.map