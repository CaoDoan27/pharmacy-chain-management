// controllers/reportController.js (Đã sửa lỗi SUM cho Báo cáo Tổng hợp)
const { 
  Invoice, 
  InvoiceItem, 
  Batch, 
  Product, 
  sequelize,
  Branch, // Import 'Branch'
  User    // Import 'User'
} = require('../models');
const { Op } = require('sequelize');

// --- HÀM HỖ TRỢ (KHÔNG ĐỔI) ---
function getStartOfDay(date) {
  date.setHours(0, 0, 0, 0);
  return date;
}
function getEndOfDay(date) {
  date.setHours(23, 59, 59, 999);
  return date;
}

// --- BÁO CÁO CHI NHÁNH (UC-08) ---
exports.getBranchReport = async (req, res) => {
  try {
    const branchId = req.session.user.branchId;

    // Múi giờ
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = String(Math.abs(offsetMinutes / 60)).padStart(2, '0');
    const offsetSign = offsetMinutes <= 0 ? '+' : '-';
    const serverTimezone = `${offsetSign}${offsetHours}:00`;
    const localDateCol = sequelize.literal(`DATE(CONVERT_TZ(ngayBan, '+00:00', '${serverTimezone}'))`);

    // 1. KPIs Sales (Hôm nay)
    const todayStart = getStartOfDay(new Date());
    const todayEnd = getEndOfDay(new Date());

    const salesToday = await Invoice.findAll({
      where: {
        branchId: branchId,
        ngayBan: { [Op.between]: [todayStart, todayEnd] }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('tongTien')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalInvoices']
      ],
      raw: true
    });

    // 2. KPIs Kho (Tổng quan)
    const inventoryStats = await Batch.findOne({
      where: { 
        branchId: branchId, 
        soLuongTon: { [Op.gt]: 0 } 
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('soLuongTon * giaNhap')), 'totalValue'],
        [sequelize.fn('COUNT', 
          sequelize.literal(`CASE WHEN hanSuDung BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 1 ELSE NULL END`)
        ), 'expiringSKUs']
      ],
      raw: true
    });

    // 3. Biểu đồ Doanh thu 7 ngày
    const sevenDaysAgo = getStartOfDay(new Date(new Date().setDate(new Date().getDate() - 6)));
    const salesLast7Days = await Invoice.findAll({
      where: {
        branchId: branchId,
        ngayBan: { [Op.gte]: sevenDaysAgo }
      },
      attributes: [
        [localDateCol, 'saleDate'],
        [sequelize.fn('SUM', sequelize.col('tongTien')), 'dailyRevenue']
      ],
      group: [localDateCol],
      order: [[localDateCol, 'ASC']],
      raw: true
    });

    // 4. Top 5 Sản phẩm Bán chạy
    const thirtyDaysAgo = getStartOfDay(new Date(new Date().setDate(new Date().getDate() - 30)));
    const top5Products = await InvoiceItem.findAll({
      attributes: [ 'productId', [sequelize.fn('SUM', sequelize.col('soLuong')), 'totalSold'] ],
      include: [
        { model: Invoice, where: { branchId: branchId, ngayBan: { [Op.gte]: thirtyDaysAgo } }, attributes: [] },
        { model: Product, attributes: ['tenSanPham'] }
      ],
      group: ['productId', 'Product.id', 'Product.tenSanPham'],
      order: [[sequelize.fn('SUM', sequelize.col('soLuong')), 'DESC']],
      limit: 5,
      raw: true
    });

    // 5. Bảng Hàng sắp hết hạn & Sắp hết tồn kho (< 50)
    const lowStockAndExpiring = await Batch.findAll({
        where: { branchId: branchId, soLuongTon: { [Op.gt]: 0 }, },
        include: [{ model: Product, attributes: ['tenSanPham', 'donViCoSo'] }],
        order: [['hanSuDung', 'ASC']],
    });
    
    const expiryDateLimit = new Date();
    expiryDateLimit.setDate(expiryDateLimit.getDate() + 90);
    const expiringItems = lowStockAndExpiring
        .filter(b => new Date(b.hanSuDung) <= expiryDateLimit)
        .slice(0, 10);

    const productStockMap = new Map();
    lowStockAndExpiring.forEach(batch => {
        if (!productStockMap.has(batch.productId)) {
            productStockMap.set(batch.productId, {
                productName: batch.Product.tenSanPham,
                donViCoSo: batch.Product.donViCoSo,
                totalStock: 0
            });
        }
        const productData = productStockMap.get(batch.productId);
        productData.totalStock += batch.soLuongTon;
    });

    const lowStockItems = Array.from(productStockMap.values())
        .filter(item => item.totalStock < 50) 
        .sort((a, b) => a.totalStock - b.totalStock)
        .slice(0, 10);

    // Gửi dữ liệu sang View
    res.render('reports/branch_dashboard', {
      title: 'Báo cáo Chi nhánh',
      salesToday: salesToday[0],
      totalInventoryValue: inventoryStats.totalValue || 0,
      expiringSKUs: inventoryStats.expiringSKUs || 0,
      salesLast7Days,
      top5Products,
      expiringItems,
      lowStockItems
    });

  } catch (err) {
    console.log("Lỗi khi tạo báo cáo chi nhánh:", err);
    res.redirect('/');
  }
};


// --- BÁO CÁO TỔNG HỢP (UC-10) - (ĐÃ SỬA LỖI) ---
exports.getGeneralReport = async (req, res) => {
  try {
    const todayStart = getStartOfDay(new Date());
    const todayEnd = getEndOfDay(new Date());
    const thirtyDaysAgo = getStartOfDay(new Date(new Date().setDate(new Date().getDate() - 30)));
    
    // --- 1. KPIs Tổng quan (Toàn chuỗi) ---
    // (ĐÂY LÀ TRUY VẤN ĐÃ SỬA, ĐẢM BẢO CHÍNH XÁC)
    const salesToday = await Invoice.findAll({
      where: { ngayBan: { [Op.between]: [todayStart, todayEnd] } },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('tongTien')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalInvoices']
      ],
      raw: true
    });

    // (ĐÃ SỬA) Truy vấn giá trị kho
    const totalInventoryValue = await Batch.findOne({
      where: { soLuongTon: { [Op.gt]: 0 } },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('soLuongTon * giaNhap')), 'totalValue']
      ],
      raw: true
    });

    // --- 2. Biểu đồ: So sánh Doanh thu các Chi nhánh (30 ngày) ---
    const salesByBranch = await Invoice.findAll({
      where: { ngayBan: { [Op.gte]: thirtyDaysAgo } },
      attributes: [
        'branchId',
        [sequelize.fn('SUM', sequelize.col('tongTien')), 'totalRevenue']
      ],
      include: [{
        model: Branch,
        attributes: ['tenChiNhanh']
      }],
      group: ['branchId', 'Branch.id', 'Branch.tenChiNhanh'],
      order: [[sequelize.fn('SUM', sequelize.col('tongTien')), 'DESC']],
      raw: true
    });

    // --- 3. Biểu đồ: Top 5 Sản phẩm Bán chạy (Toàn chuỗi, 30 ngày) ---
    const top5ProductsChain = await InvoiceItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('soLuong')), 'totalSold']
      ],
      include: [
        {
          model: Invoice,
          where: { ngayBan: { [Op.gte]: thirtyDaysAgo } },
          attributes: []
        },
        {
          model: Product,
          attributes: ['tenSanPham']
        }
      ],
      group: ['productId', 'Product.id', 'Product.tenSanPham'],
      order: [[sequelize.fn('SUM', sequelize.col('soLuong')), 'DESC']],
      limit: 5,
      raw: true
    });

    // Gửi dữ liệu sang View
    res.render('reports/general_dashboard', {
      title: 'Báo cáo Tổng hợp',
      salesToday: salesToday[0], // Truyền dữ liệu đã sửa
      totalInventoryValue: totalInventoryValue.totalValue || 0,
      salesByBranch,
      top5ProductsChain
    });

  } catch (err) {
    console.log("Lỗi khi tạo báo cáo tổng hợp:", err);
    res.redirect('/');
  }
};