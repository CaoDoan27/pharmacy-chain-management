// routes/goodsReceiptRoutes.js (Đã sửa thứ tự)
const express = require('express');
const router = express.Router();
const goodsReceiptController = require('../controllers/goodsReceiptController');
const { isAuth, isBranchManager } = require('../middleware/authMiddleware');

router.use(isAuth, isBranchManager);

// --- ĐỊNH NGHĨA ROUTE THEO THỨ TỰ ĐÚNG ---

// 1. GET /goods-receipt/ -> Trang danh sách lịch sử
router.get('/', goodsReceiptController.getReceiptList);

// 2. GET /goods-receipt/add -> Trang tạo phiếu (Tĩnh)
// Phải đặt trước route động /:id
router.get('/add', goodsReceiptController.getCreateReceipt);

// 3. POST /goods-receipt/add -> Xử lý tạo phiếu
router.post('/add', goodsReceiptController.postCreateReceipt);

// 4. GET /goods-receipt/:id -> Trang chi tiết (Động)
// Phải đặt sau route /add
router.get('/:id', goodsReceiptController.getReceiptDetails);

module.exports = router;