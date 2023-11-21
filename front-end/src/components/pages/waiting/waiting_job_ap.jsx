import React, { useEffect, useState } from 'react';
import SidebarUser from '../../structure/navbar/sb_user';
import axios from 'axios';
import colors from '../../../colors';
import './waiting.css';
import moment from 'moment';
import Swal from 'sweetalert2';

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

const pageLink = {
  backgroundColor: colors.secondary,
  color: 'white'
}

const ITEMS_PER_PAGE = 5;

function WaitingJobApPage() {
  const [MaPhieuCongTac, setMaPhieuCongTac] = useState('');
  const [MaPhieuCongTacData, setMaPhieuCongTacData] = useState(null);
  const [phieuCongTacList, setPhieuCongTacList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editedPhieuCongTac, setEditedPhieuCongTac] = useState(null);
  const [NgayTao, setNgayTao] = useState('');
  const [NgayCapNhat, setNgayCapNhat] = useState('');
  const totalCongTacPages = Math.ceil(phieuCongTacList.length / ITEMS_PER_PAGE);

  const setCurrentDateForNgayTaoAndNgayCapNhat = () => {
    const currentDate = moment().format('DD-MM-YYYY');
    setNgayTao(currentDate);
    setNgayCapNhat(currentDate);
  };

  useEffect(() => {
    setCurrentDateForNgayTaoAndNgayCapNhat();
  }, []);

  const getCongTacItemsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return phieuCongTacList.slice(startIndex, endIndex);
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
        formattedValue = formatDateToDDMMYYYY(value);
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

  const handleViewCongTacClick = (phieuCongTac) => {
    const tableHtml = createTableCongTacHtml(phieuCongTac);
    Swal.fire({
      icon: 'info',
      title: 'Thông tin phiếu công tác:',
      html: tableHtml,
      showConfirmButton: false
    });
  };

  const handleDeleteCongTacClick = (MaPhieuCongTac) => {
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

  const handleEditCongTacClick = (phieuCongTac) => {
    setEditedPhieuCongTac(phieuCongTac);
    Swal.fire({
      title: 'Chỉnh sửa phiếu công tác:',
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="MucDich">Mục đích:</label>
            <input type="text" class="form-control" id="MucDich" name="MucDich" value="${phieuCongTac.MucDich}" ></input>
          </div>
          <div class="form-group">
            <label for="GhiChu">Ghi chú:</label>
            <input type="text" class="form-control" id="GhiChu" name="GhiChu" value="${phieuCongTac.GhiChu}" />
          </div>
          <div class="form-group">
            <label for="NghiepVu">Nghiệp vụ:</label>
            <input type="text" class="form-control" id="NghiepVu" name="NghiepVu" value="${phieuCongTac.NghiepVu}" />
          </div>
          <div class="form-group">
            <label for="NgayDi">Ngày đi:</label>
            <input type="date" class="form-control" id="NgayDi" name="NgayDi" value="${formatDate(phieuCongTac.NgayDi)}" />
          </div>
          <div class="form-group">
            <label for="NgayVe">Ngày về:</label>
            <input type="date" class="form-control" id="NgayVe" name="NgayVe" value="${formatDate(phieuCongTac.NgayVe)}" />
          </div>
          <div class="form-group">
            <label for="SoNgayDi">Số ngày đi:</label>
            <input type="number" class="form-control" id="SoNgayDi" name="SoNgayDi" value="${phieuCongTac.SoNgayDi}" />
          </div>
          <div class="form-group">
            <label for="DiaDiemDi">Địa điểm đi:</label>
            <input type="text" class="form-control" id="DiaDiemDi" name="DiaDiemDi" value="${phieuCongTac.DiaDiemDi}" />
          </div>
          <div class="form-group">
            <label for="DiaDiemDen">Địa điểm đến:</label>
            <input type="text" class="form-control" id="DiaDiemDen" name="DiaDiemDen" value="${phieuCongTac.DiaDiemDen}" />
          </div>
          <input type="hidden" name="NgayCapNhat" value="${NgayCapNhat}" />
          <input type="hidden" name="TrangThai" value="${phieuCongTac.TrangThai}" />
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedPhieuCongTac = {
          ...phieuCongTac,
          MucDich: formData.get('MucDich'),
          GhiChu: formData.get('GhiChu'),
          NghiepVu: formData.get('NghiepVu'),
          NgayDi: formData.get('NgayDi'),
          NgayVe: formData.get('NgayVe'),
          SoNgayDi: formData.get('SoNgayDi'),
          DiaDiemDi: formData.get('DiaDiemDi'),
          DiaDiemDen: formData.get('DiaDiemDen'),
          NgayCapNhat: formData.get('NgayCapNhat'),
          TrangThai: formData.get('TrangThai')
        };
        axios
          .put(`http://localhost:8080/api/maphieucongtac/${phieuCongTac.MaPhieuCongTac}`, updatedPhieuCongTac)
          .then((response) => {
            axios.get('http://localhost:8080/api/phieucongtac')
              .then((response) => setPhieuCongTacList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

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
            showDenyButton: true,
            denyButtonText: 'Xoá',
            denyButtonColor: colors.danger,
            showConfirmButton: true,
            confirmButtonText: 'Chỉnh sửa',
            confirmButtonColor: colors.primary,
            didOpen: () => {
              const confirmButton = Swal.getConfirmButton();
              const denyButton = Swal.getDenyButton();
              if (confirmButton && denyButton && isDuyetDisabled) {
                confirmButton.setAttribute('disabled', 'true');
                denyButton.setAttribute('disabled', 'true');
              }
            },
          }).then((result) => {
            if (result.isConfirmed) {
              handleEditCongTacClick(maPhieuCongTacData);
            } else if (result.isDenied) {
              handleDeleteCongTacClick(maPhieuCongTacData.MaPhieuCongTac);
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
            confirmButtonColor: '#DC3545',
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
          confirmButtonColor: '#DC3545',
        });
      });
  };

  return (
    <div>
      <SidebarUser />
      <div className="d-flex shadow" style={{ height: '100vh', marginLeft: '22rem' }}>
        <div className="container" style={{ maxWidth: '1300px' }}>
          <div className="container mt-4">
            <h2 class="text-center" style={{ color: colors.primary }}>Danh sách phiếu công tác</h2>
            <form class="col-3 mt-4 mx-auto" onSubmit={handleSubmit}>
              <div class="input-group">
                <input type="search" class="form-control shadow border-end-0" placeholder="Tìm kiếm phiếu công tác..." aria-label="Tìm kiếm phiếu công tác..."
                  value={MaPhieuCongTac}
                  onChange={(e) => setMaPhieuCongTac(e.target.value)} />
                <button type="submit" class="btn border border-start-0 bg-white" onClick={handleCheckClick}>
                  <i class="fa fa-search" aria-hidden="true"></i>
                </button>
              </div>
            </form>
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
                        <td>{phieuCongTac.MucDich}</td>
                        <td>{phieuCongTac.GhiChu}</td>
                        <td>{phieuCongTac.NghiepVu}</td>
                        <td className={phieuCongTac.TrangThai == 0 ? 'text-danger' : 'text-success'}>
                          {phieuCongTac.TrangThai == 0 ? 'Chưa duyệt' : 'Đã duyệt'}
                        </td>
                        <td className="d-flex justify-content-end">
                          <button className="btn me-2 text-white btn-sm shadow border" style={{ backgroundColor: colors.primary }} onClick={() => handleViewCongTacClick(phieuCongTac)}>
                            <i className="fa fa-info" aria-hidden="true"></i>
                          </button>
                          <button className="btn me-2 text-white btn-sm shadow border" style={{ backgroundColor: colors.secondary }} disabled={phieuCongTac.TrangThai == 1}
                            onClick={() => handleEditCongTacClick(phieuCongTac)}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </button>
                          <button className="btn btn-danger me-2 text-white btn-sm shadow border" onClick={() => handleDeleteCongTacClick(phieuCongTac.MaPhieuCongTac)}
                            disabled={phieuCongTac.TrangThai == 1}>
                            <i className="fa fa-trash" aria-hidden="true"></i>
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
            <div className="d-flex flex-column align-items-center mt-3" style={{ position: 'fixed', bottom: '20px', left: '60%', transform: 'translateX(-50%)' }}>
              <nav>
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

export default WaitingJobApPage;
