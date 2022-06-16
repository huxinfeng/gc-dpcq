/**
 * #1 角色
 */
class Module_Actor {
    id: number;
    name: string;
    face: string; // = ""; 头像
    class: number; // = 1; 职业
    avatar: number; // = 0; 行走图
    growUpEnabled: boolean; // = false; 可成长角色
    dropEnabled: boolean; // = false; 死亡后掉落设定
    smallFace: string; // = ""; 小头像
    whenDeadEvent: string; // = "1"; 当死亡时处理
    isPeriodicResurrection: boolean; // = false; 自动复活
    periodicResurrectionTime: number; // = 10; 复活时间
    MaxHP: number; // = 100; 生命值
    MaxSP: number; // = 100; 魔法值
    POW: number; // = 10; 力量
    END: number; // = 5; 耐力
    MAG: number; // = 0; 魔力
    AGI: number; // = 0; 敏捷
    MaxHPGrow: string; // = ""; 生命值
    MaxSPGrow: string; // = ""; 魔法值
    POWGrow: string; // = ""; 力量
    ENDGrow: string; // = ""; 耐力
    MAGGrow: string; // = ""; 魔力
    AGIGrow: string; // = ""; 敏捷
    MaxLv: number; // = 100; 最大等级
    needEXPGrow: string; // = ""; 经验值设定
    MagDef: number; // = 0; 魔法防御力
    HIT: number; // = 100; 命中率
    MoveSpeed: number; // = 150; 移动速度
    atkSkill: Module_Skill; // = 1; 攻击技能
    skills: Module_Skill[]; // = [];
    equips: Module_Equip[]; // = [];
    aiType: number; // = 0; 行动类别
    aiVigilanceRange: number; // = 350; 警戒范围
    aiGetTargetMode: number; // = 0; 获取目标的方式
    moveType: number; // = 1; 移动方式
    lostTargetRange1: number; // = 1000; 丢失目标的距离-A
    lostTargetRange2: number; // = 1000; 丢失目标的距离-B
    lostTargetBack: boolean; // = true; 丢失目标后返回进入战斗的地点
    vigilanceAngle: number; // = 150; 警戒角度
    dropGold: number; // = 0; 掉落金币
    dropExp: number; // = 0; 掉落经验值
    dropEquips: DataStructure_dropEquip[]; // = [];
    dropItems: DataStructure_dropItem[]; // = [];
    currentEXP: number; // = 0; 当前经验值
    increaseMaxHP: number; // = 0; 增加的最大生命值
    increaseMaxSP: number; // = 0; 增加的最大魔法值
    increasePow: number; // = 0; 增加的力量
    increaseEnd: number; // = 0; 增加的耐力
    increaseMag: number; // = 0; 增加的魔力
    increaseAgi: number; // = 0; 增加的敏捷
    status: Module_Status[]; // = [];
    ATK: number; // = 0; 攻击力
    DEF: number; // = 0; 防御力
    DOD: number; // = 0; 躲避率
    CRIT: number; // = 0; 暴击率
    MagCrit: number; // = 0; 暴击率
    AI: boolean; // = false;
    hp: number; // = 1;
    sp: number; // = 1;
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
}
/**
 * #2 职业
 */
class Module_Class {
    id: number;
    name: string;
    lvUpAutoGetSkills: DataStructure_levelUpLearnSkill[]; // = [];
    canWearEquips: number[]; // = [];
    icon: string; // = ""; 职业图标
}
/**
 * #3 技能
 */
class Module_Skill {
    id: number;
    name: string;
    icon: string; // = ""; 技能图标
    intro: string; // = "";  
    skillType: number; // = 0; 技能类别
    useCondition: number; // = 0; 使用条件
    targetType: number; // = 2; 作用目标
    targetNum: number; // = 2; 目标个数
    skillReleaseType: number; // = 0; 范围类别
    scanAngle: number; // = 60; 角度
    distance: number; // = 100; 作用距离
    hitRange: number; // = 60; 碰撞范围
    totalCD: number; // = 1; 冷却时间
    hit: number; // = 100; 命中率
    costSP: number; // = 0; 消耗魔法值
    useDamage: boolean; // = false; 计算伤害
    releaseFrame: number; // = 1; 释放帧
    releaseActionID: number; // = 1; 释放动作
    useHate: boolean; // = false; 造成仇恨
    useAction2: boolean; // = true; 额外的动作
    releaseFrame2: number; // = 1; 释放帧
    releaseActionID2: number; // = 1; 释放动作2
    bulletSpeed: number; // = 0; 弹幕速度
    bulletAnimation: number; // = 0; 弹幕对象
    bulletRotation: boolean; // = true; 弹幕根据方位旋转
    damageType: number; // = 0; 伤害类型
    damageValue: number; // = 0; 数值
    additionMultiple: number; // = 100; 属性加成值
    useAddition: boolean; // = false; 属性加成
    additionMultipleType: number; // = 0; 加成类别
    fixedHeteValue: number; // = 0; 固定仇恨值
    damageHatePer: number; // = 100; 按伤害数值比例增加仇恨
    releaseAnimation: number; // = 0; 释放动画
    hitAnimation: number; // = 0; 击中目标的动画
    releaseEvent: string; // = ""; 使用技能时事件
    hitEvent: string; // = ""; 击中目标时事件
    addStatus: number[]; // = [];
    removeStatus: number[]; // = [];
    maxHP: number; // = 0;
    maxSP: number; // = 0;
    atk: number; // = 0; 攻击力
    def: number; // = 0; 防御力
    mag: number; // = 0; 魔力
    magDef: number; // = 0; 魔法防御力
    hit1: number; // = 0; 命中率变更
    moveSpeed: number; // = 0; 移动速度
    agi: number; // = 0; 敏捷
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
    currentCD: number; // = 0;
}
/**
 * #4 装备
 */
class Module_Equip {
    id: number;
    name: string;
    icon: string; // = ""; 装备图标
    intro: string; // = "";  
    sell: number; // = 0; 商店售价
    partID: number; // = 0; 部位
    sellEnabled: boolean; // = true; 允许出售
    maxHP: number; // = 0;
    maxSP: number; // = 0;
    atk: number; // = 0; 攻击力
    def: number; // = 0; 防御力
    mag: number; // = 0; 魔力
    magDef: number; // = 0; 魔法防御力
    hit: number; // = 0; 命中率变更
    moveSpeed: number; // = 0; 移动速度
    agi: number; // = 0; 敏捷
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
}
/**
 * #5 道具
 */
class Module_Item {
    id: number;
    name: string;
    icon: string; // = ""; 图标
    intro: string; // = "";
    sell: number; // = 0; 商店售价
    isUse: boolean; // = false; 可使用
    sellEnabled: boolean; // = true; 允许出售
    isConsumables: boolean; // = false; 消耗品
    callEvent: string; // = ""; 使用后执行的事件
    se: string; // = ""; 非战斗使用时音效
    isSingleTarget: boolean; // = true; 指定单个目标
    applyDeadBattler: boolean; // = true; 指定已死亡的目标
    useAnimation: number; // = 0; 使用时战斗者动画
    recoveryHP: number; // = 0; 恢复生命值
    recoverySP: number; // = 0; 恢复魔法值
    addStatus: number[]; // = [];
    removeStatus: number[]; // = [];
}
/**
 * #6 状态
 */
class Module_Status {
    id: number;
    name: string;
    icon: string; // = ""; 图标
    intro: string; // = "";
    totalDuration: number; // = 1; 持续时间
    overtime: boolean; // = false; DOT/HOT
    statusHit: number; // = 1; 命中率
    cantMove: boolean; // = false; 无法移动
    cantAtk: boolean; // = false; 无法攻击
    cantUseSkill: boolean; // = false; 无法使用技能
    removeWhenInjured: boolean; // = false; 受伤时解除
    maxlayer: number; // = 1; 最大叠加层
    removePer: number; // = 100; 解除概率
    animation: number; // = 1; 状态自动动画
    cantAutoPlay: boolean; // = false; 禁止播放动作
    cantChangeOri: boolean; // = false; 禁止更改朝向
    cantBeHit: boolean; // = false; 无法被击中
    intervalTime: number; // = 1; 时间间隔
    damageType: number; // = 0; 伤害类别
    damageValue: number; // = 0; 数值
    additionMultiple: number; // = 100; 属性加成值
    useAddition: boolean; // = false; 属性加成
    additionMultipleType: number; // = 0; 加成类别
    whenOvertimeEvent: string; // = ""; 执行的事件
    fixedHeteValue: number; // = 0; 固定仇恨值
    damageHatePer: number; // = 0; + 按伤害数值比例增加仇恨
    whenAddEvent: string; // = ""; 拥有该状态时处理
    whenRemoveEvent: string; // = ""; 解除该状态时处理
    maxHP: number; // = 100; maxHP%
    maxSP: number; // = 100; maxSP%
    atk: number; // = 100; 攻击力%
    def: number; // = 100; 防御力%
    mag: number; // = 100; 魔力%
    magDef: number; // = 100; 魔法防御力%
    hit: number; // = 0; 命中率变更
    moveSpeed: number; // = 100; 移动速度%
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    currentLayer: number; // = 1; 当前层
    fromBattlerID: number; // = 0; 来源的场景对象编号
    currentDuration: number; // = 0;
    effectTimes: number; // = 0;
    fromSceneID: number; // = 0;
}