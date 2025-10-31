const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GoodsReceipt = sequelize.define('GoodsReceipt', {
  // Bảng này chủ yếu lưu thông tin chung
  // Nó sẽ liên kết với User, Supplier, và Branch
  ngayNhap: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = GoodsReceipt;