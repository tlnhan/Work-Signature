const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config().parsed;
const dbConfig = require('../config/database');
const moment = require("moment");

router.get('/admin/accounts', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
          .query(`SELECT TOP (1000) [TaiKhoanID], [MaNV], [Username], [Pass], [NgayTao], [NgayCapNhat], [VaiTro] FROM [QL_CongTac].[dbo].[TaiKhoan]`);
        res.json(result.recordset);
      } catch (err) {
        console.error('Lỗi lấy tài khoản', err);
        res.status(500).send('Server Error');
      }
});

router.post('/admin/accounts', (req, res) => {
    const { MaNV, Username, Pass, VaiTro } = req.body;

  if (!MaNV || !Username || !Pass || !VaiTro) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin tài khoản.' });
  }

  const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `
    INSERT INTO TaiKhoan (MaNV, Username, Pass, NgayTao, NgayCapNhat, VaiTro)
    VALUES (@MaNV, @Username, @Pass, @NgayTao, @NgayCapNhat, @VaiTro)
  `;

  const pool = new mssql.ConnectionPool(dbConfig);
  pool.connect((err) => {
    if (err) {
      console.error('Lỗi kết nối cơ sở dữ liệu:', err);
      return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu.' });
    }

    const request = pool.request();
    request.input('MaNV', mssql.NVarChar, MaNV);
    request.input('Username', mssql.NVarChar, Username);
    request.input('Pass', mssql.NVarChar, Pass);
    request.input('NgayTao', mssql.DateTime, currentDate);
    request.input('NgayCapNhat', mssql.DateTime, currentDate);
    request.input('VaiTro', mssql.VarChar, VaiTro);

    request.query(query, (error) => {
      if (error) {
        console.error('Lỗi khi đăng ký tài khoản:', error);
        return res.status(500).json({ error: 'Lỗi khi đăng ký tài khoản.' });
      }

      return res.status(201).json({ message: 'Đăng ký tài khoản thành công.' });
    });
  });
});

router.put('/admin/accounts/:Username', (req, res) => {
    const { Username } = req.params;
    const { MaNV, Pass, NgayTao, NgayCapNhat, VaiTro } = req.body;

    const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[TaiKhoan] WHERE Username = '${Username}'`;
    mssql.connect(dbConfig, (err) => {
        if (err) {
            console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
            return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
        }

        const request = new mssql.Request();
        request.query(checkExistQuery, (err, resultExist) => {
            if (err) {
                console.error('Lỗi khi kiểm tra sự tồn tại của account:', err);
                return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của account trong SQL Server' });
            }

            const count = resultExist.recordset[0].Count;
            if (count == 0) {
                return res.status(404).json({ error: 'Không tìm thấy phiếu công tác cần cập nhật' });
            }

            const updateQuery = `
          UPDATE [dbo].[TaiKhoan]
          SET MaNV = '${MaNV}', Username = '${Username}, Pass = '${Pass}', NgayTao = '${NgayTao}', NgayCapNhat = '${NgayCapNhat}', VaiTro = '${VaiTro}'
          WHERE Username = '${Username}'`;
            request.query(updateQuery, (err, resultUpdate) => {
                if (err) {
                    console.error('Lỗi khi cập nhật thông tin tài khoản:', err);
                    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin tài khoản vào SQL Server' });
                }
                return res.status(200).json({ message: 'Cập nhật thông tin tài khoản thành công' });
            });
        });
    });
});

router.delete('/admin/accounts/:Username', (req, res) => {
    const { Username } = req.params;

    const deleteQuery = `
    DELETE FROM [QL_CongTac].[dbo].[TaiKhoan]
    WHERE [Username] = '${Username}'
  `;

    mssql.query(deleteQuery)
        .then(result => {
            res.status(200).json({ message: `Đã xóa tài khoản có mã: ${Username}` });
        })
        .catch(err => {
            console.error('Lỗi khi xóa tài khoản:', err);
            res.status(500).json({ error: 'Lỗi khi xóa tài khoản từ SQL Server' });
        });
});

module.exports = router;