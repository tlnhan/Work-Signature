const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/manhanvien/:MaNV', (req, res) => {
    const { MaNV } = req.params;
    const query = `SELECT * FROM NhanVien WHERE MaNV = '${MaNV}'`;
    mssql.query(query)
        .then(result => {
            res.status(200).json(result.recordset);
        })
        .catch(err => {
            console.error(`Lỗi khi lấy thông tin Mã nhân viên ${MaNV}:`, err);
            res.status(500).json({ error: `Lỗi khi lấy thông tin Mã nhân viên ${MaNV}` });
        });
});

module.exports = router;