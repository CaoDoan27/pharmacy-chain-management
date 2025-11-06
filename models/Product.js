// models/Product.js (Đã cập nhật)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  tenSanPham: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  hoatChat: {
    type: DataTypes.STRING
  },
  // YÊU CẦU MỚI: Thêm danh mục
  danhMuc: {
    type: DataTypes.STRING, // Ví dụ: 'Giảm đau, hạ sốt', 'Kháng sinh'
    allowNull: false
  },
  // YÊU CẦU MỚI: Đơn vị tính cơ sở (nhỏ nhất)
  donViCoSo: {
    type: DataTypes.STRING, // Ví dụ: 'Viên', 'Gói', 'Chai', 'Ống'
    allowNull: false
  },
  quyCach: {
    type: DataTypes.STRING, // Ví dụ: "Hộp 10 vỉ x 10 viên"
    allowNull: true // Cho phép null
  },
  giaBan: {
    type: DataTypes.DOUBLE, // Giá bán cho 1 đơn vị cơ sở (ví dụ: giá 1 viên)
    allowNull: false,
    defaultValue: 0
  },
  trangThai: {
    type: DataTypes.STRING,
    defaultValue: 'Đang kinh doanh'
  }
});

module.exports = Product;