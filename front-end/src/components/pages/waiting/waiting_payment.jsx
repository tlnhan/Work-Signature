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

const pageLink = {
    backgroundColor: colors.secondary,
    color: 'white'
}

function formatDateToDDMMYYYY(isoDateString) {
    const isoDate = new Date(isoDateString);
    const day = isoDate.getUTCDate().toString().padStart(2, '0');
    const month = (isoDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = isoDate.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

const ITEMS_PER_PAGE = 15;

function WaitingPaymentPage() {
    const [MaPhieuThanhToan, setMaPhieuThanhToan] = useState('');
    const [MaPhieuThanhToanData, setMaPhieuThanhToanData] = useState(null);
    const [phieuThanhToanList, setPhieuThanhToanList] = useState([]);
    const [NgayTao, setNgayTao] = useState('');
    const [NgayCapNhat, setNgayCapNhat] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editedPhieuThanhToan, setEditedPhieuThanhToan] = useState(null);
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
            .then((response) => setPhieuThanhToanList(response.data))
            .catch((error) => console.error('Lỗi khi lấy danh sách phiếu thanh toán:', error));
    }, [currentPage]);

    const handleDeleteThanhToanClick = (PhieuThanhToanID) => {
        axios
            .delete(`http://localhost:8080/api/phieuthanhtoanid/${PhieuThanhToanID}`)
            .then((response) => {
                axios.get('http://localhost:8080/api/phieuthanhtoan')
                    .then((response) => setPhieuThanhToanList(response.data))
                    .catch((error) => console.error('Lỗi khi lấy danh sách phiếu công tác:', error));
            })
            .catch((error) => {
                console.error('Lỗi khi xóa phiếu công tác:', error);
            });
    }

    const createTableThanhToanHtml = (data) => {
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

    const handleViewThanhToanClick = async (phieuThanhToan) => {
        const phieuThanhToanId = phieuThanhToan.MaPhieuThanhToan;

        try {
            const response = await axios.get(`http://localhost:8080/api/phieuthanhtoanid/${phieuThanhToanId}`);
            const ctPhieuThanhToanList = response.data;

            const tableHtml = createTableThanhToanHtml(phieuThanhToan);
            const ctTableHtml = createCTTableHtml(ctPhieuThanhToanList);

            Swal.fire({
                icon: 'info',
                title: 'Thông tin phiếu công tác:',
                html: `
                    ${tableHtml}
                    <h5 class="mt-4">Chi tiết phiếu công tác:</h5>
                    ${ctTableHtml}
                `,
                showCancelButton: false,
                confirmButtonText: 'Đóng',
                confirmButtonColor: colors.primary,
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chi tiết phiếu thanh toán:', error);
        }
    };

    function createCTTableHtml(ctDataList) {
        let html = `
        <form id="ctForm" style="text-align: left;">
            <div class="mb-3">
    `;

        if (ctDataList.length > 0) {
            ctDataList.forEach((ctData) => {
                html += `
                <div class="form-group">
                    <label class="mt-2" for="MaChiTiet_${ctData.MaChiTiet}" style="display: block; text-align: left;">Mã thanh toán:</label>
                    <input class="form-control mt-1" readOnly id="MaChiTiet_${ctData.MaChiTiet}" name="MaChiTiet_${ctData.MaChiTiet}" value="${ctData.MaThanhToan}" >
                </div>
                <div class="form-group">
                    <label class="mt-2" for="LoaiChiPhi_${ctData.MaChiTiet}" style="display: block; text-align: left;">Loại chi phí:</label>
                    <input class="form-control mt-1" readOnly id="LoaiChiPhi_${ctData.MaChiTiet}" name="LoaiChiPhi_${ctData.MaChiTiet}" value="${ctData.LoaiChiPhi}" >
                </div>
                <div class="form-group">
                    <label class="mt-2" for="ChiPhi_${ctData.MaChiTiet}" style="display: block; text-align: left;">Chi phí:</label>
                    <input class="form-control mt-1" readOnly id="ChiPhi_${ctData.MaChiTiet}" name="ChiPhi_${ctData.MaChiTiet}" value="${ctData.ChiPhi}" >
                </div>
                <div class="form-group">
                    <label class="mt-2" for="MoTa_${ctData.MaChiTiet}" style="display: block; text-align: left;">Mô tả:</label>
                    <input class="form-control mt-1" readOnly id="MoTa_${ctData.MaChiTiet}" name="MoTa_${ctData.MaChiTiet}" value="${ctData.MoTa}" >
                </div>
                <div class="form-group">
                    <label class="mt-2" for="MoTa_${ctData.MaChiTiet}" style="display: block; text-align: left;">Hình ảnh:</label>
                    <input class="form-control mt-1" type="tex" multiple readOnly id="HinhAnh_${ctData.MaChiTiet}" name="HinhAnh_${ctData.MaChiTiet}" value="${ctData.HinhAnh}" >
                </div>
            `;
            });
        } else {
            html += `
            <div class="form-group">
                <label class="mt-2">Không có chi tiết phiếu thanh toán.</label>
            </div>
        `;
        }

        html += `
            </div>
        </form>
    `;

        return html;
    }

    const handleEditThanhToanClick = (phieuThanhToan) => {
        setEditedPhieuThanhToan(phieuThanhToan);
        axios.get(`http://localhost:8080/api/phieuthanhtoanid/${phieuThanhToan.MaPhieuThanhToan}`)
            .then((response) => {
                const ctData = response.data[0];
                Swal.fire({
                    title: 'Chỉnh sửa phiếu thanh toán:',
                    html: `
                    <form id="editForm" style="text-align: left;">
                        <div class="form-group">
                            <label for="SoTien">Số tiền:</label>
                            <input type="number" class="form-control" id="SoTien" name="SoTien" value="${phieuThanhToan.SoTien}" />
                        </div>
                        <div class="form-group">
                            <label for="NguoiXinTT_ID">ID người xin thanh toán:</label>
                            <input type="number" class="form-control" id="NguoiXinTT_ID" name="NguoiXinTT_ID" value="${phieuThanhToan.NguoiXinTT_ID}" />
                        </div>
                        <div class="form-group">
                            <label for="NguoiXinThanhToan">Người xin thanh toán:</label>
                            <input type="text" class="form-control" id="NguoiXinThanhToan" name="NguoiXinThanhToan" value="${phieuThanhToan.NguoiXinThanhToan}" />
                        </div>
                        <div class="form-group">
                            <label for="NoiDungThanhToan">Nội dung thanh toán:</label>
                            <input type="text" class="form-control" id="NoiDungThanhToan" name="NoiDungThanhToan" value="${phieuThanhToan.NoiDungThanhToan}" />
                        </div>
                        <div class="form-group">
                            <label for="TuaDeThanhToan">Tựa đề thanh toán:</label>
                            <input type="text" class="form-control" id="TuaDeThanhToan" name="TuaDeThanhToan" value="${phieuThanhToan.TuaDeThanhToan}" />
                        </div>
                        <div class="form-group">
                            <label for="NguoiThuHuong">Người thụ hưởng:</label>
                            <input class="form-control" id="NguoiThuHuong" name="NguoiThuHuong" value="${phieuThanhToan.NguoiThuHuong}" />
                        </div>              
                        <div class="form-group">
                            <label for="STK">Số tài khoản:</label>
                            <input type="text" class="form-control" id="STK" name="STK" value="${phieuThanhToan.STK}" />
                        </div>
                        <div class="form-group">
                            <label for="NganHang">Ngân hàng:</label>
                            <input type="text" class="form-control" id="NganHang" name="NganHang" value="${phieuThanhToan.NganHang}" />
                        </div>
                        <input type="hidden" name="NgayCapNhat" value="${NgayCapNhat}" />
                        <input type="hidden" name="TrangThai" value="${phieuThanhToan.TrangThai}" />
                        <h5 class="mt-4 text-center">Chi tiết phiếu công tác:</h5>
                        <div class="form-group">
                            <label for="MaThanhToan">Mã phiếu thanh toán:</label>
                            <input type="number" class="form-control" readOnly id="MaThanhToan" name="MaThanhToan" value="${ctData.MaThanhToan}" />
                        </div>
                        <div class="form-group">
                            <label for="LoaiChiPhi">Loại chi phí:</label>
                            <input type="text" class="form-control" id="LoaiChiPhi" name="LoaiChiPhi" value="${ctData.LoaiChiPhi}" />
                        </div>
                        <div class="form-group">
                            <label for="ChiPhi">Chi phí:</label>
                            <input type="number" class="form-control" id="ChiPhi" name="ChiPhi" value="${ctData.ChiPhi}" />
                        </div>
                        <div class="form-group">
                            <label for="MoTa">Mô tả:</label>
                            <input type="text" class="form-control" id="MoTa" name="MoTa" value="${ctData.MoTa}" />
                        </div>
                        <div class="form-group">
                            <label class="mt-2" for="HinhAnh" style="display: block; text-align: left;">Hình ảnh:</label>
                            <input readOnly class="form-control mt-1" id="HinhAnh" name="HinhAnh" value="${ctData.HinhAnh}" />
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
                        const updatedPhieuThanhToan = {
                            ...phieuThanhToan,
                            SoTien: formData.get('SoTien'),
                            NguoiXinTT_ID: formData.get('NguoiXinTT_ID'),
                            NguoiXinThanhToan: formData.get('NguoiXinThanhToan'),
                            NoiDungThanhToan: formData.get('NoiDungThanhToan'),
                            TuaDeThanhToan: formData.get('TuaDeThanhToan'),
                            NguoiThuHuong: formData.get('NguoiThuHuong'),
                            STK: formData.get('STK'),
                            NganHang: formData.get('NganHang'),
                            NgayCapNhat: formData.get('NgayCapNhat'),
                            TrangThai: formData.get('TrangThai')
                        };

                        const updatedCTData = {
                            MaThanhToan: formData.get('MaThanhToan'),
                            LoaiChiPhi: formData.get('LoaiChiPhi'),
                            ChiPhi: formData.get('ChiPhi'),
                            MoTa: formData.get('MoTa'),
                            HinhAnh: formData.get('HinhAnh'),
                        };

                        axios
                            .put(`http://localhost:8080/api/chitietphieuthanhtoan/${phieuThanhToan.MaPhieuThanhToan}`, updatedCTData)
                            .then((response) => {

                            })
                            .catch((error) => {
                                console.log(error);
                            });

                        axios
                            .put(`http://localhost:8080/api/phieuthanhtoanid/${phieuThanhToan.MaPhieuThanhToan}`, updatedPhieuThanhToan)
                            .then((response) => {
                                axios.get('http://localhost:8080/api/phieuthanhtoan')
                                    .then((response) => setPhieuThanhToanList(response.data))
                                    .catch((error) => console.error('Lỗi khi lấy danh sách phiếu thanh toán:', error));
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu chi tiết phiếu thanh toán:', error);
                    });
            });
    };


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
                            handleEditThanhToanClick(maPhieuThanhToanData);
                        } else if (result.isDenied) {
                            handleDeleteThanhToanClick(maPhieuThanhToanData.MaPhieuThanhToan);
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
                console.error('Lỗi khi kiểm tra mã phiếu công tác:', error);
                setMaPhieuThanhToanData(null);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: `Mã phiếu thanh toán không được để trống !`,
                    confirmButtonColor: '#DC3545',
                });
            });
    };

    return (
        <div>
            <SidebarUser />
            <div className="d-flex shadow" style={{ height: '200vh', marginLeft: '22rem' }}>
                <div className="container" style={{ maxWidth: '1300px' }}>
                    <div className="container mt-4">
                        <h2 class="text-center" style={{ color: colors.primary }}>Danh sách phiếu thanh toán</h2>
                        <form class="col-3 mt-4 mx-auto" onSubmit={handleSubmit}>
                            <div class="input-group">
                                <input type="search" class="form-control shadow border-end-0" placeholder="Tìm kiếm phiếu thanh toán..."
                                    aria-label="Tìm kiếm phiếu thanh toán..."
                                    value={MaPhieuThanhToan}
                                    onChange={(e) => setMaPhieuThanhToan(e.target.value)} />
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
                                                    <button className="btn me-2 text-white btn-sm shadow border" style={{ backgroundColor: colors.primary }}
                                                        onClick={() => handleViewThanhToanClick(phieuThanhToan)}>
                                                        <i className="fa fa-info" aria-hidden="true"></i>
                                                    </button>
                                                    <button className="btn me-2 text-white btn-sm shadow border" style={{ backgroundColor: colors.secondary }} disabled={phieuThanhToan.TrangThai == 1}
                                                        onClick={() => handleEditThanhToanClick(phieuThanhToan)}>
                                                        <i className="fa fa-pencil" aria-hidden="true"></i>
                                                    </button>
                                                    <button className="btn btn-danger me-2 text-white btn-sm shadow border"
                                                        onClick={() => handleDeleteThanhToanClick(phieuThanhToan.MaPhieuThanhToan)} disabled={phieuThanhToan.TrangThai == 1}>
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
                        <div className="d-flex flex-column align-items-center mt-3" style={{ position: 'fixed', bottom: '20px', left: '60%', transform: 'translateX(-50%)' }}>
                            <nav>
                                <ul className="pagination">
                                    {[...Array(totalThanhToanPages)].map((_, index) => (
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

export default WaitingPaymentPage;
