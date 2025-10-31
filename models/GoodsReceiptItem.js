const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GoodsReceiptItem = sequelize.define('GoodsReceiptItem', {
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  giaNhap: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  soLo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hanSuDung: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
  // 'goodsReceiptId' và 'productId' sẽ được thêm qua Mối quan hệ
});

module.exports = GoodsReceiptItem;