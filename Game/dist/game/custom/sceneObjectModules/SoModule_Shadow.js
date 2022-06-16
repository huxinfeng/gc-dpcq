














var SoModule_Shadow = (function (_super) {
    __extends(SoModule_Shadow, _super);
    function SoModule_Shadow(installCB) {
        var _this_1 = _super.call(this, installCB) || this;
        _this_1.so.on(ProjectClientSceneObject.JUMP_START, _this_1, _this_1.startUpdateDraw);
        _this_1.so.on(ProjectClientSceneObject.JUMP_OVER, _this_1, _this_1.stopUpdateDraw);
        _this_1.drawShadow();
        return _this_1;
    }
    SoModule_Shadow.prototype.onRemoved = function () {
        this.so.off(ProjectClientSceneObject.JUMP_START, this, this.startUpdateDraw);
        this.so.off(ProjectClientSceneObject.JUMP_OVER, this, this.stopUpdateDraw);
        this.stopUpdateDraw();
        this.clearShadow();
    };
    SoModule_Shadow.prototype.refresh = function () {
        this.drawShadow();
    };
    SoModule_Shadow.prototype.clearShadow = function () {
        this.so.shadow.graphics.clear();
    };
    SoModule_Shadow.prototype.drawShadow = function () {
        var scalePer = 1 - (this.so.avatar.y / -ClientWorld.data.jumpHeight) * 0.5;
        this.so.shadow.graphics.clear();
        this.so.shadow.graphics.drawCircle(0, 0, this.shadowWidth * scalePer, "#000000");
        this.so.shadow.scaleY = this.shadowHeight / this.shadowWidth * this.so.avatar.scaleY;
        this.so.shadow.scaleX = this.so.avatar.scaleX;
        this.so.shadow.alpha = this.shadowAlpha;
    };
    SoModule_Shadow.prototype.startUpdateDraw = function () {
        stage.on(EventObject.RENDER, this, this.drawShadow);
    };
    SoModule_Shadow.prototype.stopUpdateDraw = function () {
        stage.off(EventObject.RENDER, this, this.drawShadow);
    };
    return SoModule_Shadow;
}(SceneObjectModule_1));
//# sourceMappingURL=SoModule_Shadow.js.map