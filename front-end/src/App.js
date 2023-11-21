import React, { useEffect } from 'react'
import LoginPage from './components/pages/login/login'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Job_Ap_Page from './components/pages/job_ap/job_ap'
import useAuth from './components/auth/userAuth'
import swal from 'sweetalert'
import AdminAccountsPage from './admin/pages/admin_accounts/admin_accounts'
import PaymentPage from './components/pages/payment/payment'
import WaitingJobApPage from './components/pages/waiting/waiting_job_ap'
import AdminJobApPage from './admin/pages/admin_waiting/admin_job_ap'
import AdminPaymentPage from './admin/pages/admin_waiting/admin_payment'
import WaitingPaymentPage from './components/pages/waiting/waiting_payment'
import AdminManagerPage from './admin/pages/admin_manager/admin_manager'
import AdminUsersPage from './admin/pages/admin_users/admin_users'
import HistoryPage from './components/pages/history/history'
import AdminHistoryPage from './admin/pages/admin_history/admin_history'

function App() {
  const { showLoginAlert, setShowLoginAlert } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (showLoginAlert && token === null && window.location.pathname !== '/') {
      swal({
        title: "Hsv.iOffice cho biết:",
        text: "Bạn cần đăng nhập để truy cập vào trang này",
        icon: "warning",
        dangerMode: true,
        buttons: false
      }).then(() => {
        setShowLoginAlert(false);
        navigate('/');
      });
    }

    try {
      const token = localStorage.getItem('role');
      if ((token === 'admin' && !showLoginAlert) && (window.location.pathname === '/job_ap' || window.location.pathname === '/payment' || window.location.pathname === '/waiting/job_ap'
        || window.location.pathname === '/waiting/payment' || window.location.pathname === '/history')) {
        swal({
          title: "Hsv.iOffice cho biết:",
          text: "Bạn không thể truy cập trang này, vui lòng đăng nhập lại",
          icon: "warning",
          dangerMode: true,
          buttons: false
        }).then(() => {
          navigate('/');
        });
      } else if ((token === 'user' && !showLoginAlert) && (window.location.pathname === '/admin/accounts' || window.location.pathname === '/admin/job_ap' ||
        window.location.pathname === '/admin/payment' || window.location.pathname === '/admin/manager' || window.location.pathname === '/admin/users'
        || window.location.pathname === '/admin/history')) {
        swal({
          title: "Hsv.iOffice cho biết:",
          text: "Bạn không thể truy cập trang này, vui lòng đăng nhập lại",
          icon: "warning",
          dangerMode: true,
          buttons: false
        }).then(() => {
          navigate('/');
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [showLoginAlert]);

  return (
    <div>
      <Routes>
        <Route path='/' element={<LoginPage />} />

        <Route path='/job_ap' element={<Job_Ap_Page />} />
        <Route path='/payment' element={<PaymentPage />} />
        <Route path='/waiting/job_ap' element={<WaitingJobApPage />} />
        <Route path='/waiting/payment' element={<WaitingPaymentPage />} />
        <Route path='/history' element={<HistoryPage />} />

        <Route path='/admin/accounts' element={<AdminAccountsPage />} />
        <Route path='/admin/manager' element={<AdminManagerPage />} />
        <Route path='/admin/users' element={<AdminUsersPage />} />
        <Route path='/admin/job_ap' element={<AdminJobApPage />} />
        <Route path='/admin/payment' element={<AdminPaymentPage />} />
        <Route path='/admin/history' element={<AdminHistoryPage />} />
      </Routes>
    </div>
  )
}

export default App;