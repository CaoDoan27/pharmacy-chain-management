// models/Promotion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  tenChuongTrinh: {
    type: DataTypes.STRING,
    allowNull: false
  },
  moTa: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ngayBatDau: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ngayKetThuc: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // (MỚI) Quy tắc: Giảm % hay Giảm tiền
  loaiGiamGia: {
    // percentage (Giảm %) hoặc fixed (Giảm tiền cố định)
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false
  },
  giaTriGiam: {
    type: DataTypes.DOUBLE, // Sẽ là % (ví dụ: 10) hoặc VNĐ (ví dụ: 20000)
    allowNull: false
  },
  // (MỚI) Quy tắc: Áp dụng cho ai?
  dieuKienApDung: {
    // all (Toàn bộ hóa đơn) hoặc category (Danh mục) hoặc product (Sản phẩm)
    type: DataTypes.ENUM('all', 'category', 'product'),
    allowNull: false
  },
  giaTriDieuKien: {
    type: DataTypes.STRING, // Sẽ lưu: null (cho 'all'), "Giảm đau - Hạ sốt" (cho 'category'), hoặc 1 (ID của sản phẩm cho 'product')
    allowNull: true
  },
  trangThai: {
    type: DataTypes.STRING,
    defaultValue: 'Đang hoạt động' // Đang hoạt động, Vô hiệu hóa
  }
});

module.exports = Promotion;