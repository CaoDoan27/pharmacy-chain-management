// controllers/posController.js (Đã nâng cấp API)
const { 
  Product, Customer, Batch, Invoice, InvoiceItem, 
  sequelize, User, Promotion
} = require('../models');
const { Op } = require('sequelize');

// --- (MỚI) HÀM HELPER TÍNH TOÁN KHUYẾN MÃI ---
// Hàm này sẽ được dùng chung cho cả API tính toán và API thanh toán
async function applyPromotions(cart, transaction = null) {
  let giamGiaKhuyenMai = 0;
  let originalTotalAmount = 0;

  if (!cart || cart.length === 0) {
    return { giamGiaKhuyenMai: 0, originalTotalAmount: 0 };
  }

  // 1. Lấy thông tin chi tiết và tính tổng tiền gốc
  const cartProductDetails = new Map();
  const productIds = cart.map(item => item.productId);

  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    transaction
  });

  products.forEach(p => cartProductDetails.set(p.id, p));

  for (const item of cart) {
    const product = cartProductDetails.get(item.productId);
    if (product) {
      originalTotalAmount += (product.giaBan * item.quantity);
    }
  }

  // 2. Tìm các khuyến mãi đang hoạt động
  const now = new Date();
  const activePromotions = await Promotion.findAll({
    where: {
      trangThai: 'Đang hoạt động',
      ngayBatDau: { [Op.lte]: now },
      ngayKetThuc: { [Op.gte]: now }
    },
    transaction
  });

  if (activePromotions.length === 0) {
    return { giamGiaKhuyenMai: 0, originalTotalAmount };
  }

  // 3. Tính toán giảm giá
  let totalDiscountFromItems = 0;
  let totalDiscountFromAll = 0;

  for (const promo of activePromotions) {
    let discount = 0;
    
    if (promo.dieuKienApDung === 'product' || promo.dieuKienApDung === 'category') {
      for (const item of cart) {
        const product = cartProductDetails.get(item.productId);
        if (!product) continue;
        
        let itemMatches = false;
        if (promo.dieuKienApDung === 'product' && product.id == promo.giaTriDieuKien) {
          itemMatches = true;
        }
        if (promo.dieuKienApDung === 'category' && product.danhMuc === promo.giaTriDieuKien) {
          itemMatches = true;
        }
        
        if (itemMatches) {
          const itemTotal = product.giaBan * item.quantity;
          if (promo.loaiGiamGia === 'percentage') {
            discount = (itemTotal * promo.giaTriGiam) / 100;
          } else {
            discount = promo.giaTriGiam * item.quantity;
          }
          totalDiscountFromItems += discount;
        }
      }
    } else if (promo.dieuKienApDung === 'all') {
      if (promo.loaiGiamGia === 'percentage') {
        discount = (originalTotalAmount * promo.giaTriGiam) / 100;
      } else {
        discount = promo.giaTriGiam;
      }
      totalDiscountFromAll += discount;
    }
  }

  giamGiaKhuyenMai = Math.round(totalDiscountFromItems + totalDiscountFromAll);

  // Đảm bảo không giảm giá lố
  if (giamGiaKhuyenMai > originalTotalAmount) {
    giamGiaKhuyenMai = originalTotalAmount;
  }

  return { giamGiaKhuyenMai, originalTotalAmount };
}
// --- KẾT THÚC HÀM HELPER ---


// 1. Hiển thị Trang Bán hàng (POS)
exports.getPosPage = (req, res) => {
  res.render('pos/index', {
    title: 'Bán hàng (POS)'
  });
};

// 2. [API] Tìm kiếm Sản phẩm
exports.searchProducts = async (req, res) => {
  // ... (Không thay đổi)
  try {
    const searchTerm = req.query.q || '';
    const userBranchId = req.session.user.branchId;
    if (!searchTerm) { return res.json([]); }
    const products = await Product.findAll({
      where: { tenSanPham: { [Op.like]: `%${searchTerm}%` }, trangThai: 'Đang kinh doanh' },
      include: [{
        model: Batch,
        where: { branchId: userBranchId, soLuongTon: { [Op.gt]: 0 }, hanSuDung: { [Op.gt]: new Date() } },
        attributes: [], required: true
      }],
      limit: 10
    });
    res.json(products);
  } catch (err) { console.log(err); res.status(500).json({ error: err.message }); }
};

// 3. [API] Tìm kiếm Khách hàng (UC-02)
exports.searchCustomers = async (req, res) => {
  // ... (Không thay đổi)
  try {
    const searchTerm = req.query.q || '';
    if (!searchTerm) { return res.json([]); }
    const customers = await Customer.findAll({
      where: { soDienThoai: { [Op.like]: `%${searchTerm}%` } },
      attributes: ['id', 'hoTen', 'soDienThoai', 'hangThanhVien', 'diemTichLuy'],
      limit: 5
    });
    res.json(customers);
  } catch (err) { console.log(err); res.status(500).json({ error: err.message }); }
};

// --- (MỚI) API TÍNH TOÁN KHUYẾN MÃI ---
// 4. [API] Tính toán Khuyến mãi (để hiển thị)
exports.calculatePromotions = async (req, res) => {
  try {
    const { cart } = req.body;
    // Gọi hàm helper (không cần transaction, chỉ tính toán)
    const { giamGiaKhuyenMai, originalTotalAmount } = await applyPromotions(cart, null);
    
    res.json({
      success: true,
      subtotal: originalTotalAmount,
      promotionDiscount: giamGiaKhuyenMai
    });
  } catch (err) {
    console.log("Lỗi khi tính khuyến mãi:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// --- 5. [API] Xử lý Thanh toán (UC-01) - (ĐÃ SỬA LỖI) ---
exports.postCheckout = async (req, res) => {
  const { cart, customerId, pointsToSpend } = req.body;
  const { id: userId, branchId } = req.session.user;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Giỏ hàng rỗng.' });
  }

  const t = await sequelize.transaction();

  try {
    let giamGiaDiem = 0;
    let finalAmount = 0;
    const invoiceItemsData = [];
    let customer = null;
    let finalCustomerPoints = null; // (MỚI) Biến để lưu điểm cuối cùng

    // --- BƯỚC 1: TÍNH TOÁN KHUYẾN MÃI ---
    const { giamGiaKhuyenMai, originalTotalAmount } = await applyPromotions(cart, t);
    const amountAfterPromotion = originalTotalAmount - giamGiaKhuyenMai;

    // --- BƯỚC 2: TRỪ KHO (FEFO) ---
    for (const item of cart) {
      let soLuongCanBan = parseInt(item.quantity);
      if (soLuongCanBan <= 0) continue;

      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) { throw new Error(`Không tìm thấy sản phẩm ID: ${item.productId}`); }
      
      const donGia = product.giaBan;

      const batches = await Batch.findAll({
        where: { productId: item.productId, branchId: branchId, soLuongTon: { [Op.gt]: 0 }, hanSuDung: { [Op.gt]: new Date() } },
        order: [['hanSuDung', 'ASC']],
        transaction: t, lock: true
      });

      const tongTonKho = batches.reduce((sum, batch) => sum + batch.soLuongTon, 0);
      if (tongTonKho < soLuongCanBan) { throw new Error(`Không đủ tồn kho cho "${product.tenSanPham}". (Chỉ còn ${tongTonKho})`); }

      for (const batch of batches) {
        if (soLuongCanBan <= 0) break;
        const soLuongBanTuLoNay = Math.min(soLuongCanBan, batch.soLuongTon);
        batch.soLuongTon -= soLuongBanTuLoNay;
        await batch.save({ transaction: t });
        invoiceItemsData.push({ productId: item.productId, batchId: batch.id, soLuong: soLuongBanTuLoNay, donGia: donGia });
        soLuongCanBan -= soLuongBanTuLoNay;
      }
    }

    // --- BƯỚC 3: XỬ LÝ TIÊU ĐIỂM (NẾU CÓ) ---
    if (customerId && pointsToSpend > 0) {
      customer = await Customer.findByPk(customerId, { transaction: t, lock: true });
      if (!customer) { throw new Error('Không tìm thấy khách hàng để trừ điểm.'); }
      giamGiaDiem = await customer.spendPoints(pointsToSpend, amountAfterPromotion, t);
    }
    
    finalAmount = amountAfterPromotion - giamGiaDiem;

    // --- BƯỚC 4: TẠO HÓA ĐƠN (INVOICE) ---
    const invoice = await Invoice.create({
      ngayBan: new Date(),
      tienGoc: originalTotalAmount,
      giamGiaKhuyenMai: giamGiaKhuyenMai,
      giamGiaDiem: giamGiaDiem,
      tongTien: finalAmount,
      userId: userId, branchId: branchId, customerId: customerId || null
    }, { transaction: t });

    // --- BƯỚC 5: TẠO CHI TIẾT HÓA ĐƠN (INVOICE ITEM) ---
    for (const itemData of invoiceItemsData) { itemData.invoiceId = invoice.id; }
    await InvoiceItem.bulkCreate(invoiceItemsData, { transaction: t });

    // --- BƯỚC 6: TÍCH ĐIỂM & NÂNG HẠNG ---
    if (customerId) {
      if (!customer) { 
        customer = await Customer.findByPk(customerId, { transaction: t, lock: true });
      }
      if (customer) {
        // Hàm này sẽ CẬP NHẬT 'customer.diemTichLuy'
        await customer.addPurchase(finalAmount, originalTotalAmount, t);
        finalCustomerPoints = customer.diemTichLuy; // (MỚI) Lấy số điểm cuối cùng
      }
    }

    // --- BƯỚC 7: HOÀN TẤT ---
    await t.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Thanh toán thành công!',
      invoiceId: invoice.id,
      discounts: {
        promotion: giamGiaKhuyenMai,
        points: giamGiaDiem
      },
      newPoints: finalCustomerPoints // (MỚI) Gửi số điểm mới về client
    });

  } catch (err) {
    await t.rollback();
    console.log("LỖI THANH TOÁN:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};


// --- 6 & 7. (API LỊCH SỬ BÁN HÀNG - KHÔNG ĐỔI) ---
exports.getPosHistoryList = async (req, res) => {
  try {
    const branchId = req.session.user.branchId;
    const invoices = await Invoice.findAll({
      where: { branchId: branchId }, order: [['ngayBan', 'DESC']], limit: 20,
      include: [
        { model: User, attributes: ['hoTen'] },
        { model: Customer, attributes: ['hoTen'] }
      ]
    });
    res.json(invoices);
  } catch (err) { console.log(err); res.status(500).json({ error: err.message }); }
};
exports.getPosHistoryDetails = async (req, res) => {
  try {
    const receiptId = req.params.id;
    const branchId = req.session.user.branchId;
    const invoice = await Invoice.findOne({
      where: { id: receiptId, branchId: branchId },
      include: [
        { model: User, attributes: ['hoTen'] },
        { model: Customer, attributes: ['hoTen', 'soDienThoai'] },
        { model: InvoiceItem, include: [ { model: Product }, { model: Batch, attributes: ['soLo', 'hanSuDung'] } ] }
      ]
    });
    if (!invoice) { return res.status(404).json({ error: 'Không tìm thấy hóa đơn.' }); }
    res.json(invoice);
  } catch (err) { console.log(err); res.status(500).json({ error: err.message }); }
};