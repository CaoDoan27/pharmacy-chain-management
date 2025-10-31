const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  hoTen: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tenDangNhap: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Tên đăng nhập không được trùng
  },
  matKhau: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vaiTro: {
    type: DataTypes.ENUM('Quản lý tổng', 'Quản lý chi nhánh', 'Nhân viên'),
    allowNull: false
  },
  trangThai: {
    type: DataTypes.STRING,
    defaultValue: 'Đang hoạt động'
  }
}, {
  hooks: {
    // Tự động hash mật khẩu trước khi tạo user
    beforeCreate: async (user) => {
      if (user.matKhau) {
        const salt = await bcrypt.genSalt(10);
        user.matKhau = await bcrypt.hash(user.matKhau, salt);
      }
    }
  }
});

module.exports = User;