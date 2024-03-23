const { findOne } = require('../models/OTP');
const User=require('../models/User');
const mailSender=require('../utils/mailSender');
const bcrypt=require('bcrypt');
const crypto=require('crypto');

// resetpassword token
exports.resetPasswordToken=async(req,res)=>{
try{
        // get email from req body
        const email=req.body.email;
        // check user for this email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            });
        }
    
        // generate token
        const token=crypto.randomUUID();
        // update user by adding token and expiration time
    
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true }
        );
    
        //  new ko true marks kiya hai keu ki updated wala aaye
        console.log("DETAILS", updatedDetails);
        // create url
        const url = `http://localhost:3000/update-password/${token}`;
        // send mail containing url
    
        await mailSender(email,"Password reset Link",`Password Reset Link:${url}`)
    
        // return response
    
        res.json({
            success: true,
            message:
                "Email Sent Successfully, Please Check Your Email to Continue Further",
        });
    

}
catch (error) {
    return res.json({
        error: error.message,
        success: false,
        message: `Some Error in Sending the Reset Message`,
    });
}

    

}

  

// reset password ye db me update krega password


exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, token } = req.body;

		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
		const userDetails = await User.findOne({ token: token });
		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}
		if (!(userDetails.resetPasswordExpires < Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
		const encryptedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);
		res.json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};