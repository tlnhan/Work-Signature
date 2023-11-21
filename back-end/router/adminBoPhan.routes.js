const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require('../config/database');

router.get('/admin/bophan', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT * FROM [QL_CongTac].[dbo].[BoPhan]`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy tài khoản', err);
        res.status(500).send('Server Error');
    }
});

router.post('/admin/bophan', (req, res) => {
    const {
        NguoiQuanLy,
        TenBP,
        SoDT
    } = req.body;

    const insertQuery = `
        INSERT INTO [QL_CongTac].[dbo].[BoPhan] (
          [NguoiQuanLy],
          [TenBP],
          [SoDT]
        ) VALUES (
          N'${NguoiQuanLy}',
          N'${TenBP}',
          '${SoDT}'
        )
      `;

    mssql.query(insertQuery)
        .then(result => {
            console.log('Đã thêm bộ phận thành công');
            res.status(200).json({ message: 'Đã thêm bộ phận thành công' });
        })
        .catch(err => {
            console.error('Lỗi khi thêm bộ phận:', err);
            res.status(500).json({ error: 'Lỗi khi thêm bộ phận vào SQL Server' });
        });
});

router.put('/admin/bophan/:BoPhanID', (req, res) => {
    const { BoPhanID } = req.params;
    const { NguoiQuanLy, TenBP, SoDT } = req.body;

    const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[BoPhan] WHERE BoPhanID = '${BoPhanID}'`;
    mssql.connect(dbConfig, (err) => {
        if (err) {
            console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
            return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
        }

        const request = new mssql.Request();
        request.query(checkExistQuery, (err, resultExist) => {
            if (err) {
                console.error('Lỗi khi kiểm tra sự tồn tại của bộ phận:', err);
                return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của bộ phận trong SQL Server' });
            }

            const count = resultExist.recordset[0].Count;
            if (count == 0) {
                return res.status(404).json({ error: 'Không tìm thấy bộ phận cần cập nhật' });
            }

            const updateQuery = `
          UPDATE [dbo].[BoPhan]
          SET NguoiQuanLy = N'${NguoiQuanLy}', TenBP = N'${TenBP}', SoDT = '${SoDT}'
          WHERE BoPhanID = '${BoPhanID}'`;
            request.query(updateQuery, (err, resultUpdate) => {
                if (err) {
                    console.error('Lỗi khi cập nhật thông tin bộ phận:', err);
                    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin bộ phận vào SQL Server' });
                }
                return res.status(200).json({ message: 'Cập nhật thông tin bộ phận thành công' });
            });
        });
    });
});

router.delete('/admin/bophan/:BoPhanID', (req, res) => {
    const { BoPhanID } = req.params;

    const deleteQuery = `
      DELETE FROM [QL_CongTac].[dbo].[BoPhan]
      WHERE [BoPhanID] = '${BoPhanID}'
    `;

    mssql.query(deleteQuery)
        .then(result => {
            res.status(200).json({ message: `Đã xóa bộ phận có mã: ${BoPhanID}` });
        })
        .catch(err => {
            console.error('Lỗi khi xóa bộ phận:', err);
            res.status(500).json({ error: 'Lỗi khi xóa bộ phận từ SQL Server' });
        });
});

module.exports = router;