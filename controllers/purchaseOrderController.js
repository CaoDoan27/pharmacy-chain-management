// controllers/purchaseOrderController.js
const { 
  Product, 
  Supplier, 
  PurchaseOrder, 
  PurchaseOrderItem, 
  Branch,
  User,
  sequelize 
} = require('../models');
const transporter = require('../config/mailer'); // Import mailer

// 1. Hiển thị Form Tạo Đơn Đặt Hàng (UC-06)
exports.getCreateOrder = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { trangThai: 'Đang hoạt động' },
      order: [['tenNhaCungCap', 'ASC']]
    });
    const products = await Product.findAll({
      where: { trangThai: 'Đang kinh doanh' },
      order: [['tenSanPham', 'ASC']]
    });

    res.render('purchase-order/form', {
      title: 'Tạo Đơn Đặt Hàng',
      suppliers: suppliers,
      products: products,
      error: null
    });
  } catch (err) {
    console.log(err);
  }
};

// controllers/purchaseOrderController.js

// ... (Hàm getCreateOrder và getOrderList không đổi) ...

// controllers/purchaseOrderController.js

// ... (Hàm getCreateOrder không đổi) ...

// 2. Xử lý Logic khi Gửi Đơn Đặt Hàng (UC-06) - (ĐÃ SỬA LỖI tongTienDuKien)
exports.postCreateOrder = async (req, res) => {
  const t = await sequelize.transaction(); 

  try {
    const { 
      supplierId, items, thoiGianMongMuon,
      hinhThucThanhToan, nguoiNhanHang, sdtNguoiNhan
    } = req.body;

    const { id: userId, branchId } = req.session.user;
    const userFullName = req.session.user.hoTen;
    const userEmail = process.env.EMAIL_USER;

    const userBranch = await Branch.findByPk(branchId, { transaction: t });
    if (!userBranch) {
      throw new Error('Không tìm thấy thông tin chi nhánh của người dùng.');
    }
    if (!items || items.length === 0) {
      throw new Error('Đơn đặt hàng phải có ít nhất một sản phẩm.');
    }

    // --- Bắt đầu Transaction ---

    const emailItemsDetails = [];
    const itemPromises = [];
    let totalEstimatedValue = 0; // BIẾN MỚI ĐỂ TÍNH TỔNG TIỀN

    // Bước 1: Lặp qua sản phẩm (Để tính tổng tiền TRƯỚC)
    for (const item of items) {
      const productId = parseInt(item.productId);
      const soLuongDat = parseInt(item.soLuongDat);

      // Lấy thông tin sản phẩm (bao gồm cả giaBan)
      const product = await Product.findByPk(productId, { 
        attributes: ['tenSanPham', 'hoatChat', 'quyCach', 'giaBan'] 
      });

      if (!product) {
        throw new Error(`Sản phẩm với ID ${productId} không tồn tại.`);
      }

      // --- LOGIC MỚI: TÍNH TỔNG TIỀN DỰ KIẾN ---
      // (Chúng ta dùng giá BÁN LẺ để "dự kiến", vì chưa biết giá nhập)
      totalEstimatedValue += (soLuongDat * product.giaBan); 
      // --- HẾT LOGIC MỚI ---

      emailItemsDetails.push({
        name: product.tenSanPham,
        hoatChat: product.hoatChat || 'N/A',
        quyCach: product.quyCach || 'N/A',
        quantity: soLuongDat
      });
    }

    // Bước 2: Tạo Đơn Đặt Hàng (ĐÃ SỬA)
    const order = await PurchaseOrder.create({
      userId: userId,
      supplierId: supplierId,
      branchId: branchId,
      trangThai: 'Đã gửi',
      tongTienDuKien: totalEstimatedValue // <-- LƯU TỔNG TIỀN DỰ KIẾN
    }, { transaction: t });

    // Bước 3: Tạo Chi tiết Đơn hàng
    for (const [index, item] of items.entries()) {
      itemPromises.push(
        PurchaseOrderItem.create({
          purchaseOrderId: order.id,
          productId: parseInt(item.productId),
          soLuongDat: parseInt(item.soLuongDat)
        }, { transaction: t })
      );
    }
    await Promise.all(itemPromises);

    // --- BƯỚC 4: GỬI EMAIL CHO NHÀ CUNG CẤP ---
    const supplier = await Supplier.findByPk(supplierId, { transaction: t });
    if (!supplier || !supplier.email) {
      throw new Error(`Nhà cung cấp "${supplier.tenNhaCungCap}" không có email.`);
    }

    const homNay = new Date().toLocaleDateString('vi-VN');
    const ngayMongMuon = new Date(thoiGianMongMuon).toLocaleDateString('vi-VN');
    const emailCC = process.env.EMAIL_CC || '';

    // (Code HTML Email không đổi)
    const emailHtml = `
      <p>Kính gửi: Phòng Kinh doanh – ${supplier.tenNhaCungCap}</p>
      <p>Nhà thuốc ${userBranch.tenChiNhanh} xin gửi đến Quý Công ty đơn đặt hàng thuốc theo thông tin chi tiết dưới đây:</p>
      <h3>1. Thông tin đơn hàng:</h3>
      <ul>
        <li><strong>Ngày đặt hàng:</strong> ${homNay}</li>
        <li><strong>Người phụ trách đơn hàng:</strong> ${userFullName}</li>
        <li><strong>Địa chỉ giao hàng:</strong> ${userBranch.diaChi}</li>
        <li><strong>Thời gian mong muốn nhận hàng:</strong> ${ngayMongMuon}</li>
      </ul>
      <h3>2. Danh mục sản phẩm đặt mua:</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead style="background-color: #f4f4f4;">
          <tr><th>STT</th><th>Tên thuốc</th><th>Hoạt chất / Hàm lượng</th><th>Quy cách</th><th>Số lượng</th></tr>
        </thead>
        <tbody>
          ${emailItemsDetails.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.name}</td>
              <td>${item.hoatChat}</td>
              <td>${item.quyCach}</td>
              <td>${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h3>3. Yêu cầu thanh toán và giao hàng:</h3>
      <ul>
        <li><strong>Hình thức thanh toán:</strong> ${hinhThucThanhToan}</li>
        <li><strong>Hình thức giao hàng:</strong> Giao tận nơi</li>
        <li><strong>Người nhận hàng:</strong> ${nguoiNhanHang} (SĐT: ${sdtNguoiNhan})</li>
      </ul>
      <p>Kính mong Quý Công ty xác nhận lại tình trạng hàng hóa, giá bán và thời gian giao hàng dự kiến.</p>
      <p>Xin chân thành cảm ơn sự hợp tác của Quý Công ty!</p>
      <br>
      <p>Trân trọng,<br>
      ${userFullName}<br>
      Nhà thuốc ${userBranch.tenChiNhanh}<br>
      ✉️ Email: ${userEmail}<br>
      🏠 Địa chỉ: ${userBranch.diaChi}</p>
    `;

    await transporter.sendMail({
      from: `"Nhà thuốc ${userBranch.tenChiNhanh}" <${process.env.EMAIL_USER}>`,
      to: supplier.email,
      cc: emailCC,
      subject: `📦 Đơn đặt hàng thuốc – ${userBranch.tenChiNhanh} – Ngày ${homNay}`,
      html: emailHtml
    });
    console.log("Đã gửi email đơn đặt hàng theo mẫu mới!");

    // Bước 5: Commit
    await t.commit();
    res.redirect('/purchase-order');

  } catch (err) {
    await t.rollback();
    console.log("Lỗi khi tạo đơn đặt hàng:", err);
    const suppliers = await Supplier.findAll({ where: { trangThai: 'Đang hoạt động' } });
    const products = await Product.findAll({ where: { trangThai: 'Đang kinh doanh' } });

    res.render('purchase-order/form', {
      title: 'Tạo Đơn Đặt Hàng',
      suppliers: suppliers,
      products: products,
      error: err.message
    });
  }
};


// 3. Hiển thị Lịch sử Đơn Đặt Hàng
exports.getOrderList = async (req, res) => {
  try {
    const branchId = req.session.user.branchId;

    const orders = await PurchaseOrder.findAll({
      where: { branchId: branchId },
      order: [['ngayDat', 'DESC']],
      include: [
        { model: User, attributes: ['hoTen'] },
        { model: Supplier, attributes: ['tenNhaCungCap'] }
      ]
    });

    res.render('purchase-order/list', {
      title: 'Lịch sử Đặt hàng',
      orders: orders
    });
  } catch (err) {
    console.log(err);
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const branchId = req.session.user.branchId;

    // Tìm đơn hàng, đảm bảo QLCN này sở hữu đơn hàng đó
    const order = await PurchaseOrder.findOne({
      where: {
        id: orderId,
        branchId: branchId 
      }
    });

    if (order) {
      // Cập nhật trạng thái
      order.trangThai = 'Đã hoàn thành';
      await order.save();
    }

    // Dù thành công hay không, vẫn quay về trang lịch sử
    res.redirect('/purchase-order');

  } catch (err) {
    console.log("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    res.redirect('/purchase-order');
  }
};