const authorize = (roles) => (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token không tồn tại' });
    }
  
    try {
      const decodedToken = jwt.verify(token, dotenv.SECRET_KEY);
      const { username, password, VaiTro } = decodedToken;
  
      if (roles && roles.length > 0 && !roles.includes(VaiTro)) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
  
      req.user = { username, password, VaiTro };
      next();
    } catch (error) {
      console.error('Lỗi server:', error);
      res.status(500).json({ message: 'Có lỗi bên server' });
    }
  };
  