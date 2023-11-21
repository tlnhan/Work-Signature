const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/phieucongtac', async (req, res) => {
    try {
        const result = await mssql.query('SELECT * FROM PhieuCongTac');
        res.json(result.recordset);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu công tác:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

router.post('/phieucongtac', (req, res) => {
    const {
        MaPhieuCongTac,
        MaNV,
        ChungTuID,
        MucDich,
        GiaTien,
        GhiChu,
        NghiepVu,
        NgayDi,
        NgayVe,
        SoNgayDi,
        DiaDiemDi,
        DiaDiemDen,
        NgayTao,
        NgayCapNhat,
        MaNVDC
    } = req.body;

    const TrangThai = 0;

    const checkQuery = `
        SELECT * FROM [QL_CongTac].[dbo].[PhieuCongTac]
        WHERE [MaPhieuCongTac] = N'${MaPhieuCongTac}'
      `;

    mssql.query(checkQuery)
        .then(result => {
            if (result.recordset.length > 0) {
                res.status(400).json({ error: 'Mã phiếu công tác đã tồn tại trong cơ sở dữ liệu' });
            } else {
                const insertQuery = `
              INSERT INTO [QL_CongTac].[dbo].[PhieuCongTac] (
                [MaPhieuCongTac],
                [MaNV],
                [ChungTuID],
                [MucDich],
                [GiaTien],
                [GhiChu],
                [NghiepVu],
                [NgayDi],
                [NgayVe],
                [SoNgayDi],
                [DiaDiemDi],
                [DiaDiemDen],
                [NgayTao],
                [TrangThai],
                [NgayCapNhat],
                [MaNVDiCung]
              ) VALUES (
                '${MaPhieuCongTac}',
                '${MaNV}',
                '${ChungTuID}',
                N'${MucDich}',
                '${GiaTien}',
                N'${GhiChu}',
                N'${NghiepVu}',
                '${NgayDi}',
                '${NgayVe}',
                '${SoNgayDi}',
                N'${DiaDiemDi}',
                N'${DiaDiemDen}',
                '${NgayTao}',
                '${TrangThai}',
                '${NgayCapNhat}',
                '${MaNVDC}'
              )
            `;

                mssql.query(insertQuery)
                    .then(result => {
                        const insertPheDuyetQuery = `
                INSERT INTO [QL_CongTac].[dbo].[PheDuyet] (MaPhieu, NgayCapNhat, NguoiDuyetID, NoiDung, TrangThai, LoaiPhieu)
                VALUES ('${MaPhieuCongTac}', GETDATE(), '', N'Cập nhật thành công', N'Chưa duyệt', N'Phiếu Công Tác')
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
                        console.error('Lỗi khi thêm dữ liệu:', err);
                        res.status(500).json({ error: 'Lỗi khi thêm dữ liệu vào SQL Server' });
                    });
            }
        })
        .catch(err => {
            console.error('Lỗi khi kiểm tra dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi khi kiểm tra dữ liệu trong SQL Server' });
        });
});

module.exports = router;