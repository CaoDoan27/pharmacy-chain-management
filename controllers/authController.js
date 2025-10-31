const bcrypt = require('bcryptjs');
const { User } = require('../models'); // Import từ models/index.js

// 1. Hiển thị form đăng nhập
exports.getLogin = (req, res) => {
  // Nếu đã đăng nhập, chuyển hướng về trang chủ
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('auth/login', { title: 'Đăng nhập', error: null });
};

// 2. Xử lý logic khi user nhấn nút "Đăng nhập"
exports.postLogin = async (req, res) => {
  const { tenDangNhap, matKhau } = req.body;

  try {
    // Tìm user trong database
    const user = await User.findOne({ where: { tenDangNhap } });

    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.render('auth/login', {
        title: 'Đăng nhập',
        error: 'Tên đăng nhập không tồn tại.'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(matKhau, user.matKhau);

    if (isMatch) {
      // Mật khẩu ĐÚNG
      // Lưu thông tin user vào session
      req.session.user = {
        id: user.id,
        hoTen: user.hoTen,
        vaiTro: user.vaiTro,
        branchId: user.branchId
      };
      req.session.isLoggedIn = true;

      // Chuyển hướng về trang chủ
      return res.redirect('/');
    }

    // Mật khẩu SAI
    res.render('auth/login', {
      title: 'Đăng nhập',
      error: 'Sai mật khẩu. Vui lòng thử lại.'
    });

  } catch (err) {
    console.log(err);
  }
};

// 3. Xử lý Đăng xuất
exports.getLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login'); // Đăng xuất xong thì về trang login
  });
};