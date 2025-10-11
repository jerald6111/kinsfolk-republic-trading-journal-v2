const { Resend } = require('resend');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { email, antiPhishingCode, dataStr, emailFrequency } = JSON.parse(event.body);

    // Initialize Resend
    const resend = new Resend('re_D145aHmt_8nxXgKGfrUwfUeyP34SrujjN');

    // Prepare email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F4E157 100%); color: #1E2329; padding: 20px; border-radius: 10px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .phishing-code { background: #1E2329; color: #D4AF37; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Trading Journal Backup</h1>
            <p>Kinsfolk Republic Trading Journal</p>
          </div>
          
          <div class="content">
            <h2>Your Data Backup is Ready</h2>
            <p>Hi there! 👋</p>
            <p>Your trading journal data has been successfully backed up.</p>
            
            <div class="phishing-code">
              🛡️ SECURITY CODE: ${antiPhishingCode}
            </div>
            
            <div class="warning">
              <strong>⚠️ IMPORTANT SECURITY NOTICE:</strong><br>
              Always verify this anti-phishing code matches your saved code. If the code doesn't match, 
              <strong>DO NOT TRUST THIS EMAIL</strong> - it may be a phishing attempt!
            </div>
            
            <p><strong>📅 Backup Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>📊 Auto-Send Frequency:</strong> ${emailFrequency === 'disabled' ? 'Manual Only' : emailFrequency.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            
            <h3>📥 How to Restore Your Backup:</h3>
            <ol>
              <li>Go to your Trading Journal Settings page</li>
              <li>Navigate to "Data Management" section</li>
              <li>Click "Import Data"</li>
              <li>Upload the backup file</li>
              <li>Choose "Merge" to combine with existing data, or "Overwrite" to replace all data</li>
            </ol>
            
            <h3>📎 Attached File:</h3>
            <p><strong>trading-journal-backup-${new Date().toISOString().split('T')[0]}.json</strong></p>
            <p>Your complete trading journal backup is attached to this email. You can:</p>
            <ul>
              <li>📥 Download the attachment directly from this email</li>
              <li>📋 Or copy the JSON data below and create your own backup file for extra security</li>
            </ul>
            
            <details style="margin-top: 20px;">
              <summary style="cursor: pointer; font-weight: bold; color: #D4AF37;">📄 View JSON Data (Click to expand)</summary>
              <div style="background: #1E2329; color: #D4AF37; padding: 15px; border-radius: 8px; overflow-x: auto; max-height: 300px; overflow-y: auto; margin-top: 10px;">
                <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 11px;">${dataStr}</pre>
              </div>
            </details>
          </div>
          
          <div class="footer">
            <p>This is an automated email from your Kinsfolk Republic Trading Journal.</p>
            <p>Keep your backups safe and secure! 🔐</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Prepare attachment
    const filename = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    const attachmentContent = Buffer.from(dataStr).toString('base64');

    // Send email with attachment
    const data = await resend.emails.send({
      from: 'Kinsfolk Republic <kinsfolk.republic@resend.dev>',
      to: email,
      subject: `🔒 Trading Journal Backup - ${new Date().toLocaleDateString()} - Code: ${antiPhishingCode}`,
      html: emailHTML,
      attachments: [
        {
          filename: filename,
          content: attachmentContent
        }
      ]
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data.id })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to send email' })
    };
  }
};
