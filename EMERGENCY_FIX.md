# 🚨 EMERGENCY FIX - Schema Cache Error

## The Problem
Error: `Could not find the table 'public.wallets' in the schema cache`

This means Supabase's PostgREST hasn't detected the tables yet.

---

## ⚡ QUICK FIX (5 minutes)

### **Step 1: Run the SQL**
1. Go to [Supabase Dashboard](https://supabase.com) → Your Project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open file: `supabase/migrations/RUN_THIS_FIRST.sql`
5. Copy **ALL** contents and paste into SQL Editor
6. Click **RUN** button

### **Step 2: Verify Tables Created**
After running, you should see:
```
✅ DATABASE SETUP COMPLETE!
Tables created: 7 / 7
Wallets table exists: true
```

### **Step 3: Check Table Editor**
1. Go to **Table Editor** in left sidebar
2. You should see these tables:
   - ✅ wallets
   - ✅ income
   - ✅ expenses
   - ✅ budgets
   - ✅ goals
   - ✅ bills_emis
   - ✅ user_gamification

### **Step 4: Restart Everything**
```powershell
# Stop your dev server (Ctrl + C)

# Hard refresh browser
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R

# Restart dev server
npm run dev
```

### **Step 5: Test**
Try creating a wallet or adding income again.

---

## 🔍 Why This Happens

The error occurs because:
1. Tables weren't created in Supabase yet, OR
2. PostgREST schema cache wasn't reloaded after creating tables

**The SQL script fixes BOTH issues:**
- Drops any old conflicting tables
- Creates fresh tables with correct schema
- Forces PostgREST to reload (`NOTIFY pgrst, 'reload schema'`)
- Grants all necessary permissions

---

## ✅ Success Checklist

After running the fix:
- [ ] SQL executed without errors
- [ ] "Wallets table exists: true" shown
- [ ] All 7 tables visible in Table Editor
- [ ] Browser hard refreshed
- [ ] Dev server restarted
- [ ] Wallet/Income creation works

---

## 🆘 Still Not Working?

### Try This Additional Step:

**Force Supabase to Refresh:**
1. In Supabase Dashboard, go to **Settings** → **API**
2. Click **Restart API** button
3. Wait 30 seconds
4. Hard refresh your browser again

### Check Your Supabase Connection:
Verify in your `.env.local` or environment:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Clear Browser Cache:
1. Open DevTools (`F12`)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

---

## 📝 What the Fix Does

The `RUN_THIS_FIRST.sql` script:

1. **Drops old tables** (clean slate)
2. **Creates 7 core tables** with proper schema
3. **Adds indexes** for performance
4. **Enables RLS** for security
5. **Creates policies** for data access
6. **Sets up triggers** for auto-updates
7. **Adds streak tracking** for gamification
8. **Forces schema reload** (fixes cache issue!)
9. **Grants permissions** to all roles
10. **Verifies everything** worked

---

## 🎯 Expected Result

After the fix, you should be able to:
- ✅ Create wallets
- ✅ Add income
- ✅ Add expenses
- ✅ Set budgets
- ✅ Create goals
- ✅ Track bills/EMIs
- ✅ See your streak counter

**NO MORE SCHEMA CACHE ERRORS!** 🎉

---

## 📞 If All Else Fails

1. Double-check you're using the correct Supabase project
2. Verify your user is authenticated
3. Check Supabase logs for any errors
4. Try logging out and back in
5. Create a new test user and try again

---

## 💡 Pro Tip

After fixing, keep the `RUN_THIS_FIRST.sql` file handy. If you ever need to reset your database or deploy to a new Supabase project, just run this script again!
