// models/index.js (Đã cập nhật)

const sequelize = require('../config/database');

// Import các model đã có
const User = require('./User');
const Branch = require('./Branch');
const Product = require('./Product');
const Supplier = require('./Supplier');
const Batch = require('./Batch');
const GoodsReceipt = require('./GoodsReceipt');
const GoodsReceiptItem = require('./GoodsReceiptItem');
const Customer = require('./Customer');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const StockMovement = require('./StockMovement'); 
const StockMovementItem = require('./StockMovementItem');
const Promotion = require('./Promotion');

// --- 1. Mối quan hệ User & Branch (Đã có) ---
User.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(User, { foreignKey: 'branchId' });

// --- 2. Mối quan hệ Kho (Product, Batch, Branch) (Đã có) ---
Product.hasMany(Batch, { foreignKey: 'productId' });
Batch.belongsTo(Product, { foreignKey: 'productId' });
Branch.hasMany(Batch, { foreignKey: 'branchId' });
Batch.belongsTo(Branch, { foreignKey: 'branchId' });

// --- 3. Mối quan hệ Phiếu Nhập Kho (GoodsReceipt) (Đã có) ---
GoodsReceipt.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(GoodsReceipt, { foreignKey: 'userId' });
GoodsReceipt.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(GoodsReceipt, { foreignKey: 'supplierId' });
GoodsReceipt.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(GoodsReceipt, { foreignKey: 'branchId' });

// --- 4. Mối quan hệ Chi Tiết Phiếu Nhập (GoodsReceiptItem) (Đã có) ---
GoodsReceipt.hasMany(GoodsReceiptItem, { foreignKey: 'goodsReceiptId' });
GoodsReceiptItem.belongsTo(GoodsReceipt, { foreignKey: 'goodsReceiptId' });
GoodsReceiptItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(GoodsReceiptItem, { foreignKey: 'productId' });

// --- 5. Mối quan hệ Hóa đơn Bán hàng (Invoice) (Đã có) ---
Invoice.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(Invoice, { foreignKey: 'branchId' });
Invoice.belongsTo(Customer, { foreignKey: 'customerId', allowNull: true });
Customer.hasMany(Invoice, { foreignKey: 'customerId' });

// --- 6. Mối quan hệ Chi tiết Hóa đơn (InvoiceItem) (Đã có) ---
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(InvoiceItem, { foreignKey: 'productId' });
InvoiceItem.belongsTo(Batch, { foreignKey: 'batchId' });
Batch.hasMany(InvoiceItem, { foreignKey: 'batchId' });

// --- 7. MỐI QUAN HỆ ĐƠN ĐẶT HÀNG (MỚI) ---
// Một PurchaseOrder (ĐĐH) thuộc về 1 User (Người đặt)
PurchaseOrder.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PurchaseOrder, { foreignKey: 'userId' });

// Một PurchaseOrder thuộc về 1 Supplier (Nhà cung cấp)
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId' });

// Một PurchaseOrder thuộc về 1 Branch (Chi nhánh đặt hàng)
PurchaseOrder.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(PurchaseOrder, { foreignKey: 'branchId' });

// --- 8. MỐI QUAN HỆ CHI TIẾT ĐƠN ĐẶT HÀNG (MỚI) ---
// Một PurchaseOrder (ĐĐH) có nhiều PurchaseOrderItem (Dòng hàng)
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });

// Một PurchaseOrderItem (Dòng hàng) tương ứng với 1 Product (Sản phẩm)
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(PurchaseOrderItem, { foreignKey: 'productId' });

// --- 9. MỐI QUAN HỆ PHIẾU DỊCH CHUYỂN KHO (MỚI) ---
// Một StockMovement (Phiếu xuất) thuộc về 1 User (Người tạo)
StockMovement.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(StockMovement, { foreignKey: 'userId' });

// Một StockMovement thuộc về 1 Branch (Chi nhánh Gửi)
StockMovement.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(StockMovement, { foreignKey: 'branchId' });

// (Mới) Một StockMovement có thể liên kết đến 1 Chi nhánh Nhận
// Chúng ta dùng alias (bí danh) để phân biệt với 'branchId' (Chi nhánh Gửi)
StockMovement.belongsTo(Branch, { as: 'ChiNhanhNhan', foreignKey: 'chiNhanhNhanId' });

// --- 10. MỐI QUAN HỆ CHI TIẾT DỊCH CHUYỂN (MỚI) ---
// Một StockMovement (Phiếu xuất) có nhiều StockMovementItem (Dòng hàng)
StockMovement.hasMany(StockMovementItem, { foreignKey: 'stockMovementId' });
StockMovementItem.belongsTo(StockMovement, { foreignKey: 'stockMovementId' });

// Một StockMovementItem tương ứng với 1 Product (Sản phẩm)
StockMovementItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(StockMovementItem, { foreignKey: 'productId' });

// Một StockMovementItem được xuất từ 1 Batch (Lô hàng)
StockMovementItem.belongsTo(Batch, { foreignKey: 'batchId' });
Batch.hasMany(StockMovementItem, { foreignKey: 'batchId' });

// --- Export tất cả ---
const models = {
  User,
  Branch,
  Product,
  Supplier,
  Batch,
  GoodsReceipt,
  GoodsReceiptItem,
  Customer,
  Invoice,
  InvoiceItem,
  PurchaseOrder,        
  PurchaseOrderItem,
  StockMovement,
  StockMovementItem, 
  Promotion,
};

module.exports = { sequelize, ...models };