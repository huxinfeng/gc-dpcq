/**
 * 变量集合
 * 包含数值变量、字符串变量、开关变量
 * 分为全局变量（单机版则是二周目变量）和玩家变量
 *  -- 关于单机版内核-二周目变量：不会随着读档而改变，而是贯穿于整个游戏。
 *  -- 关于网络版内核-全局变量：整个世界的变量，所有玩家访问的是同一个世界变量
 * 变量的改变会对一些有出现条件的组件、场景对象产生影响
 * 系统设计上监听了变量的改变，当变量改变时相应的地方会自动同步：
 *  -- 界面控件：一些组件可以绑定变量，绑定后变量改动会自动显示最新值无需额外的实现
 *     -- 玩家数值变量组件 [UIVariable]
 *     -- 玩家开关变量组件 [UISwitch]
 *     -- 文本组件（可绑定玩家字符串变量） [UIString]
 *  -- 客户端脚本中主动监听玩家变量的改变，参考 [ClientPlayer]
 *  -- 单机版支持监听二周目变量，网络版仅支持一次获取，参考 [ClientWorld]
 * 携带变量的类：玩家（[Player]）、世界（[ClientWorld]、[ServerWorld]）
 *
 * Created by 黑暗之神KDS on 2018-04-17 16:48:07.
 */
declare class Variable {
    /**
     * 获取数值变量
     * @param index 变量ID
     */
    getVariable(varID: number): number;
    /**
     * 设置数值变量
     * @param varID 变量ID
     * @param v 数值
     */
    setVariable(varID: number, v: number): void;
    /**
     * 获取开关变量
     * @param varID 变量ID
     */
    getSwitch(varID: number): number;
    /**
     * 设置开关变量
     * @param index 变量ID
     * @param v 开关值 0-关闭 1-开启
     */
    setSwitch(varID: number, v: number): void;
    /**
     * 获取字符串变量
     * @param varID 变量ID
     */
    getString(varID: number): string;
    /**
     * 设置字符串变量
     * @param varID 变量ID
     * @param v 字符串值
     */
    setString(varID: number, v: string): void;
}
