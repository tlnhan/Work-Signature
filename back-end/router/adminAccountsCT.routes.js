const express = require('express');
const router = express.Router();
const mssql = require('mssql');

router.get('/admin/accounts/:Username', (req, res) => {
    const { Username } = req.params;
    const query = `SELECT * FROM TaiKhoan WHERE Username = '${Username}'`;
    mssql.query(query)
      .then(result => {
        const AccountsData = result.recordset[0];
        res.status(200).json(AccountsData);
      })
      .catch(err => {
        console.error(`Lỗi khi lấy thông tin account ${Username}:`, err);
        res.status(500).json({ error: `Lỗi khi lấy thông tin account ${Username}` });
      });
});

module.exports = router;