import React, { useState, useEffect } from 'react';
import SidebarUser from '../../structure/navbar/sb_user';
import colors from '../../../colors';
import axios from 'axios';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import moment from 'moment';
import jwt_decode from 'jwt-decode'

const labelTitle = {
  marginTop: '1rem',
};

function formatDate(isoDateString) {
  const isoDate = new Date(isoDateString);
  const day = isoDate.getUTCDate().toString().padStart(2, '0');
  const month = (isoDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = isoDate.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

function PaymentPage() {
  const [MaNV, setMaNV] = useState('');
  const [MaPhieuCongTac, setMaPhieuCongTac] = useState('');
  const [SoTien, setSoTien] = useState('');
  const [NXTTID, setNXTTID] = useState('');
  const [NXTT, setNXTT] = useState('');
  const [TDXTT, setTDXTT] = useState('');
  const [NDXTT, setNDXTT] = useState('');
  const [NTHNH, setNTHNH] = useState('');
  const [STKNH, setSTKNH] = useState('');
  const [TNH, setTNH] = useState('');
  const [NgayTao, setNgayTao] = useState('');
  const [NgayCapNhat, setNgayCapNhat] = useState('');
  const [MoTa, setMoTa] = useState('');
  const [phieuCongTacData, setPhieuCongTacData] = useState(null);
  const [MaThanhToan, setMaThanhToan] = useState('');
  const [image, setImage] = useState(null);
  const [dropdownOptionsChiPhi, setDropdownOptionsChiPhi] = useState([]);
  const [selectedChiPhi, setSelectedChiPhi] = useState('');
  const [selectedChiPhiValue, setSelectedChiPhiValue] = useState('');
  const [dropdownOptionsMaPhieuCongTac, setDropdownOptionsMaPhieuCongTac] = useState([]);
  const [selectedMaPhieuCongTac, setSelectedMaPhieuCongTac] = useState('');
  const [selectedMaPhieuCongTacValue, setSelectedMaPhieuCongTacValue] = useState('');
  const [selectedPhieuCongTacIDValue, setSelectedPhieuCongTacIDValue] = useState('');

  const handleChangeChiPhi = (e) => {
    setSelectedChiPhi(e.target.value);
    const selectedOptionChiPhi = dropdownOptionsChiPhi.find(
      (option) => option.TenLoaiChiPhi === e.target.value
    );
    if (selectedOptionChiPhi) {
      setSelectedChiPhiValue(selectedOptionChiPhi);
      calculateChiPhi(selectedOptionChiPhi.ChiPhi);
    }
  };

  const calculateChiPhi = (chiPhi) => {
    if (chiPhi) {
      const giaTien = chiPhi;
      setSoTien(giaTien);
    }
  };

  const fetchDropdownOptionsChiPhi = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/congtacphi');
      setDropdownOptionsChiPhi(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin phí công tác:', error);
    }
  };

  const handleChangeMaPhieuCongTac = (e) => {
    setSelectedMaPhieuCongTac(e.target.value);
    const selectedOptionMaPhieuCongTac = dropdownOptionsMaPhieuCongTac
      .find(option => option.MaPhieuCongTac == e.target.value);
    if (selectedOptionMaPhieuCongTac) {
      setSelectedMaPhieuCongTacValue(selectedOptionMaPhieuCongTac.MaPhieuCongTac);
      setSelectedPhieuCongTacIDValue(selectedOptionMaPhieuCongTac.PhieuCongTacID);
    }
  };

  const fetchDropdownOptionsMaPhieuCongTac = async (MaNV) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/phieucongtac`);
      const allPhieuCongTac = response.data;

      const filteredPhieuCongTac = allPhieuCongTac.filter((phieuCongTac) => {
        return phieuCongTac.MaNV === MaNV;
      });

      setDropdownOptionsMaPhieuCongTac(filteredPhieuCongTac);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin phiếu công tác:', error);
    }
  };

  const setCurrentDateForNgayTaoAndNgayCapNhat = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    setNgayTao(currentDate);
    setNgayCapNhat(currentDate);
  };

  useEffect(() => {
    fetchDropdownOptionsChiPhi();
    fetchDropdownOptionsMaPhieuCongTac();
    setCurrentDateForNgayTaoAndNgayCapNhat();
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setNXTTID(decoded.MaNV);
      setNXTT(decoded.username);
      setMaNV(decoded.MaNV);
      fetchDropdownOptionsMaPhieuCongTac(decoded.MaNV);
    }
    if (MaPhieuCongTac) {
      setMaThanhToan(MaPhieuCongTac);
    }
    if (MaPhieuCongTac) {
      axios
        .get(`http://localhost:8080/api/maphieucongtac/${MaPhieuCongTac}`)
        .then((response) => {
          const maPhieuCongTacData = response.data;
          if (maPhieuCongTacData) {
            setPhieuCongTacData(maPhieuCongTacData);
          } else {
            setPhieuCongTacData(null);
          }
        })
        .catch((error) => {
          console.error('Lỗi khi kiểm tra mã phiếu công tác:', error);
          setPhieuCongTacData(null);
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !TDXTT ||
      !NDXTT ||
      !NTHNH ||
      !STKNH ||
      !TNH ||
      !STKNH ||
      !MoTa ||
      !image
    ) {
      return swal({
        title: 'Hsv.iOffice cho biết:',
        text: 'Các mục chứa sao không được để trống',
        icon: 'warning',
        dangerMode: true,
        buttons: false
      });
    }

    try {
      await axios.post('http://localhost:8080/api/phieuthanhtoan', {
        MaPhieuThanhToan: selectedMaPhieuCongTacValue,
        PhieuCongTacID: selectedPhieuCongTacIDValue,
        SoTien: SoTien,
        NguoiXinTT_ID: NXTTID,
        NguoiXinThanhToan: NXTT,
        NoiDungThanhToan: NDXTT,
        TuaDeThanhToan: TDXTT,
        NguoiThuHuong: NTHNH,
        STK: STKNH,
        NganHang: TNH,
        NgayTao: NgayTao,
        NgayCapNhat: NgayCapNhat,
      });

      const data = new FormData();
      data.append('file', image);
      data.append('upload_preset', 'hsv-ioffice');
      data.append('cloud_name', 'df2s6srdu');
      data.append('folder', 'hsv-ioffice');

      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/df2s6srdu/image/upload`, {
        method: 'post',
        body: data,
      });

      const cloudinaryData = await cloudinaryResponse.json();
      const imageUrl = await cloudinaryData.url;

      const responsePhieuTTID = await axios.get(`http://localhost:8080/api/phieuthanhtoanid/${selectedPhieuCongTacIDValue}`);

      await axios.post(`http://localhost:8080/api/chitietphieuthanhtoan`, {
        PhieuThanhToanID: responsePhieuTTID.data.PhieuThanhToanID,
        CongTacPhi_id: selectedChiPhiValue.CongTacPhiID,
        LoaiChiPhi: selectedChiPhiValue.TenLoaiChiPhi,
        MoTa: MoTa,
        ChiPhi: selectedChiPhiValue.ChiPhi,
        HinhAnh: imageUrl,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã thêm phiếu thanh toán thành công',
        confirmButtonColor: colors.primary,
        showConfirmButton: true
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Có lỗi khi thêm phiếu thanh toán',
        confirmButtonColor: colors.primary
      });
    }
  };

  return (
    <div>
      <SidebarUser />
      <div className="d-flex align-items-center shadow" style={{ height: 'auto', marginLeft: '17rem' }}>
        <div className="container" style={{ maxWidth: 'auto' }}>
          <p className='text-center' style={labelTitle}><label className='text-danger'>*</label> Vui lòng điền thông tin chính xác để có thể xét duyệt thuận lợi hơn</p>
          <form className='container mt-5' onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" htmlFor="form6Example2">
                    Mã phiếu công tác:<label className="text-danger">*</label>
                  </label>
                  <select
                    id="form6Example2"
                    className="form-select shadow"
                    value={selectedMaPhieuCongTac}
                    onChange={handleChangeMaPhieuCongTac}
                  >
                    <option value="" disabled>
                      Mã phiếu công tác
                    </option>
                    {dropdownOptionsMaPhieuCongTac.map((option, index) => (
                      <option key={index} value={option.MaPhieuCongTac}>
                        Mã PCT: {option.MaPhieuCongTac} - Mã NV: {option.MaNV} - Mục đích: {option.MucDich}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" htmlFor="form6Example2">
                    Phí công tác:<label className="text-danger">*</label>
                  </label>
                  <select
                    id="form6Example2"
                    className="form-select shadow"
                    value={selectedChiPhi}
                    onChange={handleChangeChiPhi}
                  >
                    <option value="" disabled>
                      Loại chi phí
                    </option>
                    {dropdownOptionsChiPhi.map((option, index) => (
                      <option key={index} value={option.TenLoaiChiPhi}>
                        {option.TenLoaiChiPhi} - {option.ChiPhi} VNĐ
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Tựa đề xin thanh toán: <label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={TDXTT}
                    onChange={(e) => setTDXTT(e.target.value)} />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Tên ngân hàng: <label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={TNH}
                    onChange={(e) => setTNH(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example2">Nội dung xin thanh toán: <label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example2" className="form-control shadow" value={NDXTT}
                    onChange={(e) => setNDXTT(e.target.value)} />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Người thụ hưởng ngân hàng: <label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={NTHNH}
                    onChange={(e) => setNTHNH(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example2">Mô tả: <label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example2" className="form-control shadow" value={MoTa}
                    onChange={(e) => setMoTa(e.target.value)} />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example2">Số tài khoản: <label className='text-danger'>*</label></label>
                  <input type="number" id="form6Example2" className="form-control shadow" value={STKNH} min={0}
                    onChange={(e) => setSTKNH(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" htmlFor="form6Example2">Hình ảnh:</label>
                  <input
                    type="file"
                    name="image"
                    id="form6Example2"
                    multiple
                    className="form-control shadow"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" htmlFor="form6Example2">Số tiền:</label>
                  <input
                    type="number"
                    id="form6Example2"
                    className="form-control shadow"
                    value={SoTien}
                    onChange={(e) => setSoTien(e.target.value)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="text-center text-lg-start d-flex justify-content-center">
              <button type="submit" className="btn btn-block mt-4 text-white shadow col-5 mt-4 mx-auto" style={{ backgroundColor: colors.primary }}>
                <i className="fa fa-paper-plane me-2" aria-hidden="true"></i>Gửi đơn đi
              </button>
            </div>
          </form>
        </div>
      </div >
    </div >
  );
}

export default PaymentPage;
