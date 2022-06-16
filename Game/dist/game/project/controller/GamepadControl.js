var GamepadControl = (function () {
    function GamepadControl() {
    }
    GamepadControl.init = function () {
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_LEFT_JOY_DIR4_CHANGE, this, this.onGamepadMenuDirChange, [true]);
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, this, this.onGamepadMenuDirChange, [false]);
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onGamepadKeyDown, [EventObject.KEY_DOWN]);
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_KEY_UP, this, this.onGamepadKeyDown, [EventObject.KEY_UP]);
    };
    GamepadControl.start = function () {
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, this, this.onLeftKeyChange);
        os.add_ENTERFRAME(this.update, this);
    };
    GamepadControl.stop = function () {
        GCGamepad.pad1.off(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, this, this.onLeftKeyChange);
        os.remove_ENTERFRAME(this.update, this);
    };
    GamepadControl.onLeftKeyChange = function (dir) {
        KeyboardControl.setDirKeyDown(dir);
    };
    GamepadControl.update = function () {
        if (!Controller.inSceneEnabled)
            return;
        var joyX = GCGamepad.pad1.leftJoyPoint.x;
        var joyY = GCGamepad.pad1.leftJoyPoint.y;
        var max = Math.max(Math.abs(joyX), Math.abs(joyY));
        if (max != 0) {
            var per = 1 / max;
            joyX *= per;
            joyY *= per;
        }
        if (joyX == 0 && joyY == 0) {
            if (Controller.inputState == 2) {
                Controller.inputState = 0;
                Controller.stopJoy();
            }
            return;
        }
        if (ClientWorld.data.moveDir4) {
            var angle_1 = MathUtils.direction360(0, 0, joyX, joyY);
            var dir = GameUtils.getOriByAngle(angle_1);
            var dir4 = GameUtils.getAssetOri(dir, 4);
            var offset = KeyboardControl.dirOffsetArr[dir4];
            joyX = offset[0];
            joyY = offset[1];
        }
        var angle;
        var toX = Game.player.sceneObject.x + joyX * Config.SCENE_GRID_SIZE;
        var toY = Game.player.sceneObject.y + joyY * Config.SCENE_GRID_SIZE;
        if (WorldData.moveToGridCenter && !WorldData.moveDir4) {
            ProjectUtils.pointHelper.x = joyX;
            ProjectUtils.pointHelper.y = joyY;
            angle = GCGamepad.pad1.getJoyPointAngle(ProjectUtils.pointHelper);
            if (Game.player.sceneObject.isMoving) {
                var joyAngle8 = GameUtils.getAngleByOri(GameUtils.getOriByAngle(angle));
                if (this.lastJoyAngle8 == joyAngle8) {
                    return;
                }
                this.lastJoyAngle8 = joyAngle8;
                Controller.stopJoy();
            }
        }
        else {
            angle = Math.floor(MathUtils.direction360(Game.player.sceneObject.x, Game.player.sceneObject.y, toX, toY));
            if (ClientWorld.data.moveToGridCenter && Game.player.sceneObject.isMoving) {
                Controller.stopJoy();
                return;
            }
            if (ClientWorld.data.moveToGridCenter) {
                var toP = GameUtils.getGridCenter(new Point(toX, toY));
                toX = toP.x;
                toY = toP.y;
            }
        }
        Controller.inputState = 2;
        Controller.startJoy(angle);
    };
    GamepadControl.onGamepadMenuDirChange = function (isJoy, dir) {
        ProjectUtils.fromGamePad = true;
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
    GamepadControl.onGamepadKeyDown = function (keyboardEventType, keyCode) {
        var _a;
        ProjectUtils.fromGamePad = true;
        if (GUI_Setting.IS_INPUT_KEY_MODE)
            return;
        switch (keyCode) {
            case GCGamepad.leftKeyIndex:
                return this.onGamepadMenuDirChange(true, 4);
            case GCGamepad.rightKeyIndex:
                return this.onGamepadMenuDirChange(true, 6);
            case GCGamepad.downKeyIndex:
                return this.onGamepadMenuDirChange(true, 2);
            case GCGamepad.upKeyIndex:
                return this.onGamepadMenuDirChange(true, 8);
        }
        var mapping = (_a = {},
            _a[GUI_Setting.GAMEPAD.X.key] = GUI_Setting.KEY_BOARD.X,
            _a[GUI_Setting.GAMEPAD.Y.key] = GUI_Setting.KEY_BOARD.Y,
            _a[GUI_Setting.GAMEPAD.A.key] = GUI_Setting.KEY_BOARD.A,
            _a[GUI_Setting.GAMEPAD.B.key] = GUI_Setting.KEY_BOARD.B,
            _a[GUI_Setting.GAMEPAD.L1.key] = GUI_Setting.KEY_BOARD.L1,
            _a[GUI_Setting.GAMEPAD.L2.key] = GUI_Setting.KEY_BOARD.L2,
            _a[GUI_Setting.GAMEPAD.R1.key] = GUI_Setting.KEY_BOARD.R1,
            _a[GUI_Setting.GAMEPAD.R2.key] = GUI_Setting.KEY_BOARD.R2,
            _a[GUI_Setting.GAMEPAD.BACK.key] = GUI_Setting.KEY_BOARD.BACK,
            _a[GUI_Setting.GAMEPAD.START.key] = GUI_Setting.KEY_BOARD.START,
            _a[GCGamepad.leftKeyIndex] = GUI_Setting.KEY_BOARD.LEFT,
            _a[GCGamepad.rightKeyIndex] = GUI_Setting.KEY_BOARD.RIGHT,
            _a[GCGamepad.downKeyIndex] = GUI_Setting.KEY_BOARD.DOWN,
            _a[GCGamepad.upKeyIndex] = GUI_Setting.KEY_BOARD.UP,
            _a);
        var keyboardInfo = mapping[keyCode];
        if (!keyboardInfo)
            return;
        stage.event(keyboardEventType, [{ keyCode: keyboardInfo.keys[0] }]);
    };
    GamepadControl.updateCount = 0;
    return GamepadControl;
}());
//# sourceMappingURL=GamepadControl.js.map