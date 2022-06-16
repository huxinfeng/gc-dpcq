














var MaterialData = (function () {
    function MaterialData() {
        this.____timeInfo = {};
    }
    return MaterialData;
}());
var MaterialData1 = (function (_super) {
    __extends(MaterialData1, _super);
    function MaterialData1() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 1;
        _this_1.r = 0;
        _this_1.g = 0;
        _this_1.b = 0;
        _this_1.gray = 0;
        _this_1.mr = 1;
        _this_1.mg = 1;
        _this_1.mb = 1;
        _this_1.useTime = false;
        _this_1.time = "";
        return _this_1;
    }
    return MaterialData1;
}(MaterialData));
var MaterialData2 = (function (_super) {
    __extends(MaterialData2, _super);
    function MaterialData2() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 2;
        _this_1.hue = 0;
        return _this_1;
    }
    return MaterialData2;
}(MaterialData));
var MaterialData3 = (function (_super) {
    __extends(MaterialData3, _super);
    function MaterialData3() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 3;
        _this_1.strength = 0;
        _this_1.useTime = false;
        _this_1.time = "";
        return _this_1;
    }
    return MaterialData3;
}(MaterialData));
var MaterialData4 = (function (_super) {
    __extends(MaterialData4, _super);
    function MaterialData4() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 4;
        _this_1.color = "#00FF00";
        _this_1.blur = 2;
        _this_1.offsetX = 0;
        _this_1.offsetY = 0;
        return _this_1;
    }
    return MaterialData4;
}(MaterialData));
var MaterialData5 = (function (_super) {
    __extends(MaterialData5, _super);
    function MaterialData5() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 5;
        _this_1.useTrans = false;
        _this_1.sigma = 0.2;
        _this_1.trans = "";
        _this_1.aspect = 1.7;
        return _this_1;
    }
    return MaterialData5;
}(MaterialData));
var MaterialData6 = (function (_super) {
    __extends(MaterialData6, _super);
    function MaterialData6() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 6;
        _this_1.useTrans = false;
        _this_1.time = 0;
        _this_1.trans = "";
        _this_1.useTrans1 = false;
        _this_1.sigma = 0.2;
        _this_1.trans1 = "";
        _this_1.useTrans2 = false;
        _this_1.strength = 0.02;
        _this_1.trans2 = "";
        _this_1.aspect = 1.7;
        return _this_1;
    }
    return MaterialData6;
}(MaterialData));
var MaterialData7 = (function (_super) {
    __extends(MaterialData7, _super);
    function MaterialData7() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 7;
        _this_1.tex2 = "";
        _this_1.useTrans = false;
        _this_1.time = 1;
        _this_1.trans = "";
        return _this_1;
    }
    return MaterialData7;
}(MaterialData));
var MaterialData8 = (function (_super) {
    __extends(MaterialData8, _super);
    function MaterialData8() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 8;
        _this_1.useTrans = false;
        _this_1.time = 0;
        _this_1.trans = "";
        _this_1.zoom = 0.5;
        _this_1.multiplier = 0.5;
        _this_1.centerX = 0.5;
        _this_1.centerY = 0.5;
        return _this_1;
    }
    return MaterialData8;
}(MaterialData));
var MaterialData9 = (function (_super) {
    __extends(MaterialData9, _super);
    function MaterialData9() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 9;
        _this_1.tex2 = "";
        _this_1.useTrans = false;
        _this_1.time = 0;
        _this_1.trans = "";
        return _this_1;
    }
    return MaterialData9;
}(MaterialData));
var MaterialData10 = (function (_super) {
    __extends(MaterialData10, _super);
    function MaterialData10() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 10;
        _this_1.mask = "";
        _this_1.useTrans = false;
        _this_1.time = 0;
        _this_1.trans = "";
        _this_1.vagueness = 0.25;
        _this_1.invertMask = 0;
        return _this_1;
    }
    return MaterialData10;
}(MaterialData));
var MaterialData11 = (function (_super) {
    __extends(MaterialData11, _super);
    function MaterialData11() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 11;
        _this_1.tex2 = "";
        _this_1.useTrans = false;
        _this_1.time = 0;
        _this_1.trans = "";
        _this_1.colorMulR = 1;
        _this_1.colorMulG = 1;
        _this_1.colorMulB = 1;
        _this_1.colorMulA = 1;
        _this_1.colorAddR = 0;
        _this_1.colorAddG = 0;
        _this_1.colorAddB = 0;
        _this_1.colorAddA = 0;
        _this_1.invertMask = 0;
        _this_1.alphaFactor = 0;
        return _this_1;
    }
    return MaterialData11;
}(MaterialData));
var MaterialData12 = (function (_super) {
    __extends(MaterialData12, _super);
    function MaterialData12() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 12;
        _this_1.useTrans = false;
        _this_1.trans = "";
        _this_1.pixelSize = 64;
        return _this_1;
    }
    return MaterialData12;
}(MaterialData));
var MaterialData13 = (function (_super) {
    __extends(MaterialData13, _super);
    function MaterialData13() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 13;
        _this_1.t = "";
        _this_1.amplitude = 0.3;
        _this_1.angularVelocity = 10;
        _this_1.speed = 10;
        return _this_1;
    }
    return MaterialData13;
}(MaterialData));
var MaterialData14 = (function (_super) {
    __extends(MaterialData14, _super);
    function MaterialData14() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 14;
        _this_1.t = "";
        _this_1.timeScale = 1;
        return _this_1;
    }
    return MaterialData14;
}(MaterialData));
var MaterialData15 = (function (_super) {
    __extends(MaterialData15, _super);
    function MaterialData15() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 15;
        _this_1.tex2 = "";
        _this_1.uvScale = 1;
        _this_1.noiseTimeScale = 1;
        _this_1.t = "";
        return _this_1;
    }
    return MaterialData15;
}(MaterialData));
var MaterialData16 = (function (_super) {
    __extends(MaterialData16, _super);
    function MaterialData16() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 16;
        _this_1.tex2 = "";
        _this_1.t = "";
        _this_1.dissolveSpeed = 1;
        _this_1.edgeWidth = 1;
        _this_1.edgeColorR = 1;
        _this_1.edgeColorG = 1;
        _this_1.edgeColorB = 1;
        _this_1.edgeColorA = 1;
        _this_1.startTime = 0;
        return _this_1;
    }
    return MaterialData16;
}(MaterialData));
var MaterialData17 = (function (_super) {
    __extends(MaterialData17, _super);
    function MaterialData17() {
        var _this_1 = _super !== null && _super.apply(this, arguments) || this;
        _this_1.id = 17;
        _this_1.lineColorR = 0;
        _this_1.lineColorG = 0;
        _this_1.lineColorB = 0;
        _this_1.lineColorA = 0;
        _this_1.lineWidth = 0.1;
        _this_1.rangeX = "";
        return _this_1;
    }
    return MaterialData17;
}(MaterialData));
//# sourceMappingURL=MaterialRuntime.js.map