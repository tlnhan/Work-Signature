const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require('../config/database');

router.get('/admin/chucvu/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM ChucVu WHERE id = '${id}'`;
    mssql.query(query)
        .then(result => {
            const ChucVuIDData = result.recordset[0];
            res.status(200).json(ChucVuIDData);
        })
        .catch(err => {
            console.error(`Lỗi khi lấy thông tin chức vụ ${id}:`, err);
            res.status(500).json({ error: `Lỗi khi lấy thông tin chức vụ ${id}` });
        });
});

router.post('/', (req, res) => {

});

router.put('/admin/chucvu/:id', (req, res) => {
    const { id } = req.params;
    const { ChucVu } = req.body;

    const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[ChucVu] WHERE id = '${id}'`;
    mssql.connect(dbConfig, (err) => {
        if (err) {
            console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
            return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
        }

        const request = new mssql.Request();
        request.query(checkExistQuery, (err, resultExist) => {
            if (err) {
                console.error('Lỗi khi kiểm tra sự tồn tại của chức vụ:', err);
                return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của chức vụ trong SQL Server' });
            }

            const count = resultExist.recordset[0].Count;
            if (count == 0) {
                return res.status(404).json({ error: 'Không tìm thấy chức vụ cần cập nhật' });
            }

            const updateQuery = `
          UPDATE [dbo].[ChucVu]
          SET ChucVu = '${ChucVu}'
          WHERE id = '${id}'`;
            request.query(updateQuery, (err, resultUpdate) => {
                if (err) {
                    console.error('Lỗi khi cập nhật thông tin tài khoản:', err);
                    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin chức vụ vào SQL Server' });
                }
                return res.status(200).json({ message: 'Cập nhật thông tin chức vụ thành công' });
            });
        });
    });
});

router.delete('/admin/chucvu/:id', (req, res) => {
    const { id } = req.params;

    const deleteQuery = `
    DELETE FROM [QL_CongTac].[dbo].[ChucVu]
    WHERE [id] = '${id}'
  `;

    mssql.query(deleteQuery)
        .then(result => {
            res.status(200).json({ message: `Đã xóa chức vụ có mã: ${id}` });
        })
        .catch(err => {
            console.error('Lỗi khi xóa chức vụ:', err);
            res.status(500).json({ error: 'Lỗi khi xóa chức vụ từ SQL Server' });
        });
});

module.exports = router;