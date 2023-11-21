import React, { useState, useEffect } from 'react'
import SidebarUser from '../../structure/navbar/sb_user'
import colors from '../../../colors'
import swal from 'sweetalert'
import Swal from 'sweetalert2'
import axios from 'axios'
import moment from 'moment'
import jwt_decode from 'jwt-decode'

const labelTitle = {
  marginTop: '1rem',
};

function Job_Ap_Page() {
  const [MaPhieuCongTac, setMaPhieuCongTac] = useState('');
  const [MaNV, setMaNV] = useState('');
  const [MaNVDC, setMaNVDC] = useState('');
  const [ChungTuID, setChungTuID] = useState('');
  const [MucDich, setMucDich] = useState('');
  const [GiaTien, setGiaTien] = useState('');
  const [GhiChu, setGhiChu] = useState('');
  const [NghiepVu, setNghiepVu] = useState('');
  const [NgayDi, setNgayDi] = useState('');
  const [NgayVe, setNgayVe] = useState('');
  const [SoNgayDi, setSoNgayDi] = useState('');
  const [DiaDiemDi, setDiaDiemDi] = useState('');
  const [DiaDiemDen, setDiaDiemDen] = useState('');
  const [NgayTao, setNgayTao] = useState('');
  const [NgayCapNhat, setNgayCapNhat] = useState('');
  const [TrangThai, setTrangThai] = useState('');
  const [dropdownOptionsChiPhi, setDropdownOptionsChiPhi] = useState([]);
  const [selectedChiPhi, setSelectedChiPhi] = useState('');
  const [selectedChiPhiValue, setSelectedChiPhiValue] = useState('');
  const [dropdownOptionsChungTu, setDropdownOptionsChungTu] = useState([]);
  const [selectedChungTu, setSelectedChungTu] = useState('');
  const [selectedChungTuValue, setSelectedChungTuValue] = useState('');
  const [dropdownOptionsMaNVDC, setDropdownOptionsMaNVDC] = useState([]);
  const [selectedMaNVDC, setSelectedMaNVDC] = useState('');
  const [selectedMaNVDCValue, setSelectedMaNVDCValue] = useState('');
  const [loading, setLoading] = useState(true);

  const handleChangeMaNVDC = (e) => {
    const selectedValue = e.target.value;
    setSelectedMaNVDC(selectedValue);
    const selectedOptionMaNVDC = dropdownOptionsMaNVDC.find(option => option.MaNVDC == selectedValue);
    if (selectedOptionMaNVDC) {
      setSelectedMaNVDCValue(selectedOptionMaNVDC.MaNVDC);
      setMaNVDC(selectedOptionMaNVDC.MaNVDC);
    };
  }

  useEffect(() => {
    fetchDropdownOptionsMaNVDC();
    fetchDropdownOptionsChungTu();
    fetchDropdownOptionsChiPhi();
    fetchDropdownOptionsChucVu();
    fetchDropdownOptionsBoPhan();
    setCurrentDateForNgayTaoAndNgayCapNhat();
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setMaNV(decoded.MaNV);
      fetchDropdownOptionsMaNVDC(decoded.MaNV);
    }
    generateNextMaPhieuCongTac().then(nextMaPhieuCongTac => {
      setMaPhieuCongTac(nextMaPhieuCongTac);
    });
  }, []);

  const fetchDropdownOptionsMaNVDC = async (currentUserMaNV) => {
    try {
      const response = await axios.get('http://localhost:8080/api/nhanviendicung');
      const filteredOptions = response.data.filter(option => option.MaNV != currentUserMaNV);
      setDropdownOptionsMaNVDC(filteredOptions);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin mã nhân viên đi cùng:', error);
      setLoading(false);
    }
  };

  const handleChangeChungTu = (e) => {
    const selectedValue = e.target.value;
    setSelectedChungTu(selectedValue);
    const selectedOptionChungTu = dropdownOptionsChungTu.find(option => option.LoaiChungTu == selectedValue);
    if (selectedOptionChungTu) {
      setSelectedChungTuValue(selectedOptionChungTu.ChungTuID);
      setChungTuID(selectedOptionChungTu.ChungTuID);
    };
  }

  const fetchDropdownOptionsChungTu = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/chungtu');
      setDropdownOptionsChungTu(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin phí công tác:', error);
    }
  };

  const fetchDropdownOptionsChucVu = async () => {
    try {
      const responseChucVu = await axios.get('http://localhost:8080/api/admin/chucvu');
      const responseDataChucVu = responseChucVu.data;
      return responseDataChucVu;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chức vụ:', error);
    }
  };

  const fetchDropdownOptionsBoPhan = async () => {
    try {
      const responseBoPhan = await axios.get('http://localhost:8080/api/admin/bophan');
      const responseDataBoPhan = responseBoPhan.data;
      return responseDataBoPhan;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin bộ phận:', error);
    }
  };


  const handleChangeChiPhi = (e) => {
    setSelectedChiPhi(e.target.value);
    const selectedOptionChiPhi = dropdownOptionsChiPhi.find(option => option.TenLoaiChiPhi == e.target.value);
    if (selectedOptionChiPhi) {
      setSelectedChiPhiValue(selectedOptionChiPhi.ChiPhi);
      calculateChiPhi(SoNgayDi, selectedOptionChiPhi.ChiPhi);
    }
  };

  const calculateChiPhi = (soNgay, chiPhi) => {
    if (soNgay && chiPhi) {
      const giaTien = soNgay * chiPhi;
      setGiaTien(giaTien);
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

  const setCurrentDateForNgayTaoAndNgayCapNhat = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    setNgayTao(currentDate);
    setNgayCapNhat(currentDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !MucDich ||
      !SoNgayDi ||
      !NghiepVu ||
      !NgayDi ||
      !DiaDiemDi ||
      !DiaDiemDen ||
      !selectedChiPhi ||
      !selectedChungTu
    ) {
      return swal({
        title: 'Hsv.iOffice cho biết:',
        text: 'Các mục chứa sao không được để trống !',
        icon: 'warning',
        dangerMode: true,
        buttons: false
      });
    }

    const oneWeekNow = moment().add(7, 'days');

    if (moment(NgayDi).isBefore(oneWeekNow)) {
      return swal({
        title: 'Hsv.iOffice cho biết:',
        text: 'Ngày đi không được nhỏ hơn 1 tuần !',
        icon: 'warning',
        dangerMode: true,
        buttons: false
      });
    }

    const responseMaNV = await axios.get(`http://localhost:8080/api/checkphieucongtacexist/${MaNV}`);
    
    if (responseMaNV.data || responseMaNV.data.TrangThai === 0) {
      return swal({
        title: 'Hsv.iOffice cho biết:',
        icon: 'warning',
        dangerMode: true,
        buttons: false,
        content: {
          element: 'p',
          attributes: {
            innerHTML: 'Phiếu công tác chưa được duyệt, vui lòng đợi duyệt hoặc xóa phiếu để tạo phiếu mới !',
          },
        },
      });
    }

    try {
      const nextMaPhieuCongTac = await generateNextMaPhieuCongTac();

      await axios.post('http://localhost:8080/api/phieucongtac', {
        MaPhieuCongTac: nextMaPhieuCongTac,
        MaNV: MaNV,
        MaNVDC: selectedMaNVDC,
        ChungTuID,
        MucDich,
        GiaTien,
        GhiChu,
        NghiepVu,
        NgayDi,
        NgayVe,
        SoNgayDi,
        DiaDiemDi,
        DiaDiemDen,
        NgayTao,
        NgayCapNhat,
        TrangThai
      });

      const selectedOptionMaNVDC = dropdownOptionsMaNVDC.find(option => option.MaNV === selectedMaNVDC);
      Swal.fire({
        title: 'Tạo thành công, chi tiết của phiếu là:',
        html: `Mã phiếu công tác: ${nextMaPhieuCongTac}
              <br />Tên nhân viên đi cùng: ${selectedOptionMaNVDC ? selectedOptionMaNVDC.HoTen : ''}
              <br />Chứng từ: ${selectedChungTu}
              <br />Mục đích: ${MucDich}
              <br />Giá tiền: ${GiaTien}
              <br />Ghi chú: ${GhiChu}
              <br />Nghiệp vụ: ${NghiepVu}
              <br />Ngày đi: ${NgayDi}
              <br />Ngày về: ${NgayVe}
              <br />Số ngày đi: ${SoNgayDi}
              <br />Địa điểm đi: ${DiaDiemDi}
              <br />Địa điểm đến: ${DiaDiemDen}
              <br />Ngày tạo: ${NgayTao}
              <br />Ngày cập nhật: ${NgayCapNhat}
              <br />Trạng thái: chưa duyệt`,
        icon: 'success',
        showConfirmButton: true,
        confirmButtonColor: colors.primary,
      });
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      swal({
        title: 'Hsv.iOffice cho biết:',
        text: 'Đã xảy ra lỗi vs phiếu công tác !',
        icon: 'error',
        dangerMode: true,
        buttons: false,
      });
    }
  };

  const generateNextMaPhieuCongTac = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/phieucongtac');
      const existingMaPhieuCongTacs = response.data.map(item => item.MaPhieuCongTac);

      let nextMaPhieuCongTac = 1;
      while (existingMaPhieuCongTacs.includes(nextMaPhieuCongTac.toString())) {
        nextMaPhieuCongTac++;
      }

      return nextMaPhieuCongTac.toString();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách mã phiếu công tác:', error);
      return '';
    }
  };

  const handleNgayDiChange = (e) => {
    setNgayDi(e.target.value);
    const startDate = moment(e.target.value);
    const endDate = startDate.clone().add(SoNgayDi, 'days');
    setNgayVe(endDate.format('YYYY-MM-DD'));
    calculateChiPhi(SoNgayDi, selectedChiPhiValue);
  };

  const handleBlurMaNVDC = async () => {
    const selectedOptionMaNVDC = dropdownOptionsMaNVDC.find(option => option.MaNV == selectedMaNVDC);
    if (selectedOptionMaNVDC) {
      const chucVuList = await fetchDropdownOptionsChucVu();
      const selectedChucVu = chucVuList.find(chucVu => chucVu.id === selectedOptionMaNVDC.ChucVuID);
      const ChucVuToDisplay = selectedChucVu ? selectedChucVu.ChucVu : 'Không có thông tin chức vụ';

      const boPhanList = await fetchDropdownOptionsBoPhan();
      const selectedBoPhan = boPhanList.find(boPhan => boPhan.BoPhanID === selectedOptionMaNVDC.BoPhanID);
      const BoPhanToDisplay = selectedBoPhan ? selectedBoPhan.TenBP : 'Không có thông tin bộ phận';


      Swal.fire({
        title: 'Thông tin chi tiết',
        html: `Mã: ${selectedOptionMaNVDC.MaNV}
              <br />Họ tên: ${selectedOptionMaNVDC.HoTen} 
              <br />Bộ phận: ${BoPhanToDisplay}
              <br />Chức vụ: ${ChucVuToDisplay}
              <br />Email: ${selectedOptionMaNVDC.Email}
              <br/>Số điện thoại: ${selectedOptionMaNVDC.SoDT}`,
        icon: 'info',
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
                  <label className="form-label" for="form6Example2">Mã nhân viên đi cùng: <label className='text-danger'>*</label></label>
                  {loading ? (
                    <p>Đang tải...</p>
                  ) : (
                    <select
                      id="form6Example2"
                      className="form-select shadow"
                      value={selectedMaNVDC}
                      onChange={handleChangeMaNVDC}
                      onBlur={handleBlurMaNVDC}
                    >
                      <option value="" disabled>
                        Mã nhân viên đi cùng
                      </option>
                      {dropdownOptionsMaNVDC.map((option, index) => (
                        <option key={index} value={option.MaNV}>
                          Mã: {option.MaNV} - Tên: {option.HoTen}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example2">ID chứng từ: <label className='text-danger'>*</label></label>
                  <select
                    id="form6Example2"
                    className="form-select shadow"
                    value={selectedChungTu}
                    onChange={handleChangeChungTu}
                  >
                    <option value="" disabled>
                      Loại chứng từ
                    </option>
                    {dropdownOptionsChungTu.map((option, index) => (
                      <option key={index} value={option.LoaiChungTu}>
                        Tên: {option.LoaiChungTu} - Mã: {option.MaChungTu} - Số: {option.SoChungTu}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Mục đích: <label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={MucDich}
                    onChange={(e) => setMucDich(e.target.value)} />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example2">Số ngày đi: <label className='text-danger'>*</label></label>
                  <input type="number" id="form6Example2" className="form-control shadow" value={SoNgayDi} min={2}
                    onChange={(e) => {
                      setSoNgayDi(e.target.value)
                      calculateChiPhi(e.target.value, selectedChiPhiValue)
                    }} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
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
                        {option.TenLoaiChiPhi} - {option.ChiPhi} VND
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Giá tiền:<label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={GiaTien + " VNĐ"} readOnly
                    onChange={(e) => setGiaTien(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Nghiệp vụ:<label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={NghiepVu}
                    onChange={(e) => setNghiepVu(e.target.value)} />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example6">Ngày đi:<label className='text-danger'>*</label></label>
                  <input type="date" id="form6Example6" className="form-control shadow" value={NgayDi}
                    onChange={handleNgayDiChange} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Địa điểm đi:<label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={DiaDiemDi} placeholder='Đường, khu phố, phường, quận, thành phố, nước...'
                    onChange={(e) => setDiaDiemDi(e.target.value)} />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example7">Ngày về:</label>
                  <input type="date" id="form6Example7" className="form-control shadow" value={NgayVe} readOnly
                    onChange={(e) => setNgayVe(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example2">Địa điểm đến:<label className='text-danger'>*</label></label>
                  <input type="text" id="form6Example2" className="form-control shadow" value={DiaDiemDen} placeholder='Đường, khu phố, phường, quận, thành phố, nước...'
                    onChange={(e) => setDiaDiemDen(e.target.value)} />
                </div>
              </div>
              <div className="col">
                <div className="form-outline">
                  <label className="form-label" for="form6Example1">Ghi chú:</label>
                  <input type="text" id="form6Example1" className="form-control shadow" value={GhiChu}
                    onChange={(e) => setGhiChu(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="text-center text-lg-start d-flex justify-content-center">
              <button type="submit" className="btn btn-block mt-4 text-white shadow col-5 mt-4 mx-auto" style={{ backgroundColor: colors.primary }}>
                <i className="fa fa-paper-plane me-2" aria-hidden="true"></i>Gửi đơn đi</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Job_Ap_Page