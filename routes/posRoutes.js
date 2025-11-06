// routes/posRoutes.js
const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');

// Import middleware (Nhân viên hoặc QLCN)
const { isAuth, isStoreStaff } = require('../middleware/authMiddleware');

// Khóa tất cả các route trong file này
router.use(isAuth, isStoreStaff);

// 1. GET /pos -> Hiển thị trang POS chính
router.get('/', posController.getPosPage);

// 2. [API] GET /pos/api/search-products -> API tìm sản phẩm
router.get('/api/search-products', posController.searchProducts);

// 3. [API] GET /pos/api/search-customers -> API tìm khách hàng
router.get('/api/search-customers', posController.searchCustomers);

//4. API TÍNH TOÁN KHUYẾN MÃI ---
router.post('/api/calculate-promo', posController.calculatePromotions);

// 5. [API] POST /pos/checkout -> API xử lý thanh toán
router.post('/checkout', posController.postCheckout);

// 6. [API] GET /pos/api/history -> Lấy danh sách lịch sử
router.get('/api/history', posController.getPosHistoryList);

// 7. [API] GET /pos/api/history/:id -> Lấy chi tiết 1 hóa đơn
router.get('/api/history/:id', posController.getPosHistoryDetails);

module.exports = router;