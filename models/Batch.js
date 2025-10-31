const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Batch = sequelize.define('Batch', {
  soLo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hanSuDung: {
    type: DataTypes.DATEONLY, // Chỉ lưu Ngày/Tháng/Năm
    allowNull: false
  },
  soLuongTon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  giaNhap: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
  // 'productId' và 'branchId' sẽ được thêm qua Mối quan hệ
}, {
  // Đảm bảo không thể có 2 lô hàng giống hệt nhau (cùng SP, lô, HSD) tại 1 chi nhánh
  indexes: [
    {
      unique: true,
      fields: ['productId', 'branchId', 'soLo', 'hanSuDung']
    }
  ]
});

module.exports = Batch;