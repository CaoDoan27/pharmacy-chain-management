// models/PurchaseOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  ngayDat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  trangThai: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Đã gửi' // Ví dụ: Đã gửi, Đã nhận hàng, Đã hủy
  },
  tongTienDuKien: {
    type: DataTypes.BIGINT, // Sẽ được tính toán khi tạo (chưa có giá nhập chính thức)
    allowNull: true
  }
  // 'branchId' (Đặt về chi nhánh nào)
  // 'userId' (Ai đặt)
  // 'supplierId' (Đặt của ai)
});

module.exports = PurchaseOrder;