const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require("../config/database");

router.get('/', (req, res) => {
  
});

router.post('/', (req, res) => {
   
});

router.put('/admin/phieuthanhtoan/:PhieuThanhToanID', async (req, res) => {
    const { PhieuThanhToanID } = req.params;
    const { TrangThai } = req.body;
  
    const updateQuery = `UPDATE [QL_CongTac].[dbo].[PhieuThanhToan] SET TrangThai = '${TrangThai}' WHERE PhieuThanhToanID = '${PhieuThanhToanID}'`;
  
    try {
      const pool = await mssql.connect(dbConfig);
      await pool.request().query(updateQuery);
  
      const selectQuery = `SELECT * FROM [QL_CongTac].[dbo].[PhieuThanhToan] WHERE PhieuThanhToanID = '${PhieuThanhToanID}'`;
      const result = await pool.request().query(selectQuery);
  
      if (result.recordset.length > 0) {
        const phieuThanhToan = result.recordset[0];
  
        const insertQuery = `
          INSERT INTO [QL_CongTac].[dbo].[PheDuyet] (MaPhieu, NgayCapNhat, NguoiDuyetID, NoiDung, TrangThai, LoaiPhieu)
          VALUES ('${phieuThanhToan.MaPhieuThanhToan}', GETDATE(), '', N'Cập nhật thành công', N'Đã duyệt', N'Phiếu Thanh Toán')
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

router.delete('/admin/phieuthanhtoan', async (req, res) => {
    try {
        const today = moment();
        const oneMonthAgo = today.clone().subtract(1, 'months');
    
        const query = `
          SELECT * FROM [QL_CongTac].[dbo].[PhieuThanhToan]
          WHERE [NgayCapNhat] <= '${oneMonthAgo.format('YYYY-MM-DD HH:mm:ss')}'
        `;
    
        const result = await mssql.query(query);
        const phieuThanhToanToDelete = result.recordset;
    
        if (phieuThanhToanToDelete.length == 0) {
          return res.status(404).json({ message: 'Không có phiếu thanh toán nào cần xóa' });
        }
    
        for (const phieu of phieuThanhToanToDelete) {
          const deleteQuery = `
            DELETE FROM [QL_CongTac].[dbo].[PhieuThanhToan]
            WHERE [MaPhieuThanhToan] = '${phieu.MaPhieuThanhToan}'
          `;
    
          await mssql.query(deleteQuery);
        }
    
        return res.status(200).json({ message: `Đã xóa ${phieuThanhToanToDelete.length} phiếu thanh toán có NgayCapNhat >= 1 tháng` });
      } catch (error) {
        console.error('Lỗi khi xóa phiếu thanh toán:', error);
        res.status(500).json({ error: 'Lỗi khi xóa phiếu thanh toán từ SQL Server' });
      }
});

module.exports = router;