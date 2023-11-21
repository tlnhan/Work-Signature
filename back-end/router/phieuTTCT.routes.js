const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/phieuthanhtoanid/:PhieuThanhToanID', (req, res) => {
    const { PhieuThanhToanID } = req.params;
    const query = `SELECT * FROM PhieuThanhToan WHERE PhieuCongTacID = '${PhieuThanhToanID}'`;
    mssql.query(query)
      .then(result => {
        const PhieuThanhToanData = result.recordset[0];
        res.status(200).json(PhieuThanhToanData);
      })
      .catch(err => {
        console.error(`Lỗi khi lấy thông tin Mã Phiếu Thanh Toán ${PhieuThanhToanID}:`, err);
        res.status(500).json({ error: `Lỗi khi lấy thông tin Mã Phiếu Thanh Toán ${PhieuThanhToanID}` });
      });
});

router.put('/phieuthanhtoanid/:PhieuThanhToanID', (req, res) => {
    const { PhieuThanhToanID } = req.params;
    const {
      SoTien,
      NguoiXinTT_ID,
      NguoiXinThanhToan,
      NoiDungThanhToan,
      TuaDeThanhToan,
      NguoiThuHuong,
      STK,
      NganHang,
      NgayCapNhat,
      TrangThai,
    } = req.body;
  
    const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[PhieuThanhToan] WHERE PhieuThanhToanID = '${PhieuThanhToanID}'`;
    mssql.connect(dbConfig, (err) => {
      if (err) {
        console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
        return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
      }
  
      const request = new mssql.Request();
      request.query(checkExistQuery, (err, resultExist) => {
        if (err) {
          console.error('Lỗi khi kiểm tra sự tồn tại của phiếu công tác:', err);
          return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của phiếu thanh toán trong SQL Server' });
        }
  
        const count = resultExist.recordset[0].Count;
        if (count == 0) {
          return res.status(404).json({ error: 'Không tìm thấy phiếu công tác cần cập nhật' });
        }
  
        const updateQuery = `
          UPDATE [dbo].[PhieuThanhToan]
          SET SoTien = N'${SoTien}', NguoiXinTT_ID = '${NguoiXinTT_ID}', NguoiXinThanhToan = N'${NguoiXinThanhToan}', NoiDungThanhToan = N'${NoiDungThanhToan}',
              TuaDeThanhToan = '${TuaDeThanhToan}', NguoiThuHuong = '${NguoiThuHuong}', STK = '${STK}', NganHang = N'${NganHang}',
              NgayCapNhat = N'${NgayCapNhat}', TrangThai = '${TrangThai}'
          WHERE PhieuThanhToanID = '${PhieuThanhToanID}'`;
  
        request.query(updateQuery, (updateErr) => {
          if (updateErr) {
            console.error('Lỗi khi cập nhật thông tin phiếu thanh toán:', updateErr);
            return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin phiếu thanh toán vào SQL Server' });
          }
          return res.status(200).json({ message: 'Cập nhật thông tin phiếu thanh toán thành công' });
        });
      });
    });
});

router.delete('/phieuthanhtoanid/:PhieuThanhToanID', (req, res) => {
    const { PhieuThanhToanID } = req.params;

    const deleteQuery = `
      DELETE FROM [QL_CongTac].[dbo].[PhieuThanhToan]
      WHERE [PhieuThanhToanID] = '${PhieuThanhToanID}'
    `;
  
    mssql.query(deleteQuery)
      .then(() => {
        const deleteQueryCTTT = `DELETE FROM CT_PhieuThanhToan WHERE PhieuThanhToanID = '${PhieuThanhToanID}'`;
        return mssql.query(deleteQueryCTTT);
      })
      .then(() => {
        res.status(200).json({ message: `Đã xóa phiếu công tác có mã: ${PhieuThanhToanID}` });
      })
      .catch(err => {
        console.error('Lỗi khi xóa phiếu công tác:', err);
        res.status(500).json({ error: 'Lỗi khi xóa phiếu công tác từ SQL Server' });
      });
});

module.exports = router;