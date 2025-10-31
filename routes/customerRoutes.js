// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Import middleware
const { isAuth, isStoreStaff } = require('../middleware/authMiddleware');

// Khóa tất cả các route trong file này
// Chỉ QLCN và Nhân viên mới được truy cập
router.use(isAuth, isStoreStaff);

// --- Định nghĩa các route ---

// 1. GET /customers -> Trang Tra cứu
router.get('/', customerController.getCustomerList);

// 2a. GET /customers/add -> Hiển thị form thêm mới
router.get('/add', customerController.getCreateCustomer);

// 2b. POST /customers/add -> Xử lý thêm mới
router.post('/add', customerController.postCreateCustomer);

// 3a. GET /customers/edit/:id -> Hiển thị form chỉnh sửa
router.get('/edit/:id', customerController.getEditCustomer);

// 3b. POST /customers/edit/:id -> Xử lý chỉnh sửa
router.post('/edit/:id', customerController.postEditCustomer);

module.exports = router;