// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Import middleware
const { isAuth, isManager } = require('../middleware/authMiddleware');

// Áp dụng middleware cho TẤT CẢ các route trong file này
// Bắt buộc phải đăng nhập (isAuth) VÀ là Quản lý tổng (isManager)
router.use(isAuth, isManager);

// --- Định nghĩa các route ---

// 1. GET /suppliers -> Xem danh sách
router.get('/', supplierController.getSupplierList);

// 2a. GET /suppliers/add -> Hiển thị form thêm mới
router.get('/add', supplierController.getCreateSupplier);

// 2b. POST /suppliers/add -> Xử lý thêm mới
router.post('/add', supplierController.postCreateSupplier);

// 3a. GET /suppliers/edit/:id -> Hiển thị form chỉnh sửa
router.get('/edit/:id', supplierController.getEditSupplier);

// 3b. POST /suppliers/edit/:id -> Xử lý chỉnh sửa
router.post('/edit/:id', supplierController.postEditSupplier);

// 4. POST /suppliers/status/:id -> Xử lý đổi trạng thái (vô hiệu hóa)
router.post('/status/:id', supplierController.postUpdateSupplierStatus);

module.exports = router;