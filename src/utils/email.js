const nodemailer= require('nodemailer')

const sendEmail = async (options) => {

    const transporter= nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASS
        }
    })
    
    const emailOptions= {
        from: `E-commerce mail : ${process.env.ETHEREAL_USER} `,
        to: options.email,
        subject: options.subject,
        html: options.html
    }
    
    await transporter.sendMail(emailOptions)
}


module.exports= sendEmail