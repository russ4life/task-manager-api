const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'russell.burdikin@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'russell.burdikin@gmail.com',
        subject: 'Goodbye, thanks for joining in!',
        text: `Goodbye, ${name}. It sad to see you go, if you wish you can sign up again`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}