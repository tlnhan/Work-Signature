/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useEffect } from "react"
import axios from "axios"
import './login.css'
import colors from '../../../colors'
import Footer from "../../structure/footer/footer"
import swal from 'sweetalert'
import { useNavigate } from "react-router-dom"

const btnLogin = {
    paddingLeft: '2.5rem',
    paddingRight: '2.5rem',
    backgroundColor: colors.primary,
    border: colors.primary,
    borderRadius: '7px'
}

const titleHsv = {
    fontSize: '50px',
    color: colors.primary
}

const checkbox = {
    backgroundColor: colors.primary,
    border: colors.primary
}

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            return swal({
                title: "Hsv.iOffice cho biết:",
                text: "Tài khoản hoặc mật khẩu không được để trống",
                icon: "warning",
                dangerMode: true,
                buttons: false
            });
        }
        axios.post('http://localhost:8080/api/login', { username, password })
            .then(async function (response) {
                localStorage.setItem('token', response.data.token);
                if (response.data.role === 'admin') {
                    navigate('/admin/accounts');
                } else if (response.data.role === 'user') {
                    navigate('/job_ap');
                }
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                swal({
                    title: "Hsv.iOffice cho biết:",
                    text: "Đăng nhập thành công",
                    icon: "success",
                    dangerMode: true,
                    buttons: false
                });
            })
            .catch(function (error) {
                console.log(error);
                swal({
                    title: "Hsv.iOffice cho biết:",
                    text: "Tài khoản hoặc mật khẩu không chính xác",
                    icon: "warning",
                    dangerMode: true,
                    buttons: false
                });
            });
    };

    useEffect(() => {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        const rememberedPassword = localStorage.getItem('rememberedPassword');
        const rememberedRememberMe = localStorage.getItem('rememberedRememberMe');

        if (rememberedUsername) {
            setUsername(rememberedUsername);
        }

        if (rememberedPassword) {
            setPassword(rememberedPassword);
        }

        if (rememberedRememberMe) {
            setRememberMe(rememberedRememberMe === 'true');
        }
    }, []);

    const handleLogin = async () => {
        try {
            const user = { username };
            sessionStorage.setItem('user', JSON.stringify(user));

            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
                localStorage.setItem('rememberedPassword', password);
                localStorage.setItem('rememberedRememberMe', true);
            } else {

                localStorage.removeItem('rememberedUsername');
                localStorage.removeItem('rememberedPassword');
                localStorage.removeItem('rememberedRememberMe');
                setRememberMe(false);
            }
        } catch (error) {
            console.error('Có lỗi khi đăng nhập:', error);
        }
    };

    return (
        <div>
            <section class="vh-100">
                <div class="container-fluid h-custom">
                    <div class="row d-flex justify-content-center align-items-center h-100">
                        <div class="col-md-9 col-lg-6 col-xl-5">
                            <img src="https://www.projectmanager.com/wp-content/uploads/2020/12/201203_Blog_Feature_Work_Management-scaled.jpg"
                                className="img-fluid" alt="Sample image" />
                        </div>
                        <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                            <form onSubmit={handleSubmit}>
                                <div class="divider d-flex align-items-center my-4">
                                    <p class="text-center fw-bold mx-3 mb-0" style={{ ...titleHsv }}>Trình ký công tác</p>
                                </div>
                                <div class="form-outline mb-4">
                                    <input type="text" id="form3Example3" class="form-control form-control-lg shadow"
                                        placeholder="Vui lòng nhập tài khoản..." value={username}
                                        onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div class="form-outline mb-3">
                                    <input type="password" id="inputPassword6" class="form-control form-control-lg shadow" aria-describedby="passwordHelpInline"
                                        placeholder="Vui lòng nhập password..." value={password}
                                        onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="form-check mb-0">
                                        <input class="form-check-input me-2 shadow" type="checkbox" value="" id="form2Example3" style={{ ...checkbox }}
                                            checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                                        <label class="form-check-label" for="form2Example3" style={{ color: colors.primary }}>
                                            Nhớ tài khoản
                                        </label>
                                    </div>
                                </div>
                                <div class="text-center text-lg-start mt-3 d-flex justify-content-center">
                                    <button type="submit" class="btn btn-primary btn-lg w-10 shadow" style={{ ...btnLogin }} onClick={handleLogin} >Đăng nhập</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <Footer />
            </section>
        </div>
    )
}

export default LoginPage