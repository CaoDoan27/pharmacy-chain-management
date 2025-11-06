// models/StockMovementItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockMovementItem = sequelize.define('StockMovementItem', {
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
  // 'stockMovementId' (Thuộc phiếu nào)
  // 'productId' (Sản phẩm gì)
  // 'batchId' (Từ lô nào)
});

module.exports = StockMovementItem;