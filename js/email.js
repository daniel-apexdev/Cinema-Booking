// ============================================================
// EMAIL - Simulated Email Confirmation
// ============================================================

const SavannahCinemasEmail = {
    
    // ========================================================
    // GENERATE EMAIL CONTENT
    // ========================================================
    generateBookingEmail(bookingData) {
        const template = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #14141C, #1D1D28); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 32px;">🎬 SAVANNAH CINEMAS</h1>
                    <p style="color: #E8B34C; margin: 5px 0; letter-spacing: 3px;">BOOKING CONFIRMED</p>
                </div>
                
                <div style="padding: 30px; background: #ffffff;">
                    <p style="font-size: 16px;">Hi <strong>${bookingData.customerName}</strong>,</p>
                    <p style="font-size: 14px; color: #555;">
                        Your booking has been confirmed! Here are your ticket details:
                    </p>
                    
                    <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="color: #B33951; margin-top: 0;">${bookingData.movieTitle}</h2>
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="padding: 5px 0; color: #777;">Booking Reference:</td>
                                <td style="padding: 5px 0;"><strong>${bookingData.bookingReference}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #777;">Cinema:</td>
                                <td style="padding: 5px 0;">${bookingData.branchName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #777;">Screen:</td>
                                <td style="padding: 5px 0;">${bookingData.screenName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #777;">Date & Time:</td>
                                <td style="padding: 5px 0;">${bookingData.showtime}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #777;">Seats:</td>
                                <td style="padding: 5px 0;"><strong>${bookingData.seats.join(', ')}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #777;">Total Paid:</td>
                                <td style="padding: 5px 0; color: #B33951;"><strong>${bookingData.totalAmount}</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 14px; color: #555;">
                        Please arrive at least 15 minutes before showtime. Show this email or your QR code at the entrance.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background: #000; padding: 20px; display: inline-block; border-radius: 8px;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingData.bookingReference}" 
                                 alt="QR Code" style="display: block;">
                        </div>
                        <p style="font-size: 12px; color: #999; margin-top: 10px;">Show this QR code at the entrance</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        Questions? Contact us at ${SavannahCinemasApp.config.supportEmail}<br>
                        or call ${SavannahCinemasApp.config.supportPhone}
                    </p>
                </div>
                
                <div style="background: #14141C; padding: 20px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        © 2026 Savannah Cinemas. All rights reserved.
                    </p>
                </div>
            </div>
        `;
        
        return template;
    },
    
    // ========================================================
    // SIMULATE EMAIL SENDING
    // ========================================================
    sendBookingEmail(bookingData) {
        console.log('📧 Sending Savannah Cinemas booking confirmation email...');
        console.log('Recipient:', bookingData.customerEmail);
        console.log('Booking:', bookingData.bookingReference);
        
        // Store the email content in localStorage (for demo purposes)
        const emailContent = this.generateBookingEmail(bookingData);
        localStorage.setItem('lastEmailContent', emailContent);
        localStorage.setItem('lastEmailRecipient', bookingData.customerEmail);
        
        // Simulate sending (in real app, this would call an API)
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('✅ Savannah Cinemas email sent successfully');
                resolve(true);
            }, 1000);
        });
    },
    
    // ========================================================
    // PREVIEW EMAIL (For demo)
    // ========================================================
    previewEmail() {
        const content = localStorage.getItem('lastEmailContent');
        const recipient = localStorage.getItem('lastEmailRecipient');
        
        if (!content) {
            alert('No email to preview');
            return;
        }
        
        const previewWindow = window.open('', '_blank', 'width=700,height=800');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Email Preview - ${recipient}</title>
                <style>
                    body { margin: 0; padding: 20px; background: #f0f0f0; font-family: Arial, sans-serif; }
                    .email-header { background: #333; color: white; padding: 10px 20px; border-radius: 8px 8px 0 0; }
                    .email-body { background: white; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="email-header">
                    <strong>📧 To:</strong> ${recipient}<br>
                    <strong>Subject:</strong> Your Savannah Cinemas Booking Confirmation
                </div>
                <div class="email-body">
                    ${content}
                </div>
            </body>
            </html>
        `);
    }
};

