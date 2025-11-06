// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Import middleware
const { isAuth, isManager } = require('../middleware/authMiddleware');

// Khóa tất cả các route trong file này (Chỉ Quản lý tổng)
router.use(isAuth, isManager);

// 1. GET /users -> Trang danh sách
router.get('/', userController.getUserList);

// 2. GET /users/add -> Trang tạo mới
router.get('/add', userController.getCreateUser);

// 3. POST /users/add -> Xử lý tạo mới
router.post('/add', userController.postCreateUser);

// 4. GET /users/edit/:id -> Trang chỉnh sửa
router.get('/edit/:id', userController.getEditUser);

// 5. POST /users/edit/:id -> Xử lý chỉnh sửa
router.post('/edit/:id', userController.postEditUser);

// 6. POST /users/status/:id -> Xử lý Khóa/Mở
router.post('/status/:id', userController.postToggleStatus);

// 7. POST /users/reset-password/:id -> Xử lý Đặt lại MK
router.post('/reset-password/:id', userController.postResetPassword);

module.exports = router;