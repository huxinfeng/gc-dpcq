/**
 * 项目层工具类
 * Created by 黑暗之神KDS on 2020-09-13 22:48:37.
 */
class ProjectUtils {
    // 最近的鼠标滚动值
    static mouseWhileValue: number = 0;
    /**
     * 回调函数辅助者：重用实例
     */
    static callbackHelper: Callback = new Callback;
    /**
     * 点辅助者：重用实例
     */
    static pointHelper: Point = new Point;
    /**
     * 矩形辅助者：重用实例
     */
    static rectangleHelper: Rectangle = new Rectangle;
    /**
     * 当前按键的事件对象
     */
    static keyboardEvent: EventObject;
    /**
     * 最近的操控方式 0-鼠标 1-按键 2-手柄
     */
    static lastControl: number = 0;
    /**
     * 当前按键来自手柄
     */
    static fromGamePad: boolean;
    /**
     * 矩形对象池
     */
    private static rectanglePool: PoolUtils = new PoolUtils(Rectangle);
    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    static init() {
        // 鼠标滚动值
        stage.on(EventObject.MOUSE_WHEEL, this, (e: EventObject) => { ProjectUtils.mouseWhileValue = e.delta; });
        // 鼠标移动
        stage.on(EventObject.MOUSE_MOVE, this, (e: EventObject) => { ProjectUtils.lastControl = 0; });
        // 注册键盘点击事件
        stage.on(EventObject.KEY_DOWN, this, (e: EventObject) => { ProjectUtils.lastControl = ProjectUtils.fromGamePad ? 2 : 1; ProjectUtils.fromGamePad = false; this.keyboardEvent = e; });
        // 注册键盘弹起事件
        stage.on(EventObject.KEY_UP, this, (e: EventObject) => { this.keyboardEvent = null; });
    }
    //------------------------------------------------------------------------------------------------------
    // Rectangle
    //------------------------------------------------------------------------------------------------------
    /**
     * 创建Rectangle
     */
    static takeoutRect(): Rectangle {
        return ProjectUtils.rectanglePool.takeout();
    }
    /**
     * 返还Rectangle
     * @param rect 
     */
    static freeRect(rect: Rectangle): void {
        ProjectUtils.rectanglePool.free(rect);
    }
    //------------------------------------------------------------------------------------------------------
    // 时间
    //------------------------------------------------------------------------------------------------------
    /**
     * 格式化日期
     * @param fmt 格式化字符串规格 如    
     * @param date 
     * @return [String] 
     */
    static dateFormat(fmt: string, date: Date): string {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }
    /**
     * 格式化计时器
     * @param time 时间段（毫秒）
     * @return [string] 
     */
    static timerFormat(time: number): string {
        var S = 1000;
        var M = S * 60;
        var H = M * 60;
        var hTotal = Math.floor(time / H);
        var hStr = MathUtils.fixIntDigit(hTotal, 2);
        time -= H * hTotal;
        var mTotal = Math.floor(time / M);
        var mStr = MathUtils.fixIntDigit(mTotal, 2);
        time -= M * mTotal;
        var sTotal = Math.floor(time / S);
        var sStr = MathUtils.fixIntDigit(sTotal, 2);
        return hStr + ":" + mStr + ":" + sStr;
    }

    /**
     * 获取玩家的角色
     * @param actorCheckType 检查类别 0-通过角色编号获取玩家队伍的角色 1-通过角色所在队伍的位置 2-通过场景对象编号查找
     * @param actorIDUseVar  检查类别0的参数：指定角色编号的模式 0-常量 1-变量
     * @parma actorID        检查类别0的参数：角色编号
     * @param actorIDVarID   检查类别0的参数：记录角色编号的数值变量编号
     * @param actorInPartyIndexVarIDUseVar 检查类别1的参数：指定角色所在队伍位置的模式 0-常量 1-变量
     * @param actorInPartyIndex            检查类别1的参数：角色所在队伍的位置
     * @param actorInPartyIndexVarID       检查类别1的参数：记录角色所在队伍位置的数值变量编号
     * @param soType        检查类别2的参数：指定场景对象的方式 0-触发者 1-执行者 2-指定编号
     * @param soIndexUseVar 检查类别2的参数：指定场景对象编号的模式 0-常量 1-变量
     * @param soIndex       检查类别2的参数：场景对象编号
     * @param soIndexVarID  检查类别2的参数：记录场景对象编号的数值变量编号
     * @param trigger       检查类别2的参数：触发器，如在事件执行时调用该函数则可传递触发器过来使用，以便判定触发者、执行者
     */
    static getPlayerActorByCheckType(actorCheckType: number, actorIDUseVar: number, actorID: number, actorIDVarID: number,
        actorInPartyIndexVarIDUseVar: number, actorInPartyIndex: number, actorInPartyIndexVarID: number,
        soType: number, soIndexUseVar: number, soIndex: number, soIndexVarID: number, trigger: CommandTrigger): DataStructure_inPartyActor {
        // 通过角色编号获取玩家队伍的角色
        if (actorCheckType == 0) {
            var pActorID = MathUtils.int(actorIDUseVar ? Game.player.variable.getVariable(actorIDVarID) : actorID);
            return ProjectPlayer.getPlayerActorDSByActorID(pActorID);
        }
        // 通过角色所在队伍的位置
        else if (actorCheckType == 1) {
            var pActorInPartyIndex = MathUtils.int(actorInPartyIndexVarIDUseVar ? Game.player.variable.getVariable(actorInPartyIndexVarID) : actorInPartyIndex);
            return ProjectPlayer.getPlayerActorDSByInPartyIndex(pActorInPartyIndex);
        }
        // 通过场景对象编号查找
        else if (actorCheckType == 2) {
            var soc = ProjectClientScene.getSceneObjectBySetting(soType + 1, soIndex, soIndexUseVar, soIndexVarID, trigger);
            // -- 如果是战斗者且是玩家拥有的角色的话则返回角色数据
            if (GameBattleHelper.isBattler(soc)) {
                var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(soc.actor);
                return ProjectPlayer.getPlayerActorDSByInPartyIndex(inPlayerActorIndex);
            }
        }
    }
    /**
     * 根据场景对象获取角色
     * @param soType 类别 0-触发者 1-执行者 2-指定编号
     * @param soIndexUseVar 指定场景对象编号的模式 0-常量 1-变量
     * @param soIndex 指定的编号
     * @param soIndexVarID 使用的变量ID
     * @param trigger 触发器，如在事件执行时调用该函数则可传递触发器过来使用，以便判定触发者、执行者
     * @return [Module_Actor] 
     */
    static getActorBySceneObjectIndex(soType: number, soIndexUseVar: number, soIndex: number, soIndexVarID: number, trigger: CommandTrigger): Module_Actor {
        // 根据设定获取场景对象
        var soc = ProjectClientScene.getSceneObjectBySetting(soType + 1, soIndex, soIndexUseVar, soIndexVarID, trigger);
        // 如果是战斗者的话则返回对应的角色数据
        if (GameBattleHelper.isBattler(soc)) {
            return soc.actor;
        }
        return null;
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 元素组索引移动
     * 根据相对的方位和距离计算
     * @param groupElements 元素组信息
     * @param currentIndex 索引
     * @param moveDir 2=下 4=左 6=右 8=上
     * @param fuzzySearch [可选] 默认值=false 模糊搜索，如果启用则在相对方位还会搜索临近的两个方向
     */
    static groupElementsMoveIndex(groupElements: { x: number, y: number }[], currentIndex: number, moveDir: number, limitSecondAxis: number = 50): number {
        var currentElement = currentIndex == -1 ? { x: 0, y: 0 } : groupElements[currentIndex];
        // 对应移动方向允许的方位
        var allowOris: number[] = {
            2: [1, 2, 3], // 下方向
            4: [1, 4, 7], // 左方向
            6: [3, 6, 9], // 右方向
            8: [7, 8, 9]  // 上方向
        }[moveDir];
        if (!allowOris) return null;
        // 获取第二轴参考
        var secondAxisName: string = (moveDir == 4 || moveDir == 6) ? "y" : "x";
        // 遍历所有节点
        var minDis = Number.MAX_VALUE;
        var minIndex: number = null;
        for (var i = 0; i < groupElements.length; i++) {
            var targetEle = groupElements[i];
            if (i == currentIndex) continue;
            var angle = MathUtils.direction360(currentElement.x, currentElement.y, targetEle.x, targetEle.y);
            var ori = GameUtils.getOriByAngle(angle);
            // -- 去除方位不对的节点
            if (allowOris.indexOf(ori) == -1) continue;
            // -- 获取第二轴的距离
            var secondAxisDistance = Math.abs(targetEle[secondAxisName] - currentElement[secondAxisName]);
            if (secondAxisDistance > limitSecondAxis) continue;
            // -- 获取最短的距离
            var dis2 = Point.distanceSquare2(currentElement.x, currentElement.y, targetEle.x, targetEle.y);
            if (dis2 < minDis) {
                minDis = dis2;
                minIndex = i;
            }
        }
        return minIndex;
    }


}