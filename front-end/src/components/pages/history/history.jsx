import React, { useState, useEffect } from 'react'
import SidebarUser from '../../structure/navbar/sb_user'
import colors from '../../../colors'
import axios from 'axios'

function formatDateTime(isoDateString) {
    const isoDate = new Date(isoDateString);
    const day = isoDate.getUTCDate().toString().padStart(2, '0');
    const month = (isoDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = isoDate.getUTCFullYear();
    const hours = isoDate.getUTCHours().toString().padStart(2, '0');
    const minutes = isoDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} - ${day}-${month}-${year}`;
}

function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        fetchData(searchTerm);
    };

    const fetchData = (MaPhieu) => {
        const apiEndpoint = `http://localhost:8080/api/danhsachphieucvtt/${MaPhieu}`;

        axios.get(apiEndpoint)
            .then(response => setData(response.data))
            .catch(error => console.error('Lỗi khi tải dữ liệu:', error));
    };

    useEffect(() => {
        fetchData(searchTerm || null);
    }, [searchTerm]);

    return (
        <div>
            <SidebarUser />
            <div className="d-flex shadow" style={{ height: '100vh', marginLeft: '22rem' }}>
                <div className="container" style={{ maxWidth: '1300px' }}>
                    <div className="container mt-4">
                        <h2 className='mt-4 text-center' style={{ color: colors.primary }}>Trình ký duyệt phiếu công tác và phiếu thanh toán</h2>
                        <form className="col-3 mt-4 mx-auto" onSubmit={handleSearchSubmit}>
                            <div className="input-group">
                                <input
                                    className="form-control shadow border-end-0"
                                    type="search"
                                    placeholder="Tìm kiếm thông tin trình ký..."
                                    aria-label="Search"
                                    value={searchTerm}
                                    onChange={handleSearchInputChange}
                                />
                                <button className="btn border border-start-0 bg-white" type="submit">
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                </button>
                            </div>
                        </form>
                        <hr className='mt-5' />
                        {data.length > 0 ? (
                            <div className='mt-5'>
                                <div className="row">
                                    {data.map(item => (
                                        <div key={item.MaPhieu} className="row mb-5">
                                            <form className="mb-3 d-flex justify-content-center flex-wrap">
                                                <div className="d-flex flex-wrap mb-3 me-5">
                                                    <div className="me-3">
                                                        <label className="form-label">ID người duyệt:</label>
                                                        <input type="number" className="form-control shadow" readOnly value={item.NguoiDuyetID} />
                                                    </div>
                                                    <div className="me-3">
                                                        <label className="form-label">Nội dung:</label>
                                                        <input type="text" className="form-control shadow" readOnly value={item.NoiDung} />
                                                    </div>
                                                    <div className="me-3">
                                                        <label className="form-label">Trạng thái:</label>
                                                        <input type="text" className="form-control shadow" readOnly value={item.TrangThai} />
                                                    </div>
                                                    <div className="me-3">
                                                        <label className="form-label">Loại phiếu:</label>
                                                        <input type="text" className="form-control shadow" readOnly value={item.LoaiPhieu} />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Ngày cập nhật:</label>
                                                        <input type="text" className="form-control shadow" readOnly value={formatDateTime(item.NgayCapNhat)} />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 text-center">
                                <p>Không có phiếu nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HistoryPage