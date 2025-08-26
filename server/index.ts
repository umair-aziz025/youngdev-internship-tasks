import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Password strength analysis endpoint
app.post('/api/check-password', (req, res) => {
  const { password } = req.body;
  
  const analysis = analyzePassword(password);
  
  // Return empty response for empty password
  if (!analysis) {
    return res.json({ empty: true });
  }
  
  res.json(analysis);
});

// Password history endpoint
app.get('/api/password-history', (req, res) => {
  // In a real app, this would come from a database
  res.json([]);
});

function analyzePassword(password: string) {
  // Return null for empty password
  if (!password || password.length === 0) {
    return null;
  }

  const result = {
    score: 0,
    strength: 'Very Weak',
    feedback: [] as string[],
    details: {
      length: password.length,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      hasCommonPatterns: checkCommonPatterns(password),
      estimatedCrackTime: estimateCrackTime(password)
    }
  };

  // Score calculation
  if (result.details.length >= 8) result.score += 20;
  if (result.details.length >= 12) result.score += 10;
  if (result.details.hasUppercase) result.score += 15;
  if (result.details.hasLowercase) result.score += 15;
  if (result.details.hasNumbers) result.score += 15;
  if (result.details.hasSpecialChars) result.score += 20;
  if (!result.details.hasCommonPatterns) result.score += 5;

  // Strength classification
  if (result.score >= 85) result.strength = 'Very Strong';
  else if (result.score >= 70) result.strength = 'Strong';
  else if (result.score >= 50) result.strength = 'Moderate';
  else if (result.score >= 30) result.strength = 'Weak';

  // Generate feedback
  generateFeedback(result);

  return result;
}

function checkCommonPatterns(password: string): boolean {
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /welcome/i
  ];
  
  return commonPatterns.some(pattern => pattern.test(password));
}

function estimateCrackTime(password: string): string {
  const charset = getCharsetSize(password);
  const combinations = Math.pow(charset, password.length);
  const guessesPerSecond = 1000000000; // 1 billion guesses per second
  const secondsToCrack = combinations / (2 * guessesPerSecond);
  
  return formatTime(secondsToCrack);
}

function getCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) size += 32;
  return size;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return 'Less than a minute';
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.ceil(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.ceil(seconds / 2592000)} months`;
  return `${Math.ceil(seconds / 31536000)} years`;
}

function generateFeedback(result: any) {
  if (result.details.length < 8) {
    result.feedback.push('Use at least 8 characters');
  }
  if (!result.details.hasUppercase) {
    result.feedback.push('Add uppercase letters (A-Z)');
  }
  if (!result.details.hasLowercase) {
    result.feedback.push('Add lowercase letters (a-z)');
  }
  if (!result.details.hasNumbers) {
    result.feedback.push('Add numbers (0-9)');
  }
  if (!result.details.hasSpecialChars) {
    result.feedback.push('Add special characters (!@#$%^&*)');
  }
  if (result.details.hasCommonPatterns) {
    result.feedback.push('Avoid common patterns and dictionary words');
  }
  if (result.details.length < 12) {
    result.feedback.push('Consider using 12+ characters for better security');
  }
}

// Serve the main HTML file for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Advanced Password Strength Checker - Analyze your password security and get recommendations for stronger passwords. Built for cybersecurity education." />
    <title>Password Strength Checker - Cybersecurity Tool | YoungDev Interns</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
      body {
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
        min-height: 100vh;
      }
      .glass {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .strength-very-weak { color: #ef4444; }
      .strength-weak { color: #f97316; }
      .strength-moderate { color: #eab308; }
      .strength-strong { color: #3b82f6; }
      .strength-very-strong { color: #22c55e; }
      .bg-very-weak { background: #ef4444; }
      .bg-weak { background: #f97316; }
      .bg-moderate { background: #eab308; }
      .bg-strong { background: #3b82f6; }
      .bg-very-strong { background: #22c55e; }
    </style>
  </head>
  <body>
    <div id="app">
      <!-- Header -->
      <header class="bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-10">
        <div class="container mx-auto px-4 py-6">
          <div class="flex items-center justify-center space-x-3">
            <i data-lucide="shield" class="w-8 h-8 text-cyan-400"></i>
            <h1 class="text-3xl font-bold text-white">Password Strength Checker</h1>
            <i data-lucide="lock" class="w-8 h-8 text-cyan-400"></i>
          </div>
          <p class="text-center text-gray-300 mt-2">
            Analyze your password security and get recommendations
          </p>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <!-- Password Input Section -->
          <div class="glass rounded-2xl p-8 mb-8">
            <div class="space-y-6">
              <div>
                <label for="password" class="block text-white text-lg font-medium mb-3">
                  Enter Your Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Type your password here..."
                    class="w-full px-6 py-4 bg-black bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    oninput="analyzePassword(this.value)"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onclick="togglePassword()"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    data-testid="button-toggle-password"
                  >
                    <i data-lucide="eye" id="eye-icon" class="w-5 h-5"></i>
                  </button>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div id="action-buttons" class="hidden flex flex-wrap gap-3 justify-center">
                <button
                  onclick="saveResult()"
                  class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  data-testid="button-save-result"
                >
                  <i data-lucide="save" class="w-4 h-4"></i>
                  <span>Save Result</span>
                </button>
                
                <button
                  onclick="exportToJSON()"
                  class="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  data-testid="button-export-json"
                >
                  <i data-lucide="download" class="w-4 h-4"></i>
                  <span>Export JSON</span>
                </button>
                
                <button
                  onclick="showHistory()"
                  class="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  data-testid="button-show-history"
                >
                  <i data-lucide="history" class="w-4 h-4"></i>
                  <span>View History</span>
                </button>
                
                <button
                  onclick="clearHistory()"
                  class="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  data-testid="button-clear-history"
                >
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                  <span>Clear History</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Analysis Results -->
          <div id="results" class="hidden grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Strength Overview -->
            <div class="glass rounded-2xl p-6">
              <h2 class="text-2xl font-bold text-white mb-6">Strength Analysis</h2>
              
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-white font-medium">Overall Score</span>
                    <span id="score" class="font-bold text-xl">0/100</span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-3">
                    <div id="progress-bar" class="h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                  </div>
                </div>
                
                <div class="text-center py-4">
                  <span id="strength-text" class="text-2xl font-bold">Very Weak</span>
                </div>

                <div class="bg-black bg-opacity-30 rounded-lg p-4">
                  <span class="text-white font-medium">Estimated Crack Time:</span>
                  <div id="crack-time" class="text-cyan-400 font-bold text-lg mt-1">
                    Less than a minute
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Requirements -->
            <div class="glass rounded-2xl p-6">
              <h2 class="text-2xl font-bold text-white mb-6">Security Requirements</h2>
              
              <div id="requirements" class="space-y-3">
                <!-- Requirements will be populated by JavaScript -->
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div id="recommendations" class="hidden glass rounded-2xl p-6 mb-8">
            <h2 class="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <i data-lucide="alert-triangle" class="w-6 h-6 text-yellow-400"></i>
              <span>Recommendations</span>
            </h2>
            <ul id="feedback-list" class="space-y-2">
              <!-- Recommendations will be populated by JavaScript -->
            </ul>
          </div>

          <!-- Password History Modal -->
          <div id="history-modal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm hidden flex items-center justify-center z-50">
            <div class="glass rounded-2xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white flex items-center space-x-2">
                  <i data-lucide="history" class="w-6 h-6 text-cyan-400"></i>
                  <span>Password History</span>
                </h2>
                <button
                  onclick="hideHistory()"
                  class="text-gray-400 hover:text-white transition-colors"
                  data-testid="button-close-history"
                >
                  <i data-lucide="x" class="w-6 h-6"></i>
                </button>
              </div>
              
              <div id="history-content" class="space-y-4">
                <p class="text-gray-400 text-center py-8">No password analysis history found.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-black bg-opacity-20 backdrop-blur-sm border-t border-white border-opacity-10 py-8">
        <div class="container mx-auto px-4">
          <div class="text-center space-y-4">
            <div class="flex items-center justify-center space-x-2">
              <i data-lucide="shield" class="w-6 h-6 text-cyan-400"></i>
              <span class="text-white font-bold text-lg">Cyber Security Internship Project</span>
            </div>
            
            <div class="bg-white bg-opacity-10 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 class="text-cyan-400 font-bold text-lg mb-3">YoungDev Interns</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                <strong>Intern:</strong> Umair Aziz<br />
                <strong>Position:</strong> Cyber Security Intern<br />
                <strong>Duration:</strong> 4 weeks | <strong>Start Date:</strong> 18-08-2025<br />
                <em>"Empowering Tomorrow's Developers Today"</em>
              </p>
              <p class="text-cyan-400 text-sm mt-3 font-medium">
                CEO YoungDev Interns
              </p>
            </div>
            
            <p class="text-gray-400 text-sm">
              © 2025 Password Strength Checker. Built for cybersecurity education.
            </p>
          </div>
        </div>
      </footer>
    </div>

    <script>
      // Initialize Lucide icons
      lucide.createIcons();

      let showPassword = false;
      let currentAnalysis = null;

      function togglePassword() {
        const input = document.getElementById('password');
        const icon = document.getElementById('eye-icon');
        
        showPassword = !showPassword;
        input.type = showPassword ? 'text' : 'password';
        icon.setAttribute('data-lucide', showPassword ? 'eye-off' : 'eye');
        lucide.createIcons();
      }

      async function analyzePassword(password) {
        // Handle empty password
        if (!password || password.trim().length === 0) {
          document.getElementById('results').classList.add('hidden');
          document.getElementById('recommendations').classList.add('hidden');
          document.getElementById('action-buttons').classList.add('hidden');
          currentAnalysis = null;
          return;
        }

        try {
          const response = await fetch('/api/check-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
          });
          
          const analysis = await response.json();
          
          // Check if empty response
          if (analysis.empty) {
            document.getElementById('results').classList.add('hidden');
            document.getElementById('recommendations').classList.add('hidden');
            document.getElementById('action-buttons').classList.add('hidden');
            currentAnalysis = null;
            return;
          }
          
          currentAnalysis = {
            ...analysis,
            password: password.replace(/./g, '*'), // Masked password for storage
            timestamp: new Date().toISOString(),
            id: Date.now()
          };
          
          displayResults(analysis);
        } catch (error) {
          console.error('Error analyzing password:', error);
        }
      }

      function displayResults(analysis) {
        document.getElementById('results').classList.remove('hidden');
        document.getElementById('action-buttons').classList.remove('hidden');
        
        // Update score and progress
        document.getElementById('score').textContent = analysis.score + '/100';
        document.getElementById('progress-bar').style.width = analysis.score + '%';
        
        // Update strength text and colors
        const strengthText = document.getElementById('strength-text');
        const progressBar = document.getElementById('progress-bar');
        const scoreElement = document.getElementById('score');
        
        const strengthClass = 'strength-' + analysis.strength.toLowerCase().replace(' ', '-');
        const bgClass = 'bg-' + analysis.strength.toLowerCase().replace(' ', '-');
        
        strengthText.textContent = analysis.strength;
        strengthText.className = 'text-2xl font-bold ' + strengthClass;
        scoreElement.className = 'font-bold text-xl ' + strengthClass;
        progressBar.className = 'h-3 rounded-full transition-all duration-500 ' + bgClass;
        
        // Update crack time
        document.getElementById('crack-time').textContent = analysis.details.estimatedCrackTime;
        
        // Update requirements
        updateRequirements(analysis.details);
        
        // Update recommendations
        updateRecommendations(analysis.feedback);
        
        // Recreate icons after DOM update
        lucide.createIcons();
      }

      function updateRequirements(details) {
        const requirements = [
          { label: 'Length (8+ characters)', met: details.length >= 8, detail: details.length + ' characters' },
          { label: 'Uppercase Letters', met: details.hasUppercase, detail: details.hasUppercase ? 'Found' : 'Missing' },
          { label: 'Lowercase Letters', met: details.hasLowercase, detail: details.hasLowercase ? 'Found' : 'Missing' },
          { label: 'Numbers', met: details.hasNumbers, detail: details.hasNumbers ? 'Found' : 'Missing' },
          { label: 'Special Characters', met: details.hasSpecialChars, detail: details.hasSpecialChars ? 'Found' : 'Missing' },
          { label: 'No Common Patterns', met: !details.hasCommonPatterns, detail: details.hasCommonPatterns ? 'Common patterns detected' : 'Safe' },
        ];

        const container = document.getElementById('requirements');
        container.innerHTML = requirements.map(req => 
          '<div class="flex items-center justify-between p-3 bg-black bg-opacity-20 rounded-lg">' +
            '<div class="flex items-center space-x-3">' +
              '<i data-lucide="' + (req.met ? 'check-circle' : 'x-circle') + '" class="w-5 h-5 ' + (req.met ? 'text-green-400' : 'text-red-400') + '"></i>' +
              '<span class="text-white">' + req.label + '</span>' +
            '</div>' +
            '<span class="text-sm ' + (req.met ? 'text-green-400' : 'text-red-400') + '">' + req.detail + '</span>' +
          '</div>'
        ).join('');
      }

      function updateRecommendations(feedback) {
        if (feedback.length === 0) {
          document.getElementById('recommendations').classList.add('hidden');
          return;
        }

        document.getElementById('recommendations').classList.remove('hidden');
        const list = document.getElementById('feedback-list');
        list.innerHTML = feedback.map(item => 
          '<li class="flex items-center space-x-3 text-gray-300">' +
            '<div class="w-2 h-2 bg-yellow-400 rounded-full"></div>' +
            '<span>' + item + '</span>' +
          '</li>'
        ).join('');
      }

      // Save result to local storage
      function saveResult() {
        if (!currentAnalysis) {
          alert('No analysis to save!');
          return;
        }

        let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        history.unshift(currentAnalysis);
        
        // Keep only last 50 results
        if (history.length > 50) {
          history = history.slice(0, 50);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        
        // Show success message
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>Saved!</span>';
        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('bg-green-600');
          button.classList.add('bg-blue-600', 'hover:bg-blue-700');
          lucide.createIcons();
        }, 2000);
        
        lucide.createIcons();
      }

      // Export current result to JSON
      function exportToJSON() {
        if (!currentAnalysis) {
          alert('No analysis to export!');
          return;
        }

        const dataStr = JSON.stringify(currentAnalysis, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'password-analysis-' + new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-') + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success message
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>Exported!</span>';
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-blue-600');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('bg-blue-600');
          button.classList.add('bg-green-600', 'hover:bg-green-700');
          lucide.createIcons();
        }, 2000);
        
        lucide.createIcons();
      }

      // Show password history modal
      function showHistory() {
        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        const modal = document.getElementById('history-modal');
        const content = document.getElementById('history-content');

        if (history.length === 0) {
          content.innerHTML = '<p class="text-gray-400 text-center py-8">No password analysis history found.</p>';
        } else {
          content.innerHTML = history.map((item, index) => {
            const date = new Date(item.timestamp).toLocaleString();
            const strengthClass = 'strength-' + item.strength.toLowerCase().replace(' ', '-');
            
            return '<div class="glass rounded-lg p-4 mb-4">' +
              '<div class="flex justify-between items-start mb-3">' +
                '<div class="flex items-center space-x-3">' +
                  '<span class="text-white font-medium">#' + (index + 1) + '</span>' +
                  '<span class="text-gray-400 text-sm">' + date + '</span>' +
                '</div>' +
                '<button onclick="deleteHistoryItem(' + item.id + ')" class="text-red-400 hover:text-red-300">' +
                  '<i data-lucide="trash-2" class="w-4 h-4"></i>' +
                '</button>' +
              '</div>' +
              '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">' +
                '<div><span class="text-gray-400">Password:</span><br><span class="text-white font-mono">' + item.password + '</span></div>' +
                '<div><span class="text-gray-400">Score:</span><br><span class="text-white font-bold">' + item.score + '/100</span></div>' +
                '<div><span class="text-gray-400">Strength:</span><br><span class="' + strengthClass + ' font-bold">' + item.strength + '</span></div>' +
                '<div><span class="text-gray-400">Crack Time:</span><br><span class="text-cyan-400">' + item.details.estimatedCrackTime + '</span></div>' +
              '</div>' +
            '</div>';
          }).join('');
        }

        modal.classList.remove('hidden');
        lucide.createIcons();
      }

      // Hide password history modal
      function hideHistory() {
        document.getElementById('history-modal').classList.add('hidden');
      }

      // Delete specific history item
      function deleteHistoryItem(id) {
        let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        history = history.filter(item => item.id !== id);
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        showHistory(); // Refresh the modal
      }

      // Clear all password history
      function clearHistory() {
        if (confirm('Are you sure you want to clear all password history? This action cannot be undone.')) {
          localStorage.removeItem('passwordHistory');
          
          const button = event.target.closest('button');
          const originalText = button.innerHTML;
          button.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>Cleared!</span>';
          button.classList.remove('bg-red-600', 'hover:bg-red-700');
          button.classList.add('bg-gray-600');
          
          setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('bg-gray-600');
            button.classList.add('bg-red-600', 'hover:bg-red-700');
            lucide.createIcons();
          }, 2000);
          
          lucide.createIcons();
        }
      }

      // Close modal when clicking outside
      document.getElementById('history-modal').addEventListener('click', function(e) {
        if (e.target === this) {
          hideHistory();
        }
      });
    </script>
  </body>
</html>
  `;
  
  res.send(htmlContent);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 Password Strength Checker running on http://localhost:${PORT}`);
  console.log(`📱 Frontend available at: http://localhost:${PORT}`);
  console.log(`🔧 API available at: http://localhost:${PORT}/api`);
});