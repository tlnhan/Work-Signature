const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require('../config/database');

router.get('/admin/chucvu', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
          .query(`SELECT TOP (1000) [id], [ChucVu] FROM [QL_CongTac].[dbo].[ChucVu]`);
        res.json(result.recordset);
      } catch (err) {
        console.error('Lỗi lấy tài khoản', err);
        res.status(500).send('Server Error');
      }
});

router.post('/admin/chucvu', (req, res) => {
    const {
        ChucVu
      } = req.body;
    
      const insertQuery = `
        INSERT INTO [QL_CongTac].[dbo].[ChucVu] (
          [ChucVu]
        ) VALUES (
          N'${ChucVu}'
        )
      `;
    
      mssql.query(insertQuery)
        .then(() => {
          res.status(200).json({ message: 'Đã thêm chức vụ thành công' });
        })
        .catch(() => {
          res.status(500).json({ error: 'Lỗi khi thêm chức vụ vào SQL Server' });
        });
});

module.exports = router;