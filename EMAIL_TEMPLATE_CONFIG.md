# ExpenseMuse AI - Custom Email Templates

## 🔧 Supabase Email Template Configuration

### How to Apply Custom Templates

1. **Access Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your ExpenseMuse project
   - Navigate to: **Authentication** → **Email Templates**

2. **Update Each Template Below**

---

## 📧 Password Reset Email Template

**Template Name:** Reset Password  
**Location:** Authentication → Email Templates → Reset Password

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ExpenseMuse AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                ExpenseMuse AI
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">
                                AI-Powered Expense Tracker
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
                                Reset Your Password
                            </h2>
                            
                            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password for your ExpenseMuse AI account. Click the button below to create a new password.
                            </p>
                            
                            <!-- Reset Button -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 0;">
                                        <a href="{{ .ConfirmationURL }}" 
                                           style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            
                            <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; color: #4b5563; font-size: 13px; word-break: break-all;">
                                {{ .ConfirmationURL }}
                            </p>
                            
                            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
                                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                                    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                © 2025 ExpenseMuse AI
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                AI-Powered Financial Management Platform
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Unsubscribe/Help -->
                <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                This email was sent to you because you requested a password reset.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 📧 Confirmation Email Template

**Template Name:** Confirm Signup  
**Location:** Authentication → Email Templates → Confirm Signup

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Email - ExpenseMuse AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                Welcome to ExpenseMuse AI! 🎉
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
                                Confirm Your Email Address
                            </h2>
                            
                            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Thank you for signing up! Please confirm your email address to start managing your finances with AI-powered insights.
                            </p>
                            
                            <!-- Confirm Button -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 0;">
                                        <a href="{{ .ConfirmationURL }}" 
                                           style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Confirm Email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link:
                            </p>
                            
                            <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; color: #4b5563; font-size: 13px; word-break: break-all;">
                                {{ .ConfirmationURL }}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                © 2025 ExpenseMuse AI
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                AI-Powered Financial Management Platform
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 📧 Magic Link Email Template

**Template Name:** Magic Link  
**Location:** Authentication → Email Templates → Magic Link

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - ExpenseMuse AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                ExpenseMuse AI
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
                                Sign In to Your Account
                            </h2>
                            
                            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Click the button below to sign in to your ExpenseMuse AI account.
                            </p>
                            
                            <!-- Sign In Button -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 0;">
                                        <a href="{{ .ConfirmationURL }}" 
                                           style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Sign In
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 24px 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                                This link will expire in 1 hour for security reasons.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                © 2025 ExpenseMuse AI
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                AI-Powered Financial Management Platform
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 📋 Step-by-Step Instructions

### 1. Access Supabase Dashboard
```
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your ExpenseMuse AI project
```

### 2. Navigate to Email Templates
```
1. Click on "Authentication" in the left sidebar
2. Click on "Email Templates"
3. You'll see a list of all email templates
```

### 3. Update Each Template
For each template (Reset Password, Confirm Signup, Magic Link):

```
1. Click on the template name
2. Copy the corresponding HTML from above
3. Paste it into the "Email Template" editor
4. Click "Save" at the bottom
```

### 4. Test the Changes
```
1. Try the password reset feature
2. Check your email
3. Verify the new branding appears
```

---

## 🎨 Customization Options

### Change Brand Colors
Replace these color values in the templates:

```css
/* Primary Gradient */
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

/* To your colors (example): */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Add Logo
Insert before the `<h1>` tag in the header:

```html
<img src="https://your-domain.com/logo.png" 
     alt="ExpenseMuse AI" 
     style="max-width: 150px; margin-bottom: 16px;">
```

### Change Footer Text
Edit the footer section:

```html
<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
    Your Custom Footer Text
</p>
```

---

## ⚠️ Important Notes

1. **Template Variables:**
   - `{{ .ConfirmationURL }}` - Don't change this! It's required by Supabase
   - This variable is automatically replaced with the actual confirmation link

2. **Testing:**
   - Always test emails after updating templates
   - Check both desktop and mobile rendering
   - Verify links work correctly

3. **Backup:**
   - Save the default templates before making changes
   - Keep a copy of your custom templates

4. **Email Deliverability:**
   - Avoid too many images (slows loading)
   - Use inline CSS (better email client support)
   - Keep HTML under 102KB for best delivery

---

## 📞 Support

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-templates
2. Verify HTML syntax is correct
3. Test with different email clients
4. Check spam folders if emails don't arrive

---

**Last Updated:** 2025-10-16  
**Version:** 1.0  
**Status:** Ready to Apply ✅
