import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Download, Save, Shield, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PasswordAnalysis {
  score: number;
  strength: string;
  feedback: string[];
  details: {
    length: number;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    hasCommonPatterns: boolean;
    estimatedCrackTime: string;
  };
}

interface SavedResult {
  id: string;
  password: string;
  analysis: PasswordAnalysis;
  timestamp: Date;
}

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const checkPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
    },
  });

  useEffect(() => {
    if (password.length > 0) {
      const timer = setTimeout(() => {
        checkPasswordMutation.mutate(password);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
  }, [password]);

  useEffect(() => {
    const saved = localStorage.getItem('passwordHistory');
    if (saved) {
      setSavedResults(JSON.parse(saved));
    }
  }, []);

  const saveResult = () => {
    if (!analysis || !password) return;
    
    const newResult: SavedResult = {
      id: Date.now().toString(),
      password: password.slice(0, 3) + '*'.repeat(password.length - 3),
      analysis,
      timestamp: new Date(),
    };
    
    const updated = [newResult, ...savedResults.slice(0, 9)]; // Keep only 10 results
    setSavedResults(updated);
    localStorage.setItem('passwordHistory', JSON.stringify(updated));
  };

  const exportResults = () => {
    if (!analysis) return;
    
    const exportData = {
      password: password.slice(0, 3) + '*'.repeat(password.length - 3),
      analysis,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `password-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'text-green-400';
      case 'Strong': return 'text-blue-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Weak': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  const getStrengthBg = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'bg-green-500';
      case 'Strong': return 'bg-blue-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Weak': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  const clearHistory = () => {
    setSavedResults([]);
    localStorage.removeItem('passwordHistory');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Password Strength Checker</h1>
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-center text-gray-300 mt-2">
            Analyze your password security and get recommendations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Password Input Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-white text-lg font-medium mb-3">
                  Enter Your Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type your password here..."
                    className="w-full px-6 py-4 bg-black/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    data-testid="button-toggle-visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {analysis && (
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={saveResult}
                    className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                    data-testid="button-save-result"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Result</span>
                  </button>
                  <button
                    onClick={exportResults}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    data-testid="button-export-result"
                  >
                    <Download className="w-5 h-5" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    data-testid="button-toggle-history"
                  >
                    <span>{showHistory ? 'Hide' : 'Show'} History</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Strength Overview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Strength Analysis</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Overall Score</span>
                      <span className={`font-bold text-xl ${getStrengthColor(analysis.strength)}`}>
                        {analysis.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getStrengthBg(analysis.strength)}`}
                        style={{ width: `${analysis.score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <span className={`text-2xl font-bold ${getStrengthColor(analysis.strength)}`}>
                      {analysis.strength}
                    </span>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4">
                    <span className="text-white font-medium">Estimated Crack Time:</span>
                    <div className="text-cyan-400 font-bold text-lg mt-1">
                      {analysis.details.estimatedCrackTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Requirements */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Security Requirements</h2>
                
                <div className="space-y-3">
                  {[
                    { label: 'Length (8+ characters)', met: analysis.details.length >= 8, detail: `${analysis.details.length} characters` },
                    { label: 'Uppercase Letters', met: analysis.details.hasUppercase, detail: analysis.details.hasUppercase ? 'Found' : 'Missing' },
                    { label: 'Lowercase Letters', met: analysis.details.hasLowercase, detail: analysis.details.hasLowercase ? 'Found' : 'Missing' },
                    { label: 'Numbers', met: analysis.details.hasNumbers, detail: analysis.details.hasNumbers ? 'Found' : 'Missing' },
                    { label: 'Special Characters', met: analysis.details.hasSpecialChars, detail: analysis.details.hasSpecialChars ? 'Found' : 'Missing' },
                    { label: 'No Common Patterns', met: !analysis.details.hasCommonPatterns, detail: analysis.details.hasCommonPatterns ? 'Common patterns detected' : 'Safe' },
                  ].map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {req.met ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-white">{req.label}</span>
                      </div>
                      <span className={`text-sm ${req.met ? 'text-green-400' : 'text-red-400'}`}>
                        {req.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis && analysis.feedback.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <span>Recommendations</span>
              </h2>
              <ul className="space-y-2">
                {analysis.feedback.map((item, index) => (
                  <li key={index} className="flex items-center space-x-3 text-gray-300">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* History Section */}
          {showHistory && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Password History</h2>
                {savedResults.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    data-testid="button-clear-history"
                  >
                    Clear History
                  </button>
                )}
              </div>
              
              {savedResults.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No saved results yet</p>
              ) : (
                <div className="space-y-4">
                  {savedResults.map((result) => (
                    <div key={result.id} className="bg-black/20 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">{result.password}</span>
                          <div className={`inline-block ml-3 px-3 py-1 rounded-full text-sm ${getStrengthColor(result.analysis.strength)}`}>
                            {result.analysis.strength}
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(result.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span className="text-white font-bold text-lg">Cyber Security Internship Project</span>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-cyan-400 font-bold text-lg mb-3">YoungDev Interns</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                <strong>Intern:</strong> Umair Aziz<br />
                <strong>Position:</strong> Cyber Security Intern<br />
                <strong>Duration:</strong> 4 weeks | <strong>Start Date:</strong> 18-08-2025<br />
                <em>"Empowering Tomorrow's Developers Today"</em>
              </p>
              <p className="text-cyan-400 text-sm mt-3 font-medium">
                CEO YoungDev Interns
              </p>
            </div>
            
            <p className="text-gray-400 text-sm">
              © 2025 Password Strength Checker. Built for cybersecurity education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}