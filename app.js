require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models'); // Import từ models/index.js
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const { isAuth } = require('./middleware/authMiddleware');
const supplierRoutes = require('./routes/supplierRoutes');
const goodsReceiptRoutes = require('./routes/goodsReceiptRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const posRoutes = require('./routes/posRoutes');
const reportRoutes = require('./routes/reportRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cài đặt Template Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Cài đặt thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// 3. Middleware để xử lý data từ form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'my-super-secret-key-12345', // Thay bằng một chuỗi bí mật bất kỳ
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // Phiên hết hạn sau 1 giờ
}));

// Middleware tuỳ chỉnh để truyền thông tin user vào mọi view (template)
app.use((req, res, next) => {
  res.locals.user = req.session.user; // Biến 'user' sẽ có sẵn trong mọi file .ejs
  next();
});


// 4. Routes
app.use(authRoutes); // Sử dụng các route xác thực
app.use('/products', productRoutes); // Sử dụng các route sản phẩm
app.use('/suppliers', supplierRoutes);
app.use('/goods-receipt', goodsReceiptRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/customers', customerRoutes);
app.use('/pos', posRoutes);
app.use('/reports', reportRoutes);
app.use('/purchase-order', purchaseOrderRoutes);
app.use('/stock-movement', stockMovementRoutes);
app.use('/promotions', promotionRoutes);
app.use('/users', userRoutes);

app.get('/', isAuth, (req, res) => {
  res.render('index', { title: 'Trang Chủ' });
});

// 5. Khởi động server
// --- ĐÃ SỬA LỖI Ở ĐÂY ---
// Xóa { alter: true } để tránh lỗi ER_TOO_MANY_KEYS
sequelize.sync().then(() => { 
  console.log('✅ Đã kết nối Database & đồng bộ hóa models thành công.');
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Lỗi kết nối Database hoặc đồng bộ hóa:', err);
});