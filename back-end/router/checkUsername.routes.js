const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config().parsed;
const dbConfig = require('../config/database');

router.get('/username/:NXTTID', (req, res) => {
    const { NXTTID } = req.params;
    const query = `SELECT COUNT(*) AS Count FROM TaiKhoan WHERE TaiKhoanID = '${NXTTID}'`;
    mssql.query(query)
      .then(result => {
        const count = result.recordset[0].Count;
        const exists = count > 0;
        res.status(200).json({ exists });
      })
      .catch(err => {
        console.error(`Lỗi khi lấy thông tin mã tài khoản ${NXTTID}:`, err);
        res.status(500).json({ error: `Lỗi khi lấy thông tin mã tài khoản ${NXTTID}` });
      });
});

router.post('/', (req, res) => {
   
});

router.put('/', (req, res) => {
  
});

router.delete('/', (req, res) => {
   
});

module.exports = router;