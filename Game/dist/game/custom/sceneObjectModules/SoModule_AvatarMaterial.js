














var SoModule_AvatarMaterial = (function (_super) {
    __extends(SoModule_AvatarMaterial, _super);
    function SoModule_AvatarMaterial(installCB) {
        var _this_1 = _super.call(this, installCB) || this;
        for (var i = 0; i < _this_1.materialData.length; i++) {
            var materials = _this_1.materialData[i].materials;
            for (var s = 0; s < materials.length; s++) {
                _this_1.so.avatar.addMaterial(materials[s]);
            }
        }
        return _this_1;
    }
    SoModule_AvatarMaterial.prototype.onRemoved = function () {
        for (var i = 0; i < this.materialData.length; i++) {
            var materials = this.materialData[i].materials;
            for (var s = 0; s < materials.length; s++) {
                this.so.avatar.removeMaterial(materials[s]);
            }
        }
    };
    SoModule_AvatarMaterial.prototype.refresh = function () {
    };
    return SoModule_AvatarMaterial;
}(SceneObjectModule_2));
//# sourceMappingURL=SoModule_AvatarMaterial.js.map