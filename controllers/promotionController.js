// controllers/promotionController.js
const { Promotion, Product } = require('../models');
const { Op } = require('sequelize');

// 1. Xem Danh sách Khuyến mãi
exports.getPromotionList = async (req, res) => {
  try {
    const promotions = await Promotion.findAll({
      order: [['ngayBatDau', 'DESC']]
    });
    res.render('promotions/list', {
      title: 'Quản lý Khuyến mãi',
      promotions
    });
  } catch (err) {
    console.log(err);
  }
};

// 2a. Hiển thị Form Thêm Mới
exports.getCreatePromotion = async (req, res) => {
  try {
    // Lấy danh sách sản phẩm để chọn (cho điều kiện 'product')
    const products = await Product.findAll({ 
      where: { trangThai: 'Đang kinh doanh' },
      attributes: ['id', 'tenSanPham'],
      order: [['tenSanPham', 'ASC']]
    });

    // Lấy danh sách danh mục (để chọn)
    const categories = await Product.findAll({
      attributes: ['danhMuc'],
      group: ['danhMuc']
    });

    res.render('promotions/form', {
      title: 'Tạo Khuyến mãi mới',
      promotion: null,
      products,
      categories: categories.map(c => c.danhMuc), // Chỉ lấy mảng tên
      error: null,
      isEditing: false
    });
  } catch (err) {
    console.log(err);
  }
};

// 2b. Xử lý Thêm Mới
exports.postCreatePromotion = async (req, res) => {
  const {
    tenChuongTrinh, moTa, ngayBatDau, ngayKetThuc,
    loaiGiamGia, giaTriGiam, dieuKienApDung, giaTriDieuKien
  } = req.body;

  try {
    await Promotion.create({
      tenChuongTrinh, moTa, ngayBatDau, ngayKetThuc,
      loaiGiamGia, giaTriGiam, dieuKienApDung, 
      giaTriDieuKien: (dieuKienApDung === 'all') ? null : giaTriDieuKien
    });
    res.redirect('/promotions');
  } catch (err) {
    console.log(err);
    // Tải lại form với lỗi
    const products = await Product.findAll({ attributes: ['id', 'tenSanPham'], order: [['tenSanPham', 'ASC']]});
    const categories = await Product.findAll({ attributes: ['danhMuc'], group: ['danhMuc']});
    res.render('promotions/form', {
      title: 'Tạo Khuyến mãi mới',
      promotion: req.body, // Giữ lại dữ liệu đã nhập
      products,
      categories: categories.map(c => c.danhMuc),
      error: err.message,
      isEditing: false
    });
  }
};

// 3a. Hiển thị Form Chỉnh Sửa
exports.getEditPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.redirect('/promotions');
    }

    const products = await Product.findAll({ attributes: ['id', 'tenSanPham'], order: [['tenSanPham', 'ASC']]});
    const categories = await Product.findAll({ attributes: ['danhMuc'], group: ['danhMuc']});

    res.render('promotions/form', {
      title: 'Chỉnh sửa Khuyến mãi',
      promotion: promotion,
      products,
      categories: categories.map(c => c.danhMuc),
      error: null,
      isEditing: true
    });
  } catch (err) {
    console.log(err);
  }
};

// 3b. Xử lý Chỉnh Sửa
exports.postEditPromotion = async (req, res) => {
  const {
    tenChuongTrinh, moTa, ngayBatDau, ngayKetThuc,
    loaiGiamGia, giaTriGiam, dieuKienApDung, giaTriDieuKien
  } = req.body;

  try {
    await Promotion.update({
      tenChuongTrinh, moTa, ngayBatDau, ngayKetThuc,
      loaiGiamGia, giaTriGiam, dieuKienApDung,
      giaTriDieuKien: (dieuKienApDung === 'all') ? null : giaTriDieuKien
    }, {
      where: { id: req.params.id }
    });
    res.redirect('/promotions');
  } catch (err) {
    console.log(err);
    // Tải lại form với lỗi
    const products = await Product.findAll({ attributes: ['id', 'tenSanPham'], order: [['tenSanPham', 'ASC']]});
    const categories = await Product.findAll({ attributes: ['danhMuc'], group: ['danhMuc']});
    res.render('promotions/form', {
      title: 'Chỉnh sửa Khuyến mãi',
      promotion: req.body,
      products,
      categories: categories.map(c => c.danhMuc),
      error: err.message,
      isEditing: true
    });
  }
};

// 4. Xử lý Vô hiệu hóa / Kích hoạt
exports.postTogglePromotionStatus = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (promotion) {
      const newStatus = (promotion.trangThai === 'Đang hoạt động') ? 'Vô hiệu hóa' : 'Đang hoạt động';
      promotion.trangThai = newStatus;
      await promotion.save();
    }
    res.redirect('/promotions');
  } catch (err) {
    console.log(err);
  }
};