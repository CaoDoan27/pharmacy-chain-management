// models/index.js (Đã cập nhật)

const sequelize = require('../config/database');

// Import các model đã có
const User = require('./User');
const Branch = require('./Branch');

// Import 5 model kho vận mới
const Product = require('./Product');
const Supplier = require('./Supplier');
const Batch = require('./Batch');
const GoodsReceipt = require('./GoodsReceipt');
const GoodsReceiptItem = require('./GoodsReceiptItem');

//Import module khách hàng
const Customer = require('./Customer');


// --- 1. Mối quan hệ User & Branch (Đã có) ---
User.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(User, { foreignKey: 'branchId' });

// --- 2. Mối quan hệ Kho (Product, Batch, Branch) ---
// Một Product (Sản phẩm) có nhiều Batch (Lô hàng)
Product.hasMany(Batch, { foreignKey: 'productId' });
Batch.belongsTo(Product, { foreignKey: 'productId' });

// Một Branch (Chi nhánh) có nhiều Batch (Lô hàng)
// Quan trọng: Tồn kho được quản lý theo Chi nhánh
Branch.hasMany(Batch, { foreignKey: 'branchId' });
Batch.belongsTo(Branch, { foreignKey: 'branchId' });

// --- 3. Mối quan hệ Phiếu Nhập Kho (GoodsReceipt) ---
// Một GoodsReceipt (Phiếu nhập) thuộc về 1 User (Người tạo)
GoodsReceipt.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(GoodsReceipt, { foreignKey: 'userId' });

// Một GoodsReceipt thuộc về 1 Supplier (Nhà cung cấp)
GoodsReceipt.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(GoodsReceipt, { foreignKey: 'supplierId' });

// Một GoodsReceipt thuộc về 1 Branch (Chi nhánh nhập hàng)
GoodsReceipt.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(GoodsReceipt, { foreignKey: 'branchId' });

// --- 4. Mối quan hệ Chi Tiết Phiếu Nhập (GoodsReceiptItem) ---
// Một GoodsReceipt (Phiếu nhập) có nhiều GoodsReceiptItem (Dòng hàng)
GoodsReceipt.hasMany(GoodsReceiptItem, { foreignKey: 'goodsReceiptId' });
GoodsReceiptItem.belongsTo(GoodsReceipt, { foreignKey: 'goodsReceiptId' });

// Một GoodsReceiptItem (Dòng hàng) tương ứng với 1 Product (Sản phẩm)
GoodsReceiptItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(GoodsReceiptItem, { foreignKey: 'productId' });


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
};

module.exports = { sequelize, ...models };