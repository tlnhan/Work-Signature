const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const loginRouter = require('./router/login.routes');
const accountsRouter = require('./router/adminAccounts.routes');
const accountsCTRouter = require('./router/adminAccountsCT.routes');
const phieuCTRouter = require('./router/phieuCT.routes');
const phieuTTRouter = require('./router/phieuTT.routes');
const adminPCTRouter = require('./router/adminPCT.routes');
const adminPTTRouter = require('./router/adminPTT.routes');
const phieuCTCTRouter = require('./router/phieuCTCT.routes');
const phieuTTCTRouter = require('./router/phieuTTCT.routes');
const chiTietPTTRouter = require('./router/chiTietTT.routes');
const adminAccountsRouter = require('./router/adminAccounts.routes');
const deleteAMonthRouter = require('./router/deleteAMonth.routes');
const chiTietPTTCTRouter = require('./router/chiTietTTCT.routes');
const adminChucVuRouter = require('./router/adminChucVu.routes');
const adminChucVuCTRouter = require('./router/adminChucVuCT.routes');
const adminBoPhanRouter = require('./router/adminBoPhan.routes');
const adminChungTuRouter = require('./router/adminChungTu.routes');
const adminCongtacPhiRouter = require('./router/adminCongTacPhi.routes');
const adminUsersRouter = require('./router/adminUsers.routes');
const checkMaNVRouter = require('./router/checkMaNV.routes');
const checkMaNVDCRouter = require('./router/checkMaNVDC.routes');
const maNVDCRouter = require('./router/maNVDC.routes');
const checkUsernameRouter = require('./router/checkUsername.routes');
const checkMaPCTRouter = require('./router/checkMaPCT.routes');
const checkChungTuIDRouter = require('./router/checkChungTuID.routes');
const pheDuyetRouter = require('./router/pheDuyet.routes');
const checkPCTExistRouter = require('./router/checkPCTExist.routes');

app.use(bodyParser.urlencoded({ extends: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use('/api', loginRouter);
app.use('/api', accountsRouter);
app.use('/api', accountsCTRouter);
app.use('/api', phieuCTRouter);
app.use('/api', phieuTTRouter);
app.use('/api', adminPCTRouter);
app.use('/api', adminPTTRouter);
app.use('/api', phieuCTCTRouter);
app.use('/api', phieuTTCTRouter);
app.use('/api', chiTietPTTRouter);
app.use('/api', adminAccountsRouter);
app.use('/api', deleteAMonthRouter);
app.use('/api', chiTietPTTCTRouter);
app.use('/api', adminChucVuRouter);
app.use('/api', adminChucVuCTRouter);
app.use('/api', adminBoPhanRouter);
app.use('/api', adminChungTuRouter);
app.use('/api', adminCongtacPhiRouter);
app.use('/api', adminUsersRouter);
app.use('/api', checkMaNVRouter);
app.use('/api', checkMaNVDCRouter);
app.use('/api', maNVDCRouter);
app.use('/api', checkUsernameRouter);
app.use('/api', checkMaPCTRouter);
app.use('/api', checkChungTuIDRouter);
app.use('/api', pheDuyetRouter);
app.use('/api', checkPCTExistRouter);

app.listen(8080, () => {
  console.log("Server đang được chạy 8080 !");
});