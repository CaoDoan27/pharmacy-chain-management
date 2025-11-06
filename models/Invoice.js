// models/Invoice.js (Đã cập nhật)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  ngayBan: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  tienGoc: {
    type: DataTypes.BIGINT, // Tổng tiền gốc (chưa giảm)
    allowNull: false
  },
  // --- THÊM CỘT MỚI ---
  giamGiaKhuyenMai: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  giamGiaDiem: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  tongTien: {
    type: DataTypes.BIGINT, // Tiền thực thu
    allowNull: false
  }
  // 'branchId', 'userId', 'customerId' (đã có)
});

module.exports = Invoice;