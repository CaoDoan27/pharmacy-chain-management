// routes/purchaseOrderRoutes.js
const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

// Import middleware
const { isAuth, isBranchManager } = require('../middleware/authMiddleware');

// Khóa tất cả các route trong file này (Chỉ QLCN)
router.use(isAuth, isBranchManager);

// 1. GET /purchase-order -> Trang Lịch sử Đặt hàng
router.get('/', purchaseOrderController.getOrderList);

// 2. GET /purchase-order/add -> Hiển thị form tạo đơn
router.get('/add', purchaseOrderController.getCreateOrder);

// 3. POST /purchase-order/add -> Xử lý tạo đơn
router.post('/add', purchaseOrderController.postCreateOrder);

router.post('/complete/:id', purchaseOrderController.completeOrder);

module.exports = router;