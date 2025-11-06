// controllers/goodsReceiptController.js
const { 
  Product, 
  Supplier, 
  Batch, 
  GoodsReceipt, 
  GoodsReceiptItem,
  sequelize, // Import sequelize để dùng transaction
  User
} = require('../models');

// 1. Hiển thị Form Tạo Phiếu Nhập (UC-03)
exports.getCreateReceipt = async (req, res) => {
  try {
    // Lấy danh sách Nhà cung cấp (đang hoạt động) để chọn
    const suppliers = await Supplier.findAll({
      where: { trangThai: 'Đang hoạt động' },
      order: [['tenNhaCungCap', 'ASC']]
    });

    // Lấy danh sách Sản phẩm (đang kinh doanh) để chọn
    const products = await Product.findAll({
      where: { trangThai: 'Đang kinh doanh' },
      order: [['tenSanPham', 'ASC']]
    });

    res.render('goods-receipt/form', {
      title: 'Tạo Phiếu Nhập Kho',
      suppliers: suppliers,
      products: products,
      error: null
    });

  } catch (err) {
    console.log(err);
  }
};

// 2. Xử lý Logic khi Lưu Phiếu Nhập (UC-03) - (ĐÃ CẬP NHẬT CÔNG NỢ)
exports.postCreateReceipt = async (req, res) => {
  const t = await sequelize.transaction(); 

  try {
    const { supplierId, items } = req.body;
    const { id: userId, branchId } = req.session.user;

    if (!items || items.length === 0) {
      throw new Error('Phiếu nhập phải có ít nhất một sản phẩm.');
    }

    // --- Bắt đầu Transaction ---
    let totalReceiptValue = 0; // Biến mới để tính tổng giá trị phiếu

    // Bước 1: Tạo Phiếu Nhập Kho
    const receipt = await GoodsReceipt.create({
      userId: userId,
      supplierId: supplierId,
      branchId: branchId,
      ngayNhap: new Date()
    }, { transaction: t });

    // Bước 2: Lặp qua từng sản phẩm
    for (const item of items) {
      const productId = parseInt(item.productId);
      const soLuong = parseInt(item.soLuong);
      const giaNhap = parseFloat(item.giaNhap);
      const soLo = item.soLo;
      const hanSuDung = item.hanSuDung;

      // --- LOGIC MỚI: Cộng dồn tổng giá trị phiếu ---
      totalReceiptValue += (soLuong * giaNhap);

      // Bước 2a: Tạo Chi Tiết Phiếu Nhập (Lịch sử)
      await GoodsReceiptItem.create({
        goodsReceiptId: receipt.id,
        productId: productId,
        soLuong: soLuong,
        giaNhap: giaNhap,
        soLo: soLo,
        hanSuDung: hanSuDung
      }, { transaction: t });

      // Bước 2b: Cập nhật Tồn Kho (Batches)
      const [batch, created] = await Batch.findOrCreate({
        where: {
          productId: productId,
          branchId: branchId,
          soLo: soLo,
          hanSuDung: hanSuDung
        },
        defaults: {
          soLuongTon: soLuong,
          giaNhap: giaNhap
        },
        transaction: t
      });

      if (!created) {
        batch.soLuongTon += soLuong;
        batch.giaNhap = giaNhap; 
        await batch.save({ transaction: t });
      }
    }

    // --- BƯỚC 3 (MỚI): CẬP NHẬT CÔNG NỢ CHO NHÀ CUNG CẤP ---
    if (totalReceiptValue > 0) {
      // Dùng 'increment' để cộng dồn một cách an toàn
      await Supplier.increment(
        { congNo: totalReceiptValue }, // Cộng giá trị này
        { where: { id: supplierId }, transaction: t } // Cho NCC này
      );
    }

    // Bước 4: Commit transaction
    await t.commit();

    // Chuyển hướng về trang lịch sử để xem ngay
    res.redirect('/goods-receipt'); 

  } catch (err) {
    // Bước 5: Rollback nếu có lỗi
    await t.rollback();

    console.log("Lỗi khi tạo phiếu nhập:", err);
    const suppliers = await Supplier.findAll({ where: { trangThai: 'Đang hoạt động' } });
    const products = await Product.findAll({ where: { trangThai: 'Đang kinh doanh' } });

    res.render('goods-receipt/form', {
      title: 'Tạo Phiếu Nhập Kho',
      suppliers: suppliers,
      products: products,
      error: err.message
    });
  }
};
// 3. Hiển thị Danh sách Phiếu nhập (Trang Lịch sử)
exports.getReceiptList = async (req, res) => {
  try {
    const branchId = req.session.user.branchId;

    // Lấy tất cả phiếu nhập của chi nhánh này
    // Sắp xếp theo ngày nhập mới nhất
    // Dùng 'include' để lấy thông tin Người tạo (User) và Nhà cung cấp (Supplier)
    const receipts = await GoodsReceipt.findAll({
      where: { branchId: branchId },
      order: [['ngayNhap', 'DESC']],
      include: [
        { model: User, attributes: ['hoTen'] }, // Lấy tên người tạo
        { model: Supplier, attributes: ['tenNhaCungCap'] } // Lấy tên NCC
      ]
    });

    res.render('goods-receipt/list', {
      title: 'Lịch sử Nhập kho',
      receipts: receipts
    });

  } catch (err) {
    console.log(err);
  }
};

// 4. Hiển thị Chi tiết một Phiếu nhập
exports.getReceiptDetails = async (req, res) => {
  try {
    const receiptId = req.params.id;
    const branchId = req.session.user.branchId;

    // Tìm 1 phiếu nhập theo ID VÀ phải đúng chi nhánh
    // Dùng 'include' lồng nhau để lấy thông tin chi tiết
    const receipt = await GoodsReceipt.findOne({
      where: { 
        id: receiptId,
        branchId: branchId // Đảm bảo QLCN không xem được phiếu của chi nhánh khác
      },
      include: [
        { model: User, attributes: ['hoTen'] },
        { model: Supplier },
        { 
          model: GoodsReceiptItem, // Lấy các dòng sản phẩm
          include: [
            { model: Product } // Lấy thông tin sản phẩm (tên, đv cơ sở)
          ]
        }
      ]
    });

    if (!receipt) {
      // Nếu không tìm thấy phiếu (hoặc sai chi nhánh), về trang lịch sử
      return res.redirect('/goods-receipt');
    }

    res.render('goods-receipt/details', {
      title: `Chi tiết Phiếu nhập #${receipt.id}`,
      receipt: receipt
    });

  } catch (err) {
    console.log(err);
  }
};