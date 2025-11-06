// routes/stockMovementRoutes.js
const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovementController');

// Import middleware
const { isAuth, isBranchManager } = require('../middleware/authMiddleware');

// Khóa tất cả các route trong file này (Chỉ QLCN)
router.use(isAuth, isBranchManager);

// 1. GET /stock-movement -> Trang Lịch sử Xuất kho
router.get('/', stockMovementController.getMovementList);

// 2. GET /stock-movement/add -> Hiển thị form tạo phiếu
router.get('/add', stockMovementController.getMovementPage);

// 3. POST /stock-movement/add -> Xử lý tạo phiếu
router.post('/add', stockMovementController.postCreateMovement);

// 4. [API] GET /stock-movement/api/batches/:productId -> Lấy Lô hàng cho 1 SP
router.get('/api/batches/:productId', stockMovementController.getBatchesForProduct);

module.exports = router;