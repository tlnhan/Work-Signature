const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/chitietphieuthanhtoan', async (req, res) => {
  try {
    const result = await mssql.query(`SELECT * FROM CT_PhieuThanhToan`);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phiếu chi tiết thanh toán:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/chitietphieuthanhtoan', (req, res) => {
  const {
    PhieuThanhToanID,
    CongTacPhi_id,
    LoaiChiPhi,
    MoTa,
    ChiPhi,
    HinhAnh
  } = req.body;

  const insertQuery = `
      INSERT INTO [QL_CongTac].[dbo].[CT_PhieuThanhToan] (
        [PhieuThanhToanID],
        [CongTacPhi_id],
        [LoaiChiPhi],
        [MoTa],
        [ChiPhi],
        [HinhAnh]
      ) VALUES (
        '${PhieuThanhToanID}',
        '${CongTacPhi_id}',
        N'${LoaiChiPhi}',
        N'${MoTa}',
        '${ChiPhi}',
        '${HinhAnh}'
      )
    `;

  mssql.query(insertQuery)
    .then(() => {
      res.status(200).json({ message: 'Đã thêm chi tiết phiếu thanh toán thành công' });
    })
    .catch(() => {
      res.status(500).json({ error: 'Lỗi khi thêm chi tiết phiếu thanh toán vào SQL Server' });
    });
});

module.exports = router;