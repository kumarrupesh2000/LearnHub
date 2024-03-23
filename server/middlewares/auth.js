const jwt=require('jsonwebtoken');
require('dotenv').config();
const User=require('../models/User');



// authen wala
exports.auth=async(req,res,next)=>{
    try{
        const token=req.body.token||req.cookies.token
        ||req.header("Authorisation").replace("Bearer","");
        if(!token){
            return res.status(401).json({
                success:false,
                message:"token missing"
            });
        }
        // agr token hai to authenticate krte hai kaise?verify method se


        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;

        }
        catch(err){

            return res.status(401).json({
                success:false,
                message:"Token is invalid"
            })
        }
        next();

    }

   catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}


}




// isstudent wala


exports.isStudent = async (req, res, next) => {
	try {
		 

		if (req.user.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};





// isadmin
exports.isAdmin = async (req, res, next) => {
	try {
		// const userDetails = await User.findOne({ email: req.user.email });

        if (req.user.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
// Instructor
exports.isInstructor = async (req, res, next) => {
	try {
		// const userDetails = await User.findOne({ email: req.user.email });
		// console.log(userDetails);

		// console.log(userDetails.accountType);

        if (req.user.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};




