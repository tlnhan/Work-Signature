import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../structure/sb_admin';
import colors from '../../../colors';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';

const pageLink = {
  backgroundColor: colors.secondary,
  color: 'white'
}

const btnSearch = {
  backgroundColor: colors.primary,
  color: 'white'
}

function formatDate(isoDateString) {
  const isoDate = new Date(isoDateString);
  const day = isoDate.getUTCDate().toString().padStart(2, '0');
  const month = (isoDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = isoDate.getUTCFullYear();
  return `${year}-${month}-${day}`;
}

function formatDateToDDMMYYYY(isoDateString) {
  const isoDate = new Date(isoDateString);
  const day = isoDate.getUTCDate().toString().padStart(2, '0');
  const month = (isoDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = isoDate.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

const ITEMS_PER_PAGE = 5;

function AdminAccountsPage() {
  const [Username, setUsername] = useState('');
  const [AccountsData, setAccountsData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [editedAccounts, setEditedAccounts] = useState(null);
  const [NgayTao, setNgayTao] = useState('');
  const [NgayCapNhat, setNgayCapNhat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalAccountPages = Math.ceil(accounts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchAccounts();
  });

  const getAccountsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return accounts.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const sortListByStatusAndDate = (list) => {
    const sortedList = list.sort((a, b) => {
      if (a.TrangThai != b.TrangThai) {
        return a.TrangThai - b.TrangThai;
      }
      return new Date(b.NgayCapNhat) - new Date(a.NgayCapNhat);
    });
    return sortedList;
  };

  const setCurrentDateForNgayTaoAndNgayCapNhat = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    setNgayTao(currentDate);
    setNgayCapNhat(currentDate);
  };

  useEffect(() => {
    setCurrentDateForNgayTaoAndNgayCapNhat();
  }, []);

  const fetchAccounts = () => {
    axios.get('http://localhost:8080/api/admin/accounts')
      .then(response => setAccounts(response.data))
      .catch(error => console.error('Error fetching accounts:', error));
  };

  const handleCheckClick = () => {
    axios
      .get(`http://localhost:8080/api/admin/accounts/${Username}`)
      .then((response) => {
        const AccountsData = response.data;
        if (!AccountsData) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: `Tài khoản ${Username} không tồn tại trong hệ thống !`,
            showConfirmButton: false,
          });
        } else {
          setAccountsData(AccountsData);
          Swal.fire({
            icon: 'success',
            title: 'Thông tin tài khoản của bạn:',
            html: createTableSearchHtml(AccountsData),
            showCancelButton: true,
            cancelButtonText: 'Thoát',
            showDenyButton: true,
            denyButtonText: 'Xoá',
            denyButtonColor: colors.danger,
            showConfirmButton: true,
            confirmButtonText: 'Chỉnh sửa',
            confirmButtonColor: colors.primary
          }).then((result) => {
            if (result.isConfirmed) {
              handleEditAccountsClick(AccountsData.Username);
            } else if (result.isDenied) {
              handleDeleteAccountsClick(AccountsData.Username);
            }
          });
        }
      })
      .catch((error) => {
        console.error('Lỗi khi kiểm tra tài khoản:', error);
      });
  };

  function createTableSearchHtml(data) {
    let html = '<table class="table-responsive d-flex justify-content-center">';
    for (const [key, value] of Object.entries(data)) {
      let formattedValue = value;

      if (['NgayTao', 'NgayCapNhat'].includes(key)) {
        formattedValue = formatDateToDDMMYYYY(value);
      }
      html += `
      <form id="editForm" style="text-align: left;">
        <div class="form-group">
          <label class="mt-2" for="${key}" style="display: block; text-align: left;">${key}:</label>
          <input class="form-control mt-1" readOnly id="${formattedValue}" name="${formattedValue}" value="${formattedValue}" ></input>
        </div>
      </form>
      `;
    }
    html += '</table>';

    return html;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .get(`http://localhost:8080/api/admin/accounts/${Username}`)
      .then((response) => {
        const AccountsData = response.data;
        if (!AccountsData) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: `Tài khoản ${AccountsData} không tồn tại trong hệ thống !`,
            confirmButtonColor: '#DC3545',
          });
        } else {
          axios
            .get(`http://localhost:8080/api/admin/accounts/${Username}`);
        }
      })
      .catch((error) => {
        console.error('Lỗi khi kiểm tra mã phiếu công tác:', error);
        setAccountsData(null);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: `Tài khoản không được để trống !`,
          confirmButtonColor: '#DC3545',
        });
      });
  };

  const handleDeleteAccountsClick = (Username) => {
    axios
      .delete(`http://localhost:8080/api/admin/accounts/${Username}`)
      .then(() => {
        axios.get('http://localhost:8080/api/admin/accounts')
          .then((response) => setAccounts(response.data))
          .catch((error) => console.error('Lỗi khi lấy danh sách tài khoản:', error));
      })
      .catch((error) => {
        console.error('Lỗi khi xóa tài khoản:', error);
      });
  }

  const handleEditAccountsClick = (account) => {
    setEditedAccounts(account);
    Swal.fire({
      title: `Chỉnh sửa thông tin tài khoản ${Username}:`,
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="MaNV">Mã nhân viên:</label>
            <input type="text" class="form-control" id="MaNV" name="MaNV" value="${account.MaNV}" ></input>
          </div>
          <div class="form-group">
            <label for="Username">Tên tài khoản:</label>
            <input type="text" class="form-control" id="Username" name="Username" value="${account.Username}" />
          </div>
          <div class="form-group">
            <label for="Pass">Mật khẩu:</label>
            <input type="password" class="form-control" id="Pass" name="Pass" value="${account.Pass}" />
          </div>
          <div class="form-group">
            <label for="VaiTro">Vai trò:</label>
            <input type="text" class="form-control" id="VaiTro" name="VaiTro" value="${account.VaiTro}" />
          </div>
          <input type="hidden" class="form-control" id="NgayTao" name="NgayTao" value="${formatDate(account.NgayTao)}" />
          <input type="hidden" name="NgayCapNhat" value="${NgayCapNhat}" />
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedAccounts = {
          ...account,
          MaNV: formData.get('MaNV'),
          Username: formData.get('Username'),
          Pass: formData.get('Pass'),
          VaiTro: formData.get('VaiTro'),
          NgayTao: formData.get('NgayTao'),
          NgayCapNhat: formData.get('NgayCapNhat')
        };
        axios
          .put(`http://localhost:8080/api/admin/accounts/${account.Username}`, updatedAccounts)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/accounts')
              .then((response) => setAccounts(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách tài khoản:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const createTableAccountsHtml = (data) => {
    let html = '<table class="table-responsive d-flex justify-content-center">';
    for (const [key, value] of Object.entries(data)) {
      let formattedValue = value;

      if (['NgayTao', 'NgayCapNhat'].includes(key)) {
        formattedValue = formatDateToDDMMYYYY(value);
      }

      html += `
      <form id="editForm" style="text-align: left;">
        <div class="form-group">
          <label class="mt-2" for="${key}" style="display: block; text-align: left;">${key}:</label>
          <input class="form-control mt-1" readOnly id="${formattedValue}" name="${formattedValue}" value="${formattedValue}" ></input>
        </div>
      </form>
      `;
    }
    html += '</table>';
    return html;
  };

  const handleViewAccountsClick = (account) => {
    const tableHtml = createTableAccountsHtml(account);
    Swal.fire({
      icon: 'info',
      title: 'Thông tin tài khoản:',
      html: tableHtml,
      showConfirmButton: false
    });
  };

  const handleAddAccounts = () => {
    setEditedAccounts();
    Swal.fire({
      title: `Thêm tài khoản:`,
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="MaNV">Mã nhân viên:</label>
            <input type="text" class="form-control" id="MaNV" name="MaNV"></input>
          </div>
          <div class="form-group">
            <label for="Username">Tên tài khoản:</label>
            <input type="text" class="form-control" id="Username" name="Username"/>
          </div>
          <div class="form-group">
            <label for="Pass">Mật khẩu:</label>
            <input type="password" class="form-control" id="Pass" name="Pass" />
          </div>
          <div class="form-group">
            <label for="VaiTro">Vai trò:</label>
            <select class="form-control" id="VaiTro" name="VaiTro">
              <option value="admin">admin</option>
              <option value="user">user</option>
            </select>
          </div>
          <input type="hidden" class="form-control" id="NgayTao" name="NgayTao" value="${formatDate(NgayTao)}" />
          <input type="hidden" name="NgayCapNhat" value="${NgayCapNhat}" />
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo tài khoản',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedAccounts = {
          MaNV: formData.get('MaNV'),
          Username: formData.get('Username'),
          Pass: formData.get('Pass'),
          VaiTro: formData.get('VaiTro'),
          NgayTao: formData.get('NgayTao'),
          NgayCapNhat: formData.get('NgayCapNhat')
        };
        axios
          .post(`http://localhost:8080/api/admin/accounts`, updatedAccounts)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/accounts')
              .then((response) => setAccounts(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách tài khoản:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }

  return (
    <div>
      <SidebarAdmin />
      <div className="d-flex shadow border" style={{ height: '100vh', marginLeft: '22rem' }}>
        <div className="container" style={{ maxWidth: '1300px' }}>
          <div className="container mt-4">
            <div className="mt-4 text-center container">
              <h4 style={{ color: colors.primary }}>Danh sách tài khoản nhân viên</h4>
              <div className="d-flex mt-4">
                <div className="col-3 mx-auto">
                  <form class="d-flex" onSubmit={handleSubmit}>
                    <div className="input-group">
                      <input
                        class="form-control shadow border"
                        type="search"
                        placeholder="Tìm kiếm tài khoản..."
                        aria-label="Search"
                        value={Username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <button
                        class="btn shadow btn-sm border"
                        style={btnSearch}
                        type="submit"
                        onClick={handleCheckClick}
                      >
                        <i class="fa fa-search" aria-hidden="true"></i>
                      </button>
                    </div>
                  </form>
                </div>
                <button
                  className="btn text-white me-1 shadow btn-sm border"
                  style={{ backgroundColor: colors.secondary }}
                  type="submit"
                  onClick={handleAddAccounts}
                >
                  <i class="fa fa-plus-circle" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <hr className='mt-5' />
            <div className="table-responsive mt-5">
              <table className="table table-striped shadow border">
                <thead className='border'>
                  <tr>
                    <th>Tài khoản ID</th>
                    <th>Tên tài khoản</th>
                    <th>Ngày tạo</th>
                    <th>Ngày cập nhật</th>
                    <th>Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length > 0 ? (
                    getAccountsForCurrentPage(sortListByStatusAndDate(accounts)).map((account) => (
                      <tr key={account.TaiKhoanID} >
                        <td>{account.TaiKhoanID}</td>
                        <td>{account.Username}</td>
                        <td>{formatDateToDDMMYYYY(account.NgayTao)}</td>
                        <td>{formatDateToDDMMYYYY(account.NgayCapNhat)}</td>
                        <td>{account.VaiTro}</td>
                        <td className="d-flex justify-content-end">
                          <button className="btn me-2 text-white shadow btn-sm border" style={{ backgroundColor: colors.primary }} onClick={() => handleViewAccountsClick(account)}>
                            <i className="fa fa-info" aria-hidden="true"></i>
                          </button>
                          <button className="btn me-2 text-white shadow btn-sm border" style={{ backgroundColor: colors.secondary }}
                            onClick={() => handleEditAccountsClick(account)}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </button>
                          <button className="btn btn-danger me-2 text-white shadow btn-sm border" onClick={() => handleDeleteAccountsClick(account.Username)}>
                            <i className="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">Không có tài khoản nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <nav style={{ position: 'fixed', bottom: '20px' }}>
                <ul className="pagination">
                  {[...Array(totalAccountPages)].map((_, index) => (
                    <li key={index} className={`page-item ${currentPage == index + 1 ? 'active' : ''}`}>
                      <button className="page-link shadow border" style={pageLink} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAccountsPage;
