let jwt = require('jsonwebtoken')
let userController = require('../controllers/users')

module.exports = {
    checkLogin: async function (req, res, next) {
        let token
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token
        } else {
            token = req.headers.authorization;
            if (!token || !token.startsWith("Bearer")) {
                return res.status(403).send("Bạn chưa đăng nhập");
            }
            token = token.split(' ')[1];
        }
        try {
            let result = jwt.verify(token, 'secret');
            if (result && result.exp * 1000 > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                res.status(403).send("Phiên đăng nhập hết hạn")
            }
        } catch (err) {
            res.status(403).send("Token không hợp lệ")
        }
    },
    checkRole: function (...requiredRole) {
        return async function (req, res, next) {
            let userId = req.userId;
            let user = await userController.FindUserById(userId);
            if (!user || !user.role) return res.status(403).send({ message: "Không tìm thấy quyền" });

            let currentRole = user.role.name.toUpperCase();

            // Yêu cầu: Admin full quyền
            if (currentRole === 'ADMIN') {
                return next();
            }

            // Yêu cầu: Mod có quyền Read All (được truyền vào qua requiredRole)
            if (requiredRole.some(role => role.toUpperCase() === currentRole)) {
                return next();
            } else {
                res.status(403).send({ message: "Bạn không có quyền thực hiện hành động này" });
            }
        }
    }
}