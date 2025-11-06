// models/Supplier.js (Đã cập nhật)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  tenNhaCungCap: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  soDienThoai: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  trangThai: {
    type: DataTypes.STRING,
    defaultValue: 'Đang hoạt động'
  },
  // --- THÊM TRƯỜNG MỚI ---
  congNo: {
    type: DataTypes.BIGINT, // Dùng BIGINT cho an toàn
    defaultValue: 0,
    allowNull: false
  }
});

module.exports = Supplier;