














var GUI_SkillIcon = (function (_super) {
    __extends(GUI_SkillIcon, _super);
    function GUI_SkillIcon() {
        var _this_1 = _super.call(this) || this;
        _this_1.updateCount = 0;
        _this_1.coolingMask.removeSelf();
        _this_1.iconBlack.setTonal(-200, -200, -200, 100);
        os.add_ENTERFRAME(_this_1.update, _this_1);
        return _this_1;
    }
    GUI_SkillIcon.prototype.dispose = function () {
        os.remove_ENTERFRAME(this.update, this);
        _super.prototype.dispose.call(this);
    };
    GUI_SkillIcon.prototype.setData = function (skill) {
        this.skill = skill;
        this.icon.mask = null;
        if (this.skill) {
            this.icon.image = this.iconBlack.image = skill.icon;
            if (this.skill.totalCD != 0) {
                this.icon.mask = this.coolingMask;
            }
        }
        else {
            this.icon.image = this.iconBlack.image = "";
        }
        this.update();
    };
    GUI_SkillIcon.prototype.update = function () {
        if (!this.skill)
            return;
        this.updateCount++;
        if (this.updateCount % 3 == 0) {
            if (Game.currentScene) {
                var useEnabled = GameBattleHelper.canUseOneSkill(ProjectPlayer.ctrlActorSceneObject, this.skill, true);
                this.icon.alpha = useEnabled ? 1 : 0.2;
            }
        }
        if (this.skill.totalCD == 0)
            return;
        var intervalTime = Game.now - this.skill.currentCD;
        var coolingTime = this.skill.totalCD * 1000;
        var per = Math.min(intervalTime / coolingTime, 1);
        if (this.skill.currentCD == 0)
            per = 1;
        if (per < 1 && !this.coolingSign) {
            this.coolingSign = true;
        }
        else if (per == 1 && this.coolingSign) {
            this.coolingSign = false;
            var ani = new GCAnimation();
            ani.id = 1016;
            ani.addToGameSprite(this.target, this, this);
            this.addChild(ani);
            ani.play();
            ani.once(GCAnimation.PLAY_COMPLETED, this, function (ani) {
                ani.dispose();
            }, [ani]);
        }
        this.coolingMask.graphics.clear();
        var pr = -90;
        this.coolingMask.graphics.drawPie(this.icon.width / 2, this.icon.height / 2, this.icon.width, 0 + pr, per * 359 + pr, "#FF0000");
    };
    return GUI_SkillIcon;
}(GUI_1030));
//# sourceMappingURL=GUI_SkillIcon.js.map