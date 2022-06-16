var MouseControl = (function () {
    function MouseControl() {
    }
    MouseControl.start = function () {
        var sceneLayer = Game.currentScene.displayObject;
        if (WorldData.selectSceneObjectEffect != 0 && !this.selectEffect) {
            this.selectEffect = new GCAnimation;
            this.selectEffect.id = WorldData.selectSceneObjectEffect;
            this.selectEffect.loop = true;
            this.selectEffect.play();
        }
        sceneLayer.width = Game.currentScene.width;
        sceneLayer.height = Game.currentScene.height;
        for (var i in MouseControl.mouseEvents) {
            sceneLayer.on(MouseControl.mouseEvents[i], this, this.onSceneLayerMouseEvent);
        }
        sceneLayer.on(EventObject.MOUSE_DOWN, this, MouseControl.onSceneMouseDown);
        sceneLayer.on(EventObject.MOUSE_MOVE, this, MouseControl.onSceneMouseMove);
    };
    MouseControl.stop = function () {
        if (MouseControl.selectSceneObject)
            this.unselectOneSceneObject(MouseControl.selectSceneObject);
        var sceneLayer = Game.currentScene.displayObject;
        for (var i in MouseControl.mouseEvents) {
            sceneLayer.on(MouseControl.mouseEvents[i], this, this.onSceneLayerMouseEvent);
        }
        sceneLayer.off(EventObject.MOUSE_DOWN, this, MouseControl.onSceneMouseDown);
        sceneLayer.off(EventObject.MOUSE_MOVE, this, MouseControl.onSceneMouseMove);
    };
    MouseControl.updateSelectSceneObject = function () {
        if (!Game.currentScene || Game.currentScene == ClientScene.EMPTY)
            return;
        var len = Game.currentScene.sceneObjects.length;
        var globalP = Game.currentScene.globalPos;
        for (var i = len - 1; i >= 0; i--) {
            var soc = Game.currentScene.sceneObjects[i];
            if (!soc)
                continue;
            if (!soc.root.stage)
                continue;
            if (!soc.selectEnabled)
                continue;
            this.unselectOneSceneObject(soc);
            if (soc.avatar.hitTestPoint(globalP.x, globalP.y)) {
                this.selectOneSceneObject(soc);
                return;
            }
        }
    };
    MouseControl.unselectOneSceneObject = function (soc) {
        if (soc == this.selectSceneObject) {
            this.selectSceneObject = null;
            if (WorldData.selectSceneObjectEffect != 0 && this.selectEffect) {
                this.selectEffect.removeFromGameSprite();
            }
        }
    };
    MouseControl.selectOneSceneObject = function (soc) {
        if (this.selectSceneObject)
            this.unselectOneSceneObject(this.selectSceneObject);
        this.selectSceneObject = soc;
        if (WorldData.selectSceneObjectEffect != 0 && this.selectEffect) {
            this.selectEffect.addToGameSprite(soc.avatarContainer, soc.animationLowLayer, soc.animationHighLayer);
        }
    };
    MouseControl.onSceneLayerMouseEvent = function (e) {
        this.eventDispatcher.event(e.type, [e]);
    };
    MouseControl.onSceneMouseDown = function (e) {
        this.updateSelectSceneObject();
        if (!Controller.inSceneEnabled)
            return;
        if (this.selectSceneObject && this.selectSceneObject.inScene) {
            Controller.moveToNearTargetSceneObjectAndTriggerClickEvent(this.selectSceneObject);
        }
        else {
            GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, ProjectPlayer.ctrlActorSceneObject.actor.atkSkill);
        }
    };
    MouseControl.onSceneMouseMove = function () {
        this.updateSelectSceneObject();
    };
    MouseControl.mouseEvents = [EventObject.MOUSE_DOWN, EventObject.MOUSE_UP, EventObject.CLICK, EventObject.DOUBLE_CLICK, EventObject.RIGHT_MOUSE_DOWN, EventObject.RIGHT_MOUSE_UP, EventObject.RIGHT_CLICK, EventObject.MOUSE_WHEEL, EventObject.MOUSE_MOVE];
    MouseControl.eventDispatcher = new EventDispatcher;
    return MouseControl;
}());
//# sourceMappingURL=MouseControl.js.map