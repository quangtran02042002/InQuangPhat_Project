# Ke hoach tai thiet he thong quan ly tai chinh

## 1. Muc tieu

Trang thai quyet dinh:

- Da chon Phuong an A: chot so du dau ky va mo ky moi tren module tai chinh moi.
- Ngay cut-off mac dinh de thao tac ky thuat neu chua co ngay khac: 2026-04-09.

Tai thiet module tai chinh thanh 1 trung tam van hanh duy nhat cho doanh nghiep, gom:

- Thu chi thuc te
- So quy tien mat va tai khoan ngan hang
- Cong no phai thu khach hang
- Cong no phai tra nha cung cap/xuong gia cong
- Doanh thu, chi phi, loi nhuan du kien
- Chung tu, hoa don, file dinh kem
- Quy trinh duyet chi
- Canh bao va thong bao tu dong

Dinh huong dung la "1 trang, 1 tinh nang", nhung ben trong van chia theo tab/phien ban hien thi de giu thao tac nhanh va de doc.

## 2. Hien trang repo hien tai

Codebase hien co da co nen tang co ban, nhung du lieu tai chinh dang bi tach roi:

- `backend/models/Transaction.js`: chi luu thu/chi don gian theo `type`, `amount`, `category`, `description`, `date`.
- `backend/models/Debt.js`: luu cong no rieng, co `payments` noi bo, nhung khong lien ket voi giao dich tien thuc te.
- `frontend/src/screens/admin/FinanceScreen.jsx`: la so thu chi rieng.
- `frontend/src/screens/admin/DebtScreen.jsx`: la so cong no rieng.
- `backend/models/User.js`: moi chi co `isAdmin`, chua co vai tro ke toan, thu quy, giam doc.
- `backend/routes/uploadRoutes.js`: da co upload file len Cloudinary, nhung hien dang thiet ke theo kieu upload anh, chua phan loai chung tu tai chinh.
- `backend/models/Notification.js` va `backend/utils/sendTelegram.js`: da co khung thong bao noi bo va kenh Telegram.

Ket luan quan trong:

1. He thong hien tai chua co "chung tu goc" lam trung tam.
2. Cong no va dong tien chua doi soat hai chieu.
3. Du lieu cu khong du lien ket de migration 100% tu dong theo mo hinh moi neu khong chap nhan mot muc "so du dau ky".
4. Neu muon co workflow duyet, phai nang cap phan quyen truoc hoac song song.

## 3. Nguyen tac kien truc moi

Khong xay theo kieu "them them 1 bang nua", ma doi sang mo hinh 3 lop nghiep vu:

### Lop 1: Tai khoan tien

Noi tien dang nam o dau.

- Tien mat xưởng
- Tien mat van phong
- VCB
- TCB
- Vi dien tu neu co

### Lop 2: Chung tu goc

Noi phat sinh quyen thu hoac nghia vu tra.

- Don hang/hoa don ban: sinh phai thu
- Phieu nhap mua vat tu, hoa don NCC, phieu thue gia cong: sinh phai tra
- Tam ung khach hang: sinh nghia vu can tru
- Tam ung noi bo, hoan ung, boi hoan: sinh nghia vu noi bo

### Lop 3: Phieu giao dich tien

Moi dong tien vao/ra phai di qua phieu giao dich.

- Phieu thu
- Phieu chi
- Phieu chuyen quy noi bo
- Phieu dieu chinh

Nguyen tac bat buoc:

- Neu la thanh toan cong no, phieu giao dich phai gan voi chung tu goc.
- Neu la thu/chi doc lap, phieu van phai co doi tuong, danh muc, tai khoan tien, trang thai.
- So quy, cong no, dashboard deu doc tu cung 1 nguon du lieu giao dich da "post".

## 4. Pham vi module tai chinh hop nhat

De nghi giu 1 route duy nhat, vi du:

- `/admin/finance-center`

Ben trong la 6 tab lien thong cung mot service layer:

1. Tong quan
2. So quy va dong tien
3. Thu chi
4. Phai thu
5. Phai tra
6. Cau hinh

Neu muon giam thay doi dieu huong, co the tam giu route `/admin/finance`, nhung doi ten thanh "Trung tam tai chinh" va dua toan bo cong no vao cung man hinh nay. Route `/admin/debts` cu nen dua ve che do read-only trong giai doan chuyen doi, sau do bo.

## 5. Thiet ke du lieu muc tieu

Khong nen co 1 collection "tong hop tat ca" duy nhat. Nen co 1 cum collection tai chinh, nhung frontend se hien thi thanh 1 tinh nang duy nhat.

### 5.1. `finance_accounts`

Muc dich: so quy, ngan hang, vi, tai khoan trung gian.

Truong chinh:

- `code`
- `name`
- `type`: `cash`, `bank`, `e_wallet`, `clearing`
- `currency`
- `openingBalance`
- `currentBalance`
- `isActive`
- `ownerBranch` neu sau nay co nhieu co so

### 5.2. `finance_categories`

Muc dich: danh muc thu chi va dashboard.

Truong chinh:

- `code`
- `name`
- `direction`: `inflow`, `outflow`, `both`
- `group`: `revenue`, `expense`, `debt_collection`, `debt_payment`, `internal_transfer`, `advance`, `adjustment`
- `parentId`
- `requiresCounterparty`
- `requiresSourceDocument`
- `requiresInvoiceFlag`
- `defaultApprovalPolicyId`

### 5.3. `finance_source_documents`

Muc dich: chung tu goc phat sinh cong no hoac doi soat thanh toan.

Truong chinh:

- `documentType`: `sales_order`, `sales_invoice`, `purchase_invoice`, `outsourcing_order`, `expense_claim`, `advance_request`, `opening_balance`
- `documentCode`
- `counterpartyType`: `customer`, `supplier`, `employee`, `other`
- `counterpartyId` hoac snapshot thong tin
- `issueDate`
- `dueDate`
- `grossAmount`
- `taxAmount`
- `netAmount`
- `paidAmount`
- `outstandingAmount`
- `settlementStatus`: `unpaid`, `partial`, `paid`, `overpaid`
- `invoiceStatus`: `not_required`, `pending_invoice`, `has_invoice`, `missing_invoice`
- `attachments`
- `linkedEntityType`, `linkedEntityId`

Ghi chu:

- Co the lien ket toi `Customer`, `Supplier`, `User`.
- Giai doan dau co the lien ket tam toi `AdminQuote`, `InventoryTransaction`, `ProductionOrder` neu chua co module don hang ban/nhap mua chuan.

### 5.4. `finance_vouchers`

Muc dich: phieu thu, phieu chi, phieu chuyen quy, phieu dieu chinh.

Truong chinh:

- `voucherNo`
- `voucherType`: `receipt`, `payment`, `transfer`, `adjustment`
- `transactionDate`
- `postingDate`
- `direction`: `inflow`, `outflow`, `internal`
- `counterpartyType`
- `counterpartyId`
- `amount`
- `accountId`
- `toAccountId` cho chuyen quy
- `categoryId`
- `description`
- `referenceDocumentIds`
- `invoiceStatus`
- `hasInvoice`
- `approvalStatus`: `draft`, `pending_approval`, `approved`, `rejected`, `posted`, `cancelled`
- `attachments`
- `createdBy`
- `approvedBy`
- `postedBy`
- `auditLogs`

### 5.5. `finance_allocations`

Muc dich: bang can tru giua phieu tien va chung tu goc.

Vi du:

- Phieu thu 3 tr can vao don hang A
- Phieu chi 5 tr can vao hoa don NCC B
- Tien coc khach hang can tru vao 2 dot giao hang

Truong chinh:

- `voucherId`
- `sourceDocumentId`
- `allocatedAmount`
- `allocationType`: `settlement`, `advance_apply`, `writeoff`, `adjustment`

### 5.6. `finance_approval_policies`

Muc dich: cau hinh luong duyet.

Truong chinh:

- `name`
- `voucherType`
- `minAmount`
- `maxAmount`
- `requiredRoles`
- `skipForCategories`
- `isActive`

### 5.7. `finance_notification_rules`

Muc dich: cau hinh gui thong bao.

Truong chinh:

- `eventCode`
- `channels`: `system`, `telegram`, `zalo_oa`, `zns`
- `targetUsers`
- `targetPhones`
- `templateCode`
- `isActive`

## 6. Phan quyen can bo sung

`isAdmin` la khong du cho module tai chinh moi. Can doi sang vai tro nghiep vu.

De nghi bo sung toi thieu:

- `super_admin`
- `director`
- `chief_accountant`
- `accountant`
- `cashier`
- `sales`
- `purchasing`
- `viewer`

Quyen can tach ro:

- Tao phieu
- Sua phieu nhap nhap
- Gui duyet
- Duyet
- Post vao so quy
- Huy post
- Xem bao cao
- Xem cong no
- Xem tai khoan ngan hang

Neu khong nang cap role, quy trinh duyet > 5 tr se rat de bi "vo".

## 7. Luong nghiep vu cot loi

### 7.1. Phai thu khach hang

1. Tao chung tu ban hang.
2. He thong sinh `finance_source_document` loai phai thu.
3. Cong no tang.
4. Khi thu tien, lap `finance_voucher` loai thu.
5. Voucher duoc can vao chung tu qua `finance_allocations`.
6. So quy tang, cong no giam.

### 7.2. Phai tra nha cung cap

1. Tao phieu mua hang/nhap vat tu/gia cong.
2. He thong sinh `finance_source_document` loai phai tra.
3. Cong no NCC tang.
4. Khi chi tien, lap voucher chi.
5. Voucher can vao chung tu.
6. So quy giam, cong no giam.

### 7.3. Tam ung khach hang

1. Tao voucher thu loai dat coc.
2. Chua ghi nhan doanh thu.
3. Tao so du "khach tra truoc".
4. Khi phat sinh chung tu ban hang, cho phep can tru tam ung.

### 7.4. Chuyen quy noi bo

1. Tao voucher transfer.
2. Tai khoan nguon giam.
3. Tai khoan dich tang.
4. Khong anh huong doanh thu, chi phi, cong no.

### 7.5. Chi phi van hanh

1. Tao voucher chi khong gan cong no.
2. Bat buoc category.
3. Chon co hoa don hay khong.
4. Neu co, co the dinh kem hoa don VAT, bill, uy nhiem chi.

## 8. Giao dien "1 trang"

Khong nen doi nguoi dung qua lai giua nhieu screen. Mot man hinh co the bo tri nhu sau:

### Khu A: Header tong quan

- So du tien mat/ngan hang
- Thu hom nay
- Chi hom nay
- Phai thu den han
- Phai tra den han
- Chenh lech dong tien 7 ngay/30 ngay

### Khu B: Thanh thao tac nhanh

- Tao phieu thu
- Tao phieu chi
- Tao chuyen quy
- Tao cong no dau ky
- Them chung tu mua hang
- Them thu dat coc

### Khu C: Bang dieu huong tab

- Tong quan
- Doi soat giao dich
- Phai thu
- Phai tra
- Ke hoach thanh toan
- Bao cao
- Cau hinh

### Khu D: Drawer/Modal nghiep vu

Tat ca thao tac tao sua xay ra trong drawer co chung layout:

- thong tin chinh
- doi tuong
- tai khoan tien
- chung tu lien quan
- hoa don/chung tu dinh kem
- thong tin duyet
- audit trail

## 9. Trang thai can chuan hoa

### Voucher

- `draft`
- `pending_approval`
- `approved`
- `rejected`
- `posted`
- `cancelled`

### Cong no / chung tu

- `unpaid`
- `partial`
- `paid`
- `overdue`
- `written_off`

### Hoa don

- `not_required`
- `pending_invoice`
- `has_invoice`
- `missing_invoice`

### Thao tac du lieu

- `active`
- `voided`
- `archived`

## 10. Dinh kem file va hoa don

He thong hien da co upload file, nhung can nang cap de phu hop tai chinh:

- Ho tro PDF, JPG, PNG, WEBP
- Tach `attachmentType`: `invoice`, `payment_proof`, `contract`, `delivery_note`, `other`
- Luu `uploadedBy`, `uploadedAt`
- Cho preview nhanh
- Cho danh dau file chinh
- Kiem tra kich thuoc va loai file

De xac thuc nghiep vu, truong `hasInvoice` khong du. Nen co:

- `invoiceStatus`
- `invoiceNumber`
- `invoiceDate`
- `invoiceVendorName`
- `invoiceTaxCode`

## 11. Bao cao can co

### Dashboard tai chinh

- Tong tien hien co theo tai khoan
- Thu/chi theo ngay, tuan, thang
- Phai thu vs phai tra
- Top khach no lon
- Top NCC sap den han
- Phieu cho duyet

### Bao cao chi tiet

- So quy theo tai khoan
- Bao cao luu chuyen tien te
- Bao cao doanh thu/chi phi theo category
- Cong no theo khach/NCC
- Aging report: `<30`, `30-60`, `60-90`, `>90`
- Bao cao tam ung va can tru
- Bao cao giao dich khong hoa don

### P&L thu gon

Chi nen mo o muc "quan tri noi bo", vi cost hien trong repo dang nam phan tan o gia vat tu, cong thuc in, gia cong, chi phi van hanh. Giai doan dau co the tinh "loi nhuan du kien", chua nen goi la bao cao ke toan chinh thuc.

## 12. Chien luoc migration du lieu

Day la diem kho nhat.

Do du lieu hien tai dang tach:

- `Transaction` khong biet gan voi cong no nao
- `Debt.payments` khong biet tien vao tai khoan nao
- `Debt` va `Transaction` khong co khoa lien ket voi chung tu goc

Nen co 2 lua chon migration:

### Phuong an A: Chot so du dau ky

Khuyen nghi cho go-live an toan.

- Chot mot ngay cut-off, vi du 01/05/2026.
- Toan bo lich su cu giu de tra cuu read-only.
- Tao so du dau ky cho:
  - tung tai khoan tien
  - tung khach hang con no
  - tung NCC con no
  - tam ung con treo
- Tu cut-off tro di, chi cho phep van hanh tren module moi.

Uu diem:

- De doi soat
- It sai lech
- Go-live nhanh

Nhuoc diem:

- Khong co lich su lien thong 100% truoc ngay cut-off

### Phuong an B: Migration mot phan lich su

Chi nen lam neu doanh nghiep chap nhan ra soat tay.

- Map `Transaction` -> voucher lich su
- Map `Debt` -> source document cong no
- Map `Debt.payments` -> allocation lich su
- Ke toan doi soat tung khoan sai/khuyet

Uu diem:

- Co lich su nhieu hon

Nhuoc diem:

- Rat ton cong
- Nguy co lech so du cao

Khuyen nghi thuc te:

- Chon Phuong an A cho production
- Phuong an B chi dung cho mot so doi tuong lon can lich su

## 13. Roadmap de xuat

### Giai doan 0: Khao sat va chot nghiep vu (3-5 ngay)

- Chot pham vi MVP
- Chot danh muc tai khoan tien
- Chot danh muc thu chi
- Chot quy trinh duyet
- Chot phuong an migration
- Chot event thong bao nao can gui Zalo

Deliverable:

- Tai lieu nghiep vu
- Danh sach role
- Mapping du lieu cu -> moi

### Giai doan 1: Nen tang du lieu va phan quyen (1 tuan)

- Tao collection moi
- Tao index, ma chung tu, so phieu
- Tao role/permission
- Tao API cau hinh danh muc
- Tao script khoi tao opening balance

Deliverable:

- Schema moi
- Seed category/account
- Role matrix

### Giai doan 2: Voucher engine + so quy (1 tuan)

- Tao phieu thu, chi, chuyen quy
- Post vao so quy
- Lich su bien dong tai khoan
- Dinh kem file
- Co/khong hoa don
- Audit trail

Deliverable:

- Hoan tat dong tien thuc te
- So quy cap nhat dung khi them/sua/huy/post

### Giai doan 3: Cong no phai thu/phai tra lien thong (1-1.5 tuan)

- Tao chung tu goc
- Tao allocation
- Cong no chi tiet theo doi tuong/chung tu
- Tam ung va can tru
- Aging report

Deliverable:

- Thu tien giam no
- Chi tien giam no
- Dashboard cong no chuan

### Giai doan 4: Man hinh hop nhat va dashboard (1 tuan)

- Gom thu chi + cong no vao 1 route
- Thanh thao tac nhanh
- Tong quan dong tien
- Bao cao luu chuyen tien te
- P&L noi bo thu gon
- Ke hoach thanh toan

Deliverable:

- 1 trang tai chinh duy nhat cho van hanh

### Giai doan 5: Zalo notification bot (0.5-1 tuan)

- Truu tuong hoa he thong thong bao theo event
- Them kenh Zalo
- Tao log gui/that bai/retry
- Cau hinh nhom nguoi nhan

Deliverable:

- Thong bao tu dong khi co thu, chi, cong no, qua han, phieu cho duyet

### Giai doan 6: Migration rehearsal, UAT, go-live (0.5-1 tuan)

- Chay migration thu
- Doi soat so du
- UAT voi ke toan va giam doc
- Khoa module cu
- Go-live

Deliverable:

- Bien ban doi soat
- Checklist go-live

## 14. Ke hoach 4 tuan neu can MVP nhanh

Neu ban muon bam sat khung 4 tuan tham khao, can giam pham vi nhu sau:

### Tuan 1

- Chot schema moi
- Tao account, category, role
- Chot opening balance

### Tuan 2

- Hoan tat phieu thu/chi/chuyen quy
- Attachments
- Invoice flag
- Approval workflow muc co ban

### Tuan 3

- Lien ket phai thu/phai tra
- Allocation
- Aging report co ban

### Tuan 4

- Dashboard
- 1 man hinh hop nhat
- Zalo notification ban dau
- UAT

Luu y:

- Ke hoach 4 tuan chi hop ly neu chon migration kieu "so du dau ky".
- Neu muon migration lich su sau, phan quyen day du, bao cao ky thuat toan dien, thi thuc te nen tinh 6-8 tuan.

## 15. Phuong an Zalo thong bao

Khong nen "hard-code Zalo vao moi controller". Nen tao Notification Service trung tam:

- `createFinanceEvent(eventCode, payload)`
- `dispatchNotifications(eventCode, payload)`

### 15.1. Event can gui

- `finance.voucher.created`
- `finance.voucher.pending_approval`
- `finance.voucher.approved`
- `finance.voucher.rejected`
- `finance.voucher.posted`
- `finance.receivable.created`
- `finance.receivable.collected`
- `finance.payable.created`
- `finance.payable.paid`
- `finance.debt.overdue`
- `finance.cash.low_balance`

### 15.2. Kenh gui

- Notification trong he thong
- Telegram hien co
- Zalo OA
- ZNS

### 15.3. Khuyen nghi su dung Zalo

Can tach 2 bai toan:

#### A. Thong bao noi bo cho nhan su cong ty

Neu chi gui cho giam doc, ke toan, thu quy:

- Uu tien dung Zalo OA OpenAPI neu tung nguoi da quan tam/tuong tac voi OA.
- Dung cho canh bao phieu cho duyet, thu/chi lon, cong no qua han, so quy thap.

#### B. Thong bao giao dich den khach hang

Neu gui nhac thanh toan, xac nhan da thu tien, thong bao hoa don:

- Uu tien dung ZNS theo template duoc duyet.
- Phu hop hon vi di theo mau thong bao, co tracking, co webhook xac nhan da nhan.

### 15.4. De xuat ky thuat

Them 1 provider:

- `backend/utils/sendZaloMessage.js`

Va 1 bang log:

- `notification_deliveries`

Truong chinh:

- `channel`
- `eventCode`
- `recipient`
- `requestPayload`
- `responsePayload`
- `status`
- `retryCount`
- `lastError`

### 15.5. Quy trinh setup

1. Tao Zalo OA doanh nghiep.
2. Dang ky OpenAPI cho OA.
3. Neu gui thong bao theo mau, dang ky ZNS va tao template.
4. Tao App + Access Token/OAuth.
5. Cau hinh webhook.
6. Test voi 3 nhom event: thu, chi, cong no.
7. Them retry va dashboard log gui.

## 16. Ranh gioi ky thuat can luu y

1. He thong nay la "quan tri tai chinh noi bo", khong nen tu xung la phan mem ke toan day du neu chua co but toan ke toan, thue, khoi phuc ky, khoa so.
2. `AdminQuote` hien tai la bao gia noi bo, chua phai don hang ban chuan. Neu muon phai thu chuan, can bo sung document ban hang xac nhan.
3. `InventoryTransaction` hien tai la xuat nhap BTP, chua du de dai dien cho chung tu phai tra NCC neu thieu don gia/so tien.
4. Upload hien tai dang nghieng ve anh; tai chinh can ho tro PDF va metadata hoa don.
5. Bao cao loi nhuan phai tach "du kien" va "chot so" de tranh hieu nham.

## 17. Thu tu uu tien thuc thi

Neu chi duoc chon 5 hang muc de lam truoc, thu tu nen la:

1. Schema moi + opening balance
2. Voucher engine + so quy
3. Allocation cong no
4. Role/approval
5. Man hinh hop nhat + dashboard

Zalo thong bao nen lam sau khi event model da on dinh. Neu lam qua som, sau nay doi schema se phai sua template va logic gui lai.

## 18. De xuat chot scope MVP

MVP nen bao gom:

- Tai khoan tien
- Danh muc thu chi
- Phieu thu/chi/chuyen quy
- Cong no phai thu/phai tra
- Attachment + invoice status
- Duyet chi vuot nguong
- Dashboard co ban
- Thong bao Zalo cho su kien cot loi

Khong nen nhet vao MVP:

- But toan ke toan kep
- Da tien te
- Hop nhat cong ty con
- Tinh gia thanh san xuat chi tiet
- Ke khai thue

## 19. De xuat go-live

De nghi go-live theo cach sau:

1. Tuan rehearsal: chay song song module cu va moi.
2. Ke toan doi soat so du cuoi ngay.
3. Chot cut-off.
4. Dong trang sua o module cu, chi de xem.
5. Bat module moi.
6. Theo doi 7 ngay dau voi log va canh bao Zalo/Telegram.

## 20. Ket luan

Huong dung dung la:

- Gom ve 1 trung tam tai chinh duy nhat
- Lay chung tu goc va voucher lam trung tam
- Khong migration tham lam neu du lieu cu thieu lien ket
- Nang cap role truoc khi lam workflow duyet
- Truu tuong hoa thong bao thanh event bus, roi moi gan them Zalo

Khuyen nghi quyet dinh ngay:

1. Chon phuong an migration `so du dau ky` hay `migrate lich su`
2. Chon MVP 4 tuan hay rollout 6-8 tuan
3. Chot kenh Zalo dung cho noi bo, cho khach hang, hay cho ca hai
