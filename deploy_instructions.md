# Clean Deployment Instructions

## 🚀 **Quick Start**

Run the clean deployment script to fix the Customers page issue:

```bash
cd /home/ubuntu/flat_rate_project
./deploy_clean.sh
```

## 📋 **What the Script Does**

### **1. Cache Clearing**
- Removes `node_modules` directory
- Clears Vite build cache (`.vite` folder)
- Removes previous build outputs (`dist`, `build`)
- Deletes package lock files

### **2. Configuration Update**
- Updates API client with correct backend URL
- Adds cache-busting timestamp
- Enhances error logging for debugging
- Sets environment variables

### **3. Fresh Build**
- Performs clean npm install
- Builds with cache-busting parameters
- Verifies build output contains correct URLs

### **4. Verification**
- Tests backend connectivity
- Checks build file contents
- Provides deployment summary

## 🔧 **Manual Steps After Script**

### **Step 1: Run the Script**
```bash
./deploy_clean.sh
```

### **Step 2: Deploy Frontend**
After the script completes successfully, deploy the frontend:
```bash
# The script will prepare everything, then you deploy with:
service_deploy_frontend static /home/ubuntu/flat_rate_project/servicebook-pros-dashboard/dist
```

### **Step 3: Test the Fix**
1. Open the new frontend URL
2. Login with: `demo_admin` / `demo123`
3. Click on "Customers" tab
4. Verify it loads without blank screen

## 🔍 **Troubleshooting**

### **If Script Fails**
```bash
# Check backend connectivity
curl https://y0h0i3c8k75w.manus.space/api/health

# Check build logs
cd servicebook-pros-dashboard
npm run build --verbose
```

### **If Customers Page Still Fails**
1. Check browser console for errors
2. Verify API calls are going to correct URL
3. Clear browser cache completely
4. Try incognito/private browsing mode

## 📊 **Expected Results**

### **Before Fix**
- ❌ Customers page: Blank screen
- ❌ Console: "Failed to fetch" errors
- ❌ Authentication: Lost after refresh

### **After Fix**
- ✅ Customers page: Displays customer list
- ✅ Console: Clean API calls to correct backend
- ✅ Authentication: Maintained across navigation

## 🎯 **Key Features of Enhanced API Client**

### **Enhanced Logging**
```javascript
console.log('🔗 API Client initialized with baseURL:', this.baseURL);
console.log('🌐 Making API request to:', url);
console.log('📡 API Response status:', response.status);
```

### **Better Error Handling**
- Automatic token refresh on 401 errors
- Detailed error messages
- Graceful fallback for network issues

### **Cache Busting**
- Timestamp-based cache invalidation
- Force fresh API client loading
- Prevent stale configuration issues

## 🔗 **Current Configuration**

- **Backend URL**: `https://y0h0i3c8k75w.manus.space/api`
- **Frontend**: Will be deployed to new URL
- **Mobile App**: `https://bb4760a402e6b7a0e6a2974a1213cf14a58ea84e.manus.space`

## ⚡ **Quick Test Commands**

```bash
# Test backend health
curl https://y0h0i3c8k75w.manus.space/api/health

# Test authentication
curl -X POST https://y0h0i3c8k75w.manus.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_admin","password":"demo123"}'

# Test customers endpoint (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://y0h0i3c8k75w.manus.space/api/customers/
```

---

**This deployment script should resolve the Customers page issue by ensuring a completely clean build with the correct backend URL configuration.**

