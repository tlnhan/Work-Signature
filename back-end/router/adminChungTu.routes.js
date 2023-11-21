const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require('../config/database');

router.get('/admin/chungtu', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
          .query(`SELECT * FROM [QL_CongTac].[dbo].[ChungTu]`);
        res.json(result.recordset);
      } catch (err) {
        console.error('Lỗi lấy chứng từ', err);
        res.status(500).send('Server Error');
      }
});

router.post('/admin/chungtu', (req, res) => {
    const {
        LoaiChungTu,
        MaChungTu,
        SoChungTu,
        NguoiTao,
        NgayTao
    } = req.body;

    const insertQuery = `
        INSERT INTO [QL_CongTac].[dbo].[ChungTu] (
          [LoaiChungTu],
          [MaChungTu],
          [SoChungTu],
          [NguoiTao],
          [NgayTao]
        ) VALUES (
          N'${LoaiChungTu}',
          '${MaChungTu}',
          '${SoChungTu}',
          N'${NguoiTao}',
          '${NgayTao}'
        )
      `;

    mssql.query(insertQuery)
        .then(result => {
            console.log('Đã thêm chứng từ thành công');
            res.status(200).json({ message: 'Đã thêm chứng từ thành công' });
        })
        .catch(err => {
            console.error('Lỗi khi thêm chức vụ:', err);
            res.status(500).json({ error: 'Lỗi khi thêm chứng từ vào SQL Server' });
        });
});

router.put('/admin/chungtu/:ChungTuID', (req, res) => {
    const { ChungTuID } = req.params;
    const { LoaiChungTu, MaChungTu, SoChungTu, NguoiTao, NgayTao } = req.body;
  
    const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[ChungTu] WHERE ChungTuID = '${ChungTuID}'`;
    mssql.connect(dbConfig, (err) => {
      if (err) {
        console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
        return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
      }
  
      const request = new mssql.Request();
      request.query(checkExistQuery, (err, resultExist) => {
        if (err) {
          console.error('Lỗi khi kiểm tra sự tồn tại của chứng từ:', err);
          return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của chứng từ trong SQL Server' });
        }
  
        const count = resultExist.recordset[0].Count;
        if (count == 0) {
          return res.status(404).json({ error: 'Không tìm thấy chứng từ cần cập nhật' });
        }
  
        const updateQuery = `
          UPDATE [dbo].[ChungTu]
          SET LoaiChungTu = N'${LoaiChungTu}', MaChungTu = '${MaChungTu}', SoChungTu = '${SoChungTu}', NguoiTao = N'${NguoiTao}', NgayTao = '${NgayTao}'
          WHERE ChungTuID = '${ChungTuID}'`;
        request.query(updateQuery, (err, resultUpdate) => {
          if (err) {
            console.error('Lỗi khi cập nhật thông tin chứng từ:', err);
            return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin chứng từ vào SQL Server' });
          }
          return res.status(200).json({ message: 'Cập nhật thông tin chứng từ thành công' });
        });
      });
    });
});

router.delete('/admin/chungtu/:ChungTuID', (req, res) => {
    const { ChungTuID } = req.params;

    const deleteQuery = `
      DELETE FROM [QL_CongTac].[dbo].[ChungTu]
      WHERE [ChungTuID] = '${ChungTuID}'
    `;
  
    mssql.query(deleteQuery)
      .then(result => {
        res.status(200).json({ message: `Đã xóa chứng từ có mã: ${ChungTuID}` });
      })
      .catch(err => {
        console.error('Lỗi khi xóa chứng từ:', err);
        res.status(500).json({ error: 'Lỗi khi xóa chứng từ từ SQL Server' });
      });
});

module.exports = router;