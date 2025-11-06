// models/PurchaseOrderItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  soLuongDat: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
  // 'purchaseOrderId' (Thuộc đơn đặt hàng nào) sẽ được thêm tự động bởi models/index.js
  // 'productId' (Sản phẩm gì) sẽ được thêm tự động bởi models/index.js
});

module.exports = PurchaseOrderItem;