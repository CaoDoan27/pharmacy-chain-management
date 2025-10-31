// controllers/productController.js (Đã cập nhật)
const { Product } = require('../models');
const { Op } = require('sequelize');

// 1. Xem Danh sách Sản phẩm
exports.getProductList = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['tenSanPham', 'ASC']]
    });
    res.render('products/list', {
      title: 'Quản lý Sản phẩm',
      products
    });
  } catch (err) {
    console.log(err);
  }
};

// 2a. Hiển thị Form Thêm Mới
exports.getCreateProduct = (req, res) => {
  res.render('products/form', {
    title: 'Thêm Sản phẩm mới',
    product: null,
    error: null,
    isEditing: false
  });
};

// 2b. Xử lý Thêm Mới (Đã cập nhật)
exports.postCreateProduct = async (req, res) => {
  // Lấy data mới
  const { tenSanPham, hoatChat, danhMuc, donViCoSo, giaBan } = req.body;

  try {
    const existingProduct = await Product.findOne({ where: { tenSanPham } });
    if (existingProduct) {
      return res.render('products/form', {
        title: 'Thêm Sản phẩm mới',
        // Giữ lại data đã nhập
        product: { tenSanPham, hoatChat, danhMuc, donViCoSo, giaBan },
        error: 'Tên sản phẩm này đã tồn tại. Vui lòng chọn tên khác.',
        isEditing: false
      });
    }

    // Tạo sản phẩm mới
    await Product.create({
      tenSanPham,
      hoatChat,
      danhMuc,     // Thêm trường mới
      donViCoSo,  // Thêm trường mới
      giaBan: parseFloat(giaBan)
    });

    res.redirect('/products');

  } catch (err) {
    console.log(err);
  }
};

// 3a. Hiển thị Form Chỉnh Sửa
exports.getEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.redirect('/products');
    }

    res.render('products/form', {
      title: 'Chỉnh sửa Sản phẩm',
      product: product,
      error: null,
      isEditing: true
    });
  } catch (err) {
    console.log(err);
  }
};

// 3b. Xử lý Chỉnh Sửa (Đã cập nhật)
exports.postEditProduct = async (req, res) => {
  const productId = req.params.id;
  const { tenSanPham, hoatChat, danhMuc, donViCoSo, giaBan } = req.body;

  try {
    const existingProduct = await Product.findOne({
      where: {
        tenSanPham,
        id: { [Op.ne]: productId }
      }
    });

    if (existingProduct) {
      return res.render('products/form', {
        title: 'Chỉnh sửa Sản phẩm',
        product: { id: productId, tenSanPham, hoatChat, danhMuc, donViCoSo, giaBan },
        error: 'Tên sản phẩm này đã tồn tại. Vui lòng chọn tên khác.',
        isEditing: true
      });
    }

    // Cập nhật sản phẩm
    await Product.update({
      tenSanPham,
      hoatChat,
      danhMuc,     // Thêm trường mới
      donViCoSo,  // Thêm trường mới
      giaBan: parseFloat(giaBan)
    }, {
      where: { id: productId }
    });

    res.redirect('/products');

  } catch (err) {
    console.log(err);
  }
};

// 4. Xử lý Đổi Trạng thái
exports.postUpdateProductStatus = async (req, res) => {
  const productId = req.params.id;
  const currentStatus = req.body.currentStatus;

  try {
    const newStatus = (currentStatus === 'Đang kinh doanh')
      ? 'Ngừng kinh doanh'
      : 'Đang kinh doanh';

    await Product.update(
      { trangThai: newStatus },
      { where: { id: productId } }
    );

    res.redirect('/products');
  } catch (err) {
    console.log(err);
  }
};