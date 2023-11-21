const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config().parsed;
const dbConfig = require('../config/database');

router.get('/danhsachphieucvtt/:MaPhieu', (req, res) => {
    const { MaPhieu } = req.params;
    const query = `
      SELECT * FROM PheDuyet
      WHERE MaPhieu = '${MaPhieu}'
    `;
    mssql.query(query)
      .then(result => {
        const danhSachPhieuCVTT = result.recordset;
        res.status(200).json(danhSachPhieuCVTT);
      })
      .catch(err => {
        console.error(`Lỗi khi lấy danh sách Phiếu Công Tác và Phiếu Thanh Toán có PhieuCongTacID ${PhieuCongTacID}:`, err);
        res.status(500).json({ error: `Lỗi khi lấy danh sách Phiếu Công Tác và Phiếu Thanh Toán có PhieuCongTacID ${PhieuCongTacID}` });
      });
});

router.post('/', (req, res) => {
   
});

router.put('/', (req, res) => {
  
});

router.delete('/', (req, res) => {
   
});

module.exports = router;