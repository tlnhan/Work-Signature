import React, { useState, useEffect } from 'react'
import SidebarAdmin from '../../structure/sb_admin'
import colors from '../../../colors';
import moment from 'moment';
import axios from 'axios';
import Swal from 'sweetalert2';


const pageLink = {
  backgroundColor: colors.secondary,
  color: 'white'
}

// NGÀY THÁNGNG

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

const ITEMS_PER_PAGE = 15;

function AdminManagerPage() {
  const [chucVuList, setChucVuList] = useState([]);
  const [boPhanList, setBoPhanList] = useState([]);
  const [chungTuList, setChungTuList] = useState([]);
  const [phiCongTacList, setPhiCongTacList] = useState([]);
  const [editedChucVu, setEditedChucVu] = useState(null);
  const [editedBoPhan, setEditedBoPhan] = useState(null);
  const [editedChungTu, setEditedChungTu] = useState(null);
  const [editedPhiCongTac, setEditedPhiCongTac] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [NgayTao, setNgayTao] = useState('');
  const [NgayCapNhat, setNgayCapNhat] = useState('');
  const totalPages = Math.ceil((chucVuList.length && boPhanList.length && chungTuList.length && phiCongTacList.length) / ITEMS_PER_PAGE);

  // NGÀY THÁNG

  const setCurrentDateForNgayTaoAndNgayCapNhat = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    setNgayTao(currentDate);
    setNgayCapNhat(currentDate);
  };

  useEffect(() => {
    setCurrentDateForNgayTaoAndNgayCapNhat();
  }, []);

  // TÍNH NĂNG TRANG

  const getChucVuItemsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return chucVuList.slice(startIndex, endIndex);
  };

  const getBoPhanItemsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return boPhanList.slice(startIndex, endIndex);
  };

  const getChungTuItemsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return chungTuList.slice(startIndex, endIndex);
  };

  const getPhiCongTacItemsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return phiCongTacList.slice(startIndex, endIndex);
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
    axios.get('http://localhost:8080/api/admin/chucvu')
      .then((response) => setChucVuList(response.data))
      .catch((error) => console.error('Lỗi khi lấy danh sách chức vụ:', error));

    axios.get('http://localhost:8080/api/admin/bophan')
      .then((response) => setBoPhanList(response.data))
      .catch((error) => console.error('Lỗi khi lấy danh sách bộ phận:', error));

    axios.get('http://localhost:8080/api/admin/chungtu')
      .then((response) => setChungTuList(response.data))
      .catch((error) => console.error('Lỗi khi lấy danh sách chứng từ:', error));

    axios.get('http://localhost:8080/api/admin/congtacphi')
      .then((response) => setPhiCongTacList(response.data))
      .catch((error) => console.error('Lỗi khi lấy danh sách phí công tác:', error));
  }, [currentPage]);

  // THÊM XOÁ SỬA CHỨC VỤ

  const handleAddChucVu = () => {
    setEditedChucVu();
    Swal.fire({
      title: `Thêm chức vụ:`,
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="ChucVu">Chức vụ:</label>
            <input type="text" class="form-control" id="ChucVu" name="ChucVu"></input>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo chức vụ',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedChucVu = {
          ChucVu: formData.get('ChucVu'),
        };
        axios
          .post(`http://localhost:8080/api/admin/chucvu`, updatedChucVu)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/chucvu')
              .then((response) => setChucVuList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách chức vụ:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }

  const handleEditChucVuClick = (chucvu) => {
    setEditedChucVu(chucvu);
    Swal.fire({
      title: `Chỉnh sửa thông tin chức vụ ${chucvu.ChucVu}:`,
      html: `
        <form id="editForm" style="text-align: left;">
        <div class="form-group">
          <label for="id">Chức vụ ID:</label>
          <input type="text" readOnly class="form-control" id="id" name="id" value="${chucvu.id}" ></input>
        </div>
          <div class="form-group">
            <label for="ChucVu">Chức vụ:</label>
            <input type="text" class="form-control" id="ChucVu" name="ChucVu" value="${chucvu.ChucVu}" ></input>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedChucVu = {
          ...chucvu,
          id: formData.get('id'),
          ChucVu: formData.get('ChucVu'),
        };
        axios
          .put(`http://localhost:8080/api/admin/chucvu/${chucvu.id}`, updatedChucVu)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/chucvu')
              .then((response) => setChucVuList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách chức vụ:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleDeleteChucVuClick = (id) => {
    axios
      .delete(`http://localhost:8080/api/admin/chucvu/${id}`)
      .then(() => {
        axios.get('http://localhost:8080/api/admin/chucvu')
          .then((response) => setChucVuList(response.data))
          .catch((error) => console.error('Lỗi khi lấy danh sách chức vụ:', error));
      })
      .catch((error) => {
        console.error('Lỗi khi xóa chức vụ:', error);
      });
  }

  // THÊM XOÁ SỬA BỘ PHẬN

  const handleAddBoPhan = () => {
    setEditedBoPhan();
    Swal.fire({
      title: `Thêm bộ phận:`,
      html: `
        <form id="editForm" style="text-align: left;">
        <div class="form-group">
          <label for="NguoiQuanLy">Người quản lý:</label>
          <input type="text" class="form-control" id="NguoiQuanLy" name="NguoiQuanLy" placeHolder="Vui lòng nhập đúng mã nhân viên người quản lý..."></input>
        </div>
          <div class="form-group">
            <label for="TenBP">Tên bộ phận:</label>
            <input type="text" class="form-control" id="TenBP" name="TenBP"></input>
          </div>
          <div class="form-group">
            <label for="SoDT">Số điện thoại:</label>
            <input type="number" class="form-control" id="SoDT" name="SoDT"></input>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo bộ phận',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedBoPhan = {
          NguoiQuanLy: formData.get('NguoiQuanLy'),
          TenBP: formData.get('TenBP'),
          SoDT: formData.get('SoDT')
        };
        axios
          .post(`http://localhost:8080/api/admin/bophan`, updatedBoPhan)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/bophan')
              .then((response) => setBoPhanList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách bộ phận:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }

  const handleEditBoPhanClick = (bophan) => {
    setEditedBoPhan(bophan);
    Swal.fire({
      title: `Chỉnh sửa thông tin bộ phận ${bophan.TenBP}:`,
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="BoPhanID">Bộ phận ID:</label>
            <input type="number" readOnly class="form-control" id="BoPhanID" name="BoPhanID" value="${bophan.BoPhanID}"></input>
          </div>
          <div class="form-group">
            <label for="NguoiQuanLy">Người quản lý:</label>
            <input type="text" class="form-control" id="NguoiQuanLy" name="NguoiQuanLy" value="${bophan.NguoiQuanLy}" ></input>
          </div>
          <div class="form-group">
            <label for="TenBP">Tên bộ phận:</label>
            <input type="text" class="form-control" id="TenBP" name="TenBP" value="${bophan.TenBP}"></input>
          </div>
          <div class="form-group">
            <label for="SoDT">Số điện thoại:</label>
            <input type="number" class="form-control" id="SoDT" name="SoDT" value="${bophan.SoDT}"></input>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedBoPhan = {
          ...bophan,
          BoPhanID: formData.get('BoPhanID'),
          NguoiQuanLy: formData.get('NguoiQuanLy'),
          TenBP: formData.get('TenBP'),
          SoDT: formData.get('SoDT')
        };
        axios
          .put(`http://localhost:8080/api/admin/bophan/${bophan.BoPhanID}`, updatedBoPhan)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/bophan')
              .then((response) => setBoPhanList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách bộ phận:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleDeleteBoPhanClick = (BoPhanID) => {
    axios
      .delete(`http://localhost:8080/api/admin/bophan/${BoPhanID}`)
      .then(() => {
        axios.get('http://localhost:8080/api/admin/bophan')
          .then((response) => setBoPhanList(response.data))
          .catch((error) => console.error('Lỗi khi lấy danh sách bộ phận:', error));
      })
      .catch((error) => {
        console.error('Lỗi khi xóa bộ phận:', error);
      });
  }

  // THÊM XOÁ SỬA CHỨNG TỪ

  const handleAddChungTu = () => {
    setEditedChungTu();
    Swal.fire({
      title: `Thêm chứng từ:`,
      html: `
        <form id="editForm" style="text-align: left;">
        <div class="form-group">
          <label for="LoaiChungTu">Loại chứng từ:</label>
          <input type="text" class="form-control" id="LoaiChungTu" name="LoaiChungTu"></input>
        </div>
          <div class="form-group">
            <label for="MaChungTu">Mã chứng từ:</label>
            <input type="text" class="form-control" id="MaChungTu" name="MaChungTu"></input>
          </div>
          <div class="form-group">
            <label for="SoChungTu">Số chứng từ:</label>
            <input type="number" class="form-control" id="SoChungTu" name="SoChungTu"></input>
          </div>
          <div class="form-group">
            <label for="NguoiTao">Người tạo:</label>
            <input type="text" class="form-control" id="NguoiTao" name="NguoiTao"></input>
          </div>
          <input type="hidden" class="form-control" id="NgayTao" name="NgayTao" value="${formatDate(NgayTao)}" />
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo chứng từ',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedChungTu = {
          LoaiChungTu: formData.get('LoaiChungTu'),
          MaChungTu: formData.get('MaChungTu'),
          SoChungTu: formData.get('SoChungTu'),
          NguoiTao: formData.get('NguoiTao'),
          NgayTao: formData.get('NgayTao')
        };
        axios
          .post(`http://localhost:8080/api/admin/chungtu`, updatedChungTu)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/chungtu')
              .then((response) => setChungTuList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách chứng từ:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }

  const handleEditChungTuClick = (chungtu) => {
    setEditedChungTu(chungtu);
    Swal.fire({
      title: `Chỉnh sửa thông tin chứng từ ${chungtu.LoaiChungTu}:`,
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="LoaiChungTu">Loại chứng từ:</label>
            <input type="text" class="form-control" id="LoaiChungTu" name="LoaiChungTu" value="${chungtu.LoaiChungTu}"></input>
          </div>
          <div class="form-group">
            <label for="MaChungTu">Mã chứng từ:</label>
            <input type="text" class="form-control" id="MaChungTu" name="MaChungTu" value="${chungtu.MaChungTu}"></input>
          </div>
          <div class="form-group">
            <label for="SoChungTu">Số chứng từ:</label>
            <input type="number" class="form-control" id="SoChungTu" name="SoChungTu" value="${chungtu.SoChungTu}"></input>
          </div>
          <div class="form-group">
            <label for="NguoiTao">Người tạo:</label>
            <input type="text" class="form-control" id="NguoiTao" name="NguoiTao" value="${chungtu.NguoiTao}"></input>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedChungTu = {
          ...chungtu,
          LoaiChungTu: formData.get('LoaiChungTu'),
          MaChungTu: formData.get('MaChungTu'),
          SoChungTu: formData.get('SoChungTu'),
          NguoiTao: formData.get('NguoiTao')
        };
        axios
          .put(`http://localhost:8080/api/admin/chungtu/${chungtu.ChungTuID}`, updatedChungTu)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/chungtu')
              .then((response) => setChungTuList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách chứng từ:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleDeleteChungTuClick = (ChungTuID) => {
    axios
      .delete(`http://localhost:8080/api/admin/chungtu/${ChungTuID}`)
      .then(() => {
        axios.get('http://localhost:8080/api/admin/chungtu')
          .then((response) => setChungTuList(response.data))
          .catch((error) => console.error('Lỗi khi lấy danh sách chứng từ:', error));
      })
      .catch((error) => {
        console.error('Lỗi khi xóa chứng từ:', error);
      });
  }

  // THÊM XOÁ SỬA PHÍ CÔNG TÁC

  const handleAddPhiCongTac = () => {
    setEditedPhiCongTac();
    Swal.fire({
      title: `Thêm phí công tác:`,
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="TenLoaiChiPhi">Tên loại chi phí:</label>
            <input type="text" class="form-control" id="TenLoaiChiPhi" name="TenLoaiChiPhi"></input>
          </div>
          <div class="form-group">
              <label for="ChiPhi">Chi phí:</label>
              <input type="text" class="form-control" id="ChiPhi" name="ChiPhi"></input>
          </div>
          <input type="hidden" class="form-control" id="NgayTao" name="NgayTao" value="${formatDate(NgayTao)}" />
          <input type="hidden" class="form-control" id="NgayCapNhat" name="NgayCapNhat" value="${formatDate(NgayCapNhat)}" />
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo phí công tác',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedPhiCongTac = {
          TenLoaiChiPhi: formData.get('TenLoaiChiPhi'),
          ChiPhi: formData.get('ChiPhi'),
          NgayTao: formData.get('NgayTao'),
          NgayCapNhat: formData.get('NgayCapNhat')
        };
        axios
          .post(`http://localhost:8080/api/admin/congtacphi`, updatedPhiCongTac)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/congtacphi')
              .then((response) => setPhiCongTacList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách phí công tác:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }

  const handleEditPhiCongTacClick = (phiCongTac) => {
    setEditedPhiCongTac(phiCongTac);
    Swal.fire({
      title: `Chỉnh sửa thông tin phí công tác ${phiCongTac.TenLoaiChiPhi}:`,
      html: `
        <form id="editForm" style="text-align: left;">
          <div class="form-group">
            <label for="TenLoaiChiPhi">Tên loại chi phí:</label>
            <input type="text" class="form-control" id="TenLoaiChiPhi" name="TenLoaiChiPhi" value="${phiCongTac.TenLoaiChiPhi}"></input>
          </div>
          <div class="form-group">
            <label for="ChiPhi">Chi phí:</label>
            <input type="text" class="form-control" id="ChiPhi" name="ChiPhi" value="${phiCongTac.ChiPhi}"></input>
          </div>
          <input type="hidden" class="form-control" id="NgayCapNhat" name="NgayCapNhat" value="${formatDate(NgayCapNhat)}" />
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      confirmButtonColor: colors.primary,
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedPhiCongTac = {
          ...phiCongTac,
          TenLoaiChiPhi: formData.get('TenLoaiChiPhi'),
          ChiPhi: formData.get('ChiPhi'),
          NgayCapNhat: formData.get('NgayCapNhat')
        };
        axios
          .put(`http://localhost:8080/api/admin/congtacphi/${phiCongTac.CongTacPhiID}`, updatedPhiCongTac)
          .then((response) => {
            axios.get('http://localhost:8080/api/admin/congtacphi')
              .then((response) => setPhiCongTacList(response.data))
              .catch((error) => console.error('Lỗi khi lấy danh sách phí công tác:', error));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleDeletePhiCongTacClick = (CongTacPhiID) => {
    axios
      .delete(`http://localhost:8080/api/admin/congtacphi/${CongTacPhiID}`)
      .then(() => {
        axios.get('http://localhost:8080/api/admin/congtacphi')
          .then((response) => setPhiCongTacList(response.data))
          .catch((error) => console.error('Lỗi khi lấy danh sách phí công tác:', error));
      })
      .catch((error) => {
        console.error('Lỗi khi xóa phí công tác:', error);
      });
  }

  return (
    <div>
      <SidebarAdmin />
      <div className="d-flex shadow border" style={{ height: 'auto', marginLeft: '18rem' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="container mt-4">
            <h4 className='mt-4 text-center' style={{ color: colors.primary }}>Danh sách quản lý chức vụ</h4>
            <div className="d-flex justify-content-end container">
              <div className=''>
                <button className="btn text-white me-1 shadow border btn-sm" style={{ backgroundColor: colors.secondary }} type="submit" onClick={handleAddChucVu}>
                  <i class="fa fa-plus-circle" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <hr className='mt-5' />
            <div className="table-responsive mt-5">
              <table className="table table-striped shadow border">
                <thead>
                  <tr>
                    <th>Chức vụ ID</th>
                    <th>Tên chức vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {chucVuList.length > 0 ? (
                    getChucVuItemsForCurrentPage(sortListByStatusAndDate(chucVuList)).map((chucvu) => (
                      <tr key={chucvu.id}>
                        <td>{chucvu.id}</td>
                        <td>{chucvu.ChucVu}</td>
                        <td className="d-flex justify-content-end">
                          <button className="btn me-2 text-white shadow btn-sm border" style={{ backgroundColor: colors.secondary }} onClick={() => handleEditChucVuClick(chucvu)}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </button>
                          <button className="btn btn-danger me-2 text-white shadow btn-sm border" onClick={() => handleDeleteChucVuClick(chucvu.id)}>
                            <i className="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">Không có danh mục chức vụ nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4 className='mt-4 text-center' style={{ color: colors.primary }}>Danh sách quản lý bộ phận</h4>
            <div className="d-flex justify-content-end container">
              <div className=''>
                <button className="btn text-white me-1 shadow border btn-sm" style={{ backgroundColor: colors.secondary }} type="button" onClick={handleAddBoPhan}>
                  <i class="fa fa-plus-circle" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <hr className='mt-5' />
            <div className="table-responsive mt-5">
              <table className="table table-striped shadow border">
                <thead>
                  <tr>
                    <th>Bộ phận ID</th>
                    <th>Người quản lý</th>
                    <th>Tên bộ phận</th>
                    <th>Số điện thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {boPhanList.length > 0 ? (
                    getBoPhanItemsForCurrentPage(sortListByStatusAndDate(boPhanList)).map((bophan) => (
                      <tr key={bophan.BoPhanID}>
                        <td>{bophan.BoPhanID}</td>
                        <td>{bophan.NguoiQuanLy}</td>
                        <td>{bophan.TenBP}</td>
                        <td>{bophan.SoDT}</td>
                        <td className="d-flex justify-content-end">
                          <button className="btn me-2 text-white shadow btn-sm border" style={{ backgroundColor: colors.secondary }} onClick={() => handleEditBoPhanClick(bophan)}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </button>
                          <button className="btn btn-danger me-2 text-white shadow btn-sm border" onClick={() => handleDeleteBoPhanClick(bophan.BoPhanID)}>
                            <i className="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">Không có danh mục bộ phận nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4 className='mt-4 text-center' style={{ color: colors.primary }}>Danh sách quản lý chứng từ</h4>
            <div className="d-flex justify-content-end container">
              <div className=''>
                <button className="btn text-white shadow border btn-sm me-1" style={{ backgroundColor: colors.secondary }} type="button" onClick={handleAddChungTu}>
                  <i class="fa fa-plus-circle" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <hr className='mt-5' />
            <div className="table-responsive mt-5">
              <table className="table table-striped shadow border">
                <thead>
                  <tr>
                    <th>Chứng từ ID</th>
                    <th>Loại chứng từ</th>
                    <th>Mã chứng từ</th>
                    <th>Số chứng từ</th>
                    <th>Người tạo</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {chungTuList.length > 0 ? (
                    getChungTuItemsForCurrentPage(sortListByStatusAndDate(chungTuList)).map((chungtu) => (
                      <tr key={chungtu.ChungTuID}>
                        <td>{chungtu.ChungTuID}</td>
                        <td>{chungtu.LoaiChungTu}</td>
                        <td>{chungtu.MaChungTu}</td>
                        <td>{chungtu.SoChungTu}</td>
                        <td>{chungtu.NguoiTao}</td>
                        <td>{formatDateToDDMMYYYY(chungtu.NgayTao)}</td>
                        <td className="d-flex justify-content-end">
                          <button className="btn me-2 text-white shadow btn-sm border" style={{ backgroundColor: colors.secondary }}
                            onClick={() => handleEditChungTuClick(chungtu)}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </button>
                          <button className="btn btn-danger me-2 text-white shadow btn-sm border" onClick={() => handleDeleteChungTuClick(chungtu.ChungTuID)}>
                            <i className="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">Không có danh mục chứng từ nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4 className='mt-4 text-center' style={{ color: colors.primary }}>Danh sách quản lý phí công tác</h4>
            <div className="d-flex justify-content-end container">
              <div className=''>
                <button className="btn text-white me-1 shadow border btn-sm" style={{ backgroundColor: colors.secondary }} type="button" onClick={handleAddPhiCongTac}>
                  <i class="fa fa-plus-circle" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <hr className='mt-5' />
            <div className="table-responsive mt-5">
              <table className="table table-striped shadow border">
                <thead>
                  <tr>
                    <th>Công tác phí ID</th>
                    <th>Tên loại chi phí</th>
                    <th>Chi phí</th>
                    <th>Ngày tạo</th>
                    <th>Ngày cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {phiCongTacList.length > 0 ? (
                    getPhiCongTacItemsForCurrentPage(sortListByStatusAndDate(phiCongTacList)).map((phiCongTac) => (
                      <tr key={phiCongTac.CongTacPhiID}>
                        <td>{phiCongTac.CongTacPhiID}</td>
                        <td>{phiCongTac.TenLoaiChiPhi}</td>
                        <td>{phiCongTac.ChiPhi == 0 ? 'Phí ngoài' : phiCongTac.ChiPhi}</td>
                        <td>{formatDateToDDMMYYYY(phiCongTac.NgayTao)}</td>
                        <td>{formatDateToDDMMYYYY(phiCongTac.NgayCapNhat)}</td>
                        <td className="d-flex justify-content-end">
                          <button className="btn me-2 text-white shadow btn-sm border" style={{ backgroundColor: colors.secondary }} onClick={() => handleEditPhiCongTacClick(phiCongTac)}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </button>
                          <button className="btn btn-danger me-2 text-white shadow btn-sm border" onClick={() => handleDeletePhiCongTacClick(phiCongTac.CongTacPhiID)}>
                            <i className="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">Không có danh mục phí công tác nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-center" style={{ marginTop: '100px' }}>
              <nav style={{ position: 'fixed', bottom: '20px' }}>
                <ul className="pagination">
                  {[...Array(totalPages)].map((_, index) => (
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

export default AdminManagerPage