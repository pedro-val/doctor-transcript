# Medical AI Assistant

A responsive Next.js application that records medical consultations, transcribes audio using OpenAI Whisper, and generates structured reports with GPT-4o. Fully functional frontend-only application with secure API routes.

## ✨ Features

- **Audio Recording & Upload**: Record consultations or upload audio files (unlimited duration)
- **AI Transcription**: Automatic transcription using OpenAI Whisper API
- **Smart Report Generation**: Create structured medical reports with GPT-4o
- **Custom Prompts**: Fully configurable system prompts and instructions
- **Large File Support**: Automatic chunking for files of any size
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Internationalization**: Portuguese and English language support
- **Real-time Progress**: Detailed progress indicators for each processing stage

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **AI Integration**: OpenAI Whisper API (transcription), OpenAI GPT-4o (report generation)
- **Forms**: React Hook Form + Zod validation
- **Audio**: MediaRecorder API, File upload support
- **Architecture**: Clean Architecture principles, SOLID design patterns

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/your-username/medical-ai-assistant.git
cd medical-ai-assistant
```

2. **Set up environment variables**
```bash
# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

3. **Run with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000)

### Alternative: Docker Build & Run

```bash
# Build the image
docker build -t medical-ai-assistant .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_api_key_here \
  --name medical-ai-assistant \
  medical-ai-assistant
```

## 🚀 Development

For local development without Docker:

```bash
npm install
npm run dev
```

## 🔒 Security

- API keys are kept server-side only
- No data persistence (stateless application)
- Secure API routes proxy requests to OpenAI
- Frontend never exposes API credentials

## ⚠️ Important Notes

- **Demo Purpose**: This application is for demonstration only
- **API Costs**: OpenAI API usage incurs costs - monitor your usage
- **Medical Use**: Always validate medical information with qualified professionals
- **Privacy**: Do not use with real patient data without proper authorization

## 📄 License

Educational and demonstration purposes.

---

Built with ❤️ for you mom!
