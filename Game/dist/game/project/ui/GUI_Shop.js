














var GUI_Shop = (function (_super) {
    __extends(GUI_Shop, _super);
    function GUI_Shop() {
        var _this_1 = _super.call(this) || this;
        GUI_Manager.standardList(_this_1.goodsList, false);
        GUI_Manager.standardList(_this_1.sellItemList, false);
        _this_1.preTypeTabItem = _this_1.typeTab.items;
        _this_1.listenQueue();
        return _this_1;
    }
    GUI_Shop.prototype.listenQueue = function () {
        var _this_1 = this;
        this.on(EventObject.DISPLAY, this, this.onDisplay);
        this.on(EventObject.UNDISPLAY, this, this.onUndisplay);
        this.goodsList.on(EventObject.CHANGE, this, this.refreshItemInfo, [this.goodsList]);
        this.sellItemList.on(EventObject.CHANGE, this, this.refreshItemInfo, [this.sellItemList]);
        this.goodsList.on(UIList.ITEM_CLICK, this, this.onGoodsClick);
        this.sellItemList.on(UIList.ITEM_CLICK, this, this.onSellItemClick);
        this.typeTab.on(EventObject.CHANGE, this, this.onTypeTabChange);
        this.closeBtn.on(EventObject.CLICK, this, function () {
            GameAudio.playSE(WorldData.cancelSE);
            GameUI.hide(_this_1.guiID);
        });
        this.subNumBtn.on(EventObject.CLICK, this, this.onSubNumChange);
        this.addNumBtn.on(EventObject.CLICK, this, this.onAddNumChange);
        this.maxNumBtn.on(EventObject.CLICK, this, this.onMaxNumChange);
        this.sureBtn.on(EventObject.CLICK, this, this.onSureNumChange);
        this.cancelBtn.on(EventObject.CLICK, this, this.onCancelNumChange);
        stage.on(EventObject.RIGHT_MOUSE_DOWN, this, this.onRightMouseDOwn);
    };
    GUI_Shop.prototype.initGoodsList = function () {
        var dataArr;
        var p = this.shopEventData;
        if (!p || !p.goodsList || p.goodsList.length == 0) {
            this.goodsList.items = [];
            this.goodsList.selectedIndex = -1;
            return;
        }
        dataArr = p.goodsList;
        var items = [];
        for (var i = 0; i < dataArr.length; i++) {
            var goods = dataArr[i];
            var data = new ListItem_1003();
            var moduleID = goods.isEquip ? 4 : 5;
            var gooldsID = goods.isEquip ? goods.equip : goods.item;
            var item = GameData.getModuleData(moduleID, gooldsID);
            if (!item)
                continue;
            data.data = goods;
            data.icon = item.icon;
            data.itemName = item.name;
            if (goods.numberType == 0) {
                data.itemNum = this.shopEventData.nameWhenInfinite;
            }
            else if (goods.numberType == 1) {
                data.itemNum = goods.number.toString();
            }
            else {
                data.itemNum = Game.player.variable.getVariable(goods.numberVar).toString();
            }
            if (goods.priceType == 0) {
                data.itemPrice = item.sell.toString();
            }
            else if (goods.priceType == 1) {
                data.itemPrice = goods.price.toString();
            }
            else {
                data.itemPrice = Game.player.variable.getVariable(goods.priceVar).toString();
            }
            var playerItemDS = ProjectPlayer.getItemDS(item.id, goods.isEquip);
            data.ownNum = playerItemDS ? playerItemDS.number.toString() : "0";
            items.push(data);
        }
        this.goodsList.items = items;
        this.goodsList.selectedIndex = 0;
        this.refreshGoodsListView();
    };
    GUI_Shop.prototype.onDisplay = function () {
        var _this_1 = this;
        if (!this.shopEventData)
            return;
        this.preMenuEnabled = WorldData.menuEnabled;
        WorldData.menuEnabled = false;
        if (this.shopEventData.enableSell) {
            this.typeTab.items = this.preTypeTabItem;
        }
        else {
            this.typeTab.items = this.preTypeTabItem.split(",")[0];
        }
        this.buyBoxArea.visible = false;
        this.initGoodsList();
        setFrameout(function () { UIList.focus = _this_1.goodsList; }, 1);
        this.focusState = 0;
        this.refreshItemInfo();
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
    };
    GUI_Shop.prototype.onUndisplay = function () {
        WorldData.menuEnabled = this.preMenuEnabled;
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
        this.typeTab.selectedIndex = 0;
    };
    GUI_Shop.prototype.onGoodsClick = function () {
        var selectedItem = this.goodsList.selectedItem;
        if (selectedItem && selectedItem.data) {
            var itemID = selectedItem.data;
            var itemNum = Number(selectedItem.itemNum);
            var itemPrice = Number(selectedItem.itemPrice);
            if (itemPrice <= Game.player.data.gold && itemNum != 0) {
                GameAudio.playSE(ClientWorld.data.sureSE);
                this.focusState = 1;
                this.buyBoxArea.visible = true;
                this.buyNum_text.visible = true;
                this.sellNum_text.visible = false;
                UIList.focus = null;
                this.buyNum.text = "1";
                this.refreshBuyNum(selectedItem);
            }
            else {
                GameAudio.playSE(ClientWorld.data.disalbeSE);
            }
        }
    };
    GUI_Shop.prototype.onSellItemClick = function () {
        var selectedItem = this.sellItemList.selectedItem;
        if (selectedItem && selectedItem.data) {
            var itemID = selectedItem.data;
            var itemNum = Number(selectedItem.itemNum);
            var itemPrice = Number(selectedItem.itemPrice);
            if (itemNum > 0) {
                GameAudio.playSE(ClientWorld.data.sureSE);
                this.focusState = 1;
                this.buyBoxArea.visible = true;
                this.buyNum_text.visible = false;
                this.sellNum_text.visible = true;
                UIList.focus = null;
                this.buyNum.text = "1";
                this.refreshSellNum(selectedItem);
            }
            else {
                GameAudio.playSE(ClientWorld.data.disalbeSE);
            }
        }
    };
    GUI_Shop.prototype.onTypeTabChange = function () {
        if (this.typeTab.selectedIndex == 0) {
            this.sellItemList.visible = false;
            this.goodsList.visible = true;
            UIList.focus = this.goodsList;
            this.focusState = 0;
            this.buyBoxArea.visible = false;
            this.refreshItemInfo(this.goodsList);
            this.buyNum_text.visible = true;
            this.sellNum_text.visible = false;
            this.refreshGoodsListView();
        }
        else if (this.typeTab.selectedIndex == 1) {
            this.refreshSellItemList();
            this.goodsList.visible = false;
            this.sellItemList.visible = true;
            UIList.focus = this.sellItemList;
            this.focusState = 0;
            this.buyBoxArea.visible = false;
            this.refreshItemInfo(this.sellItemList);
            this.buyNum_text.visible = false;
            this.sellNum_text.visible = true;
        }
    };
    GUI_Shop.prototype.onKeyDown = function (e) {
        var keyCode = e.keyCode;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.L1)) {
            if (this.typeTab.selectedIndex > 0) {
                this.typeTab.selectedIndex--;
                GameAudio.playSE(WorldData.selectSE);
            }
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.R1)) {
            if (this.typeTab.selectedIndex < this.typeTab.length - 1) {
                this.typeTab.selectedIndex++;
                GameAudio.playSE(WorldData.selectSE);
            }
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            if (this.focusState == 0) {
                GameAudio.playSE(WorldData.cancelSE);
                GameUI.hide(this.guiID);
            }
            else if (this.focusState == 1) {
                GameAudio.playSE(WorldData.cancelSE);
                this.focusState = 0;
                this.buyBoxArea.visible = false;
                if (this.typeTab.selectedIndex == 0) {
                    UIList.focus = this.goodsList;
                }
                else {
                    UIList.focus = this.sellItemList;
                }
            }
        }
        if (this.focusState == 1) {
            var selectedItem = void 0;
            if (this.typeTab.selectedIndex == 0)
                selectedItem = this.goodsList.selectedItem;
            else if (this.typeTab.selectedIndex == 1)
                selectedItem = this.sellItemList.selectedItem;
            var buyNum = Number(this.buyNum.text);
            var flag_key_num = false;
            if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.DOWN)) {
                flag_key_num = true;
                if (buyNum > 10)
                    buyNum -= 10;
                else
                    buyNum = 1;
            }
            else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.UP)) {
                flag_key_num = true;
                if (buyNum < 990)
                    buyNum += 10;
                else
                    buyNum = 999;
            }
            else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
                flag_key_num = true;
                if (buyNum > 1)
                    buyNum -= 1;
            }
            else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
                flag_key_num = true;
                if (buyNum < 999)
                    buyNum += 1;
            }
            if (flag_key_num == true) {
                if (this.typeTab.selectedIndex == 0)
                    this.refreshBuyNum(selectedItem, buyNum);
                else if (this.typeTab.selectedIndex == 1)
                    this.refreshSellNum(selectedItem, buyNum);
                GameAudio.playSE(WorldData.selectSE);
            }
            if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
                if (this.typeTab.selectedIndex == 0)
                    this.buyGoods(selectedItem, Math.floor(Number(this.buyNum.text)));
                else if (this.typeTab.selectedIndex == 1)
                    this.sellItem(selectedItem, Math.floor(Number(this.buyNum.text)));
            }
        }
    };
    GUI_Shop.prototype.onRightMouseDOwn = function () {
        if (!this.stage)
            return;
        var e = new EventObject;
        e.keyCode = GUI_Setting.KEY_BOARD.B.keys[0];
        this.onKeyDown(e);
    };
    GUI_Shop.prototype.onSubNumChange = function () {
        var buyNum = Number(this.buyNum.text);
        if (buyNum > 1)
            buyNum -= 1;
        this.changeBuyOrSellNum(buyNum);
    };
    GUI_Shop.prototype.onAddNumChange = function () {
        var buyNum = Number(this.buyNum.text);
        if (buyNum < 999)
            buyNum += 1;
        this.changeBuyOrSellNum(buyNum);
    };
    GUI_Shop.prototype.onMaxNumChange = function () {
        var buyNum = 999;
        this.changeBuyOrSellNum(buyNum);
    };
    GUI_Shop.prototype.onSureNumChange = function () {
        if (this.typeTab.selectedIndex == 0)
            var selectedItem = this.goodsList.selectedItem;
        else if (this.typeTab.selectedIndex == 1)
            selectedItem = this.sellItemList.selectedItem;
        if (this.typeTab.selectedIndex == 0)
            this.buyGoods(selectedItem, Math.floor(Number(this.buyNum.text)));
        else if (this.typeTab.selectedIndex == 1)
            this.sellItem(selectedItem, Math.floor(Number(this.buyNum.text)));
    };
    GUI_Shop.prototype.onCancelNumChange = function () {
        GameAudio.playSE(WorldData.cancelSE);
        this.focusState = 0;
        this.buyBoxArea.visible = false;
        if (this.typeTab.selectedIndex == 0) {
            UIList.focus = this.goodsList;
        }
        else {
            UIList.focus = this.sellItemList;
        }
    };
    GUI_Shop.prototype.changeBuyOrSellNum = function (buyNum) {
        GameAudio.playSE(WorldData.selectSE);
        if (this.typeTab.selectedIndex == 0)
            var selectedItem = this.goodsList.selectedItem;
        else if (this.typeTab.selectedIndex == 1)
            selectedItem = this.sellItemList.selectedItem;
        if (this.typeTab.selectedIndex == 0)
            this.refreshBuyNum(selectedItem, buyNum);
        else if (this.typeTab.selectedIndex == 1)
            this.refreshSellNum(selectedItem, buyNum);
    };
    GUI_Shop.prototype.buyGoods = function (selectedItem, buyNum) {
        if (!selectedItem || !selectedItem.data)
            return;
        var itemDS = selectedItem.data;
        var itemPrice = Math.floor(Number(selectedItem.itemPrice));
        if (itemPrice * buyNum > Game.player.data.gold)
            return;
        var itemID = itemDS.isEquip ? itemDS.equip : itemDS.item;
        GameAudio.playSE(ClientWorld.data.sureSE);
        ProjectPlayer.increaseGold(-itemPrice * buyNum);
        ProjectPlayer.changeItemNumber(itemID, buyNum, itemDS.isEquip);
        this.reduceGoodsNum(buyNum);
        this.refreshItemInPackage(itemID, itemDS.isEquip, selectedItem);
        this.refreshGoodsListView();
        this.buyBoxArea.visible = false;
        this.focusState = 0;
        UIList.focus = this.goodsList;
    };
    GUI_Shop.prototype.reduceGoodsNum = function (buyNum) {
        var selectedItemIndex = this.goodsList.selectedIndex;
        if (selectedItemIndex < 0)
            return;
        var goods = this.goodsList.items[selectedItemIndex];
        var data = this.shopEventData.goodsList[selectedItemIndex];
        if (data.numberType == 0)
            return;
        goods.itemNum = (Number(goods.itemNum) - buyNum).toString();
        var itemID = data.isEquip ? data.equip : data.item;
        var playerItemDS = ProjectPlayer.getItemDS(itemID, data.isEquip);
        goods.ownNum = playerItemDS ? playerItemDS.number.toString() : "0";
        this.goodsList.replaceItem(goods, selectedItemIndex);
        if (data.numberType == 2)
            Game.player.variable.setVariable(data.numberVar, Number(goods.itemNum));
    };
    GUI_Shop.prototype.sellItem = function (selectedItem, sellNum) {
        if (!selectedItem || !selectedItem.data || sellNum <= 0)
            return;
        var itemDS = selectedItem.data;
        var itemPrice = Math.floor(Number(selectedItem.itemPrice));
        var itemID = itemDS.isEquip ? itemDS.equip.id : itemDS.item.id;
        GameAudio.playSE(ClientWorld.data.sureSE);
        ProjectPlayer.increaseGold(itemPrice * sellNum);
        ProjectPlayer.changeItemNumber(itemID, -sellNum, itemDS.isEquip);
        this.refreshItemInPackage(itemID, itemDS.isEquip, null);
        this.refreshSellItemList();
        this.refreshSellItemListView();
        this.buyBoxArea.visible = false;
        this.focusState = 0;
        UIList.focus = this.sellItemList;
    };
    GUI_Shop.prototype.refreshGoodsListView = function () {
        for (var i = 0; i < this.goodsList.length; i++) {
            var goodsUI = this.goodsList.getItemUI(i);
            var goods = this.goodsList.items[i];
            if (Number(goods.itemPrice) > Game.player.data.gold || goods.itemNum == "0") {
                goodsUI.alpha = 0.5;
            }
            else {
                goodsUI.alpha = 1;
            }
        }
    };
    GUI_Shop.prototype.refreshSellItemListView = function () {
        for (var i = 0; i < this.sellItemList.length; i++) {
            var sellItemUI = this.sellItemList.getItemUI(i);
            var sellItem = this.sellItemList.items[i];
            if (Number(sellItem.itemNum) <= 0) {
                sellItemUI.alpha = 0.5;
            }
            else {
                sellItemUI.alpha = 1;
            }
        }
    };
    GUI_Shop.prototype.refreshItemInfo = function (list) {
        if (list === void 0) { list = this.goodsList; }
        var selectedItem = list.selectedItem;
        if (!selectedItem || !selectedItem.data) {
            this.clearItemInfo();
        }
        else {
            if (this.typeTab.selectedIndex == 0) {
                var itemDS = selectedItem.data;
                var isEquip = itemDS.isEquip;
                var item = itemDS.isEquip ? GameData.getModuleData(4, itemDS.equip) : GameData.getModuleData(5, itemDS.item);
            }
            else {
                var inPackageItemDS = selectedItem.data;
                isEquip = inPackageItemDS.isEquip;
                item = (inPackageItemDS.isEquip ? inPackageItemDS.equip : inPackageItemDS.item);
            }
            if (!item) {
                this.clearItemInfo();
                return;
            }
            if (isEquip) {
                this.itemIntro.text = GUI_Manager.equipDesc(item);
            }
            else {
                this.itemIntro.text = GUI_Manager.itemDesc(item);
            }
            this.itemName.text = item.name;
            this.refreshItemInPackage(item.id, isEquip, selectedItem);
        }
        this.buyNum.text = "1";
    };
    GUI_Shop.prototype.clearItemInfo = function () {
        this.itemName.text = "";
        this.itemIntro.text = "";
    };
    GUI_Shop.prototype.refreshItemInPackage = function (itemID, isEquip, selectedItem) {
        var itemInPackage = ProjectPlayer.getItemDS(itemID, isEquip);
        if (!selectedItem) {
            if (isEquip) {
                selectedItem = ArrayUtils.matchAttributesD2(this.goodsList.items, "data", { equip: itemID }, true)[0];
            }
            else {
                selectedItem = ArrayUtils.matchAttributesD2(this.goodsList.items, "data", { item: itemID }, true)[0];
            }
            if (!selectedItem)
                return;
        }
        var index = this.goodsList.items.indexOf(selectedItem);
        selectedItem.ownNum = itemInPackage ? itemInPackage.number.toString() : "0";
        this.goodsList.replaceItem(selectedItem, index);
    };
    GUI_Shop.prototype.refreshBuyNum = function (selectedItem, buyNum) {
        if (!buyNum)
            buyNum = Number(this.buyNum.text);
        if (selectedItem && selectedItem.data) {
            if (selectedItem.itemNum != this.shopEventData.nameWhenInfinite && buyNum > Number(selectedItem.itemNum)) {
                buyNum = Number(selectedItem.itemNum);
            }
            if (Number(selectedItem.itemPrice) > 0 && buyNum * Number(selectedItem.itemPrice) > Game.player.data.gold) {
                buyNum = Game.player.data.gold / Number(selectedItem.itemPrice);
            }
            this.buyNum.text = Math.floor(buyNum).toString();
        }
    };
    GUI_Shop.prototype.refreshSellNum = function (selectedItem, buyNum) {
        if (!buyNum)
            buyNum = Number(this.buyNum.text);
        if (selectedItem && selectedItem.data) {
            if (buyNum > Number(selectedItem.itemNum)) {
                buyNum = Number(selectedItem.itemNum);
            }
            this.buyNum.text = Math.floor(buyNum).toString();
        }
    };
    GUI_Shop.prototype.refreshSellItemList = function () {
        var items = [];
        for (var i = 0; i < Game.player.data.package.length; i++) {
            var d = new ListItem_1003();
            var itemDS = Game.player.data.package[i];
            if (itemDS.isEquip) {
                if (!itemDS.equip.sellEnabled)
                    continue;
                var sell = itemDS.equip.sell;
            }
            else {
                if (!itemDS.item.sellEnabled)
                    continue;
                sell = itemDS.item.sell;
            }
            if (sell == 0)
                continue;
            var sellPrice = Math.ceil(sell * this.shopEventData.discount);
            d.data = itemDS;
            if (itemDS.isEquip) {
                d.icon = itemDS.equip.icon;
                d.itemName = itemDS.equip.name;
            }
            else {
                d.icon = itemDS.item.icon;
                d.itemName = itemDS.item.name;
            }
            d.itemNum = itemDS.number.toString();
            d.itemPrice = sellPrice.toString();
            d.ownNum = "";
            items.push(d);
        }
        this.sellItemList.items = items;
    };
    return GUI_Shop;
}(GUI_12));
//# sourceMappingURL=GUI_Shop.js.map