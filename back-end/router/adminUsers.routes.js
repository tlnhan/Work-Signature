const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config().parsed;
const dbConfig = require('../config/database');

router.get('/admin/users', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT * FROM [QL_CongTac].[dbo].[NhanVien]`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy phí công tác', err);
        res.status(500).send('Server Error');
    }
});

router.post('/admin/users', (req, res) => {
    const {
        BoPhanID,
        ChucVuID,
        HoTen,
        NgaySinh,
        Email,
        SoDT,
        NgayVaoLam,
        NgayCapNhat
    } = req.body;

    const getMaxMaNVQuery = `
        SELECT MAX(CAST([MaNV] AS INT)) AS MaxMaNV
        FROM [QL_CongTac].[dbo].[NhanVien]
      `;

    const getExistingMaNVsQuery = `
        SELECT [MaNV]
        FROM [QL_CongTac].[dbo].[NhanVien]
      `;

    mssql.query(getMaxMaNVQuery)
        .then(result => {
            const maxMaNV = result.recordset[0].MaxMaNV;

            mssql.query(getExistingMaNVsQuery)
                .then(existingResult => {
                    const existingMaNVs = existingResult.recordset.map(row => row.MaNV);

                    let nextMaNV = maxMaNV ? maxMaNV + 1 : 1;

                    while (existingMaNVs.includes(nextMaNV.toString())) {
                        nextMaNV++;
                    }

                    const insertQuery = `
                INSERT INTO [QL_CongTac].[dbo].[NhanVien] (
                  [MaNV],
                  [BoPhanID],
                  [ChucVuID],
                  [HoTen],
                  [NgaySinh],
                  [Email],
                  [SoDT],
                  [NgayVaoLam],
                  [NgayCapNhat]
                ) VALUES (
                  '${nextMaNV}',
                  '${BoPhanID}',
                  '${ChucVuID}',
                  N'${HoTen}',
                  '${NgaySinh}',
                  '${Email}',
                  '${SoDT}',
                  '${NgayVaoLam}',
                  '${NgayCapNhat}'
                )
              `;

                    mssql.query(insertQuery)
                        .then(result => {
                            console.log('Đã thêm nhân viên thành công');
                            res.status(200).json({ message: 'Đã thêm nhân viên thành công' });
                        })
                        .catch(err => {
                            console.error('Lỗi khi thêm nhân viên:', err);
                            res.status(500).json({ error: 'Lỗi khi thêm nhân viên vào SQL Server' });
                        });
                })
                .catch(err => {
                    console.error('Lỗi khi truy vấn dữ liệu:', err);
                    res.status(500).json({ error: 'Lỗi khi truy vấn dữ liệu' });
                });
        })
        .catch(err => {
            console.error('Lỗi khi truy vấn dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi khi truy vấn dữ liệu' });
        });
});

router.put('/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const {
        MaNV,
        BoPhanID,
        ChucVuID,
        HoTen,
        NgaySinh,
        Email,
        SoDT,
        NgayVaoLam,
        NgayCapNhat
    } = req.body;

    const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[NhanVien] WHERE id = '${id}'`;
    mssql.connect(dbConfig, (err) => {
        if (err) {
            console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
            return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
        }

        const request = new mssql.Request();
        request.query(checkExistQuery, (err, resultExist) => {
            if (err) {
                console.error('Lỗi khi kiểm tra sự tồn tại của nhân viên:', err);
                return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của nhân viên trong SQL Server' });
            }

            const count = resultExist.recordset[0].Count;
            if (count == 0) {
                return res.status(404).json({ error: 'Không tìm thấy thông tin nhân viên cần cập nhật' });
            }

            const updateQuery = `
          UPDATE [dbo].[NhanVien]
          SET MaNV = '${MaNV}', BoPhanID = '${BoPhanID}', ChucVuID = '${ChucVuID}', HoTen = N'${HoTen}', NgaySinh = '${NgaySinh}', Email = '${Email}', SoDT = '${SoDT}', 
          NgayVaoLam = '${NgayVaoLam}', NgayCapNhat = '${NgayCapNhat}' WHERE id = '${id}'`;
            request.query(updateQuery, (err, resultUpdate) => {
                if (err) {
                    console.error('Lỗi khi cập nhật thông tin nhân viên:', err);
                    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin nhân viên vào SQL Server' });
                }
                return res.status(200).json({ message: 'Cập nhật thông tin nhân viên thành công' });
            });
        });
    });
});

router.delete('/admin/users/:id', (req, res) => {
    const { id } = req.params;

    const deleteQuery = `
      DELETE FROM [QL_CongTac].[dbo].[NhanVien]
      WHERE [id] = '${id}'
    `;

    mssql.query(deleteQuery)
        .then(result => {
            res.status(200).json({ message: `Đã xóa thông tin nhân viên có mã: ${id}` });
        })
        .catch(err => {
            console.error('Lỗi khi xóa thông tin nhân viên:', err);
            res.status(500).json({ error: 'Lỗi khi xóa thông tin nhân viên từ SQL Server' });
        });
});

module.exports = router;