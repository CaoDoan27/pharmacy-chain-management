// middleware/authMiddleware.js (Đã sửa lỗi)

// 1. Kiểm tra đã đăng nhập chưa
exports.isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};

// 2. Kiểm tra vai trò Quản lý Tổng
exports.isManager = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  if (req.session.user.vaiTro !== 'Quản lý tổng') {
    console.log('User không có quyền (yêu cầu Quản lý tổng):', req.session.user.vaiTro);
    return res.redirect('/');
  }
  next();
};

// 3. KIỂM TRA ĐÚNG VAI TRÒ "QUẢN LÝ CHI NHÁNH" (ĐÃ SỬA TÊN HÀM)
exports.isBranchManager = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  
  // Chỉ cho phép "Quản lý chi nhánh"
  if (req.session.user.vaiTro !== 'Quản lý chi nhánh') {
    console.log('User không có quyền (yêu cầu Quản lý chi nhánh):', req.session.user.vaiTro);
    return res.redirect('/');
  }

  // Nếu đúng, cho phép đi tiếp
  next();
};
exports.isStoreStaff = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }

  const userRole = req.session.user.vaiTro;

  // Cho phép nếu là Quản lý chi nhánh hoặc Nhân viên
  if (userRole === 'Quản lý chi nhánh' || userRole === 'Nhân viên') {
    next(); // Cho phép đi tiếp
  } else {
    // Nếu là vai trò khác (ví dụ: Quản lý tổng), từ chối
    console.log('User không có quyền (yêu cầu QLCN hoặc NV):', userRole);
    return res.redirect('/');
  }
};