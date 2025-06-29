# Your Best Friend Anytime

## 🚀 Introduction

Your personal AI best friend available 24/7. This React application provides a friendly, supportive companion for conversations powered by Tavus's Conversational Video Interface technology.

> ⚠️ **Important Note**: This is a development template only. For production use, you must:
> - Never expose your Tavus API keys in the frontend
> - Implement a secure backend service to handle API calls
> - Use environment variables and proper key management
> - Follow security best practices for handling sensitive credentials

## 🤖 Current Configuration
- **Replica ID**: r91c80eca351
- **Conversation Status**: Active
- **Last Updated**: June 28, 8:21 pm

<br></br>
## 🛠️ Tech Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
<br></br>
## 🧑‍💻 Try it Live
Spin up this template in under a minute with StackBlitz:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Tavus-Engineering/tavus-vibecode-quickstart?file=src%2FApp.tsx)

<br></br>
## ⚡ Quick Start

1. **Get your API credentials:**
   - Create an account on [Tavus Platform](https://platform.tavus.io/api-keys)
   - Generate your API token

2. **Run the application:**
   ```bash
   npm install
   npm run dev
   ```

3. **Customize your AI friend persona:**
   - Update the `persona_id` and `replica_id` in `createConversation.ts` with your own
   - Learn how to [create your own persona](https://docs.tavus.io/sections/conversational-video-interface/creating-a-persona) on the [Tavus Platform](https://platform.tavus.io/)

   ```typescript
   body: JSON.stringify({
     persona_id: "your_persona_id_here",
     replica_id: "your_replica_id_here",
   }),
   ```

<br></br>
## 📚 Resources

- [Tavus Documentation](https://docs.tavus.io/)
- [API Reference](https://docs.tavus.io/api-reference/)
- [Tavus Platform](https://platform.tavus.io/)
- [Daily React Reference](https://docs.daily.co/reference/daily-react)