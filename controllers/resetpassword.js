const ForgotPasswordRequest = require('../models/ForgotPasswordRequests');
const bcrypt = require('bcrypt');
const User = require('../models/signup')

exports.resetPassword = async (req, res) => {
    const resetToken = req.params.token; 
    const newPassword = req.body.newpassword;

    try {
        const resetRequest = await ForgotPasswordRequest.findOne({
            where: {
                id: resetToken,
                isActive: true,
            },
        });

        if (!resetRequest) {
            return res.status(404).json({ message: 'Invalid or expired reset token.' });
        }

        // Hashing the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Updating user's password in the database
        await User.update(
            { userpassword: hashedPassword },
            {
                where: {
                    id: resetRequest.userId,
                },
            }
        );

        // Deactivatong the reset token
        await ForgotPasswordRequest.update(
            { isActive: false },
            {
                where: {
                    id: resetToken,
                },
            }
        );

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
