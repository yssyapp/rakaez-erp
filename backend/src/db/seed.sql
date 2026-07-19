INSERT INTO branches (name, city) VALUES
('فرع الرياض - الصناعية', 'الرياض'),
('فرع جدة - حي الصناعية', 'جدة'),
('مستودع مركزي - الدمام', 'الدمام');

INSERT INTO parts (id, name, brand, category, price, cost) VALUES
('P-1001','طقم تيل فرامل أمامي - تويوتا كامري 2018-2022','Toyota','فرامل',185,120),
('P-1002','فلتر زيت المحرك - هوندا أكورد 2016-2021','Honda','فلاتر',35,18),
('P-1003','بطارية سيارة 70 أمبير - عام','AC Delco','كهرباء',420,310),
('P-1004','مساعد أمامي يمين - هيونداي النترا 2017-2020','Hyundai','تعليق',310,210),
('P-1005','طرمبة بنزين - نيسان التيما 2013-2018','Nissan','وقود',265,170),
('P-1006','رديتر تبريد - فورد F150 2015-2020','Ford','تبريد',540,400);

INSERT INTO inventory (part_id, branch_id, shelf_section, shelf_number, shelf_level, quantity, min_quantity) VALUES
('P-1001',1,'A','5','دور 2',42,15),
('P-1002',1,'B','2','دور 1',8,20),
('P-1003',2,'D','1','أرضي',5,10),
('P-1004',1,'C','7','دور 3',24,8),
('P-1005',3,'E','4','دور 1',0,6),
('P-1006',3,'F','9','أرضي',12,5);

INSERT INTO vin_map (part_id, vin_pattern, vehicle_model, vehicle_year_from, vehicle_year_to) VALUES
('P-1001','JTNBE46K','Toyota Camry',2018,2022),
('P-1002','1HGCV1F','Honda Accord',2016,2021),
('P-1004','KMHD84L','Hyundai Elantra',2017,2020),
('P-1005','1N4AL3AP','Nissan Altima',2013,2018),
('P-1006','1FTEW1EP','Ford F150',2015,2020);

INSERT INTO users (name, role, branch_id, email) VALUES
('عبدالله (بائع)','seller',1,'seller1@example.com'),
('مدير النظام','admin',NULL,'admin@example.com');
