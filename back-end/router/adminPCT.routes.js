const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require("../config/database");

router.put('/admin/phieucongtac/:PhieuCongTacID', async (req, res) => {
    const { PhieuCongTacID } = req.params;
    const { TrangThai } = req.body;
  
    const updateQuery = `UPDATE [QL_CongTac].[dbo].[PhieuCongTac] SET TrangThai = '${TrangThai}' WHERE PhieuCongTacID = '${PhieuCongTacID}'`;
  
    try {
      const pool = await mssql.connect(dbConfig);
      await pool.request().query(updateQuery);
  
      const selectQuery = `SELECT * FROM [QL_CongTac].[dbo].[PhieuCongTac] WHERE PhieuCongTacID = '${PhieuCongTacID}'`;
      const result = await pool.request().query(selectQuery);
  
      if (result.recordset.length > 0) {
        const phieuCongTac = result.recordset[0];
  
        const insertQuery = `
          INSERT INTO [QL_CongTac].[dbo].[PheDuyet] (MaPhieu, NgayCapNhat, NguoiDuyetID, NoiDung, TrangThai, LoaiPhieu)
          VALUES ('${phieuCongTac.MaPhieuCongTac}', GETDATE(), '', N'Cập nhật thành công', N'Đã duyệt', N'Phiếu Công Tác')
        `;
  
        await pool.request().query(insertQuery);
  
        res.status(200).json({ message: 'Cập nhật dữ liệu và thêm vào PheDuyet thành công' });
      } else {
        res.status(404).json({ error: 'Không tìm thấy phiếu công tác' });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật dữ liệu và thêm vào PheDuyet:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật dữ liệu và thêm vào PheDuyet vào SQL Server' });
    }
});

router.delete('/', (req, res) => {
   
});

module.exports = router;