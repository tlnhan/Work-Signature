const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config().parsed;
const dbConfig = require('../config/database');

router.get('/login', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (token) {
      try {
        const decodedToken = jwt.verify(token, dotenv.SECRET_KEY);
        const { username, password } = decodedToken;
  
        const pool = await mssql.connect(dbConfig);
        const query = `SELECT * FROM TaiKhoan WHERE Username = @username AND Pass = @password`;
        const result = await pool.request()
          .input('username', mssql.VarChar, username)
          .input('password', mssql.VarChar, password)
          .query(query);
  
        if (result.recordset.length > 0) {
          res.status(200).json({ message: 'Người dùng đã đăng nhập' });
        } else {
          res.status(401).json({ message: 'Token không hợp lệ hoặc người dùng không tồn tại' });
        }
      } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ message: 'Có lỗi bên server' });
      }
    } else {
      res.status(401).json({ message: 'Token không tồn tại' });
    }
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    mssql.connect(dbConfig).then(pool => {
      const query = `SELECT * FROM TaiKhoan WHERE Username = @username AND Pass = @password`;
      return pool.request()
        .input('username', mssql.VarChar, username)
        .input('password', mssql.VarChar, password)
        .query(query);
    }).then(result => {
      if (result.recordset.length > 0) {
        const { TaiKhoanID, VaiTro, MaNV } = result.recordset[0];
        const token = jwt.sign({ username, password, VaiTro, TaiKhoanID, MaNV }, dotenv.SECRET_KEY, { expiresIn: '1h' });
        globalTaiKhoanID = TaiKhoanID;
        res.status(200).json({ token, role: VaiTro, maNV: MaNV });
      } else {
        res.status(400).json('Tài khoản không đúng');
      }
    }).catch(err => {
      console.log(err);
      res.status(500).json('Có lỗi bên server');
    });
});

module.exports = router;
