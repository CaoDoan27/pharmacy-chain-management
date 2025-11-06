// File: seedTransactions.js (Phiên bản 2.0 - 500 Hóa đơn)
// Lệnh chạy: node seedTransactions.js

const {
  sequelize, Branch, User, Supplier, Product, Customer,
  GoodsReceipt, GoodsReceiptItem, Invoice, InvoiceItem, Batch,
  PurchaseOrder, PurchaseOrderItem
} = require('./models');
const { Op } = require('sequelize');

// --- HÀM HỖ TRỢ ---
function getRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomFutureDate() {
  const d = new Date('2025-11-03'); // Dựa trên ngày chạy
  d.setDate(d.getDate() + randomInt(365, 3 * 365));
  return d;
}
// --------------------

// --- ĐỊNH NGHĨA MỐC THỜI GIAN ---
// Dữ liệu bán hàng 10 ngày, kết thúc vào 02/11/2025
const SALES_END_DATE = new Date('2025-11-02T23:59:59+07:00');
const SALES_START_DATE = new Date('2025-10-24T00:00:00+07:00'); // 10 ngày

// Dữ liệu nhập kho phải TRƯỚC ngày bán
const IMPORT_START_DATE = new Date('2025-10-20T09:00:00+07:00');
const IMPORT_END_DATE = new Date('2025-10-22T17:00:00+07:00');

// Dữ liệu đặt hàng phải TRƯỚC ngày nhập
const PO_START_DATE = new Date('2025-10-15T09:00:00+07:00');
const PO_END_DATE = new Date('2025-10-18T17:00:00+07:00');

// --------------------

async function createSeedTransactions() {
  console.log(`Bắt đầu tạo dữ liệu giao dịch (10 ngày, ${SALES_START_DATE.toLocaleDateString()} - ${SALES_END_DATE.toLocaleDateString()})...`);
  
  // Dùng 1 transaction LỚN cho toàn bộ
  const t = await sequelize.transaction();

  try {
    // --- 1. TẢI DỮ LIỆU GỐC (MASTER DATA) ---
    console.log('Đang tải dữ liệu gốc (Nhân viên, Sản phẩm, Khách hàng)...');
    
    const branches = await Branch.findAll({ where: { tenChiNhanh: { [Op.ne]: 'Trụ sở chính' } }, transaction: t });
    const allStaff = await User.findAll({ where: { vaiTro: { [Op.ne]: 'Quản lý tổng' } }, transaction: t });
    const branchManagers = allStaff.filter(u => u.vaiTro === 'Quản lý chi nhánh');
    const products = await Product.findAll({ transaction: t });
    const suppliers = await Supplier.findAll({ transaction: t });
    const customers = await Customer.findAll({ transaction: t });

    if (products.length < 100) throw new Error('Bạn phải chạy "node seed.js" trước.');
    if (branches.length === 0) throw new Error('Không tìm thấy chi nhánh.');

    // --- 2. TẠO 10 ĐƠN ĐẶT HÀNG (Purchase Orders) ---
    console.log('Đang tạo 10 Đơn Đặt Hàng (mô phỏng)...');
    for (let i = 0; i < 10; i++) {
      const currentBranch = getRandom(branches);
      const currentManager = branchManagers.find(m => m.branchId === currentBranch.id);
      if (!currentManager) continue;

      let totalEstimatedValue = 0;
      const itemsInPO = randomInt(3, 8);
      const itemPromises = [];

      for (let j = 0; j < itemsInPO; j++) {
        const randomProduct = getRandom(products);
        totalEstimatedValue += (randomInt(50, 200) * randomProduct.giaBan);
        itemPromises.push({ productId: randomProduct.id, soLuongDat: randomInt(50, 200) });
      }

      const order = await PurchaseOrder.create({
        ngayDat: randomDate(PO_START_DATE, PO_END_DATE),
        trangThai: i % 3 === 0 ? 'Đã hoàn thành' : 'Đã gửi', // 1/3 đã hoàn thành
        tongTienDuKien: totalEstimatedValue,
        userId: currentManager.id,
        supplierId: getRandom(suppliers).id,
        branchId: currentBranch.id
      }, { transaction: t });

      await PurchaseOrderItem.bulkCreate(
        itemPromises.map(item => ({ ...item, purchaseOrderId: order.id })),
        { transaction: t }
      );
    }
    console.log('✅ Hoàn thành 10 Đơn Đặt Hàng.');

    // --- 3. TẠO 50 PHIẾU NHẬP KHO (10 phiếu / 5 chi nhánh) ---
    console.log('Đang tạo 50 Phiếu Nhập kho (để có tồn kho)...');
    for (let i = 0; i < 50; i++) {
      const currentBranch = branches[i % 5];
      const currentManager = branchManagers.find(m => m.branchId === currentBranch.id);
      const randomSupplier = getRandom(suppliers);
      let totalReceiptValue = 0;

      const receipt = await GoodsReceipt.create({
        userId: currentManager.id, supplierId: randomSupplier.id,
        branchId: currentBranch.id, ngayNhap: randomDate(IMPORT_START_DATE, IMPORT_END_DATE)
      }, { transaction: t });

      const itemsInReceipt = randomInt(5, 10);
      for (let j = 0; j < itemsInReceipt; j++) {
        const randomProduct = getRandom(products);
        const soLuong = randomInt(500, 2000); // Nhập số lượng LỚN
        const giaNhap = Math.floor(randomProduct.giaBan * 0.8);
        const soLo = `L${randomInt(1000, 9999)}-${j}`;
        const hanSuDung = randomFutureDate();

        totalReceiptValue += (soLuong * giaNhap);

        await GoodsReceiptItem.create({
          goodsReceiptId: receipt.id, productId: randomProduct.id,
          soLuong, giaNhap, soLo, hanSuDung
        }, { transaction: t });

        await Batch.create({
          productId: randomProduct.id, branchId: currentBranch.id,
          soLo, hanSuDung, soLuongTon: soLuong, giaNhap
        }, { transaction: t });
      }
      await Supplier.increment({ congNo: totalReceiptValue }, { where: { id: randomSupplier.id }, transaction: t });
    }
    console.log('✅ Hoàn thành 50 Phiếu Nhập kho. Tồn kho đã được cập nhật.');

    // --- 4. TẠO 500 HÓA ĐƠN BÁN HÀNG (100 hóa đơn / 5 chi nhánh) ---
    console.log('Đang tạo 500 Hóa đơn Bán hàng (mô phỏng FEFO). Xin chờ...');
    
    // Tạo 1 map để lưu trữ khách hàng (tránh query DB lặp lại)
    const customerMap = new Map();
    for(const c of customers) { customerMap.set(c.id, c); }

    for (let i = 0; i < 500; i++) {
      const currentBranch = branches[i % 5];
      const branchStaff = allStaff.filter(s => s.branchId === currentBranch.id);
      const randomStaff = getRandom(branchStaff);
      const randomCustomer = Math.random() < 0.7 ? getRandom(customers) : null;
      
      let originalTotalAmount = 0;
      const invoiceItemsData = [];

      const itemsInInvoice = randomInt(1, 3);
      for (let j = 0; j < itemsInInvoice; j++) {
        
        const availableProductsInStock = await Product.findAll({
          include: [{
            model: Batch, where: { branchId: currentBranch.id, soLuongTon: { [Op.gt]: 0 }, hanSuDung: { [Op.gt]: new Date() } },
            attributes: [], required: true
          }],
          transaction: t
        });
        if (availableProductsInStock.length === 0) continue;

        const productSold = getRandom(availableProductsInStock);
        const soLuongBan = randomInt(1, 10); // Bán 1-10 ĐV

        const batchToSell = await Batch.findOne({
          where: { productId: productSold.id, branchId: currentBranch.id, soLuongTon: { [Op.gt]: 0 }, hanSuDung: { [Op.gt]: new Date() } },
          order: [['hanSuDung', 'ASC']], transaction: t, lock: true
        });
        if (!batchToSell) continue;

        const actualSold = Math.min(soLuongBan, batchToSell.soLuongTon);
        batchToSell.soLuongTon -= actualSold;
        await batchToSell.save({ transaction: t });
        
        originalTotalAmount += (actualSold * productSold.giaBan);
        invoiceItemsData.push({
          productId: productSold.id, batchId: batchToSell.id,
          soLuong: actualSold, donGia: productSold.giaBan
        });
      } 

      if (invoiceItemsData.length > 0) {
        
        const invoice = await Invoice.create({
          ngayBan: randomDate(SALES_START_DATE, SALES_END_DATE), // Ngày bán ngẫu nhiên trong 10 ngày
          tienGoc: originalTotalAmount,
          giamGiaDiem: 0,
          tongTien: originalTotalAmount,
          userId: randomStaff.id,
          branchId: currentBranch.id,
          customerId: randomCustomer ? randomCustomer.id : null
        }, { transaction: t });

        for (const itemData of invoiceItemsData) { itemData.invoiceId = invoice.id; }
        await InvoiceItem.bulkCreate(invoiceItemsData, { transaction: t });

        if (randomCustomer) {
          // Lấy khách hàng từ Map (nhanh hơn query)
          const customerInstance = customerMap.get(randomCustomer.id);
          // Tích điểm
          await customerInstance.addPurchase(originalTotalAmount, originalTotalAmount, t);
        }
      }
    }
    console.log('✅ Hoàn thành 500 Hóa đơn Bán hàng.');

    // --- 5. HOÀN TẤT ---
    await t.commit();
    console.log('--- TẠO DỮ LIỆU GIAO DỊCH HOÀN TẤT ---');

  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu giao dịch:', error);
    await t.rollback();
    console.log('Đã rollback (hủy bỏ) tất cả thay đổi.');
  } finally {
    await sequelize.close();
    console.log('Đã đóng kết nối database.');
  }
}

createSeedTransactions();