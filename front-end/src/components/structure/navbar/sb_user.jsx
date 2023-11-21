import React, { useState, useEffect } from 'react'
import useAuth from '../../auth/userAuth'
import { useNavigate, Link } from "react-router-dom"
import swal from 'sweetalert'
import colors from '../../../colors'
import Swal from 'sweetalert2'
import jwt_decode from 'jwt-decode'

function SidebarUser() {
    const { loggedIn, handleLogout } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [maNV, setMaNV] = useState(null);
    const [taiKhoanID, setTaiKhoanID] = useState(null);

    const handleLogoutClick = () => {
        handleLogout();
        swal({
            title: "Hsv.iOffice cho biết:",
            text: "Bạn đã đăng xuất thành công",
            icon: "success",
            dangerMode: true,
            buttons: false
        });
        navigate('/');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwt_decode(token);
            setUsername(decoded.username)
            setMaNV(decoded.MaNV);
            setTaiKhoanID(decoded.TaiKhoanID)
        }
    }, []);

    const handleShowEmployeeInfo = () => {
        let employeeInfo = "";

        if (taiKhoanID) {
            employeeInfo += `<div><strong>ID nhân viên:</strong> ${taiKhoanID}</div>`;
        }

        if (maNV) {
            employeeInfo += `<div><strong>Mã nhân viên:</strong> ${maNV}</div>`;
        }

        if (username) {
            employeeInfo += `<div><strong>Tên tài khoản:</strong> ${username}</div>`;
        }

        Swal.fire({
            icon: 'info',
            title: 'Thông tin nhân viên!',
            html: employeeInfo,
            confirmButtonColor: colors.primary,
            confirmButtonText: 'Thoát'
        });
    };

    return (
        <nav id="sidebar" className="sidebar position-fixed top-0 bottom-0 start-0"
            style={{
                width: '250px', padding: '20px', backgroundColor: colors.primary, color: 'white',
                fontSize: '15px', boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.2)',
            }}>
            <div className="text-center mb-3">
            </div>
            <div className="mb-3">
                <button className="btn btn-link nav-link" onClick={handleShowEmployeeInfo}>
                    <div className="nav-item">
                        <i className="fa fa-id-card me-2" aria-hidden="true"></i>Thông tin nhân viên
                    </div>
                </button>
            </div>
            <hr className="text-whitemb-3"></hr>
            <div className="mb-2">
                <Link to="/job_ap" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-envelope me-2" aria-hidden="true"></i>Phiếu công tác
                    </div>
                </Link>
            </div>
            <hr className="text-whitemb-3"></hr>
            <div className="mb-3">
                <Link to="/payment" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-credit-card-alt me-2" aria-hidden="true"></i>Phiếu thanh toán
                    </div>
                </Link>
            </div>
            <hr className='text-whitemb-3'></hr>
            <div className="mb-3">
                <Link to="/waiting/job_ap" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-pencil-square-o me-2" aria-hidden="true"></i>Trạng thái phiếu công tác
                    </div>
                </Link>
            </div>
            <hr className='text-whitemb-3'></hr>
            <div className="mb-3">
                <Link to="/waiting/payment" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-pencil-square me-2" aria-hidden="true"></i>Trạng thái phiếu thanh toán
                    </div>
                </Link>
            </div>
            <hr className='text-whitemb-3'></hr>
            <div className="mb-3">
                <Link to="/history" className="nav-link">
                    <div className="nav-item">
                        <i class="fa fa-history me-2" aria-hidden="true"></i>Trình ký phiếu công - thanh
                    </div>
                </Link>
            </div>
            <div className="position-absolute bottom-0 start-0 p-4 text-white" style={{ width: '250px' }}>
                <hr className='text-whitemb-3'></hr>
                <a href="#" className="nav-link" onClick={handleLogoutClick}>
                    <div className="nav-item">
                        <i className="fa fa-sign-out me-2" aria-hidden="true"></i>Đăng xuất
                    </div>
                </a>
            </div>
        </nav>
    )
}

export default SidebarUser