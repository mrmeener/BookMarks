# Microsoft 365 Admin Center - Quick Reference

**Version:** 1.0 | **Updated:** July 2025 | **Print-Friendly Format**

---

## 🚀 Quick Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Admin Center** | admin.microsoft.com | Main admin portal |
| **Exchange Admin** | admin.exchange.microsoft.com | Email management |
| **Teams Admin** | admin.teams.microsoft.com | Teams configuration |
| **SharePoint Admin** | admin.sharepoint.com | SharePoint management |
| **Security Center** | security.microsoft.com | Security & compliance |
| **Compliance Center** | compliance.microsoft.com | Data governance |

---

## 👥 User Management Checklist

### ✅ Adding New Users
- [ ] Navigate to **Users** > **Active users**
- [ ] Click **Add a user**
- [ ] Enter: First name, Last name, Display name, Username
- [ ] Select domain from dropdown
- [ ] Assign appropriate licenses
- [ ] Set password (auto-generate or custom)
- [ ] Assign admin roles (if needed)
- [ ] Review settings and click **Finish**

### ✅ Password Reset
- [ ] Go to **Users** > **Active users**
- [ ] Select user from list
- [ ] Click **Reset password**
- [ ] Choose: Auto-generate or set custom password
- [ ] Decide: Require password change on first sign-in
- [ ] Send password via email or display on screen

### ✅ License Management
- [ ] Select user from **Active users**
- [ ] Click **Licenses and apps**
- [ ] Check/uncheck license assignments
- [ ] Expand license to select specific services
- [ ] Click **Save changes**

---

## 🔐 Security Quick Actions

### ✅ Enable MFA for User
1. **Users** > **Active users** > **Multi-factor authentication**
2. Select user(s) from list
3. Click **Enable** in right panel
4. User will be prompted to set up MFA on next sign-in

### ✅ Block User Sign-in
1. Select user from **Active users**
2. Click **Block sign-in**
3. Confirm action
4. User will be signed out of all sessions

### ✅ Check Sign-in Logs
1. **Reports** > **Usage** > **Sign-ins**
2. Filter by user, date range, or status
3. Click on entry for detailed information
4. Export data if needed for analysis

---

## 📧 Exchange Online Essentials

### ✅ Create Shared Mailbox
- [ ] **Admin centers** > **Exchange**
- [ ] **Recipients** > **Mailboxes**
- [ ] Click **Add a shared mailbox**
- [ ] Enter display name and email address
- [ ] Add members who can access mailbox
- [ ] Set permissions (Full Access, Send As)

### ✅ Mail Flow Rules
- [ ] **Exchange admin center** > **Mail flow** > **Rules**
- [ ] Click **Add a rule**
- [ ] Choose condition (sender, recipient, subject, etc.)
- [ ] Define action (redirect, add disclaimer, etc.)
- [ ] Set exceptions if needed
- [ ] Test rule before enabling

---

## 🛡️ Security & Compliance

### ✅ Create DLP Policy
- [ ] **Compliance center** > **Data loss prevention** > **Policies**
- [ ] Click **Create policy**
- [ ] Choose template or create custom
- [ ] Select locations (Exchange, SharePoint, Teams)
- [ ] Configure sensitive info types
- [ ] Set policy actions and notifications
- [ ] Test policy in simulation mode first

### ✅ Conditional Access Policy
- [ ] **Azure AD admin center** > **Security** > **Conditional Access**
- [ ] Click **New policy**
- [ ] Name the policy
- [ ] Assign users/groups
- [ ] Select cloud apps
- [ ] Configure conditions (location, device, risk)
- [ ] Set access controls (block, require MFA, etc.)
- [ ] Enable policy

---

## 📊 Reporting Quick Checks

### ✅ Active Users Report
- **Reports** > **Usage** > **Active users**
- Shows user activity across all services
- Filter by time period (7, 30, 90, 180 days)
- Export data for further analysis

### ✅ Email Activity
- **Reports** > **Usage** > **Email activity**
- Monitor send/receive patterns
- Identify inactive mailboxes
- Track storage usage

### ✅ Security Reports
- **Security center** > **Reports**
- Sign-in risk events
- Users flagged for risk
- Risky sign-ins
- Identity protection summary

---

## 🔧 Troubleshooting Quick Fixes

| Problem | Quick Solution |
|---------|----------------|
| **User can't sign in** | Check: Account enabled, password not expired, MFA setup, conditional access |
| **Email not delivered** | Check: Mail flow rules, spam filter, recipient limits, DNS records |
| **License assignment fails** | Verify: Available licenses, usage location set, conflicting licenses |
| **Teams not working** | Check: Teams license, policy assignments, network connectivity |
| **SharePoint access denied** | Verify: Site permissions, sharing settings, external sharing policies |

---

## ⚡ PowerShell Quick Commands

```powershell
# Connect to Microsoft 365
Connect-MsolService

# Get all users
Get-MsolUser

# Reset user password
Set-MsolUserPassword -UserPrincipalName user@domain.com -NewPassword "NewPassword123"

# Assign license
Set-MsolUserLicense -UserPrincipalName user@domain.com -AddLicenses "company:ENTERPRISEPACK"

# Block user sign-in
Set-MsolUser -UserPrincipalName user@domain.com -BlockCredential $true

# Get mailbox statistics
Get-MailboxStatistics -Identity user@domain.com
```

---

## 📞 Emergency Contacts

| Issue Type | Contact | Hours |
|------------|---------|-------|
| **Account Lockouts** | IT Helpdesk: ext. 2222 | 24/7 |
| **Security Incidents** | Security Team: ext. 3333 | 24/7 |
| **License Issues** | IT Admin: ext. 4444 | Mon-Fri 8-5 |
| **Exchange Problems** | Email Admin: ext. 5555 | Mon-Fri 8-6 |

---

## 🎯 Best Practices Reminder

- ✅ **Always enable MFA** for admin accounts
- ✅ **Use least privilege** principle for role assignments
- ✅ **Regular access reviews** - quarterly minimum
- ✅ **Monitor sign-in logs** for suspicious activity
- ✅ **Test changes** in non-production first
- ✅ **Document procedures** for consistency
- ✅ **Keep licenses optimized** - regular audits
- ✅ **Backup critical configurations** regularly

---

**💡 Pro Tips:**
- Bookmark frequently used admin centers
- Use browser profiles for different admin roles
- Set up email alerts for critical events
- Create custom dashboards for your role
- Join Microsoft 365 admin community forums

---

*Quick Reference Card - Keep handy for daily admin tasks*  
**Last Updated:** July 2025 | **Next Review:** January 2026
