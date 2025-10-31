// controllers/inventoryController.js
const { Batch, Product, Branch } = require('../models');
const { Op } = require('sequelize'); // Import Operator của Sequelize

exports.getLookupPage = async (req, res) => {
  const searchTerm = req.query.q || ''; // Lấy từ khóa tìm kiếm từ URL (ví dụ: /lookup?q=panadol)
  const userBranchId = req.session.user.branchId; // Lấy chi nhánh của người dùng
  let results = null; // Biến chứa kết quả

  // Chỉ thực hiện tìm kiếm nếu có searchTerm
  if (searchTerm) {
    try {
      // 1. Tìm tất cả các lô hàng (Batches)
      const batches = await Batch.findAll({
        where: { soLuongTon: { [Op.gt]: 0 } }, // Chỉ lấy lô còn hàng
        include: [
          {
            model: Product,
            where: {
              // Tìm sản phẩm có tên chứa từ khóa
              tenSanPham: { [Op.like]: `%${searchTerm}%` }
            },
            required: true // Bắt buộc phải khớp sản phẩm
          },
          {
            model: Branch,
            attributes: ['tenChiNhanh'] // Chỉ lấy tên chi nhánh
          }
        ],
        order: [['hanSuDung', 'ASC']] // Sắp xếp theo HSD (FEFO)
      });

      // 2. Xử lý và nhóm kết quả
      const grouped = {
        myBranch: { branchName: '', totalStock: 0, batches: [] },
        otherBranches: []
      };
      
      const branchMap = new Map(); // Dùng để nhóm các chi nhánh khác

      for (const batch of batches) {
        const stock = batch.soLuongTon;
        const batchInfo = {
          soLo: batch.soLo,
          hanSuDung: batch.hanSuDung,
          soLuongTon: stock,
          productName: batch.Product.tenSanPham // Thêm tên SP để dễ hiển thị
        };

        if (batch.branchId === userBranchId) {
          // A. Đây là chi nhánh của người dùng
          if (!grouped.myBranch.branchName) {
            grouped.myBranch.branchName = batch.Branch.tenChiNhanh;
          }
          grouped.myBranch.totalStock += stock;
          grouped.myBranch.batches.push(batchInfo);
        } else {
          // B. Đây là chi nhánh khác
          if (!branchMap.has(batch.branchId)) {
            // Nếu lần đầu thấy chi nhánh này
            branchMap.set(batch.branchId, {
              branchName: batch.Branch.tenChiNhanh,
              totalStock: 0,
              batches: []
            });
          }
          // Thêm lô hàng vào chi nhánh tương ứng
          const branchData = branchMap.get(batch.branchId);
          branchData.totalStock += stock;
          branchData.batches.push(batchInfo);
        }
      }
      
      // Chuyển Map thành Array
      grouped.otherBranches = Array.from(branchMap.values());
      results = grouped;

    } catch (err) {
      console.log("Lỗi khi tra cứu tồn kho:", err);
    }
  }
  
  // 3. Render view
  res.render('inventory/lookup', {
    title: 'Tra cứu Tồn kho',
    searchTerm: searchTerm, // Trả lại từ khóa để hiển thị trong ô tìm kiếm
    results: results        // Trả lại kết quả đã nhóm
  });
};