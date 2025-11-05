const nodemailer = require('nodemailer');

function canUseSmtp() {
    return Boolean(process.env.SMTP_USER && (process.env.SMTP_HOST || process.env.SMTP_SERVICE));
}

function createTransporter() {
    const host = (process.env.SMTP_HOST || '').trim().toLowerCase();
    const service = (process.env.SMTP_SERVICE || '').trim().toLowerCase();
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Gmail configuration with explicit settings
    if (service === 'gmail' || host === 'smtp.gmail.com') {
        return nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: user.trim(),
                pass: pass.trim() // App password may have spaces
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            },
            connectionTimeout: 20000, // 20 seconds
            greetingTimeout: 20000,
            socketTimeout: 20000,
            debug: false,
            logger: false
        });
    }

    // Generic SMTP configuration
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: user ? { 
            user: user.trim(), 
            pass: pass.trim() 
        } : undefined,
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000
    });
}

async function sendVerificationCodeEmail({ to, code }) {
    const subject = 'Your verification code';
    const text = `Your verification code is: ${code}\nThis code will expire in 10 minutes.`;
    const html = `<p>Your verification code is:</p><p style="font-size:20px;font-weight:bold;letter-spacing:3px">${code}</p><p>This code will expire in 10 minutes.</p>`;

    if (!canUseSmtp()) {
        console.log(`[DEV] SMTP not configured. Would send to ${to}: ${code}`);
        return;
    }

    const host = (process.env.SMTP_HOST || '').trim().toLowerCase();
    const service = (process.env.SMTP_SERVICE || '').trim().toLowerCase();
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';

    console.log(`[EMAIL] Attempting to send verification code to ${to} via Gmail SMTP`);

    // For Gmail, try port 465 first (SSL) as Render often blocks 587
    if (service === 'gmail' || host === 'smtp.gmail.com') {
        // Try port 465 (SSL) first - often works better on cloud platforms
        try {
            console.log('[EMAIL] Trying port 465 (SSL)...');
            const transporter465 = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // SSL
                auth: { 
                    user: user.trim(), 
                    pass: pass.trim() // App password may have spaces
                },
                tls: { 
                    rejectUnauthorized: false 
                },
                connectionTimeout: 20000, // 20 seconds
                greetingTimeout: 20000,
                socketTimeout: 20000
            });
            
            const sendPromise = transporter465.sendMail({ 
                from: from.trim(), 
                to: to.trim(), 
                subject, 
                text, 
                html 
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout on port 465')), 20000)
            );
            
            await Promise.race([sendPromise, timeoutPromise]);
            transporter465.close();
            console.log(`✓ [EMAIL] Successfully sent verification code to ${to} via port 465`);
            return; // Success
        } catch (err465) {
            console.log(`⚠ [EMAIL] Port 465 failed: ${err465.message}, trying port 587...`);
            // Fall through to try port 587
        }
    }

    // Try port 587 (TLS) as fallback
    console.log('[EMAIL] Trying port 587 (TLS)...');
    const transporter = createTransporter();
    
    try {
        const sendPromise = transporter.sendMail({ 
            from: from.trim(), 
            to: to.trim(), 
            subject, 
            text, 
            html 
        });
        
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email sending timeout after 20 seconds on port 587')), 20000)
        );
        
        await Promise.race([sendPromise, timeoutPromise]);
        transporter.close();
        console.log(`✓ [EMAIL] Successfully sent verification code to ${to} via port 587`);
    } catch (err) {
        transporter.close();
        console.error(`✗ [EMAIL] Failed to send email: ${err.message}`);
        throw err;
    }
}

module.exports = { sendVerificationCodeEmail };


