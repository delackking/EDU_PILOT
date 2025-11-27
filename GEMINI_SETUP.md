# 🔧 Gemini API Setup Guide

## Issue Identified

Your Gemini API key is loaded correctly but returns **404 Not Found** errors. This means:
1. The API key might be invalid or expired
2. The Generative Language API is not enabled for your key
3. You might need to create a new API key

## ✅ Solution: Get a Valid Gemini API Key

### Step 1: Visit Google AI Studio
Go to: **https://aistudio.google.com/app/apikey**

### Step 2: Create New API Key
1. Click "Create API Key"
2. Select "Create API key in new project" (recommended)
3. Copy the generated key (starts with `AIzaSy...`)

### Step 3: Update Your `.env` File
Open `e:\education-app\.env` and update:

```env
GEMINI_API_KEY=your_new_api_key_here
```

**Important**: Make sure there are NO spaces around the `=` sign and NO quotes around the key.

### Step 4: Restart the Backend Server
1. Stop the current server (Ctrl+C in the terminal)
2. Run: `node server.js`
3. You should see: `🚀 EduPilot Server running...` (without the API key warning)

### Step 5: Test the AI Tutor
1. Go to http://localhost:3000/student/ai-tutor
2. Enter:
   - **Topic**: Science
   - **Question**: What is photosynthesis?
   - **Mode**: Normal
3. Click "Get Explanation"
4. You should see an AI-generated response!

## 🧪 Quick Test

Run this command to test your API key:
```bash
node test-gemini.js
```

If it shows `✅ gemini-1.5-flash works!`, your API key is valid!

## 📝 Notes

- **Free Tier**: Google AI Studio provides a generous free tier
- **Rate Limits**: 60 requests per minute (plenty for testing)
- **Models Updated**: We're now using `gemini-1.5-flash` (the latest model)
- **Old Keys**: If you have an old API key from 2023, it might not work with new models

## ❓ Troubleshooting

**Still getting errors?**
1. Make sure you're using the API key from **aistudio.google.com** (not Google Cloud Console)
2. Check that the key has no extra spaces or line breaks
3. Try creating a brand new API key
4. Restart the backend server after changing the `.env` file

**Need help?**
- Google AI Studio: https://aistudio.google.com
- Gemini API Docs: https://ai.google.dev/tutorials/get_started_web

---

Once you have a valid API key, the AI Tutor will work perfectly! 🤖✨
