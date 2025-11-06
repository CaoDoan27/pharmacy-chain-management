// controllers/userController.js
const { User, Branch } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = '123456'; // Mật khẩu mặc định khi reset

// 1. Xem Danh sách Người dùng
exports.getUserList = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        vaiTro: { [Op.ne]: 'Quản lý tổng' } // Không hiển thị Quản lý tổng
      },
      include: [
        { model: Branch, attributes: ['tenChiNhanh'] } // Lấy tên chi nhánh
      ],
      order: [['hoTen', 'ASC']]
    });
    res.render('users/list', {
      title: 'Quản lý Người dùng',
      users
    });
  } catch (err) {
    console.log(err);
  }
};

// 2a. Hiển thị Form Thêm Mới
exports.getCreateUser = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      where: { tenChiNhanh: { [Op.ne]: 'Trụ sở chính' } }, // Không cho gán vào Trụ sở chính
      order: [['tenChiNhanh', 'ASC']]
    });

    res.render('users/form', {
      title: 'Tạo Người dùng mới',
      user: null,
      branches,
      error: null,
      isEditing: false
    });
  } catch (err) {
    console.log(err);
  }
};

// 2b. Xử lý Thêm Mới
exports.postCreateUser = async (req, res) => {
  const { hoTen, tenDangNhap, matKhau, vaiTro, branchId } = req.body;
  const branches = await Branch.findAll({ where: { tenChiNhanh: { [Op.ne]: 'Trụ sở chính' } }, order: [['tenChiNhanh', 'ASC']] });

  try {
    // Kiểm tra tên đăng nhập
    const existingUser = await User.findOne({ where: { tenDangNhap } });
    if (existingUser) {
      throw new Error('Tên đăng nhập này đã tồn tại.');
    }

    // Mật khẩu sẽ tự động được hash bởi hook trong Model 'User.js'
    await User.create({
      hoTen,
      tenDangNhap,
      matKhau,
      vaiTro,
      branchId
    });
    res.redirect('/users');

  } catch (err) {
    console.log(err);
    res.render('users/form', {
      title: 'Tạo Người dùng mới',
      user: req.body, // Giữ lại dữ liệu đã nhập
      branches,
      error: err.message,
      isEditing: false
    });
  }
};

// 3a. Hiển thị Form Chỉnh Sửa
exports.getEditUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || user.vaiTro === 'Quản lý tổng') {
      return res.redirect('/users');
    }

    const branches = await Branch.findAll({ where: { tenChiNhanh: { [Op.ne]: 'Trụ sở chính' } }, order: [['tenChiNhanh', 'ASC']] });

    res.render('users/form', {
      title: 'Chỉnh sửa Người dùng',
      user: user,
      branches,
      error: null,
      isEditing: true
    });
  } catch (err) {
    console.log(err);
  }
};

// 3b. Xử lý Chỉnh Sửa
exports.postEditUser = async (req, res) => {
  const { hoTen, vaiTro, branchId } = req.body;
  const branches = await Branch.findAll({ where: { tenChiNhanh: { [Op.ne]: 'Trụ sở chính' } }, order: [['tenChiNhanh', 'ASC']] });

  try {
    await User.update({
      hoTen,
      vaiTro,
      branchId
    }, {
      where: { id: req.params.id }
    });
    res.redirect('/users');
  } catch (err) {
    console.log(err);
    res.render('users/form', {
      title: 'Chỉnh sửa Người dùng',
      user: req.body,
      branches,
      error: err.message,
      isEditing: true
    });
  }
};

// 4. Xử lý Khóa/Mở khóa Tài khoản
exports.postToggleStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user && user.vaiTro !== 'Quản lý tổng') {
      const newStatus = (user.trangThai === 'Đang hoạt động') ? 'Đã khóa' : 'Đang hoạt động';
      user.trangThai = newStatus;
      await user.save();
    }
    res.redirect('/users');
  } catch (err) {
    console.log(err);
  }
};

// 5. Xử lý Đặt lại Mật khẩu
exports.postResetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user && user.vaiTro !== 'Quản lý tổng') {
      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      user.matKhau = await bcrypt.hash(DEFAULT_PASSWORD, salt);
      user.trangThai = 'Đang hoạt động'; // Mở khóa tài khoản (nếu đang khóa)
      await user.save();
    }
    // Có thể thêm flash message "Đã đặt lại mật khẩu thành '123456'"
    res.redirect('/users');
  } catch (err) {
    console.log(err);
  }
};