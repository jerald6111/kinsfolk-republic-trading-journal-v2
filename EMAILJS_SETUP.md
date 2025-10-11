# EmailJS Free Email Setup Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Free EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" (100% FREE - 200 emails/month)
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook**
   - **Yahoo**
   - Or any other SMTP service
4. Follow the connection instructions
5. Copy your **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **Email Templates** in dashboard
2. Click **Create New Template**
3. Use this template:

```html
Subject: 🔒 Trading Journal Backup - {{backup_date}}

Hi there!

Your Kinsfolk Republic Trading Journal backup is ready.

🛡️ ANTI-PHISHING SECURITY CODE: {{anti_phishing_code}}
⚠️ Always verify this code matches your saved code. If it doesn't match, this email is NOT from your trading journal!

📅 Backup Date: {{backup_date}}
📊 Auto-Send Frequency: {{frequency}}

Your trading data is attached to this email as a JSON file.

---
To restore this backup:
1. Go to Settings > Data Management
2. Click "Import Data"
3. Select this backup file
4. Choose "Merge" or "Overwrite"

Keep this backup safe and secure!

Best regards,
Your Kinsfolk Republic Trading Journal
```

4. In the template settings, add these variables:
   - `to_email` - Email address
   - `anti_phishing_code` - Security code
   - `backup_date` - Timestamp
   - `data_content` - Backup data
   - `frequency` - Auto-send frequency

5. Copy your **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** > **General**
2. Find your **Public Key** (e.g., `abcDEF123xyz`)
3. Copy it

### Step 5: Update Configuration
1. Open `src/pages/DataSettings.tsx`
2. Find lines ~115-117:
```typescript
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY' // Replace with your key
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID' // Replace with your service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID' // Replace with your template ID
```

3. Replace with your actual values:
```typescript
const EMAILJS_PUBLIC_KEY = 'abcDEF123xyz' // Your public key
const EMAILJS_SERVICE_ID = 'service_abc123' // Your service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz789' // Your template ID
```

4. Save the file

### Step 6: Test It!
1. Go to Settings page in your app
2. Enter your email address
3. Set an anti-phishing code
4. Click "Send Now"
5. Check your inbox!

---

## 🆓 Alternative Free Email Services

If you prefer other options:

### Web3Forms
- **Completely FREE** - Unlimited emails
- No registration required
- Simple REST API
- Website: [https://web3forms.com/](https://web3forms.com/)

### FormSubmit
- **100% FREE** - No limits
- No backend required
- Zero configuration
- Website: [https://formsubmit.co/](https://formsubmit.co/)

### Resend
- **Free Tier**: 3,000 emails/month
- Modern email API
- Great deliverability
- Website: [https://resend.com/](https://resend.com/)

---

## 🔧 Troubleshooting

### Emails not sending?
1. Check your Public Key, Service ID, and Template ID are correct
2. Verify your email service is connected in EmailJS dashboard
3. Check EmailJS dashboard for error logs
4. Make sure you haven't exceeded free tier limit (200 emails/month)

### Emails going to spam?
1. Add sender email to your contacts
2. Mark first email as "Not Spam"
3. Create a filter to move emails to inbox

### Want to change email provider?
1. Go to EmailJS dashboard
2. Add new email service
3. Update Service ID in code
4. Test with "Send Now" button

---

## 📊 Free Tier Limits

**EmailJS Free Plan:**
- ✅ 200 emails per month
- ✅ 2 email services
- ✅ 2 email templates
- ✅ Basic email analytics
- ✅ Community support

**Upgrade if needed:**
- Personal: $9/month (1,000 emails)
- Pro: $35/month (10,000 emails)

For most personal trading journals, **200 emails/month is plenty**!
- Daily backups = ~30 emails/month
- Weekly backups = ~4 emails/month
- Manual only = As needed

---

## 🛡️ Security Notes

1. **Never commit your EmailJS keys to public repositories**
2. **Use environment variables for production**
3. **Keep your anti-phishing code private**
4. **Regularly update your EmailJS password**

---

## 💡 Tips

- Use a dedicated email for backups (e.g., Gmail alias)
- Set up email filters to organize backups
- Test email sending monthly to ensure it works
- Download manual backup before making major changes

---

**Need Help?**
- EmailJS Docs: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- Community Support: [https://www.emailjs.com/community/](https://www.emailjs.com/community/)

Happy Trading! 📈
