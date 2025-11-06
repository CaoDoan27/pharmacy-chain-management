// routes/promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// Import middleware
const { isAuth, isManager } = require('../middleware/authMiddleware');

// Khóa tất cả các route trong file này (Chỉ Quản lý tổng)
router.use(isAuth, isManager);

// 1. GET /promotions -> Trang danh sách
router.get('/', promotionController.getPromotionList);

// 2. GET /promotions/add -> Trang tạo mới
router.get('/add', promotionController.getCreatePromotion);

// 3. POST /promotions/add -> Xử lý tạo mới
router.post('/add', promotionController.postCreatePromotion);

// 4. GET /promotions/edit/:id -> Trang chỉnh sửa
router.get('/edit/:id', promotionController.getEditPromotion);

// 5. POST /promotions/edit/:id -> Xử lý chỉnh sửa
router.post('/edit/:id', promotionController.postEditPromotion);

// 6. POST /promotions/status/:id -> Xử lý đổi trạng thái
router.post('/status/:id', promotionController.postTogglePromotionStatus);

module.exports = router;