import React, { useState, useEffect } from 'react'
import SidebarAdmin from '../../structure/sb_admin'
import colors from '../../../colors'
import moment from 'moment'
import axios from 'axios'
import Swal from 'sweetalert2'

const pageLink = {
    backgroundColor: colors.secondary,
    color: 'white'
}

const btnSearch = {
    backgroundColor: colors.primary,
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

function AdminUsersPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [NgayTao, setNgayTao] = useState('');
    const [NgayCapNhat, setNgayCapNhat] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [editedUsers, setEditedUsers] = useState(null);
    const totalPages = Math.ceil(usersList.length / ITEMS_PER_PAGE);

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

    const getUsersItemsForCurrentPage = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return usersList.slice(startIndex, endIndex);
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
        axios.get('http://localhost:8080/api/admin/users')
            .then((response) => setUsersList(response.data))
            .catch((error) => console.error('Lỗi khi lấy danh sách chức vụ:', error));
    }, [currentPage]);

    // THÊM XOÁ SỬA PHÍ USERS

    const handleAddUsers = async () => {
        setEditedUsers();

        const chucVuResponse = await axios.get('http://localhost:8080/api/admin/chucvu');
        const chucVuList = chucVuResponse.data;

        const boPhanResponse = await axios.get('http://localhost:8080/api/admin/bophan');
        const boPhanList = boPhanResponse.data;

        Swal.fire({
            title: `Thêm nhân viên:`,
            html: `
                    <form id="editForm" style="text-align: left;">
                        <div class="form-group">
                            <input type="hidden" class="form-control" id="MaNV" name="MaNV"></input>
                        </div>
                        <div class="form-group">
                            <label for="BoPhanID">ID bộ phận:</label>
                            <select class="form-control" id="BoPhanID" name="BoPhanID">
                                ${boPhanList.map(boPhan =>
                                `<option value="${boPhan.BoPhanID}">${boPhan.BoPhanID} - ${boPhan.NguoiQuanLy} - ${boPhan.TenBP} - ${boPhan.SoDT}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="ChucVuID">ID chức vụ:</label>
                            <select class="form-control" id="ChucVuID" name="ChucVuID">
                                 ${chucVuList.map(chucVu => `<option value="${chucVu.id}">${chucVu.id} - ${chucVu.ChucVu}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="HoTen">Họ và tên:</label>
                            <input type="text" class="form-control" id="HoTen" name="HoTen"></input>
                        </div>
                        <div class="form-group">
                            <label for="NgaySinh">Ngày tháng năm sinh:</label>
                            <input type="date" class="form-control" id="NgaySinh" name="NgaySinh"></input>
                        </div>
                        <div class="form-group">
                            <label for="Email">Email:</label>
                            <input type="email" class="form-control" id="Email" name="Email"></input>
                        </div>
                        <div class="form-group">
                            <label for="SoDT">Số điện thoại:</label>
                            <input type="text" class="form-control" id="SoDT" name="SoDT"></input>
                        </div>
                        <div class="form-group">
                            <label for="NgayVaoLam">Ngày vào làm:</label>
                            <input type="date" class="form-control" id="NgayVaoLam" name="NgayVaoLam"></input>
                        </div>
                        <input type="hidden" class="form-control" id="NgayCapNhat" name="NgayCapNhat" value="${NgayCapNhat}" />
                    </form>
                `,
            onBeforeOpen: () => {
                // Tạo mã nhân viên mới
                generateNextMaNV().then(nextMaNV => {
                    document.getElementById('MaNV').value = nextMaNV;
                });
            },
            showCancelButton: true,
            confirmButtonText: 'Tạo nhân viên',
            confirmButtonColor: colors.primary,
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData(document.getElementById('editForm'));
                const updatedUsers = {
                    MaNV: formData.get('MaNV'),
                    BoPhanID: formData.get('BoPhanID'),
                    ChucVuID: formData.get('ChucVuID'),
                    HoTen: formData.get('HoTen'),
                    NgaySinh: formData.get('NgaySinh'),
                    Email: formData.get('Email'),
                    SoDT: formData.get('SoDT'),
                    NgayVaoLam: formData.get('NgayVaoLam'),
                    NgayCapNhat: formData.get('NgayCapNhat')
                };
                axios
                    .post(`http://localhost:8080/api/admin/users`, updatedUsers)
                    .then((response) => {
                        axios.get('http://localhost:8080/api/admin/users')
                            .then((response) => setUsersList(response.data))
                            .catch((error) => console.error('Lỗi khi lấy danh sách nhân viên:', error));
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        });
    }

    const generateNextMaNV = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/users');
            const existingMaNVs = response.data.map(user => user.MaNV);

            const maxExistingMaNV = Math.max(...existingMaNVs.map(maNV => parseInt(maNV, 10)));
            let nextMaNV = 1;

            for (let i = 1; i <= maxExistingMaNV; i++) {
                if (!existingMaNVs.includes(i.toString())) {
                    nextMaNV = i;
                    break;
                }
            }

            return nextMaNV.toString();
        } catch (error) {
            console.error('Lỗi khi lấy danh sách mã nhân viên:', error);
            return '';
        }
    };

    const handleEditUsersClick = async (users) => {
        setEditedUsers(users);

        const prevChucVuID = users.ChucVuID;
        const prevBoPhanID = users.BoPhanID;

        const chucVuResponse = await axios.get('http://localhost:8080/api/admin/chucvu');
        const chucVuList = chucVuResponse.data;

        const boPhanResponse = await axios.get('http://localhost:8080/api/admin/bophan');
        const boPhanList = boPhanResponse.data;

        Swal.fire({
            title: `Chỉnh sửa thông tin nhân viên ${users.HoTen}:`,
            html: `
            <form id="editForm" style="text-align: left;">
                <div class="form-group">
                    <label for="MaNV">Mã nhân viên:</label>
                    <input type="text" class="form-control" id="MaNV" name="MaNV" placeHolder="Vui lòng điền đúng mã nhân viên" value='${users.MaNV}'></input>
                </div>
                <div class="form-group">
                    <label for="BoPhanID">Bộ phận:</label>
                    <select class="form-control" id="BoPhanID" name="BoPhanID">
                        ${boPhanList.map(boPhan => 
                            `<option value="${boPhan.BoPhanID}" ${boPhan.BoPhanID === prevBoPhanID ? 'selected' : ''}>
                            ${boPhan.BoPhanID} - ${boPhan.NguoiQuanLy} - ${boPhan.TenBP} - ${boPhan.SoDT}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="ChucVuID">Chức vụ:</label>
                    <select class="form-control" id="ChucVuID" name="ChucVuID">
                        ${chucVuList.map(chucVu => 
                            `<option value="${chucVu.id}" ${chucVu.id === prevChucVuID ? 'selected' : ''}>${chucVu.id} - ${chucVu.ChucVu}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="HoTen">Họ và tên:</label>
                    <input type="text" class="form-control" id="HoTen" name="HoTen" value='${users.HoTen}'></input>
                </div>
                <div class="form-group">
                    <label for="NgaySinh">Ngày tháng năm sinh:</label>
                    <input type="date" class="form-control" id="NgaySinh" name="NgaySinh" value='${formatDate(users.NgaySinh)}'></input>
                </div>
                <div class="form-group">
                    <label for="Email">Email:</label>
                    <input type="email" class="form-control" id="Email" name="Email" validate value='${users.Email}'></input>
                </div>
                <div class="form-group">
                    <label for="SoDT">Số điện thoại:</label>
                    <input type="text" class="form-control" id="SoDT" name="SoDT" min='0' value='${users.SoDT}'></input>
                </div>
                <div class="form-group">
                    <label for="NgayVaoLam">Ngày vào làm:</label>
                    <input type="date" class="form-control" id="NgayVaoLam" name="NgayVaoLam" value='${formatDate(users.NgayVaoLam)}'></input>
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
                const updatedUsers = {
                    ...users,
                    MaNV: formData.get('MaNV'),
                    BoPhanID: formData.get('BoPhanID'),
                    ChucVuID: formData.get('ChucVuID'),
                    HoTen: formData.get('HoTen'),
                    NgaySinh: formData.get('NgaySinh'),
                    Email: formData.get('Email'),
                    SoDT: formData.get('SoDT'),
                    NgayVaoLam: formData.get('NgayVaoLam'),
                    NgayCapNhat: formData.get('NgayCapNhat')
                };
                axios
                    .put(`http://localhost:8080/api/admin/users/${users.id}`, updatedUsers)
                    .then((response) => {
                        axios.get('http://localhost:8080/api/admin/users')
                            .then((response) => setUsersList(response.data))
                            .catch((error) => console.error('Lỗi khi lấy danh sách nhân viên:', error));
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        });
    };

    const handleDeleteUsersClick = (id) => {
        axios
            .delete(`http://localhost:8080/api/admin/users/${id}`)
            .then(() => {
                axios.get('http://localhost:8080/api/admin/users')
                    .then((response) => setUsersList(response.data))
                    .catch((error) => console.error('Lỗi khi lấy thông tin nhân viên:', error));
            })
            .catch((error) => {
                console.error('Lỗi khi xóa thông tin nhân viên:', error);
            });
    }

    return (
        <div>
            <SidebarAdmin />
            <div className="d-flex shadow border" style={{ height: '100vh', marginLeft: '18rem' }}>
                <div className="container" style={{ maxWidth: '1300px' }}>
                    <div className="container mt-4">
                        <div className="mt-4 text-center container">
                            <h4 style={{ color: colors.primary }}>Danh sách tài khoản nhân viên</h4>
                            <div className="d-flex mt-4">
                                <div className="col-3 mx-auto">
                                    <form class="d-flex">
                                        <div className="input-group">
                                            <input
                                                class="form-control shadow border"
                                                type="search"
                                                placeholder="Tìm kiếm tài khoản..."
                                                aria-label="Search"
                                            />
                                            <button
                                                class="btn shadow btn-sm border"
                                                style={btnSearch}
                                                type="submit"
                                            >
                                                <i class="fa fa-search" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <button
                                    className="btn text-white shadow me-1 btn-sm border"
                                    style={{ backgroundColor: colors.secondary }}
                                    type="submit" onClick={handleAddUsers}>
                                    <i class="fa fa-plus-circle" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                        <hr className='mt-5' />
                        <div className="table-responsive mt-5">
                            <table className="table table-striped shadow border">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Mã NV</th>
                                        <th>ID bộ phận</th>
                                        <th>ID chức vụ</th>
                                        <th>Họ và tên</th>
                                        <th>Email</th>
                                        <th>SĐT</th>
                                        <th>Ngày vào</th>
                                        <th>Ngày cập nhật</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.length > 0 ? (
                                        getUsersItemsForCurrentPage(sortListByStatusAndDate(usersList)).map((users) => (
                                            <tr key={users.id}>
                                                <td>{users.id}</td>
                                                <td>{users.MaNV}</td>
                                                <td>{users.BoPhanID}</td>
                                                <td>{users.ChucVuID}</td>
                                                <td>{users.HoTen}</td>
                                                <td>{users.Email}</td>
                                                <td>{users.SoDT}</td>
                                                <td>{formatDateToDDMMYYYY(users.NgayVaoLam)}</td>
                                                <td>{formatDateToDDMMYYYY(users.NgayCapNhat)}</td>
                                                <td className="d-flex justify-content-end">
                                                    <button className="btn me-2 text-white btn-sm shadow border" style={{ backgroundColor: colors.secondary }} onClick={() => handleEditUsersClick(users)}>
                                                        <i className="fa fa-pencil" aria-hidden="true"></i>
                                                    </button>
                                                    <button className="btn btn-danger me-2 text-white btn-sm shadow border" onClick={() => handleDeleteUsersClick(users.id)}>
                                                        <i className="fa fa-trash" aria-hidden="true"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10">Không có thông tin nhân viên nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-center">
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

export default AdminUsersPage