














var SceneObjectModule = (function () {
    function SceneObjectModule(installCB) {
        installCB && installCB.runWith([this]);
    }
    SceneObjectModule.prototype.onRemoved = function () {
    };
    SceneObjectModule.prototype.refresh = function () {
    };
    SceneObjectModule.prototype.dispose = function () {
        this.so = null;
        this.name = null;
        this.isDisposed = true;
    };
    SceneObjectModule.moduleClassArr = [];
    return SceneObjectModule;
}());
var SceneObjectCommon = (function (_super) {
    __extends(SceneObjectCommon, _super);
    function SceneObjectCommon(soData, scene) {
        return _super.call(this, soData, scene) || this;
    }
    return SceneObjectCommon;
}(ClientSceneObject));
var SceneObjectModule_1 = (function (_super) {
    __extends(SceneObjectModule_1, _super);
    function SceneObjectModule_1(installCB) {
        return _super.call(this, installCB) || this;
    }
    return SceneObjectModule_1;
}(SceneObjectModule));
SceneObjectModule.moduleClassArr[1] = SceneObjectModule_1;
var SceneObjectModule_2 = (function (_super) {
    __extends(SceneObjectModule_2, _super);
    function SceneObjectModule_2(installCB) {
        return _super.call(this, installCB) || this;
    }
    return SceneObjectModule_2;
}(SceneObjectModule));
SceneObjectModule.moduleClassArr[2] = SceneObjectModule_2;
var SceneObjectModule_3 = (function (_super) {
    __extends(SceneObjectModule_3, _super);
    function SceneObjectModule_3(installCB) {
        return _super.call(this, installCB) || this;
    }
    return SceneObjectModule_3;
}(SceneObjectModule));
SceneObjectModule.moduleClassArr[3] = SceneObjectModule_3;
//# sourceMappingURL=SceneObjectModules.js.map