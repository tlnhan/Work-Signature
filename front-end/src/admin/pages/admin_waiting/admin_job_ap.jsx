import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../structure/sb_admin';
import axios from 'axios';
import colors from '../../../colors';
import Swal from 'sweetalert2';
import moment from 'moment';

function formatDate(isoDateString) {
  const isoDate = new Date(isoDateString);
  const day = isoDate.getUTCDate().toString().padStart(2, '0');
  const month = (isoDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = isoDate.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

const pageLink = {
  backgroundColor: colors.secondary,
  color: 'white'
}

const btnSearch = {
  backgroundColor: colors.primary,
  color: 'white'
}

const ITEMS_PER_PAGE = 15;

function AdminJobApPage() {
  const [MaPhieuCongTac, setMaPhieuCongTac] = useState('');
  const [MaPhieuCongTacData, setMaPhieuCongTacData] = useState(null);
  const [phieuCongTacList, setPhieuCongTacList] = useState([]);
  const [NgayTao, setNgayTao] = useState('');
  const [NgayCapNhat, setNgayCapNhat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalCongTacPages = Math.ceil(phieuCongTacList.length / ITEMS_PER_PAGE);

  const getCongTacItemsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return phieuCongTacList.slice(startIndex, endIndex);
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


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const setCurrentDateForNgayTaoAndNgayCapNhat = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    setNgayTao(currentDate);
    setNgayCapNhat(currentDate);
  };

  useEffect(() => {
    setCurrentDateForNgayTaoAndNgayCapNhat();
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/api/phieucongtac')
      .then((response) => {
        setPhieuCongTacList(response.data);
      })
      .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
  }, []);

  const handleViewCongTacClick = (phieuCongTac) => {
    const tableHtml = createTableCongTacHtml(phieuCongTac);
    Swal.fire({
      icon: 'info',
      title: 'Thông tin phiếu công tác:',
      html: tableHtml,
      showConfirmButton: false
    });
  };

  useEffect(() => {
    axios.get('http://localhost:8080/api/phieucongtac')
      .then((response) => setPhieuCongTacList(response.data))
      .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
  }, [currentPage]);

  const createTableCongTacHtml = (data) => {
    let html = '<table class="table-responsive d-flex justify-content-center">';
    for (const [key, value] of Object.entries(data)) {
      let formattedValue = value;

      if (['NgayTao', 'NgayCapNhat', 'NgayDi', 'NgayVe'].includes(key)) {
        formattedValue = formatDate(value);
      } else if (key == 'TrangThai') {
        formattedValue = value == 1 ? 'Đã duyệt' : 'Chưa duyệt';
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

  function updateTrangThaiForPhieuCongTac(phieuCongTacID, newTrangThai) {
    axios
      .put(`http://localhost:8080/api/admin/phieucongtac/${phieuCongTacID}`, { TrangThai: newTrangThai })
      .then((response) => {
        axios.get('http://localhost:8080/api/phieucongtac')
          .then((response) => {
            console.log(response.data);
            setPhieuCongTacList(response.data);
          })
          .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
      })
      .catch((error) => console.error('Lỗi khi cập nhật trạng thái phiếu công tác:', error));
  }

  const handleCheckClick = () => {
    axios
      .get(`http://localhost:8080/api/MaPhieuCongTac/${MaPhieuCongTac}`)
      .then((response) => {
        const maPhieuCongTacData = response.data;
        if (!maPhieuCongTacData) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: `Mã phiếu công tác ${MaPhieuCongTac} không tồn tại trong hệ thống !`,
            showConfirmButton: false,
          });
        } else {
          setMaPhieuCongTacData(maPhieuCongTacData);

          const isDuyetDisabled = maPhieuCongTacData.TrangThai == 1;

          Swal.fire({
            icon: 'success',
            title: 'Thông tin phiếu của bạn:',
            html: createTableSearchHtml(maPhieuCongTacData),
            showCancelButton: true,
            cancelButtonText: 'Thoát',
            showConfirmButton: true,
            confirmButtonText: 'Duyệt',
            confirmButtonColor: colors.primary,
            didOpen: () => {
              const confirmButton = Swal.getConfirmButton();
              if (confirmButton && isDuyetDisabled) {
                confirmButton.setAttribute('disabled', 'true');
              }
            },
          }).then((result) => {
            if (result.isConfirmed && !isDuyetDisabled) {
              updateTrangThaiForPhieuCongTac(maPhieuCongTacData.PhieuCongTacID, 1);
              Swal.fire({
                icon: 'success',
                title: 'Phiếu công tác đã được duyệt!',
                showConfirmButton: true,
                confirmButtonColor: colors.primary,
              });
            }
          });
        }
      })
      .catch((error) => {
        console.error('Lỗi khi kiểm tra mã phiếu công tác:', error);
      });
  };

  function createTableSearchHtml(data) {
    let html = '<table class="table-responsive d-flex justify-content-center">';
    for (const [key, value] of Object.entries(data)) {
      let formattedValue = value;

      if (['NgayTao', 'NgayCapNhat', 'NgayDi', 'NgayVe'].includes(key)) {
        formattedValue = formatDate(value);
      } else if (key == 'TrangThai') {
        formattedValue = value == 1 ? 'Đã duyệt' : 'Chưa duyệt';
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
      .get(`http://localhost:8080/api/maphieucongtac/${MaPhieuCongTac}`)
      .then((response) => {
        const maPhieuCongTacData = response.data;
        if (!maPhieuCongTacData) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: `Mã phiếu công tác ${MaPhieuCongTac} không tồn tại trong hệ thống !`,
            confirmButtonColor: colors.danger,
          });
        } else {
          axios
            .get(`http://localhost:8080/api/maphieucongtac/${MaPhieuCongTac}`);
        }
      })
      .catch((error) => {
        console.error('Lỗi khi kiểm tra mã phiếu công tác:', error);
        setMaPhieuCongTacData(null);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: `Mã phiếu công tác không được để trống !`,
          confirmButtonColor: colors.danger,
        });
      });
  };

  const handleDeleteCongTacClick = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Lỗi!',
      text: `Nếu tiếp tục, những phiếu công tác đã hơn 1 tháng sẽ bị xoá !`,
      confirmButtonColor: colors.danger,
      confirmButtonText: 'Đồng ý',
      showCancelButton: true,
      cancelButtonText: "Thoát"
    }).then((result) => {
      axios
        .delete(`http://localhost:8080/api/admin/phieucongtac`)
        .then(() => {
          axios.get('http://localhost:8080/api/phieucongtac')
            .then((response) => setPhieuCongTacList(response.data))
            .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
        })
        .catch((error) => {
          console.error('Lỗi khi xóa phiếu công tác:', error);
        });
    });
  }

  const handleDeleteEachCongTacClick = (MaPhieuCongTac) => {
    axios
      .delete(`http://localhost:8080/api/maphieucongtac/${MaPhieuCongTac}`)
      .then(() => {
        axios.get('http://localhost:8080/api/phieucongtac')
          .then((response) => setPhieuCongTacList(response.data))
          .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
      })
      .catch((error) => {
        console.error('Lỗi khi xóa phiếu công tác:', error);
      });
  }

  return (
    <div>
      <SidebarAdmin />
      <div className="d-flex shadow border" style={{ height: '100vh', marginLeft: '18rem' }}>
        <div className="container" style={{ maxWidth: '1300px' }}>
          <div className="container mt-4">
            <div className="mt-4 text-center container">
              <h4 style={{ color: colors.primary }}>Danh sách phiếu công tác</h4>
              <div className="d-flex mt-4">
                <div className="col-3 mx-auto">
                  <form class="d-flex" onSubmit={handleSubmit}>
                    <div className="input-group">
                      <input
                        class="form-control shadow border"
                        type="search"
                        placeholder="Tìm kiếm mã phiếu công tác..."
                        aria-label="Search"
                        value={MaPhieuCongTac}
                        onChange={(e) => setMaPhieuCongTac(e.target.value)}
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
                  className="btn text-white shadow btn-sm border"
                  style={{ backgroundColor: colors.danger }}
                  type="submit"
                  onClick={handleDeleteCongTacClick}
                >
                  <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <hr className='mt-5' />
            <div className="table-responsive mt-5">
              <table className="table table-striped shadow border">
                <thead>
                  <tr>
                    <th>Mã phiếu công tác</th>
                    <th>Chứng từ ID</th>
                    <th>Mục đích</th>
                    <th>Ghi chú</th>
                    <th>Nghiệp vụ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {phieuCongTacList.length > 0 ? (
                    getCongTacItemsForCurrentPage(sortListByStatusAndDate(phieuCongTacList)).map((phieuCongTac) => (
                      <tr key={phieuCongTac.PhieuCongTacID}>
                        <td>{phieuCongTac.MaPhieuCongTac}</td>
                        <td>{phieuCongTac.ChungTuID}</td>
                        <td>{phieuCongTac.GhiChu}</td>
                        <td>{phieuCongTac.NghiepVu}</td>
                        <td>{phieuCongTac.MucDich}</td>
                        <td className={phieuCongTac.TrangThai == 0 ? 'text-danger' : 'text-success'}>
                          {phieuCongTac.TrangThai == 0 ? 'Chưa duyệt' : 'Đã duyệt'}
                        </td>
                        <td className="d-flex justify-content-end">
                          <button className="btn me-2 text-white shadow border btn-sm" style={{ backgroundColor: colors.secondary }} onClick={() => handleViewCongTacClick(phieuCongTac)}>
                            <i class="fa fa-info" aria-hidden="true"></i>
                          </button>
                          <button
                            className="btn me-1 text-white shadow border btn-sm"
                            style={{ backgroundColor: colors.primary }}
                            onClick={() => updateTrangThaiForPhieuCongTac(phieuCongTac.PhieuCongTacID, 1)}
                            disabled={phieuCongTac.TrangThai == 1}
                          >
                            <i className="fa fa-check" aria-hidden="true"></i>
                          </button>
                          <button className="btn me-1 text-white shadow border btn-sm" style={{ backgroundColor: colors.danger }}
                            onClick={() => handleDeleteEachCongTacClick(phieuCongTac.MaPhieuCongTac)}>
                            <i class="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">Không có phiếu công tác nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <nav style={{ position: 'fixed', bottom: '20px' }}>
                <ul className="pagination">
                  {[...Array(totalCongTacPages)].map((_, index) => (
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
  );
}

export default AdminJobApPage;
