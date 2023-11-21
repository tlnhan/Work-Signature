import React, { useState, useEffect } from 'react'
import colors from '../../colors'
import useAuth from '../../components/auth/userAuth'
import swal from 'sweetalert'
import { useNavigate } from 'react-router-dom'
import jwt_decode from 'jwt-decode'

const imgLogoBrand = {
    maxWidth: '50%',
    height: 'auto',
    border: `2px solid '${colors.primary}'`,
    borderRadius: '7px'
}

function SidebarAdmin() {
    const { loggedIn, handleLogout } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
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
            setTaiKhoanID(decoded.TaiKhoanID);
            setUsername(decoded.username);
        }
    }, []);

    return (
        <nav id="sidebar" style={{
            position: 'fixed', top: 0, bottom: 0, left: 0, width: '300px', padding: '20px',
            backgroundColor: colors.primary, color: 'white', fontSize: '15px', boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.2)'
        }}>
            <div className="text-center mb-4">
                <h3 className='mt-3'>HSV.iOffice</h3>
            </div>
            <hr className='text-white mb-4'></hr>
            <div className="mb-4">
                <a href="/admin/accounts" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-key me-2" aria-hidden="true"></i>Tài khoản
                    </div>
                </a>
            </div>
            <hr className='text-white mb-4'></hr>
            <div className="mb-4">
                <a href="/admin/users" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-users me-2" aria-hidden="true"></i>Nhân viên
                    </div>
                </a>
            </div>
            <hr className='text-white mb-4'></hr>
            <div className="mb-4">
                <a href="/admin/manager" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-bars me-2" aria-hidden="true"></i>Danh mục
                    </div>
                </a>
            </div>
            <hr className='text-white mb-4'></hr>
            <div className="mb-4">
                <a href="/admin/job_ap" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-envelope me-2" aria-hidden="true"></i>Phiếu công tác
                    </div>
                </a>
            </div>
            <hr className='text-white mb-4'></hr>
            <div className="mb-4">
                <a href="/admin/payment" className="nav-link">
                    <div className="nav-item">
                        <i className="fa fa-credit-card-alt me-2" aria-hidden="true"></i>Phiếu thanh toán
                    </div>
                </a>
            </div>
            <hr className='text-white mb-4'></hr>
            <div className=" mb-4">
                <a href="/admin/history" className="nav-link">
                    <div className="nav-item">
                        <i class="fa fa-history me-2" aria-hidden="true"></i>Trình ký phiếu công - thanh
                    </div>
                </a>
            </div>
            <div style={{
                position: 'absolute', left: 0, bottom: '0px', fontSize: '15px', width: '250px', padding: '20px', color: 'white',
            }}>
                {loggedIn && (
                    <div>
                        {taiKhoanID && (
                            <div className="nav-item mb-4">
                                <i className="fa fa-id-card me-2" aria-hidden="true"></i>
                                ID tài khoản: {taiKhoanID}
                            </div>
                        )}
                        <hr className='text-white mb-4'></hr>
                        {username && (
                            <div className="nav-item mb-4">
                                <i className="fa fa-user me-2" aria-hidden="true"></i>Tên tài khoản: {username}
                            </div>
                        )}
                        <hr className='text-white mb-4'></hr>
                        <a href="#" className="nav-link" onClick={handleLogoutClick}>
                            <div className="nav-item">
                                <i className="fa fa-sign-out me-2" aria-hidden="true"></i>Đăng xuất
                            </div>
                        </a>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default SidebarAdmin