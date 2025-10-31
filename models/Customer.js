// models/Customer.js (Đã nâng cấp)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  hoTen: {
    type: DataTypes.STRING,
    allowNull: false
  },
  soDienThoai: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  diemTichLuy: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // Yêu cầu 1: Mặc định 0 điểm
  },
  hangThanhVien: {
    type: DataTypes.STRING,
    defaultValue: 'Đồng' // Yêu cầu 1: Mặc định hạng Đồng
  },
  // TRƯỜNG MỚI: Dùng để xét hạng
  tongChiTieu: {
    type: DataTypes.BIGINT, // Dùng BIGINT để chứa số tiền lớn
    defaultValue: 0 
  }
}, {
  // Thêm các hàm logic vào model
  instanceMethods: {
    
    /**
     * Lấy tỉ lệ tích điểm dựa trên hạng HIỆN TẠI của khách
     * (Ví dụ: 1.000 VNĐ = 5 điểm => tỉ lệ là 0.005)
     */
    _getPointRatio: function() {
      switch (this.hangThanhVien) {
        case 'Đồng':
          return 0.005; // 1.000đ = 5 điểm
        case 'Bạc':
          return 0.007; // 1.000đ = 7 điểm
        case 'Vàng':
          return 0.010; // 1.000đ = 10 điểm
        case 'Kim Cương':
          return 0.015; // 1.000đ = 15 điểm
        default:
          return 0.005;
      }
    },

    /**
     * Cập nhật hạng dựa trên tổng chi tiêu
     */
    _updateRank: function() {
      const chiTieu = this.tongChiTieu;

      if (chiTieu >= 8000000) {
        this.hangThanhVien = 'Kim Cương';
      } else if (chiTieu >= 5000000) {
        this.hangThanhVien = 'Vàng';
      } else if (chiTieu >= 2000000) {
        this.hangThanhVien = 'Bạc';
      } else {
        this.hangThanhVien = 'Đồng';
      }
      console.log(`Đã cập nhật hạng cho KH ${this.id}: ${this.hangThanhVien}`);
    },

    /**
     * HÀM CHÍNH: Sẽ được gọi khi khách hàng thanh toán hóa đơn
     * @param {number} purchaseAmount - Tổng số tiền của hóa đơn
     * @param {object} transaction - Transaction của Sequelize (nếu có)
     */
    addPurchase: async function(purchaseAmount, transaction = null) {
      // 1. Lấy tỉ lệ điểm dựa trên hạng HIỆN TẠI
      const ratio = this._getPointRatio();
      
      // 2. Tính điểm được cộng (làm tròn xuống)
      const pointsToAdd = Math.floor(purchaseAmount * ratio);

      // 3. Cộng dồn điểm và tổng chi tiêu
      this.diemTichLuy += pointsToAdd;
      this.tongChiTieu += purchaseAmount;

      // 4. Cập nhật lại hạng (nếu cần)
      this._updateRank();

      // 5. Lưu lại vào database
      await this.save({ transaction });
      
      console.log(`KH ${this.id} vừa chi tiêu ${purchaseAmount}. Cộng ${pointsToAdd} điểm.`);
      return this;
    }
  }
});

// Gán các hàm instanceMethods vào prototype của Customer
// (Đây là cách làm chuẩn của Sequelize v5/v6)
Object.assign(Customer.prototype, Customer.options.instanceMethods);

module.exports = Customer;