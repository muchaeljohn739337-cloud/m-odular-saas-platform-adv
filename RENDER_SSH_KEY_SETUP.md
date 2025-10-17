# 🔐 Add SSH Key to Render

## Your SSH Public Key (Copy This!)

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC7WeVwZTSDp+WTTUQlRu000H/ybP5XBLgy2nY6hrYIv8i7qrC6QeaUIDkYccGuzuAdv5q6XL3/d2+on/OdXGDmL41/DRROtxNVD1PJvt142Yljx+8Y3ZohIoCRqC9R4AlzmfeVl5sktVNv3QcQg6jGcqx6My+UENKmC8KlY+dIUSaHIlKlzI+RaPAAXm4LrwC7KK+FL6zvjPJddSZCEvZD72thn7EJ43UjOl/zixKFLouyZog2LZfZD6XcuTX+qjLC6Zya06q0XbANJvj11f9vCcQ/V1CUsvjEwyR+i/2BVH4jsvHBirkR7aElmqtonvh/RG8Q4WeJrntb7kwRzSA4DN6TmJRcDr1lYXq3YGaJOLDGpaHcVX9hut0E44XAmunpb2911MPM5eZoxnU3inc+SgdvwPEtNmkeV1/ldpluZNvzNojdEABUVxMdcf1G2Cf4Yl1AZ8ztZv4UMZgiHioj02Nv+ZMevZ8PzJRXBD8gk1KxZ+fJx/DZ143M4nISk0UyQ31upZtm3Vyk6OWmfyqS+0J9b525Mc2hGNOLjIaureT8jKCZZrmaj+wmYFTOMWJr9cnO0jW7IQe4ZSp3WOYsd0DCxULxucA40URafaBN3Wu2fr7oGRvkYds+OYAlRGPC6HFDOu0LTvlvxr75GoypavQPpSnXR9B+AO0WfKvjCw== mucha@DESKTOP-H7T9NPM
```

---

## ✅ Steps to Add to Render

### Step 1: Go to Render Account Settings
1. Open: https://dashboard.render.com
2. Click your **avatar** (top right)
3. Click **Account**
4. Go to **SSH Keys** tab

### Step 2: Add Your Public Key
1. Click **Add SSH Key** button
2. **Name:** `My Windows Dev Machine`
3. **Public Key:** Paste the entire key above (starts with `ssh-rsa`)
4. Click **Add SSH Key**

### Step 3: Verify
- You should see your key listed in the SSH Keys section
- Fingerprint: `SHA256:6mYLs1e0rTYT+WEuA28cEnR3uCafsHTeKPdX7mZAw3o`

---

## 🎯 What This Enables

Once added, you can:

✅ **SSH into your services:**
```bash
ssh -i ~/.ssh/id_rsa render@backend-service.render.com
```

✅ **Use Render CLI to manage deployments:**
```bash
render deploy --service advancia-backend
```

✅ **Access service logs remotely:**
```bash
ssh -i ~/.ssh/id_rsa render@backend-service.render.com "tail -f /var/log/app.log"
```

---

## 📍 Your SSH Key Location

**Private Key (Keep Secret!):**
```
C:\Users\mucha.DESKTOP-H7T9NPM\.ssh\id_rsa
```

**Public Key (Share with Services):**
```
C:\Users\mucha.DESKTOP-H7T9NPM\.ssh\id_rsa.pub
```

---

## ⚠️ Important Notes

- ✅ Private key (`id_rsa`) is saved on your machine
- ✅ Public key (`id_rsa.pub`) is what you add to Render
- ⚠️ Never share your private key!
- ⚠️ Don't commit private key to GitHub!
- ✅ Already added to your `.gitignore` (if you have one)

---

## 🔗 Quick Links

- Add SSH Key: https://dashboard.render.com/account/ssh-keys
- Render Dashboard: https://dashboard.render.com
- Render CLI Docs: https://render.com/docs/cli

