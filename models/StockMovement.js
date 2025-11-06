// models/StockMovement.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockMovement = sequelize.define('StockMovement', {
  ngayThucHien: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Phân biệt 2 nghiệp vụ
  loaiPhieu: {
    type: DataTypes.ENUM('Xuất Hủy', 'Chuyển kho'),
    allowNull: false
  },
  // (MỚI) Lưu lý do hủy (UC-09)
  lyDo: {
    type: DataTypes.STRING,
    allowNull: true // Chỉ bắt buộc khi loaiPhieu = 'Xuất Hủy'
  },
  // (MỚI) Lưu chi nhánh nhận (cho 'Chuyển kho')
  chiNhanhNhanId: {
    type: DataTypes.INTEGER,
    allowNull: true // Chỉ bắt buộc khi loaiPhieu = 'Chuyển kho'
  }
  // 'branchId' (Chi nhánh Gửi)
  // 'userId' (Người tạo)
});

module.exports = StockMovement;