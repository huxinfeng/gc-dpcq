class WorldData {
    static readonly screenMode: number; // = 0; 移动端屏幕布局模式
    static readonly sceneBGMGradientTime: number; // = 0; BGM过渡时间
    static readonly sceneBGSGradientTime: number; // = 0; BGS过渡时间
    static readonly moveToGridCenter: boolean; // = false; 移动至格子中心点
    static readonly moveDir4: boolean; // = false; 四方向移动
    static readonly jumpTimeCost: number; // = 0; 跳跃花费的时间
    static readonly jumpHeight: number; // = 0; 跳跃高度
    static menuEnabled: boolean; // = true;
    static readonly sceneObjectCollisionSize: number; // = 32; 场景对象碰撞范围
    static readonly sceneObjectMoveStartAct: number; // = 2; 行走动作
    static readonly useSceneObjectMoveStartAct2: boolean; // = false; 开启奔跑动作
    static readonly sceneObjectMoveStartAct2Speed: number; // = 0; 奔跑需要的速度
    static readonly sceneObjectMoveStartAct2: number; // = 0; 奔跑动作
    static readonly selectSceneObjectEffect: number; // = 0; 场景对象悬停动画
    static readonly saveFileMax: number; // = 10; 存档总数
    static playCtrlEnabled: boolean; // = true;
    static readonly uiCompFocusAnimation: number; // = 0; 界面组件焦点动画
    static gridObsDebug: boolean; // = false; 显示地图格子障碍
    static rectObsDebug: boolean; // = false; 显示对象碰撞盒
    static dragSceneObjectDebug: boolean; // = false; 鼠标左键拖拽对象
    static zoomCameraDebug: boolean; // = false; 滚轮缩放镜头
    static readonly focusEnabled: boolean; // = false; 使用按钮焦点
    static readonly hotKeyListEnabled: boolean; // = false; 允许按键操作列表
    static readonly selectSE: string; // = ""; 光标
    static readonly sureSE: string; // = ""; 确定
    static readonly cancelSE: string; // = ""; 取消
    static readonly disalbeSE: string; // = ""; 禁用
    static readonly dialogSE: string; // = ""; 文本播放音效
    static dialogSEEnabled: boolean; // = true;
    static readonly equipSE: string; // = ""; 穿上装备
    static readonly unequipSE: string; // = ""; 卸下装备
    static readonly getItemSE: string; // = ""; 获得道具
    static keyboards: DataStructure_gameKeyboard[]; // = [];
    static bak1: number; // = 0; 准备阶段角色上场提示
    static bak2: number; // = 0; 准备阶段更换角色位置提示
    static bak3: number; // = 0; 准备阶段移动端提示
    static bak4: string; // = ""; 准备阶段更换角色朝向提示
    static deadPlayerActorLeaveParty: boolean; // = true; 死亡的玩家角色自动离开队伍
    static readonly menuDisabledAni: number; // = 1; 菜单禁用时动画效果
    static readonly iconDisabledAni: number; // = 1; 图标禁用时动画效果
    static showVigilanceRange: boolean; // = false; 显示警戒范围
    static vigilanceColor: string; // = "#FFFF00"; 警戒范围颜色
    static vigilanceAlpha: number; // = 0.3; 警戒范围透明度
    static displayBattlerPointBar: boolean; // = true; 显示战斗者血条
    static whenDeadContinue: boolean; // = false; 阵亡后继续游戏
}
class PlayerData {
    sceneObject: SceneObject;
    package: DataStructure_packageItem[]; // = [];
    gold: number; // = 0; 金币
    party: DataStructure_inPartyActor[]; // = [];
    aiMode: number; // = 1; 队员攻击模式
    aiVigilanceRange: number; // = 200; 警戒范围
}