// seed.js
const { sequelize, Branch, User } = require('./models');

async function createAdmin() {
  console.log('Bắt đầu tạo dữ liệu mẫu...');

  try {
    // 1. Đồng bộ database (đảm bảo các bảng đã được tạo)
    await sequelize.sync({ alter: true });

    // 2. Tạo chi nhánh "Trụ sở chính"
    // findOrCreate: Tìm, nếu không thấy thì mới tạo
    const [branch, created] = await Branch.findOrCreate({
      where: { tenChiNhanh: 'Trụ sở chính' },
      defaults: {
        diaChi: 'Hà Nội'
      }
    });

    if (created) {
      console.log('Đã tạo chi nhánh Trụ sở chính.');
    } else {
      console.log('Chi nhánh Trụ sở chính đã tồn tại.');
    }

    // 3. Tạo User "Quản lý tổng"
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { tenDangNhap: 'admin' },
      defaults: {
        hoTen: 'Quản lý Tổng',
        matKhau: 'admin123', // Mật khẩu sẽ tự động được mã hóa bởi hook
        vaiTro: 'Quản lý tổng',
        branchId: branch.id // Gán user này vào chi nhánh vừa tạo
      }
    });

    if (adminCreated) {
      console.log('Đã tạo tài khoản admin (admin/admin123) thành công!');
    } else {
      console.log('Tài khoản admin đã tồn tại.');
    }

  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    // Đóng kết nối database
    await sequelize.close();
    console.log('Đã đóng kết nối database.');
  }
}

createAdmin();