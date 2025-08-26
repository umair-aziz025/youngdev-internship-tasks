# Password Strength Checker

A comprehensive web-based password strength analysis tool built for cybersecurity education. This application provides real-time password analysis, security recommendations, and management features.

## Features

### 🔍 Real-time Password Analysis
- **Strength Scoring**: Advanced algorithm scoring passwords from 0-100
- **Security Requirements**: Visual indicators for password criteria compliance
- **Crack Time Estimation**: Realistic time estimates based on modern attack methods
- **Pattern Detection**: Identifies common patterns and dictionary words

### 📊 Security Assessment
- **Character Set Analysis**: Uppercase, lowercase, numbers, special characters
- **Length Validation**: Minimum 8+ character requirement with 12+ recommendation
- **Common Pattern Detection**: Warns against predictable sequences
- **Visual Progress Bar**: Color-coded strength indicators

### 💾 Data Management
- **Local Storage**: Save analysis results for future reference (last 50 entries)
- **JSON Export**: Export individual analysis results with timestamps
- **Password History**: Complete history management with search and filtering
- **Secure Storage**: Passwords are masked with asterisks for privacy

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach with glassmorphism effects
- **Dark Theme**: Modern gradient background with blur effects
- **Interactive Elements**: Smooth animations and hover effects
- **Custom Modals**: Professional confirmation dialogs instead of browser alerts

### 🔐 Security Features
- **No Server Storage**: All data remains in browser local storage
- **Password Masking**: Actual passwords never stored in plain text
- **Client-side Analysis**: All processing done locally for privacy
- **Secure Cleanup**: Easy history management and deletion

## Technical Stack

- **Backend**: Node.js with Express.js and TypeScript
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Styling**: Tailwind CSS via CDN with custom glassmorphism effects
- **Icons**: Lucide React icon library
- **Storage**: Browser localStorage API
- **Build**: Single-file application with embedded frontend

## Password Analysis Algorithm

The strength calculation considers multiple factors:

- **Length Points**: 8+ chars (20pts), 12+ chars (+10pts)
- **Character Diversity**: Uppercase (15pts), lowercase (15pts), numbers (15pts), special chars (20pts)
- **Pattern Safety**: No common patterns (+5pts)
- **Final Classification**: Very Weak (0-29), Weak (30-49), Moderate (50-69), Strong (70-84), Very Strong (85-100)

## Crack Time Estimation

Based on modern attack scenarios:
- **Charset Size**: Dynamically calculated based on character types used
- **Attack Speed**: 1 billion guesses per second (realistic for modern hardware)
- **Time Formats**: Seconds to years with human-readable formatting

## Usage

### Starting the Application
```bash
npm install
npm run dev
```

### Using the Tool
1. Enter your password in the input field
2. View real-time analysis and recommendations
3. Save results to local storage for tracking
4. Export individual analyses as JSON files
5. Manage password history through the history modal

### API Endpoints
- `POST /api/check-password` - Analyze password strength
- `GET /api/password-history` - Retrieve password history (placeholder)

## Security Considerations

- **Privacy First**: No passwords transmitted or stored on server
- **Local Processing**: All analysis performed client-side
- **Masked Storage**: Only masked passwords stored in browser
- **No Network Exposure**: Passwords never leave the user's browser

## Installation Requirements

- Node.js 16+ 
- npm or yarn package manager
- Modern web browser with ES6+ support

## Development

### Project Structure
```
├── server/
│   └── index.ts          # Main server file with embedded frontend
├── package.json          # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── README.md           # This documentation
```

### Key Dependencies
- `express` - Web framework
- `typescript` - Type safety
- `tsx` - TypeScript execution
- `tailwindcss` - Styling framework
- `cross-env` - Environment variables

## Educational Purpose

This tool was created as part of a cybersecurity internship project to demonstrate:
- Password security best practices
- Real-time web application development
- Client-side security analysis
- Modern web development techniques
- User experience design for security tools

## License

Educational use only. Created for YoungDev Interns cybersecurity program.

---

**Project**: Cybersecurity Internship - Password Security Analysis Tool  
**Intern**: Umair Aziz  
**Position**: Cyber Security Intern  
**Organization**: YoungDev Interns  
**Motto**: "Empowering Tomorrow's Developers Today"