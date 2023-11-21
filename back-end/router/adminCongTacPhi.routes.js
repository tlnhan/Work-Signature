const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require('../config/database');

router.get('/admin/congtacphi', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT * FROM [QL_CongTac].[dbo].[CongTacPhi]`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy phí công tác', err);
        res.status(500).send('Server Error');
    }
});

router.post('/admin/congtacphi', (req, res) => {
    const {
        TenLoaiChiPhi,
        ChiPhi,
        NgayTao,
        NgayCapNhat
    } = req.body;

    const insertQuery = `
        INSERT INTO [QL_CongTac].[dbo].[CongTacPhi] (
          [TenLoaiChiPhi],
          [ChiPhi],
          [NgayCapNhat],
          [NgayTao]
        ) VALUES (
          N'${TenLoaiChiPhi}',
          '${ChiPhi}',
          '${NgayCapNhat}',
          '${NgayTao}'
        )
      `;

    mssql.query(insertQuery)
        .then(result => {
            console.log('Đã thêm công tác phí thành công thành công');
            res.status(200).json({ message: 'Đã thêm công tác phí thành công' });
        })
        .catch(err => {
            console.error('Lỗi khi thêm chức vụ:', err);
            res.status(500).json({ error: 'Lỗi khi thêm công tác phí vào SQL Server' });
        });
});

router.put('/admin/congtacphi/:CongTacPhiID', (req, res) => {
    const { CongTacPhiID } = req.params;
    const { TenLoaiChiPhi, ChiPhi, NgayTao, NgayCapNhat } = req.body;

    const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[CongTacPhi] WHERE CongTacPhiID = '${CongTacPhiID}'`;
    mssql.connect(dbConfig, (err) => {
        if (err) {
            console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
            return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
        }

        const request = new mssql.Request();
        request.query(checkExistQuery, (err, resultExist) => {
            if (err) {
                console.error('Lỗi khi kiểm tra sự tồn tại của phí công tác:', err);
                return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của phí công tác trong SQL Server' });
            }

            const count = resultExist.recordset[0].Count;
            if (count == 0) {
                return res.status(404).json({ error: 'Không tìm thấy phí công tác cần cập nhật' });
            }

            const updateQuery = `
          UPDATE [dbo].[CongTacPhi]
          SET TenLoaiChiPhi = N'${TenLoaiChiPhi}', ChiPhi = '${ChiPhi}', NgayTao = '${NgayTao}', NgayCapNhat = '${NgayCapNhat}'
          WHERE CongTacPhiID = '${CongTacPhiID}'`;
            request.query(updateQuery, (err, resultUpdate) => {
                if (err) {
                    console.error('Lỗi khi cập nhật thông tin phí công tác:', err);
                    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin phí công tác vào SQL Server' });
                }
                return res.status(200).json({ message: 'Cập nhật thông tin phí công tác thành công' });
            });
        });
    });
});

router.delete('/admin/congtacphi/:CongTacPhiID', (req, res) => {
    const { CongTacPhiID } = req.params;

    const deleteQuery = `
      DELETE FROM [QL_CongTac].[dbo].[CongTacPhi]
      WHERE [CongTacPhiID] = '${CongTacPhiID}'
    `;

    mssql.query(deleteQuery)
        .then(result => {
            res.status(200).json({ message: `Đã xóa phí công tác có mã: ${CongTacPhiID}` });
        })
        .catch(err => {
            console.error('Lỗi khi xóa phí công tác:', err);
            res.status(500).json({ error: 'Lỗi khi xóa phí công tác từ SQL Server' });
        });
});

module.exports = router;