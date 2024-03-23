const User=require('../models/User');
const OTP=require('../models/OTP');
const bcrypt = require('bcrypt');
const otpGenerator=require('otp-generator');
const jwt=require('jsonwebtoken');
const Profile=require('../models/Profile')
require('dotenv').config();
// send otp wla sign up page pe email verify kregaaa  


exports.sendotp=async(req,res)=>{

    const {email}= req.body;

    // check user already exist
try{
    const checkUserPresent=await User.findOne({email});

    if(checkUserPresent){
        return res.status(401).json({
            status:false,
            message:"User already exist"
        })
    }

    // generate otp
    let otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false

    })

    console.log("Otp => ",otp);

    // otp jo aya wo unique ho eske corresponding kuchh  mil gya to 
    let otpcheck=await OTP.findOne({otp:otp});
    while(otpcheck){
        otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
    
        })
        const otpcheck=await OTP.findOne({otp:otp});

    }
// check otp generator package is install or not payload mtlb data kya kya liya hai
    const otpPayload={email,otp};

    // db me entry create krna hai keu krna hai keu ki further esko verify v to krna hai 
    

    const otpBody=await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
        status:true,
        message:"OTP sent successfully"
    })
}

catch(err){

    console.log(err);
    res.status(500).json({
        status:false,
        message:err.message

    })

    
}


}

// signup
 

exports.signup=async(req,res)=>{
    try{

    // data fetch krunga from req ki body
    const{email,firstName,lastName,password,confirmPassword,accountType,contactNumber,otp}=req.body;
    // data ko validate kr lo

    if(!email||!firstName||!lastName||!password||!confirmPassword||!otp){
        return res.status(403).json({
            status:false,
            message:"All fields are required"
        })
    }
       // 2 password ko match kr lo cnfrm password
    if(password!==confirmPassword){
        return res.status(400).json(
            {
                status:false,
                message:"Password didnt match with confirmPassword"
            }
        )
    }

    // email exist kr rha ki nhi

    const emailExist=await User.findOne({email});

    if(emailExist){

        return res.status(400).json({
            status:false,
            message:"User already exist"
        });
    }


    


 

    // find most recent otp
    console.log("Yha tk to sahi hai");
    
    const recentOtp=await OTP.find({email}).sort({createdt:-1}).limit(1);
    // const recentOtp=await OTP.find({otp:otp})
   
    console.log(recentOtp);
   
   

    // validate otp

    if(recentOtp.length==0){
        return res.status(400).json({
            success:false,
            message:"Otp is not found"
        })
    }
    else if(recentOtp[0].otp!=otp){
        return res.status(400).json({
            status:false,
            message:"Invalid Otp"
        })

    }






    // password ko hash kr lia 
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Password encryption failed" });
    }

    const ProfileDetails=await Profile.create({gender:null,dateofBirth:null,about:null,contactNumber:null})
    // db k andr entry create kr liya
    const user=await User.create({email,firstName,lastName,password:hashedPassword,accountType,contactNumber,additionalDetails:ProfileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`});


    return res.status(200).json({
        success:true,
        message:"User registered sucessfully",
        user:user
    });

}

    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"user cannt be registered .Please try again"
        })
    }







}


// login
exports.login=async(req,res)=>{

    try{
        const {email,password}=req.body;
        // validation kro data
        if(!email||!password){
            return res.status(403).json({
                success:false,
                message:"all fields are required"
            });
        }



        //user check kro exist krta hai ki nhi signup

        const userExist=await User.findOne({email});
        if(!userExist){
            return res.status(401).json({
                success:false,
                message:"Email address doesnot exist please singup"
            });
        }

        // password match kr lo

        const isMatch=await bcrypt.compare(password,userExist.password);


        if(isMatch){
            // generate jwt token agar ye isMatch return true krta hai to token kaise generate krte hai 
            // sign wale method se
            const payload={
                email:userExist.email,
                id:userExist._id,
                accountType:userExist.accountType

            }

            const options={
                expiresIn:"2h"
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,options);

            // ess token ko user me daal dena hai

            userExist.token=token;
            userExist.password=undefined;
            const option={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true
            }
            res.cookie("token",token,option).status(200).json({
                success:true,
                user:userExist,
                message:"logged in successfully"

            })

        }
        else{
        return res.status(401).json({

            success:false,
            message:"password didnot match"

        })
    }
        
        // create cookie aur usko response me bhej do

    }
    catch(err){
        console.log(err);
        return res.status(500).json({

            success:false,
            message:"Login Failure"
        })

    }

   

     



}


// change password ka


exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }
 
// login k baad wo middleware se auth isstudnet wala add krenge