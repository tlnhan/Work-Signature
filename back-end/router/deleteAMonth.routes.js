const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/', (req, res) => {
  
});

router.post('/', (req, res) => {
   
});

router.put('/', (req, res) => {
  
});

router.delete('/admin/phieucongtac', async (req, res) => {
    try {
        const today = moment();
        const oneMonthAgo = today.clone().subtract(1, 'months');
    
        const query = `
          SELECT * FROM [QL_CongTac].[dbo].[PhieuCongTac]
          WHERE [NgayCapNhat] <= '${oneMonthAgo.format('YYYY-MM-DD HH:mm:ss')}'
        `;
    
        const result = await mssql.query(query);
        const phieuCongTacToDelete = result.recordset;
    
        if (phieuCongTacToDelete.length == 0) {
          return res.status(404).json({ message: 'Không có phiếu công tác nào cần xóa' });
        }
    
        for (const phieu of phieuCongTacToDelete) {
          const deleteQuery = `
            DELETE FROM [QL_CongTac].[dbo].[PhieuCongTac]
            WHERE [MaPhieuCongTac] = '${phieu.MaPhieuCongTac}'
          `;
    
          await mssql.query(deleteQuery);
        }
    
        return res.status(200).json({ message: `Đã xóa ${phieuCongTacToDelete.length} phiếu công tác có NgayCapNhat >= 1 tháng` });
      } catch (error) {
        console.error('Lỗi khi xóa phiếu công tác:', error);
        res.status(500).json({ error: 'Lỗi khi xóa phiếu công tác từ SQL Server' });
      }
});

module.exports = router;