// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Import middleware (Nhân viên hoặc QLCN)
const { isAuth, isStoreStaff } = require('../middleware/authMiddleware');

// Khóa tất cả các route trong file này
router.use(isAuth, isStoreStaff);

// GET /inventory/lookup
// Route này xử lý cả việc hiển thị trang và nhận kết quả tìm kiếm
router.get('/lookup', inventoryController.getLookupPage);

module.exports = router;