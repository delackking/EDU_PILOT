# 🚀 Groq API Setup Guide for EduPilot

## What is Groq?

**Groq** is a fast AI inference platform that provides access to open-source models like **Llama 3.1 8B Instant**. It's:
- ✅ **Free** to use (generous free tier)
- ✅ **Fast** (optimized for speed)
- ✅ **Reliable** (better availability than Gemini)
- ✅ **Open-source models** (Llama, Mixtral, etc.)

---

## 🔑 Get Your Groq API Key (2 minutes)

### Step 1: Visit Groq Console
Go to: **https://console.groq.com/keys**

### Step 2: Sign Up
- Click "Sign Up" (or "Sign In" if you have an account)
- Use Google, GitHub, or email
- It's completely **FREE**!

### Step 3: Create API Key
1. Click "Create API Key"
2. Give it a name (e.g., "EduPilot")
3. Copy the key (starts with `gsk_...`)

### Step 4: Add to `.env` File
Open `e:\education-app\.env` and add:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

**Important**: 
- Replace the old `GEMINI_API_KEY` line with `GROQ_API_KEY`
- No spaces around the `=` sign
- No quotes around the key

### Step 5: Restart Backend Server
```bash
# Stop the current server (Ctrl+C)
node server.js
```

You should see: `🚀 EduPilot Server running...` (without API key warning)

---

## 🧪 Test Your Setup

Run the test script:
```bash
node test-groq.js
```

**Expected output:**
```
✅ Groq API Test Successful!
Model: llama-3.1-8b-instant
Response: [AI explanation about photosynthesis]
🎉 Your AI Tutor is ready to use!
```

---

## 🎯 Try the AI Tutor

1. Go to http://localhost:3000/student/ai-tutor
2. Enter:
   - **Topic**: Science
   - **Question**: What is photosynthesis?
   - **Mode**: Normal (or try ELI5, Story, etc.)
3. Click "Get Explanation"
4. **You should see an AI-generated response!** 🎉

---

## 📊 What Changed from Gemini?

| Feature | Gemini (Old) | Groq (New) |
|---------|--------------|------------|
| **Model** | gemini-pro (deprecated) | llama-3.1-8b-instant |
| **Speed** | Moderate | Very Fast ⚡ |
| **Availability** | Had issues | Reliable ✅ |
| **Image Support** | Yes | Limited (text only for now) |
| **Cost** | Free tier | Free tier |

---

## ⚠️ Known Limitations

### Image Upload Mode
- **Status**: Not yet supported with Groq
- **Reason**: Groq's vision capabilities are still in development
- **Workaround**: Use the Chat Mode for text-based questions

The AI Tutor will show a helpful message if you try to upload an image.

---

## 🆘 Troubleshooting

### "GROQ_API_KEY not set" Error
- Make sure you added the key to `.env` file
- Check for typos: `GROQ_API_KEY` (not GROK or GEMINI)
- Restart the backend server

### "401 Unauthorized" Error
- Your API key might be invalid
- Create a new key at https://console.groq.com/keys
- Make sure you copied the entire key

### "Failed to generate explanation"
- Check your internet connection
- Verify the API key is correct
- Try the test script: `node test-groq.js`

---

## 🎓 Available Models on Groq

You can use these models (we're using `llama-3.1-8b-instant`):

- **llama-3.1-8b-instant** ⚡ (Fastest, what we use)
- **llama-3.1-70b-versatile** (More powerful, slower)
- **mixtral-8x7b-32768** (Good for long context)
- **gemma-7b-it** (Google's open model)

---

## 📚 Resources

- **Groq Console**: https://console.groq.com
- **Groq Documentation**: https://console.groq.com/docs
- **API Reference**: https://console.groq.com/docs/api-reference

---

## ✅ Quick Checklist

- [ ] Got Groq API key from https://console.groq.com/keys
- [ ] Added `GROQ_API_KEY=gsk_...` to `.env` file
- [ ] Removed or commented out old `GEMINI_API_KEY` line
- [ ] Restarted backend server
- [ ] Ran `node test-groq.js` successfully
- [ ] Tested AI Tutor at http://localhost:3000/student/ai-tutor

---

**Once all steps are complete, your AI Tutor will work perfectly!** 🚀🤖
