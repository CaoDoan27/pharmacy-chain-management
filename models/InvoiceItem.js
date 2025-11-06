// models/InvoiceItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  donGia: {
    type: DataTypes.DOUBLE, // Giá bán của 1 ĐV cơ sở tại thời điểm bán
    allowNull: false
  }
  // 'invoiceId' (Thuộc hóa đơn nào) sẽ được thêm qua Mối quan hệ
  // 'productId' (Sản phẩm gì) sẽ được thêm qua Mối quan hệ
  // 'batchId' (Bán từ lô nào) sẽ được thêm qua Mối quan hệ (Rất quan trọng)
});

module.exports = InvoiceItem;