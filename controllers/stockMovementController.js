// controllers/stockMovementController.js
const { 
  Product, 
  Branch,
  Batch,
  StockMovement,
  StockMovementItem,
  User,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

// 1. Hiển thị Form Tạo Phiếu (UC-09)
exports.getMovementPage = async (req, res) => {
  try {
    // Lấy danh sách sản phẩm có tồn kho tại chi nhánh này
    const userBranchId = req.session.user.branchId;
    const productsInStock = await Product.findAll({
      where: { trangThai: 'Đang kinh doanh' },
      include: [{
        model: Batch,
        where: {
          branchId: userBranchId,
          soLuongTon: { [Op.gt]: 0 }
        },
        attributes: [],
        required: true // Chỉ lấy SP có hàng
      }],
      order: [['tenSanPham', 'ASC']]
    });

    // Lấy danh sách chi nhánh (để chuyển kho)
    const otherBranches = await Branch.findAll({
      where: {
        id: { [Op.ne]: userBranchId } // Loại trừ chi nhánh hiện tại
      },
      order: [['tenChiNhanh', 'ASC']]
    });

    res.render('stock-movement/form', {
      title: 'Tạo Phiếu Xuất kho',
      products: productsInStock,
      branches: otherBranches,
      error: null
    });
  } catch (err) {
    console.log(err);
  }
};

// 2. [API] Lấy danh sách Lô hàng của 1 sản phẩm (cho form động)
exports.getBatchesForProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userBranchId = req.session.user.branchId;

    const batches = await Batch.findAll({
      where: {
        productId: productId,
        branchId: userBranchId,
        soLuongTon: { [Op.gt]: 0 } // Chỉ lấy lô còn hàng
      },
      order: [['hanSuDung', 'ASC']] // Ưu tiên lô sắp hết hạn
    });
    res.json(batches); // Trả về JSON cho client
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 3. Xử lý Logic khi Tạo Phiếu (Hủy hoặc Chuyển)
exports.postCreateMovement = async (req, res) => {
  const t = await sequelize.transaction(); 

  try {
    // Lấy dữ liệu từ form
    const { 
      loaiPhieu, // "Xuất Hủy" hoặc "Chuyển kho"
      productId, 
      batchId,   // Lô hàng CỤ THỂ
      soLuong,   // Số lượng đã nhập (đã được gợi ý)
      lyDo,      // (Chỉ cho Xuất Hủy)
      chiNhanhNhanId // (Chỉ cho Chuyển kho)
    } = req.body;

    const { id: userId, branchId: chiNhanhGuiId } = req.session.user;
    const soLuongXuat = parseInt(soLuong);

    if (soLuongXuat <= 0) {
      throw new Error('Số lượng phải lớn hơn 0.');
    }

    // --- Bắt đầu Transaction ---

    // Bước 1: Tìm và Khóa Lô hàng GỬI (để trừ kho)
    const batchToDecrease = await Batch.findOne({
      where: {
        id: batchId,
        productId: productId,
        branchId: chiNhanhGuiId,
        soLuongTon: { [Op.gte]: soLuongXuat } // Đảm bảo đủ hàng
      },
      transaction: t,
      lock: true // Khóa dòng này lại
    });

    if (!batchToDecrease) {
      throw new Error('Lô hàng không đủ tồn kho hoặc không tồn tại.');
    }

    // Bước 2: Tạo Phiếu Dịch chuyển (StockMovement)
    const movement = await StockMovement.create({
      ngayThucHien: new Date(),
      loaiPhieu: loaiPhieu,
      lyDo: (loaiPhieu === 'Xuất Hủy') ? lyDo : null,
      chiNhanhNhanId: (loaiPhieu === 'Chuyển kho') ? chiNhanhNhanId : null,
      userId: userId,
      branchId: chiNhanhGuiId // Chi nhánh gửi
    }, { transaction: t });

    // Bước 3: Tạo Chi tiết Dịch chuyển (StockMovementItem)
    await StockMovementItem.create({
      stockMovementId: movement.id,
      productId: productId,
      batchId: batchId,
      soLuong: soLuongXuat
    }, { transaction: t });

    // Bước 4: Trừ kho tại Chi nhánh GỬI
    batchToDecrease.soLuongTon -= soLuongXuat;
    await batchToDecrease.save({ transaction: t });

    // Bước 5: Xử lý logic nghiệp vụ riêng
    if (loaiPhieu === 'Chuyển kho') {
      // --- Logic Chuyển kho ---
      // Tìm hoặc Tạo lô hàng tại Chi nhánh NHẬN
      const [batchToIncrease, created] = await Batch.findOrCreate({
        where: {
          productId: productId,
          branchId: chiNhanhNhanId,
          soLo: batchToDecrease.soLo, // Giữ nguyên Lô, HSD, Giá nhập
          hanSuDung: batchToDecrease.hanSuDung
        },
        defaults: {
          soLuongTon: soLuongXuat,
          giaNhap: batchToDecrease.giaNhap // Giữ nguyên giá nhập gốc
        },
        transaction: t
      });

      if (!created) {
        // Nếu lô đã tồn tại ở chi nhánh nhận, cộng dồn
        batchToIncrease.soLuongTon += soLuongXuat;
        await batchToIncrease.save({ transaction: t });
      }
    } 
    // Nếu là 'Xuất Hủy', chúng ta không cần làm gì thêm (chỉ trừ kho)

    // Bước 6: Commit
    await t.commit();
    res.redirect('/stock-movement'); // Về trang Lịch sử

  } catch (err) {
    // Bước 7: Rollback
    await t.rollback();
    console.log("Lỗi khi tạo phiếu xuất:", err);

    // Tải lại dữ liệu cho form
    const userBranchId = req.session.user.branchId;
    const productsInStock = await Product.findAll({
      where: { trangThai: 'Đang kinh doanh' },
      include: [{ model: Batch, where: { branchId: userBranchId, soLuongTon: { [Op.gt]: 0 } }, attributes: [], required: true }],
      order: [['tenSanPham', 'ASC']]
    });
    const otherBranches = await Branch.findAll({
      where: { id: { [Op.ne]: userBranchId } },
      order: [['tenChiNhanh', 'ASC']]
    });

    res.render('stock-movement/form', {
      title: 'Tạo Phiếu Xuất kho',
      products: productsInStock,
      branches: otherBranches,
      error: err.message
    });
  }
};

// 4. Hiển thị Lịch sử Xuất kho
exports.getMovementList = async (req, res) => {
  try {
    const branchId = req.session.user.branchId;

    const movements = await StockMovement.findAll({
      where: { branchId: branchId }, // Chỉ lấy phiếu của chi nhánh này
      order: [['ngayThucHien', 'DESC']],
      include: [
        { model: User, attributes: ['hoTen'] },
        { 
          model: Branch, 
          as: 'ChiNhanhNhan', // Lấy tên Chi nhánh nhận (nếu có)
          attributes: ['tenChiNhanh'] 
        },
        {
          model: StockMovementItem,
          attributes: ['soLuong'],
          include: [
            { model: Product, attributes: ['tenSanPham'] },
            { model: Batch, attributes: ['soLo'] }
          ]
        }
      ]
    });

    res.render('stock-movement/list', {
      title: 'Lịch sử Xuất kho',
      movements: movements
    });

  } catch (err) {
    console.log("Lỗi khi lấy lịch sử xuất kho:", err);
  }
};