// models/Customer.js (Đã nâng cấp logic Tích/Tiêu điểm)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// --- CẤU HÌNH QUY ĐỔI ---
const POINT_TO_VND_RATE = 20; // 1 điểm = 20 VNĐ

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
    defaultValue: 0
  },
  hangThanhVien: {
    type: DataTypes.STRING,
    defaultValue: 'Đồng'
  },
  tongChiTieu: {
    type: DataTypes.BIGINT,
    defaultValue: 0 
  }
}, {
  // Thêm các hàm logic vào model
  instanceMethods: {
    
    /**
     * Lấy tỉ lệ tích điểm (1.000đ = ? điểm)
     */
    _getPointRatio: function() {
      switch (this.hangThanhVien) {
        case 'Đồng': return 0.005; // 5 điểm
        case 'Bạc': return 0.007; // 7 điểm
        case 'Vàng': return 0.010; // 10 điểm
        case 'Kim Cương': return 0.015; // 15 điểm
        default: return 0.005;
      }
    },

    /**
     * Cập nhật hạng dựa trên tổng chi tiêu
     */
    _updateRank: function() {
      const chiTieu = this.tongChiTieu;
      // Cập nhật hạng (logic cũ)
      if (chiTieu >= 8000000) { this.hangThanhVien = 'Kim Cương'; }
      else if (chiTieu >= 5000000) { this.hangThanhVien = 'Vàng'; }
      else if (chiTieu >= 2000000) { this.hangThanhVien = 'Bạc'; }
      else { this.hangThanhVien = 'Đồng'; }
    },

    /**
     * HÀM MỚI: Dùng để TIÊU ĐIỂM
     * @param {number} pointsToSpend - Số điểm muốn tiêu
     * @param {number} originalTotalAmount - Tổng tiền gốc của hóa đơn
     * @param {object} transaction - Transaction của Sequelize
     */
    spendPoints: async function(pointsToSpend, originalTotalAmount, transaction = null) {
      if (pointsToSpend <= 0) return 0; // Không tiêu gì
      
      if (pointsToSpend > this.diemTichLuy) {
        throw new Error(`Khách hàng không đủ điểm (chỉ có ${this.diemTichLuy} điểm).`);
      }

      const discountAmount = pointsToSpend * POINT_TO_VND_RATE;
      
      if (discountAmount > originalTotalAmount) {
        // Vượt quá giá trị hóa đơn.
        // Chỉ cho giảm tối đa bằng giá trị hóa đơn
        throw new Error(`Số điểm sử dụng (quy đổi ${discountAmount} VNĐ) không được vượt quá tổng tiền hóa đơn.`);
      }
      
      // Trừ điểm
      this.diemTichLuy -= pointsToSpend;
      await this.save({ transaction });
      
      console.log(`KH ${this.id} vừa tiêu ${pointsToSpend} điểm. Trừ ${discountAmount} VNĐ.`);
      return discountAmount; // Trả về số tiền được giảm
    },

    /**
     * HÀM ĐƯỢC SỬA LẠI: Dùng để TÍCH ĐIỂM
     * @param {number} amountToCalculatePoints - Số tiền THỰC TẾ TRẢ (đã giảm giá)
     * @param {number} originalTotalAmount - Tổng tiền GỐC (chưa giảm, để xét hạng)
     * @param {object} transaction - Transaction của Sequelize (nếu có)
     */
    addPurchase: async function(amountToCalculatePoints, originalTotalAmount, transaction = null) {
      // 1. Lấy tỉ lệ điểm dựa trên hạng HIỆN TẠI
      const ratio = this._getPointRatio();
      
      // 2. Tính điểm được cộng (dựa trên số tiền THỰC TẾ TRẢ)
      const pointsToAdd = Math.floor(amountToCalculatePoints * ratio);

      // 3. Cộng dồn điểm. CỘNG DỒN TỔNG CHI TIÊU (dựa trên tiền GỐC)
      this.diemTichLuy += pointsToAdd;
      this.tongChiTieu += originalTotalAmount; // Xét hạng dựa trên tổng chi tiêu GỐC

      // 4. Cập nhật lại hạng (nếu cần)
      this._updateRank();

      // 5. Lưu lại vào database
      await this.save({ transaction });
      
      console.log(`KH ${this.id} chi tiêu ${originalTotalAmount}. Cộng ${pointsToAdd} điểm (tính trên ${amountToCalculatePoints}).`);
      return this;
    }
  }
});

// Gán các hàm instanceMethods vào prototype của Customer
Object.assign(Customer.prototype, Customer.options.instanceMethods);

module.exports = Customer;