const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require('../config/database');

router.get('/nhanviendicung', (req, res) => {
    const query = `SELECT * FROM NhanVien`;
    mssql.query(query)
      .then(result => {
        res.status(200).json(result.recordset);
      })
      .catch(err => {
        console.error(`Lỗi khi lấy thông tin phí công tác:`, err);
        res.status(500).json({ error: `Lỗi khi lấy thông tin phí công tác` });
      });
});

router.post('/', (req, res) => {

});

router.put('/', (req, res) => {

});

router.delete('/', (req, res) => {

});

module.exports = router;