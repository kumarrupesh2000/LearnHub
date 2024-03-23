const nodemailer = require('nodemailer');

require('dotenv').config();
// input parameter jiske pass mail bhejne ko hai
const mailSender=async(email,title,body)=>{
    try{
        const transporter = nodemailer.createTransport({


            // Your email service configuration
            service:process.env.MAIL_HOST,
            auth: {
                user: process.env.HOST_EMAIL, // Your Gmail email address
                pass: process.env.HOST_PASS // Your Gmail password or App Password if 2-step verification is enabled
            }
        });
        const info=await transporter.sendMail({
            from: 'Sona Jeweller & Company', 
            to: `${email}`,
            subject: `${title}`,
            html:`${body}`,
            // You can customize the email content as needed
        });
        console.log(info)
        console.log('Email sent successfully');
        return info;

        

    }
    catch(err){
        console.log(err.message);
    }
}

module.exports=mailSender;