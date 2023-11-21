const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/chitietphieuthanhtoan/:MaThanhToan', async (req, res) => {
    const { MaThanhToan } = req.params;
    try {
      const result = await mssql.query(`SELECT MaThanhToan, LoaiChiPhi, MoTa, ChiPhi, HinhAnh FROM CT_PhieuThanhToan WHERE MaThanhToan = ${MaThanhToan}`);
      res.json(result.recordset);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiếu chi tiết thanh toán:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/chitietphieuthanhtoan/:MaThanhToan', (req, res) => {
  const { MaThanhToan } = req.params;
    const {
      LoaiChiPhi,
      MoTa,
      ChiPhi,
      HinhAnh,
    } = req.body;
  
    const checkExistQuery = `
      SELECT LoaiChiPhi, MoTa, ChiPhi, HinhAnh
      FROM [dbo].[CT_PhieuThanhToan]
      WHERE MaThanhToan = '${MaThanhToan}'`;
    mssql.connect(dbConfig, (err) => {
      if (err) {
        console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
        return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
      }
  
      const request = new mssql.Request();
      request.query(checkExistQuery, (err, resultExist) => {
        if (err) {
          console.error('Lỗi khi kiểm tra sự tồn tại của chi tiết phiếu thanh toán:', err);
          return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của chi thiết phiếu thanh toán trong SQL Server' });
        }
  
        if (resultExist.recordset.length == 0) {
          return res.status(404).json({ error: 'Không tìm thấy chi tiết phiếu thanh toán cần cập nhật' });
        }
  
        const existingCT = resultExist.recordset[0];
        const updateQuery = `
          UPDATE [dbo].[CT_PhieuThanhToan]
          SET LoaiChiPhi = N'${LoaiChiPhi}', ChiPhi = '${ChiPhi}', MoTa = '${MoTa}', HinhAnh = '${HinhAnh}'
          WHERE MaThanhToan = '${MaThanhToan}'`;
  
        request.query(updateQuery, (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Lỗi khi cập nhật thông tin chi tiết phiếu thanh toán:', updateErr);
            return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin chi tiết phiếu thanh toán vào SQL Server' });
          }
          return res.status(200).json({ message: 'Cập nhật thông tin chi tiết phiếu thanh toán thành công', updatedCT: existingCT });
        });
      });
    });
});

module.exports = router;