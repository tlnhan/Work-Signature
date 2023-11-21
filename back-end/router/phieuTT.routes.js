const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/phieuthanhtoan', async (req, res) => {
    try {
        const result = await mssql.query('SELECT * FROM PhieuThanhToan');
        res.json(result.recordset);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu thanh toán:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

router.post('/phieuthanhtoan', (req, res) => {
    const {
        MaPhieuThanhToan,
        PhieuCongTacID,
        SoTien,
        NguoiXinTT_ID,
        NguoiXinThanhToan,
        NoiDungThanhToan,
        TuaDeThanhToan,
        NguoiThuHuong,
        STK,
        NganHang,
        NgayTao,
        NgayCapNhat,
      } = req.body;
    
      const TrangThai = 0;
    
      const insertQuery = `
        INSERT INTO [QL_CongTac].[dbo].[PhieuThanhToan] (
          [MaPhieuThanhToan],
          [PhieuCongTacID],
          [SoTien],
          [NguoiXinTT_ID],
          [NguoiXinThanhToan],
          [NoiDungThanhToan],
          [TuaDeThanhToan],
          [NguoiThuHuong],
          [STK],
          [NganHang],
          [NgayTao],
          [NgayCapNhat],
          [TrangThai]
        ) VALUES (
          '${MaPhieuThanhToan}',
          '${PhieuCongTacID}',
          '${SoTien}',
          '${NguoiXinTT_ID}',
          N'${NguoiXinThanhToan}',
          N'${NoiDungThanhToan}',
          N'${TuaDeThanhToan}',
          N'${NguoiThuHuong}',
          '${STK}',
          N'${NganHang}',
          '${NgayTao}',
          '${NgayCapNhat}',
          '${TrangThai}'
        )
      `;
    
      mssql.query(insertQuery)
        .then(result => {
          const insertPheDuyetQuery = `
          INSERT INTO [QL_CongTac].[dbo].[PheDuyet] (MaPhieu, NgayCapNhat, NguoiDuyetID, NoiDung, TrangThai, LoaiPhieu)
          VALUES ('${MaPhieuThanhToan}', GETDATE(), '', N'Cập nhật thành công', N'Chưa duyệt', N'Phiếu Thanh Toán')
        `;
    
          mssql.query(insertPheDuyetQuery)
            .then(result => {
              res.status(200).json({ message: 'Đã thêm dữ liệu và PheDuyet thành công' });
            })
            .catch(err => {
              console.error('Lỗi khi thêm dữ liệu vào PheDuyet:', err);
              res.status(500).json({ error: 'Lỗi khi thêm dữ liệu vào PheDuyet trong SQL Server' });
            });
        })
        .catch(err => {
          console.error('Lỗi khi thêm phiếu thanh toán:', err);
          res.status(500).json({ error: 'Lỗi khi thêm phiếu thanh toán vào SQL Server' });
        });
});

module.exports = router;