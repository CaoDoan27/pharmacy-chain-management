// controllers/supplierController.js
const { Supplier } = require('../models');
const { Op } = require('sequelize');

// 1. Xem Danh sách Nhà cung cấp
exports.getSupplierList = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [['tenNhaCungCap', 'ASC']]
    });
    res.render('suppliers/list', {
      title: 'Quản lý Nhà cung cấp',
      suppliers
    });
  } catch (err) {
    console.log(err);
  }
};

// 2a. Hiển thị Form Thêm Mới
exports.getCreateSupplier = (req, res) => {
  res.render('suppliers/form', {
    title: 'Thêm Nhà cung cấp mới',
    supplier: null,
    error: null,
    isEditing: false
  });
};

// 2b. Xử lý Thêm Mới
exports.postCreateSupplier = async (req, res) => {
  const { tenNhaCungCap, soDienThoai, email } = req.body;

  try {
    const existingSupplier = await Supplier.findOne({ where: { tenNhaCungCap } });
    if (existingSupplier) {
      return res.render('suppliers/form', {
        title: 'Thêm Nhà cung cấp mới',
        supplier: { tenNhaCungCap, soDienThoai, email },
        error: 'Tên nhà cung cấp này đã tồn tại.',
        isEditing: false
      });
    }

    await Supplier.create({ tenNhaCungCap, soDienThoai, email });
    res.redirect('/suppliers');

  } catch (err) {
    console.log(err);
  }
};

// 3a. Hiển thị Form Chỉnh Sửa
exports.getEditSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
      return res.redirect('/suppliers');
    }

    res.render('suppliers/form', {
      title: 'Chỉnh sửa Nhà cung cấp',
      supplier: supplier,
      error: null,
      isEditing: true
    });
  } catch (err) {
    console.log(err);
  }
};

// 3b. Xử lý Chỉnh Sửa
exports.postEditSupplier = async (req, res) => {
  const supplierId = req.params.id;
  const { tenNhaCungCap, soDienThoai, email } = req.body;

  try {
    const existingSupplier = await Supplier.findOne({
      where: {
        tenNhaCungCap,
        id: { [Op.ne]: supplierId }
      }
    });

    if (existingSupplier) {
      return res.render('suppliers/form', {
        title: 'Chỉnh sửa Nhà cung cấp',
        supplier: { id: supplierId, tenNhaCungCap, soDienThoai, email },
        error: 'Tên nhà cung cấp này đã tồn tại.',
        isEditing: true
      });
    }

    await Supplier.update({
      tenNhaCungCap,
      soDienThoai,
      email
    }, {
      where: { id: supplierId }
    });

    res.redirect('/suppliers');

  } catch (err) {
    console.log(err);
  }
};

// 4. Xử lý Đổi Trạng thái (Vô hiệu hóa)
exports.postUpdateSupplierStatus = async (req, res) => {
  const supplierId = req.params.id;
  const currentStatus = req.body.currentStatus;

  try {
    const newStatus = (currentStatus === 'Đang hoạt động')
      ? 'Vô hiệu hóa'
      : 'Đang hoạt động';

    await Supplier.update(
      { trangThai: newStatus },
      { where: { id: supplierId } }
    );

    res.redirect('/suppliers');
  } catch (err) {
    console.log(err);
  }
};