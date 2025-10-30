require('dotenv').config();
const express = require('express');
const path = require('path');
const sequelize = require('./config/database');

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

// 4. Route "Hello World"
app.get('/', (req, res) => {
  // res.render sẽ tìm file 'index.ejs' trong thư mục 'views'
  res.render('index', { title: 'Trang chủ' });
});

// 5. Khởi động server
sequelize.sync().then(() => {
  console.log('✅ Đã kết nối Database thành công.');
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Lỗi kết nối Database:', err);
});