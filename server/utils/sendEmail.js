// poqo fznf wprs kmru
// code for my email



const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const Attendee = require("../models/attendee"); // Adjust the path as necessary
require("dotenv").config(); // To use environment variables from the .env file




// Set up nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sahniwesh@gmail.com", // Replace with your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Replace with your app-specific password from .env
  },
});




// Function to send QR code to an attendee
// async function sendQRCodeEmail(attendee) {
//   try {
//     // Generate QR code for attendee’s secret QR string
//     const qrCodeData = await QRCode.toDataURL(attendee.secretQRSTring);

//     // Email configuration
//     const mailOptions = {
//       from: "sahniwesh@gmail.com", // Sender address
//       to: attendee.email, // Receiver's email
//       subject: "Your QR Code for the Event",
//       html: `
//         <p>Hi ${attendee.name},</p>
//         <p>Thank you for registering for the event. Please find your unique QR code attached below.</p>
//         <img src="${qrCodeData}" alt="QR Code">
//         <p>Show this code at the entrance to verify your attendance.</p>
//         <p>Best regards,<br/>Event Team</p>
//       `,
//     };

//     // Send the email
//     await transporter.sendMail(mailOptions);
//     console.log(`QR code email sent to ${attendee.email}`);
//   } catch (error) {
//     console.error(`Error sending email to ${attendee.email}:`, error);
//   }
// }



async function sendQRCodeEmail(attendee) {
  try {
    // Generate QR code as a buffer
    const qrCodeBuffer = await QRCode.toBuffer(attendee.secretQRSTring);

    // Email configuration
    const mailOptions = {
      from: "sahniwesh@gmail.com", // Sender address
      to: attendee.email, // Receiver's email
      subject: "Your QR Code for the Conference",
      html: `
        <p>Hi ${attendee.name},</p>
        <p>We humbly invite you to our conference. Please find your unique QR code attached below.</p>
        <p>Show this code at the entrance to verify your attendance.</p>
        <p>Best regards,<br/>GatherHub Team</p>
      `,
      attachments: [
        {
          filename: 'QRCode.png',
          content: qrCodeBuffer,
          contentType: 'image/png',
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`QR code email sent to ${attendee.email}`);
  } catch (error) {
    console.error(`Error sending email to ${attendee.email}:`, error);
  }
}


// Function to send QR codes to all attendees
async function sendQRCodesToAllAttendees(attendees_id) {
  try {
    const attendees = await Attendee.find({ _id: { $in: attendees_id } });

    // const attendees = await Attendee.find({}); // Fetch all attendees from the database
    for (const attendee of attendees) {
      await sendQRCodeEmail(attendee); // Send an email to each attendee
    }
  } catch (error) {
    console.error("Error fetching attendees or sending emails:", error);
  }
}



// Export the functions to be used elsewhere
module.exports = { sendQRCodeEmail, sendQRCodesToAllAttendees };
