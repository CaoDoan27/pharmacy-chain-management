// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Import middleware
const { isAuth, isManager } = require('../middleware/authMiddleware');

// Áp dụng middleware cho TẤT CẢ các route trong file này
// Bất kỳ ai truy cập các URL bắt đầu bằng /products...
// đều phải đăng nhập (isAuth) VÀ là Quản lý tổng (isManager)
router.use(isAuth, isManager);

// --- Định nghĩa các route ---

// 1. GET /products -> Xem danh sách sản phẩm
router.get('/', productController.getProductList);

// 2a. GET /products/add -> Hiển thị form thêm mới
router.get('/add', productController.getCreateProduct);

// 2b. POST /products/add -> Xử lý thêm mới
router.post('/add', productController.postCreateProduct);

// 3a. GET /products/edit/:id -> Hiển thị form chỉnh sửa
router.get('/edit/:id', productController.getEditProduct);

// 3b. POST /products/edit/:id -> Xử lý chỉnh sửa
router.post('/edit/:id', productController.postEditProduct);

// 4. POST /products/status/:id -> Xử lý đổi trạng thái
router.post('/status/:id', productController.postUpdateProductStatus);

module.exports = router;