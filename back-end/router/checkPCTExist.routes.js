const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/checkphieucongtacexist/:MaNV', (req, res) => {
  const { MaNV } = req.params;
  const query = `SELECT * FROM PhieuCongTac WHERE MaNV = '${MaNV}'`;
  mssql.query(query)
    .then(result => {
      const MaNVData = result.recordset[0];
      res.status(200).json(MaNVData);
    })
    .catch(err => {
      console.error(`Lỗi khi lấy thông tin Mã Phiếu Công Tác ${MaNV}:`, err);
      res.status(500).json({ error: `Lỗi khi lấy thông tin Mã Phiếu Công Tác ${MaNV}` });
    });
});

module.exports = router;