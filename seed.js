// seed.js (Đã cập nhật với 8 Khách hàng)
const { sequelize, Branch, User, Supplier, Product, Customer } = require('./models');

// --- DỮ LIỆU NHÀ CUNG CẤP ---
const suppliers = [
  { tenNhaCungCap: 'Công ty Cổ phần Dược Hậu Giang (DHG Pharma)', soDienThoai: '02923891433', email: 'cskh@dhgpharma.com.vn' },
  { tenNhaCungCap: 'Công ty Cổ phần Traphaco', soDienThoai: '02435655885', email: 'info@traphaco.com.vn' },
  { tenNhaCungCap: 'Công ty Cổ phần Pymepharco', soDienThoai: '02573829165', email: 'info@pymepharco.com' },
  { tenNhaCungCap: 'Công ty Cổ phần Imexpharm', soDienThoai: '02773822 Imexpharm', email: 'info@imexpharm.com' },
  { tenNhaCungCap: 'Công ty Cổ phần Dược phẩm OPC', soDienThoai: '02838753919', email: 'info@opcpharma.com' },
  { tenNhaCungCap: 'Công ty Cổ phần Domesco', soDienThoai: '02773852278', email: 'info@domesco.com' },
  { tenNhaCungCap: 'Công ty TNHH Dược phẩm Hisamitsu Việt Nam', soDienThoai: '02513991080', email: 'info@hisamitsu.vn' },
  { tenNhaCungCap: 'Công ty TNHH Dược phẩm GlaxoSmithKline (GSK) Việt Nam', soDienThoai: '02838232981', email: 'vnc.contact@gsk.com' },
  { tenNhaCungCap: 'Công ty TNHH Pfizer Việt Nam', soDienThoai: '02836220500', email: 'info@pfizer.vn' },
  { tenNhaCungCap: 'Công ty TNHH AstraZeneca Việt Nam', soDienThoai: '02838230100', email: 'info@astrazeneca.vn' }
];

// --- DỮ LIỆU SẢN PHẨM (THUỐC) ---
const products = [
  // 1. Giảm đau - Hạ sốt
  { tenSanPham: 'Panadol Extra', hoatChat: 'Paracetamol 500mg, Caffeine 65mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 1500 },
  { tenSanPham: 'Hapacol 650', hoatChat: 'Paracetamol 650mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 1200 },
  { tenSanPham: 'Efferagan 500mg', hoatChat: 'Paracetamol 500mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên sủi', giaBan: 3000 },
  { tenSanPham: 'Decolgen Forte', hoatChat: 'Paracetamol 500mg, Phenylephrine 10mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 1300 },
  { tenSanPham: 'Advil Ibuprofen 200mg', hoatChat: 'Ibuprofen 200mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 2500 },
  { tenSanPham: 'Alaxan', hoatChat: 'Paracetamol 325mg, Ibuprofen 200mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 2000 },
  { tenSanPham: 'Mobic 7.5mg', hoatChat: 'Meloxicam 7.5mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 4000 },
  { tenSanPham: 'Celebrex 200mg', hoatChat: 'Celecoxib 200mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 7000 },
  { tenSanPham: 'Tiffy', hoatChat: 'Paracetamol 500mg, Chlorpheniramine 2mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Sarsaparim', hoatChat: 'Paracetamol 500mg', danhMuc: 'Giảm đau - Hạ sốt', donViCoSo: 'Viên', giaBan: 800 },

  // ... (90 sản phẩm khác)
  { tenSanPham: 'Augmentin 625mg', hoatChat: 'Amoxicillin 500mg, Clavulanic Acid 125mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 15000 },
  { tenSanPham: 'Zinnat 500mg', hoatChat: 'Cefuroxime 500mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 20000 },
  { tenSanPham: 'Klacid 500mg', hoatChat: 'Clarithromycin 500mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 25000 },
  { tenSanPham: 'Amoxicillin 500mg (Domesco)', hoatChat: 'Amoxicillin 500mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 700 },
  { tenSanPham: 'Ciprofloxacin 500mg', hoatChat: 'Ciprofloxacin 500mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Azithromycin 500mg', hoatChat: 'Azithromycin 500mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 12000 },
  { tenSanPham: 'Doxycyclin 100mg', hoatChat: 'Doxycycline 100mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 800 },
  { tenSanPham: 'Metronidazol 250mg', hoatChat: 'Metronidazole 250mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 500 },
  { tenSanPham: 'Rovamycine 3 M.I.U', hoatChat: 'Spiramycin 3 M.I.U', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 9000 },
  { tenSanPham: 'Fugacar', hoatChat: 'Mebendazole 500mg', danhMuc: 'Kháng sinh', donViCoSo: 'Viên', giaBan: 18000 },

  // 3. Tiêu hóa
  { tenSanPham: 'Omeprazol 20mg (Domesco)', hoatChat: 'Omeprazole 20mg', danhMuc: 'Tiêu hóa', donViCoSo: 'Viên', giaBan: 1500 },
  { tenSanPham: 'Nexium Mups 40mg', hoatChat: 'Esomeprazole 40mg', danhMuc: 'Tiêu hóa', donViCoSo: 'Viên', giaBan: 20000 },
  { tenSanPham: 'Gaviscon', hoatChat: 'Natri Alginat, Natri Bicarbonat', danhMuc: 'Tiêu hóa', donViCoSo: 'Gói', giaBan: 10000 },
  { tenSanPham: 'Smecta', hoatChat: 'Diosmectite 3g', danhMuc: 'Tiêu hóa', donViCoSo: 'Gói', giaBan: 4000 },
  { tenSanPham: 'Oresol 245', hoatChat: 'Glucose khan, NaCl, KCl', danhMuc: 'Tiêu hóa', donViCoSo: 'Gói', giaBan: 3000 },
  { tenSanPham: 'Enterogermina', hoatChat: 'Bacillus clausii 2 tỷ CFU', danhMuc: 'Tiêu hóa', donViCoSo: 'Ống', giaBan: 7000 },
  { tenSanPham: 'Motilium-M', hoatChat: 'Domperidone 10mg', danhMuc: 'Tiêu hóa', donViCoSo: 'Viên', giaBan: 2500 },
  { tenSanPham: 'Maalox', hoatChat: 'Nhôm hydroxyd, Magnesi hydroxyd', danhMuc: 'Tiêu hóa', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Buscopan', hoatChat: 'Hyoscine butylbromide 10mg', danhMuc: 'Tiêu hóa', donViCoSo: 'Viên', giaBan: 3000 },
  { tenSanPham: 'Loperamid 2mg', hoatChat: 'Loperamide 2mg', danhMuc: 'Tiêu hóa', donViCoSo: 'Viên', giaBan: 500 },

  // 4. Tim mạch
  { tenSanPham: 'Aspirin 81mg', hoatChat: 'Aspirin 81mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Concor 5mg', hoatChat: 'Bisoprolol 5mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 3500 },
  { tenSanPham: 'Amlor 5mg', hoatChat: 'Amlodipine 5mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 2000 },
  { tenSanPham: 'Coversyl 5mg', hoatChat: 'Perindopril 5mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 4000 },
  { tenSanPham: 'Crestor 10mg', hoatChat: 'Rosuvastatin 10mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 15000 },
  { tenSanPham: 'Plavix 75mg', hoatChat: 'Clopidogrel 75mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 18000 },
  { tenSanPham: 'Losartan 50mg (Hasan)', hoatChat: 'Losartan 50mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 1200 },
  { tenSanPham: 'Nifedipin 20mg', hoatChat: 'Nifedipine 20mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 800 },
  { tenSanPham: 'Betaloc ZOK 50mg', hoatChat: 'Metoprolol 50mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 4500 },
  { tenSanPham: 'Atorvastatin 20mg', hoatChat: 'Atorvastatin 20mg', danhMuc: 'Tim mạch', donViCoSo: 'Viên', giaBan: 2500 },

  // 5. Hô hấp
  { tenSanPham: 'Terpin Codein', hoatChat: 'Terpin hydrat 100mg, Codein 10mg', danhMuc: 'Hô hấp', donViCoSo: 'Viên', giaBan: 900 },
  { tenSanPham: 'Ambroxol 30mg', hoatChat: 'Ambroxol 30mg', danhMuc: 'Hô hấp', donViCoSo: 'Viên', giaBan: 500 },
  { tenSanPham: 'Exomuc', hoatChat: 'Acetylcysteine 200mg', danhMuc: 'Hô hấp', donViCoSo: 'Gói', giaBan: 3000 },
  { tenSanPham: 'Ventolin 2mg', hoatChat: 'Salbutamol 2mg', danhMuc: 'Hô hấp', donViCoSo: 'Viên', giaBan: 700 },
  { tenSanPham: 'Singulair 10mg', hoatChat: 'Montelukast 10mg', danhMuc: 'Hô hấp', donViCoSo: 'Viên', giaBan: 17000 },
  { tenSanPham: 'Eugica', hoatChat: 'Eucalyptol, Tinh dầu gừng', danhMuc: 'Hô hấp', donViCoSo: 'Viên', giaBan: 1200 },
  { tenSanPham: 'Bricanyl 0.5mg', hoatChat: 'Terbutaline 0.5mg', danhMuc: 'Hô hấp', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Acemuc 200mg', hoatChat: 'Acetylcysteine 200mg', danhMuc: 'Hô hấp', donViCoSo: 'Gói', giaBan: 2800 },
  { tenSanPham: 'Prospan', hoatChat: 'Cao lá thường xuân', danhMuc: 'Hô hấp', donViCoSo: 'Chai', giaBan: 70000 },
  { tenSanPham: 'Strepsils', hoatChat: 'Amylmetacresol, Dichlorobenzyl alcohol', danhMuc: 'Hô hấp', donViCoSo: 'Viên ngậm', giaBan: 2500 },

  // 6. Vitamin & Khoáng chất
  { tenSanPham: 'Berocca', hoatChat: 'Vitamin B, C, Canxi, Magie', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên sủi', giaBan: 7000 },
  { tenSanPham: 'Vitamin C 500mg', hoatChat: 'Ascorbic Acid 500mg', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên', giaBan: 800 },
  { tenSanPham: 'Calcium Sandoz 500mg', hoatChat: 'Calcium 500mg', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên sủi', giaBan: 5000 },
  { tenSanPham: 'Vitamin B complex (Traphaco)', hoatChat: 'Vitamin B1, B6, B12', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên', giaBan: 600 },
  { tenSanPham: 'Enervon-C', hoatChat: 'Vitamin C, B complex', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên', giaBan: 1100 },
  { tenSanPham: 'Pharmaton', hoatChat: 'Nhân sâm, Vitamin, Khoáng chất', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên', giaBan: 5500 },
  { tenSanPham: 'Sắt (II) sulfat 200mg', hoatChat: 'Sắt (II) sulfat 200mg', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên', giaBan: 400 },
  { tenSanPham: 'Magie B6', hoatChat: 'Magie, Vitamin B6', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Vitamin E 400 IU (Enat)', hoatChat: 'Vitamin E 400 IU', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Viên', giaBan: 3000 },
  { tenSanPham: 'Vitamin D3 (Aquadetrim)', hoatChat: 'Vitamin D3 15000 IU/ml', danhMuc: 'Vitamin & Khoáng chất', donViCoSo: 'Chai', giaBan: 80000 },

  // 7. Dị ứng
  { tenSanPham: 'Clarityne 10mg', hoatChat: 'Loratadine 10mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 5000 },
  { tenSanPham: 'Telfast 180mg', hoatChat: 'Fexofenadine 180mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 10000 },
  { tenSanPham: 'Zyrtec 10mg', hoatChat: 'Cetirizine 10mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 4000 },
  { tenSanPham: 'Aerius 5mg', hoatChat: 'Desloratadine 5mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 6000 },
  { tenSanPham: 'Phenergan 2%', hoatChat: 'Promethazine 2%', danhMuc: 'Dị ứng', donViCoSo: 'Tuýp', giaBan: 15000 },
  { tenSanPham: 'Chlorpheniramine 4mg', hoatChat: 'Chlorpheniramine 4mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 300 },
  { tenSanPham: 'Cetirizin 10mg (Stada)', hoatChat: 'Cetirizine 10mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 500 },
  { tenSanPham: 'Loratadin 10mg (Pymepharco)', hoatChat: 'Loratadine 10mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 600 },
  { tenSanPham: 'Levocetirizine 5mg', hoatChat: 'Levocetirizine 5mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Hydroxyzine 25mg', hoatChat: 'Hydroxyzine 25mg', danhMuc: 'Dị ứng', donViCoSo: 'Viên', giaBan: 1200 },

  // 8. Cơ - Xương - Khớp
  { tenSanPham: 'Voltaren Emulgel 1%', hoatChat: 'Diclofenac 1%', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Tuýp', giaBan: 60000 },
  { tenSanPham: 'Myonal 50mg', hoatChat: 'Eperisone 50mg', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 3000 },
  { tenSanPham: 'Salonpas Gel', hoatChat: 'Methyl Salicylate, l-Menthol', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Tuýp', giaBan: 45000 },
  { tenSanPham: 'Glucosamine 500mg', hoatChat: 'Glucosamine Sulfate 500mg', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 2000 },
  { tenSanPham: 'Colchicine 1mg', hoatChat: 'Colchicine 1mg', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Allopurinol 300mg', hoatChat: 'Allopurinol 300mg', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 800 },
  { tenSanPham: 'Decontractyl 250mg', hoatChat: 'Mephenesin 250mg', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 1300 },
  { tenSanPham: 'Arcoxia 90mg', hoatChat: 'Etoricoxib 90mg', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 16000 },
  { tenSanPham: 'Bonlutin', hoatChat: 'Glucosamine, Chondroitin', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 4000 },
  { tenSanPham: 'JEX Max', hoatChat: 'PEPTAN, Undenatured Type II Collagen', danhMuc: 'Cơ - Xương - Khớp', donViCoSo: 'Viên', giaBan: 10000 },

  // 9. Nội tiết
  { tenSanPham: 'Metformin 850mg (Stada)', hoatChat: 'Metformin 850mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Glucophage 500mg', hoatChat: 'Metformin 500mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 1500 },
  { tenSanPham: 'Diamicron MR 30mg', hoatChat: 'Gliclazide 30mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 4000 },
  { tenSanPham: 'Amaryl 2mg', hoatChat: 'Glimepiride 2mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 3000 },
  { tenSanPham: 'Januvia 100mg', hoatChat: 'Sitagliptin 100mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 18000 },
  { tenSanPham: 'Thyrozol 10mg', hoatChat: 'Thiamazole 10mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 2500 },
  { tenSanPham: 'Levothyrox 100mcg', hoatChat: 'Levothyroxine 100mcg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Duphaston 10mg', hoatChat: 'Dydrogesterone 10mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 11000 },
  { tenSanPham: 'Postinor 1.5mg', hoatChat: 'Levonorgestrel 1.5mg', danhMuc: 'Nội tiết', donViCoSo: 'Viên', giaBan: 35000 },
  { tenSanPham: 'Marvelon', hoatChat: 'Desogestrel, Ethinylestradiol', danhMuc: 'Nội tiết', donViCoSo: 'Vỉ', giaBan: 60000 },

  // 10. Thần kinh
  { tenSanPham: 'Tanakan 40mg', hoatChat: 'Ginkgo Biloba 40mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 6000 },
  { tenSanPham: 'Stugeron 25mg', hoatChat: 'Cinnarizine 25mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 1500 },
  { tenSanPham: 'Cerebrolysin 5ml', hoatChat: 'Cerebrolysin 5ml', danhMuc: 'Thần kinh', donViCoSo: 'Ống', giaBan: 50000 },
  { tenSanPham: 'Magie B6 (Sanofi)', hoatChat: 'Magie, Vitamin B6', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 1200 },
  { tenSanPham: 'Sibelium 5mg', hoatChat: 'Flunarizine 5mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 3000 },
  { tenSanPham: 'Depakine 500mg', hoatChat: 'Valproic Acid 500mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 5000 },
  { tenSanPham: 'Tegretol 200mg', hoatChat: 'Carbamazepine 200mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 2000 },
  { tenSanPham: 'Dogmatil 50mg', hoatChat: 'Sulpiride 50mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 2500 },
  { tenSanPham: 'Lexomil 6mg', hoatChat: 'Bromazepam 6mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 1000 },
  { tenSanPham: 'Seduxen 5mg', hoatChat: 'Diazepam 5mg', danhMuc: 'Thần kinh', donViCoSo: 'Viên', giaBan: 800 }
];

// --- DỮ LIỆU KHÁCH HÀNG (MỚI) ---
const customers = [
  { hoTen: 'Nguyễn Văn Bình', soDienThoai: '0905123456' },
  { hoTen: 'Trần Thị Lan Anh', soDienThoai: '0913789123' },
  { hoTen: 'Lê Minh Hoàng', soDienThoai: '0988456789' },
  { hoTen: 'Phạm Thu Thảo', soDienThoai: '0935111222' },
  { hoTen: 'Võ Thành Trung', soDienThoai: '0868333444' },
  { hoTen: 'Đặng Yến Nhi', soDienThoai: '0909555666' },
  { hoTen: 'Hoàng Tuấn Kiệt', soDienThoai: '0977788999' },
  { hoTen: 'Bùi Phương Nga', soDienThoai: '0912987654' }
];


async function createSeedData() {
  console.log('Bắt đầu tạo dữ liệu mẫu chi tiết...');

  try {
    await sequelize.sync({ alter: true });
    console.log('Đã đồng bộ database.');

    // --- 1. TẠO CHI NHÁNH ---
    const [branchHQ] = await Branch.findOrCreate({ where: { tenChiNhanh: 'Trụ sở chính' }, defaults: { diaChi: 'Tòa nhà trung tâm, Hà Nội' }});
    const [branchCG] = await Branch.findOrCreate({ where: { tenChiNhanh: 'CN Cầu Giấy' }, defaults: { diaChi: '123 Xuân Thủy, Cầu Giấy, Hà Nội' }});
    const [branchHBT] = await Branch.findOrCreate({ where: { tenChiNhanh: 'CN Hai Bà Trưng' }, defaults: { diaChi: '456 Minh Khai, Hai Bà Trưng, Hà Nội' }});
    const [branchHD] = await Branch.findOrCreate({ where: { tenChiNhanh: 'CN Hà Đông' }, defaults: { diaChi: '789 Quang Trung, Hà Đông, Hà Nội' }});
    const [branchQ1] = await Branch.findOrCreate({ where: { tenChiNhanh: 'CN Quận 1' }, defaults: { diaChi: '101 Đồng Khởi, Quận 1, TP. Hồ Chí Minh' }});
    const [branchGV] = await Branch.findOrCreate({ where: { tenChiNhanh: 'CN Gò Vấp' }, defaults: { diaChi: '202 Phan Văn Trị, Gò Vấp, TP. Hồ Chí Minh' }});
    console.log('Đã tạo/tải 6 chi nhánh.');

    // --- 2. TẠO NGƯỜI DÙNG ---
    // (Giữ nguyên code tạo 16 người dùng của bạn)
    await User.findOrCreate({ where: { tenDangNhap: 'admin' }, defaults: { hoTen: 'Nguyễn Văn An (Tổng)', matKhau: 'admin123', vaiTro: 'Quản lý tổng', branchId: branchHQ.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'ql_caugiay' }, defaults: { hoTen: 'Trần Thị Bích (QL Cầu Giấy)', matKhau: '123456', vaiTro: 'Quản lý chi nhánh', branchId: branchCG.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'ql_haibatrung' }, defaults: { hoTen: 'Lê Văn Cường (QL HBT)', matKhau: '123456', vaiTro: 'Quản lý chi nhánh', branchId: branchHBT.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'ql_hadong' }, defaults: { hoTen: 'Phạm Thị Dung (QL Hà Đông)', matKhau: '123456', vaiTro: 'Quản lý chi nhánh', branchId: branchHD.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'ql_quan1' }, defaults: { hoTen: 'Võ Minh Hải (QL Quận 1)', matKhau: '123456', vaiTro: 'Quản lý chi nhánh', branchId: branchQ1.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'ql_govap' }, defaults: { hoTen: 'Hoàng Thị Em (QL Gò Vấp)', matKhau: '123456', vaiTro: 'Quản lý chi nhánh', branchId: branchGV.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_cg1' }, defaults: { hoTen: 'Nhân viên CG 1', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchCG.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_cg2' }, defaults: { hoTen: 'Nhân viên CG 2', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchCG.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_hbt1' }, defaults: { hoTen: 'Nhân viên HBT 1', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchHBT.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_hbt2' }, defaults: { hoTen: 'Nhân viên HBT 2', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchHBT.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_hd1' }, defaults: { hoTen: 'Nhân viên HD 1', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchHD.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_hd2' }, defaults: { hoTen: 'Nhân viên HD 2', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchHD.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_q1_1' }, defaults: { hoTen: 'Nhân viên Q1 1', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchQ1.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_q1_2' }, defaults: { hoTen: 'Nhân viên Q1 2', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchQ1.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_gv1' }, defaults: { hoTen: 'Nhân viên GV 1', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchGV.id }});
    await User.findOrCreate({ where: { tenDangNhap: 'nv_gv2' }, defaults: { hoTen: 'Nhân viên GV 2', matKhau: '123456', vaiTro: 'Nhân viên', branchId: branchGV.id }});
    console.log('Đã tạo/tải 16 người dùng.');

    // --- 3. TẠO NHÀ CUNG CẤP ---
    await Promise.all(suppliers.map(supplier => 
      Supplier.findOrCreate({
        where: { tenNhaCungCap: supplier.tenNhaCungCap },
        defaults: supplier
      })
    ));
    console.log(`Đã tạo/tải ${suppliers.length} nhà cung cấp.`);

    // --- 4. TẠO SẢN PHẨM ---
    await Promise.all(products.map(product => 
      Product.findOrCreate({
        where: { tenSanPham: product.tenSanPham },
        defaults: product
      })
    ));
    console.log(`Đã tạo/tải ${products.length} sản phẩm.`);

    // --- 5. TẠO KHÁCH HÀNG (MỚI) ---
    await Promise.all(customers.map(customer => 
      Customer.findOrCreate({
        where: { soDienThoai: customer.soDienThoai }, // Dùng SĐT làm khóa
        defaults: customer
      })
    ));
    console.log(`Đã tạo/tải ${customers.length} khách hàng.`);


    console.log('--- TẠO DỮ LIỆU MẪU HOÀN TẤT ---');

  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await sequelize.close();
    console.log('Đã đóng kết nối database.');
  }
}

createSeedData();