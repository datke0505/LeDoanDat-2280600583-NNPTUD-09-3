let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')

module.exports = {
    // ... Các hàm cũ của bạn (CreateAnUser, FindUserById, v.v.)
    FindUserById: async function (id) {
        return await userModel.findOne({ _id: id, isDeleted: false }).populate('role')
    },

    // Hàm đổi mật khẩu mới
    ChangePassword: async function (userId, oldPassword, newPassword) {
        try {
            let user = await userModel.findById(userId);
            if (!user) return { success: false, message: "User không tồn tại" };

            // So sánh mật khẩu cũ
            let isMatch = bcrypt.compareSync(oldPassword, user.password);
            if (!isMatch) return { success: false, message: "Mật khẩu cũ không đúng" };

            // Hash mật khẩu mới và lưu
            user.password = bcrypt.hashSync(newPassword, 10);
            await user.save();
            return { success: true, message: "Đổi mật khẩu thành công" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}