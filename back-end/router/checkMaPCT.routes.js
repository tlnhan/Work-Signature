const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/checkthanhtoan/maphieuthanhtoan/:PhieuCongTacID', (req, res) => {
    const { PhieuCongTacID } = req.params;
    const query = `SELECT * FROM PhieuThanhToan WHERE PhieuCongTacID = '${PhieuCongTacID}'`;
    mssql.query(query)
      .then(result => {
        const existingRecord = result.recordset[0];
        res.status(200).json(existingRecord);
      })
      .catch(err => {
        console.error(`Lỗi khi lấy thông tin ID Phiếu Công Tác ${PhieuCongTacID}:`, err);
        res.status(500).json({ error: `Lỗi khi lấy thông tin ID Phiếu Công Tác ${PhieuCongTacID}` });
      });
});

module.exports = router;