
const nodemailer = require("nodemailer");
const sendEmail = async (option) => {
    
    var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "260886f58cd4e4",
          pass: "ffdfd342cd52a6"
        }
      });

      let info = await transporter.sendMail({
        from: '"Dev Camper API" <noreply@devcamper.io>',
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
    
      });

      console.log("Message sent: %s", info.messageId);
}   

module.exports = sendEmail;