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
  // Thêm trường mới để Vô hiệu hóa
  trangThai: {
    type: DataTypes.STRING,
    defaultValue: 'Đang hoạt động'
  }
});

module.exports = Supplier;