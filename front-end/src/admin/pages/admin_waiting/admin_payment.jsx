import React, { useEffect, useState } from 'react'
import SidebarAdmin from '../../structure/sb_admin';
import axios from 'axios';
import Swal from 'sweetalert2';
import colors from '../../../colors';
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

const btnFilter = {
    backgroundColor: colors.secondary,
    color: 'white'
}

const ITEMS_PER_PAGE = 5;

function AdminPaymentPage() {
    const [MaPhieuThanhToan, setMaPhieuThanhToan] = useState('');
    const [MaPhieuThanhToanData, setMaPhieuThanhToanData] = useState(null);
    const [phieuThanhToanList, setPhieuThanhToanList] = useState([]);
    const [NgayTao, setNgayTao] = useState('');
    const [NgayCapNhat, setNgayCapNhat] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const totalThanhToanPages = Math.ceil(phieuThanhToanList.length / ITEMS_PER_PAGE);

    const getThanhToanItemsForCurrentPage = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return phieuThanhToanList.slice(startIndex, endIndex);
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

    useEffect(() => {
        axios.get('http://localhost:8080/api/phieuthanhtoan')
            .then((response) => {
                setPhieuThanhToanList(response.data);
            })
            .catch((error) => console.error('Lỗi khi lấy danh sách phiếu thanh toán:', error));
    }, []);

    const handleViewThanhToanClick = (phieuThanhToan) => {
        const tableHtml = createTableThanhToanHtml(phieuThanhToan);

        Swal.fire({
            icon: 'info',
            title: 'Thông tin phiếu thanh toán:',
            html: tableHtml,
            showConfirmButton: false
        });
    };

    const createTableThanhToanHtml = (data) => {
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

    function updateTrangThaiForPhieuThanhToan(phieuThanhToanID, newTrangThai) {
        axios
            .put(`http://localhost:8080/api/admin/phieuthanhtoan/${phieuThanhToanID}`, { TrangThai: newTrangThai })
            .then((response) => {
                axios.get('http://localhost:8080/api/phieuthanhtoan')
                    .then((response) => {
                        console.log(response.data);
                        setPhieuThanhToanList(response.data);
                    })
                    .catch((error) => console.error('Lỗi khi lấy danh sách phiếu thanh toán:', error));
            })
            .catch((error) => console.error('Lỗi khi cập nhật trạng thái phiếu thanh toán:', error));
    }

    const handleCheckClick = () => {
        axios
            .get(`http://localhost:8080/api/phieuthanhtoanid/${MaPhieuThanhToan}`)
            .then((response) => {
                const maPhieuThanhToanData = response.data;
                if (!maPhieuThanhToanData) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: `Mã phiếu thanh toán ${MaPhieuThanhToan} không tồn tại trong hệ thống !`,
                        showConfirmButton: false,
                    });
                } else {
                    setMaPhieuThanhToanData(maPhieuThanhToanData);

                    const isDuyetDisabled = maPhieuThanhToanData.TrangThai == 1;

                    Swal.fire({
                        icon: 'success',
                        title: 'Thông tin phiếu của bạn:',
                        html: createTableSearchHtml(maPhieuThanhToanData),
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
                            updateTrangThaiForPhieuThanhToan(maPhieuThanhToanData.PhieuThanhToanID, 1);
                            Swal.fire({
                                icon: 'success',
                                title: 'Phiếu thanh toán đã được duyệt!',
                                showConfirmButton: true,
                                confirmButtonColor: colors.primary,
                            });
                        }
                    });
                }
            })
            .catch((error) => {
                console.error('Lỗi khi kiểm tra mã phiếu thanh toán:', error);
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
            .get(`http://localhost:8080/api/phieuthanhtoanid/${MaPhieuThanhToan}`)
            .then((response) => {
                const maPhieuThanhToanData = response.data;
                if (!maPhieuThanhToanData) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: `Mã phiếu thanh toán ${MaPhieuThanhToan} không tồn tại trong hệ thống !`,
                        confirmButtonColor: '#DC3545',
                    });
                } else {
                    axios
                        .get(`http://localhost:8080/api/phieuthanhtoanid/${MaPhieuThanhToan}`);
                }
            })
            .catch((error) => {
                console.error('Lỗi khi kiểm tra mã phiếu thanh toán:', error);
                setMaPhieuThanhToanData(null);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: `Mã phiếu thanh toán không được để trống !`,
                    confirmButtonColor: '#DC3545',
                });
            });
    };

    useEffect(() => {
        axios.get('http://localhost:8080/api/phieuthanhtoan')
            .then((response) => setPhieuThanhToanList(response.data))
            .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
    }, [currentPage]);

    const handleDeleteThanhToanClick = () => {
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
                .delete(`http://localhost:8080/api/admin/phieuthanhtoan`)
                .then(() => {
                    axios.get('http://localhost:8080/api/phieuthanhtoan')
                        .then((response) => setPhieuThanhToanList(response.data))
                        .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
                })
                .catch((error) => {
                    console.error('Lỗi khi xóa phiếu công tác:', error);
                });
        });
    }

    const handleDeleteEachThanhToanClick = (MaPhieuThanhToan) => {
        axios
            .delete(`http://localhost:8080/api/phieuthanhtoanid/${MaPhieuThanhToan}`)
            .then((response) => {
                axios.get('http://localhost:8080/api/phieuthanhtoan')
                    .then((response) => setPhieuThanhToanList(response.data))
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
                            <h4 style={{ color: colors.primary }}>Danh sách phiếu thanh toán</h4>
                            <div className="d-flex mt-4">
                                <div className="col-3 mx-auto">
                                    <form class="d-flex" onSubmit={handleSubmit}>
                                        <div className="input-group">
                                            <input
                                                class="form-control shadow border"
                                                type="search"
                                                placeholder="Tìm kiếm mã phiếu thanh toán..."
                                                aria-label="Search"
                                                value={MaPhieuThanhToan}
                                                onChange={(e) => setMaPhieuThanhToan(e.target.value)}
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
                                    className="btn text-white shadow btn-sm border me-1"
                                    style={{ backgroundColor: colors.danger }}
                                    type="submit"
                                    onClick={handleDeleteThanhToanClick}
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
                                        <th>Mã phiếu thanh toán</th>
                                        <th>Nội dung thanh toán</th>
                                        <th>Người xin thanh toán</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {phieuThanhToanList.length > 0 ? (
                                        getThanhToanItemsForCurrentPage(sortListByStatusAndDate(phieuThanhToanList)).map((phieuThanhToan) => (
                                            <tr key={phieuThanhToan.PhieuThanhToanID}>
                                                <td>{phieuThanhToan.MaPhieuThanhToan}</td>
                                                <td>{phieuThanhToan.NoiDungThanhToan}</td>
                                                <td>{phieuThanhToan.NguoiXinThanhToan}</td>
                                                <td className={phieuThanhToan.TrangThai == 0 ? 'text-danger' : 'text-success'}>
                                                    {phieuThanhToan.TrangThai == 0 ? 'Chưa duyệt' : 'Đã duyệt'}
                                                </td>
                                                <td className="d-flex justify-content-end">
                                                    <button className="btn me-2 text-white shadow border btn-sm" style={{ backgroundColor: colors.secondary }} onClick={() => handleViewThanhToanClick(phieuThanhToan)}>
                                                        <i class="fa fa-info" aria-hidden="true"></i>
                                                    </button>
                                                    <button
                                                        className="btn me-1 text-white shadow border btn-sm"
                                                        style={{ backgroundColor: colors.primary }}
                                                        onClick={() => updateTrangThaiForPhieuThanhToan(phieuThanhToan.PhieuThanhToanID, 1)}
                                                        disabled={phieuThanhToan.TrangThai == 1}
                                                    >
                                                        <i className="fa fa-check" aria-hidden="true"></i>
                                                    </button>
                                                    <button className="btn btn-danger me-2 text-white btn-sm shadow border"
                                                        onClick={() => handleDeleteEachThanhToanClick(phieuThanhToan.MaPhieuThanhToan)}>
                                                        <i className="fa fa-trash" aria-hidden="true"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">Không có phiếu thanh toán nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex justify-content-center mt-3">
                            <nav style={{ position: 'fixed', bottom: '20px' }}>
                                <ul className="pagination">
                                    {[...Array(totalThanhToanPages)].map((_, index) => (
                                        <li key={index} className={`page-item ${currentPage == index + 1 ? 'active' : ''}`}>
                                            <button className="page-link" style={pageLink} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
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

export default AdminPaymentPage