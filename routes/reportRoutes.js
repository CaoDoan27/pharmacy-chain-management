// routes/reportRoutes.js (Đã cập nhật)
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Import cả 2 middleware
const { isAuth, isBranchManager, isManager } = require('../middleware/authMiddleware');

// --- Báo cáo Cấp Chi nhánh ---
// GET /reports/branch -> Dashboard của Quản lý chi nhánh
router.get('/branch', isAuth, isBranchManager, reportController.getBranchReport);

// --- BÁO CÁO CẤP TỔNG (MỚI) ---
// GET /reports/general -> Dashboard của Quản lý tổng
router.get('/general', isAuth, isManager, reportController.getGeneralReport);

module.exports = router;