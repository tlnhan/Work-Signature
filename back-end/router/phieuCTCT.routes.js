const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfig = require("../config/database");

router.get('/maphieucongtac/:MaPhieuCongTac', (req, res) => {
  const { MaPhieuCongTac } = req.params;
  const query = `SELECT * FROM PhieuCongTac WHERE MaPhieuCongTac = '${MaPhieuCongTac}'`;
  mssql.query(query)
    .then(result => {
      const MaPhieuCongTacData = result.recordset[0];
      res.status(200).json(MaPhieuCongTacData);
    })
    .catch(err => {
      console.error(`Lỗi khi lấy thông tin Mã Phiếu Công Tác ${MaPhieuCongTac}:`, err);
      res.status(500).json({ error: `Lỗi khi lấy thông tin Mã Phiếu Công Tác ${MaPhieuCongTac}` });
    });
});

router.put('/maphieucongtac/:MaPhieuCongTac', (req, res) => {
  const { MaPhieuCongTac } = req.params;
  const { MucDich, GiaTien, GhiChu, NghiepVu, NgayDi, NgayVe, SoNgayDi, DiaDiemDi, DiaDiemDen, TrangThai } = req.body;

  const checkExistQuery = `SELECT COUNT(*) AS Count FROM [dbo].[PhieuCongTac] WHERE MaPhieuCongTac = '${MaPhieuCongTac}'`;
  mssql.connect(dbConfig, (err) => {
    if (err) {
      console.error('Lỗi khi kết nối cơ sở dữ liệu:', err);
      return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu SQL Server' });
    }

    const request = new mssql.Request();
    request.query(checkExistQuery, (err, resultExist) => {
      if (err) {
        console.error('Lỗi khi kiểm tra sự tồn tại của phiếu công tác:', err);
        return res.status(500).json({ error: 'Lỗi khi kiểm tra sự tồn tại của phiếu công tác trong SQL Server' });
      }

      const count = resultExist.recordset[0].Count;
      if (count == 0) {
        return res.status(404).json({ error: 'Không tìm thấy phiếu công tác cần cập nhật' });
      }

      const updateQuery = `
        UPDATE [dbo].[PhieuCongTac]
        SET MucDich = N'${MucDich}', GiaTien = ${GiaTien}, GhiChu = N'${GhiChu}', NghiepVu = N'${NghiepVu}',
            NgayDi = '${NgayDi}', NgayVe = '${NgayVe}', SoNgayDi = ${SoNgayDi}, DiaDiemDi = N'${DiaDiemDi}',
            DiaDiemDen = N'${DiaDiemDen}', TrangThai = '${TrangThai}'
        WHERE MaPhieuCongTac = '${MaPhieuCongTac}'`;
      request.query(updateQuery, (err, resultUpdate) => {
        if (err) {
          console.error('Lỗi khi cập nhật thông tin phiếu công tác:', err);
          return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin phiếu công tác vào SQL Server' });
        }

        return res.status(200).json({ message: 'Cập nhật thông tin phiếu công tác thành công' });
      });
    });
  });
});

router.delete('/maphieucongtac/:MaPhieuCongTac', (req, res) => {
    const { MaPhieuCongTac } = req.params;

  const deleteQuery = `
    DELETE FROM [QL_CongTac].[dbo].[PhieuCongTac]
    WHERE [MaPhieuCongTac] = '${MaPhieuCongTac}'
  `;

  mssql.query(deleteQuery)
    .then(result => {
      res.status(200).json({ message: `Đã xóa phiếu công tác có mã: ${MaPhieuCongTac}` });
    })
    .catch(err => {
      console.error('Lỗi khi xóa phiếu công tác:', err);
      res.status(500).json({ error: 'Lỗi khi xóa phiếu công tác từ SQL Server' });
    });
});

module.exports = router;