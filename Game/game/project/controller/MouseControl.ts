/**
 * 鼠标控制器
 * Created by 黑暗之神KDS on 2020-03-26 06:05:08.
 */
class MouseControl {
    /**
     * 鼠标事件集
     */
    static mouseEvents = [EventObject.MOUSE_DOWN, EventObject.MOUSE_UP, EventObject.CLICK, EventObject.DOUBLE_CLICK, EventObject.RIGHT_MOUSE_DOWN, EventObject.RIGHT_MOUSE_UP, EventObject.RIGHT_CLICK, EventObject.MOUSE_WHEEL, EventObject.MOUSE_MOVE];
    /**
     * 事件派发器
     */
    static eventDispatcher: EventDispatcher = new EventDispatcher;
    /**
     * 选中的场景对象
     */
    static selectSceneObject: ProjectClientSceneObject;
    /**
     * 选中场景对象时的动画效果
     */
    private static selectEffect: GCAnimation;
    //------------------------------------------------------------------------------------------------------
    // 启动或停止
    //------------------------------------------------------------------------------------------------------
    /**
     * 启动控制器
     */
    static start(): void {
        var sceneLayer = Game.currentScene.displayObject;
        // 初始化选中时效果
        if (WorldData.selectSceneObjectEffect != 0 && !this.selectEffect) {
            this.selectEffect = new GCAnimation;
            this.selectEffect.id = WorldData.selectSceneObjectEffect;
            this.selectEffect.loop = true;
            this.selectEffect.play();
        }
        // 初始化
        sceneLayer.width = Game.currentScene.width;
        sceneLayer.height = Game.currentScene.height;
        // 抛出同等事件
        for (var i in MouseControl.mouseEvents) {
            sceneLayer.on(MouseControl.mouseEvents[i], this, this.onSceneLayerMouseEvent);
        }
        // 操作事件
        sceneLayer.on(EventObject.MOUSE_DOWN, this, MouseControl.onSceneMouseDown);
        sceneLayer.on(EventObject.MOUSE_MOVE, this, MouseControl.onSceneMouseMove);
    }
    /**
     * 关闭控制器 
     */
    static stop(): void {
        if (MouseControl.selectSceneObject) this.unselectOneSceneObject(MouseControl.selectSceneObject);
        var sceneLayer = Game.currentScene.displayObject;
        for (var i in MouseControl.mouseEvents) {
            sceneLayer.on(MouseControl.mouseEvents[i], this, this.onSceneLayerMouseEvent);
        }
        // 场景对象
        sceneLayer.off(EventObject.MOUSE_DOWN, this, MouseControl.onSceneMouseDown);
        sceneLayer.off(EventObject.MOUSE_MOVE, this, MouseControl.onSceneMouseMove);
    }
    //------------------------------------------------------------------------------------------------------
    // 选中效果
    //------------------------------------------------------------------------------------------------------
    /**
     * 更新选中场景对象的效果
     * @param e 
     */
    static updateSelectSceneObject() {
        if (!Game.currentScene || Game.currentScene == ClientScene.EMPTY) return;
        var len = Game.currentScene.sceneObjects.length;
        var globalP = Game.currentScene.globalPos;
        for (var i = len - 1; i >= 0; i--) {
            var soc = Game.currentScene.sceneObjects[i];
            if (!soc) continue;
            if (!soc.root.stage) continue;
            if (!soc.selectEnabled) continue;
            // 非选中效果
            this.unselectOneSceneObject(soc);
            // 像素级检测
            if (soc.avatar.hitTestPoint(globalP.x, globalP.y)) {
                this.selectOneSceneObject(soc);
                return;
            }
        }
    }
    /**
     * 取消选中场景对象
     */
    static unselectOneSceneObject(soc: ProjectClientSceneObject): void {
        if (soc == this.selectSceneObject) {
            this.selectSceneObject = null;
            if (WorldData.selectSceneObjectEffect != 0 && this.selectEffect) {
                this.selectEffect.removeFromGameSprite();
            }
        }
    }
    /**
     * 选中场景对象
     * @param soc 场景对象
     */
    static selectOneSceneObject(soc: ProjectClientSceneObject): void {
        if (this.selectSceneObject) this.unselectOneSceneObject(this.selectSceneObject);
        this.selectSceneObject = soc;
        if (WorldData.selectSceneObjectEffect != 0 && this.selectEffect) {
            this.selectEffect.addToGameSprite(soc.avatarContainer, soc.animationLowLayer, soc.animationHighLayer);
        }
    }
    /**
     * 场景鼠标事件
     * @param e 
     */
    private static onSceneLayerMouseEvent(e: EventObject) {
        this.eventDispatcher.event(e.type, [e]);
    }
    /**
     * 鼠标左键点击场景的场合
     * @param e 
     */
    private static onSceneMouseDown(e: EventObject): void {
        // 刷新选中效果
        this.updateSelectSceneObject();
        // 当无法控制时忽略
        if (!Controller.inSceneEnabled) return;
        // 选中对象时：移动至其附近并执行点击事件
        if (this.selectSceneObject && this.selectSceneObject.inScene) {
            Controller.moveToNearTargetSceneObjectAndTriggerClickEvent(this.selectSceneObject);
        }
        else {
            // 
            GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, ProjectPlayer.ctrlActorSceneObject.actor.atkSkill);
        }
    }
    /**
     * 鼠标在场景中移动的场合
     */
    private static onSceneMouseMove() {
        // 刷新选中效果
        this.updateSelectSceneObject();
    }

}