// controllers/customerController.js
const { Customer } = require('../models');
const { Op } = require('sequelize');

// 1. Xem/Tìm kiếm Khách hàng (UC-02)
exports.getCustomerList = async (req, res) => {
  const searchTerm = req.query.q || ''; // Lấy từ khóa (SĐT) từ URL
  
  try {
    let whereClause = {}; // Khởi tạo một mệnh đề "where" rỗng

    // Nếu có từ khóa, thì thêm điều kiện tìm kiếm vào mệnh đề "where"
    if (searchTerm) {
      whereClause.soDienThoai = { [Op.like]: `%${searchTerm}%` };
    }

    // Luôn luôn thực hiện tìm kiếm
    // Nếu searchTerm rỗng, whereClause sẽ là {}, Sequelize hiểu là "tìm tất cả"
    const customers = await Customer.findAll({
      where: whereClause, // Áp dụng mệnh đề "where"
      limit: 50, // Giới hạn 50 kết quả cho đỡ nặng
      order: [['hoTen', 'ASC']] // Sắp xếp theo tên A-Z
    });
    
    res.render('customers/list', {
      title: 'Tra cứu Khách hàng',
      customers,
      searchTerm
    });

  } catch (err) {
    console.log(err);
  }
};

// 2a. Hiển thị Form Thêm Mới (UC-04)
exports.getCreateCustomer = (req, res) => {
  res.render('customers/form', {
    title: 'Thêm Khách hàng mới',
    customer: null,
    error: null,
    isEditing: false
  });
};

// 2b. Xử lý Thêm Mới (UC-04)
exports.postCreateCustomer = async (req, res) => {
  const { hoTen, soDienThoai } = req.body;

  try {
    // Kiểm tra SĐT đã tồn tại chưa
    const existingCustomer = await Customer.findOne({ where: { soDienThoai } });
    if (existingCustomer) {
      return res.render('customers/form', {
        title: 'Thêm Khách hàng mới',
        customer: { hoTen, soDienThoai },
        error: 'Số điện thoại này đã được đăng ký cho một khách hàng khác.',
        isEditing: false
      });
    }

    await Customer.create({ hoTen, soDienThoai });
    res.redirect('/customers'); // Quay về trang tra cứu

  } catch (err) {
    console.log(err);
  }
};

// 3a. Hiển thị Form Chỉnh Sửa
exports.getEditCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.redirect('/customers');
    }

    res.render('customers/form', {
      title: 'Chỉnh sửa Khách hàng',
      customer: customer,
      error: null,
      isEditing: true
    });
  } catch (err) {
    console.log(err);
  }
};

// 3b. Xử lý Chỉnh Sửa
exports.postEditCustomer = async (req, res) => {
  const customerId = req.params.id;
  const { hoTen, soDienThoai } = req.body;

  try {
    // Kiểm tra SĐT trùng (nhưng loại trừ chính khách hàng này)
    const existingCustomer = await Customer.findOne({
      where: {
        soDienThoai,
        id: { [Op.ne]: customerId } // [Op.ne] = Not Equal
      }
    });

    if (existingCustomer) {
      return res.render('customers/form', {
        title: 'Chỉnh sửa Khách hàng',
        customer: { id: customerId, hoTen, soDienThoai },
        error: 'Số điện thoại này đã thuộc về một khách hàng khác.',
        isEditing: true
      });
    }

    await Customer.update({
      hoTen,
      soDienThoai
    }, {
      where: { id: customerId }
    });

    res.redirect('/customers');

  } catch (err) {
    console.log(err);
  }
};