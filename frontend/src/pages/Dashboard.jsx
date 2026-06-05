import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext, API_URL } from '../App';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  // States
  const [history, setHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [historyLoading, setHistoryLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch History on Mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/analyze/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Remedies mapping — matches Django implementation exactly
  const getRemedies = (label) => {
    const remedyMap = {
      'curl': [
        'Remove and destroy infected leaves or plants.',
        'Spray neem oil or insecticidal soap to control whiteflies and aphids.',
        'Keep soil consistently moist (avoid overwatering).',
        'Apply mulch to reduce heat stress and conserve moisture.',
        'Use insect-proof nets to prevent insect-borne viruses.',
        'Sanitize tools after working on infected plants.'
      ],
      'healthy': [
        'No treatment needed — maintain good care.',
        'Water properly at the root zone.',
        'Use mulch to maintain moisture.',
        'Apply balanced fertilizer as needed.',
        'Maintain good spacing and airflow.',
        'Inspect plants weekly for early signs of issues.'
      ],
      'bacterial': [
        'Remove infected leaves and dispose of them away from field/garden.',
        'Avoid overhead watering; use drip irrigation.',
        'Increase spacing or prune to improve airflow.',
        'Clean tools with alcohol/bleach solution after each plant.',
        'Apply copper-based bactericide if disease continues.',
        'Remove plant debris after harvesting to prevent spread.'
      ],
      'cercospora': [
        'Cut and remove infected leaves immediately.',
        'Clean fallen leaves and debris around plants.',
        'Improve air circulation by light pruning.',
        'Avoid overhead watering; water early in the day.',
        'Use protectant fungicides or biological fungicides if needed.',
        'Rotate crops and avoid planting too close together.'
      ]
    };

    const dl = String(label || '').trim().toLowerCase();
    if (!dl) return ['No specific recommendations available for this disease.'];

    // Exact case-insensitive match
    if (remedyMap[dl]) return remedyMap[dl];

    // Substring match
    const keySub = Object.keys(remedyMap).find(k => k.includes(dl) || dl.includes(k));
    if (keySub) return remedyMap[keySub];

    // Token overlap match
    const words = dl.split(/\s+/).filter(Boolean);
    const keyToken = Object.keys(remedyMap).find(k => words.some(w => k.includes(w)));
    if (keyToken) return remedyMap[keyToken];

    return ['No specific recommendations available for this disease.'];
  };

  // File Upload Handlers
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      alert('File size too large. Please choose an image under 10MB.');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please choose a JPG, PNG, or WebP image.');
      return false;
    }

    return true;
  };

  const processFile = (file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    handleInference(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Run Inference on backend
  const handleInference = async (file) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Parse result (matches JS mapping logic in home.html)
      const preds = res.data.predictions || [];
      let primary = null;
      if (preds.length === 1) {
        primary = preds[0];
      } else if (preds.length > 1) {
        primary = preds.reduce((best, cur) => {
          const b = best && best.confidence ? best.confidence : 0;
          const c = cur && cur.confidence ? cur.confidence : 0;
          return c > b ? cur : best;
        }, preds[0]);
      }

      const diseaseLabel = primary ? (primary.class || primary.label) : 'healthy';
      const confidencePct = primary ? Math.round(primary.confidence * 100) : 100;

      setAnalysisResult({
        disease: diseaseLabel,
        confidence: confidencePct,
        remedies: getRemedies(diseaseLabel)
      });

      // Set image source to annotated result
      if (res.data.annotated_url) {
        setPreviewUrl(`${API_URL}${res.data.annotated_url}`);
      }

      // Refresh prediction history list
      fetchHistory();
    } catch (err) {
      console.error('Inference error:', err);
      alert('Analysis failed. ' + (err.response?.data?.error || err.message));
      resetDemo();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDemo = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // History Actions
  const handleSelectHistoryItem = (item) => {
    setPreviewUrl(`${API_URL}/uploads/${item.annotatedName}`);
    setAnalysisResult({
      disease: item.disease,
      confidence: item.confidence,
      remedies: getRemedies(item.disease)
    });
    setActiveTab('new'); // Switch to main pane to show selection
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this prediction record?')) return;

    try {
      await axios.delete(`${API_URL}/api/analyze/history/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
      // Reset if deleted item was currently selected
      resetDemo();
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete history record.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[320px] h-[320px] bg-purple-900/10 rounded-full blur-[60px] floating-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[320px] h-[320px] bg-yellow-900/10 rounded-full blur-[60px] floating-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] left-[10%] w-[320px] h-[320px] bg-pink-900/10 rounded-full blur-[60px] floating-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-900/40 border-b border-slate-800/80 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Capsiguard</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden sm:inline text-slate-400 text-sm">
              Logged in as: <strong className="text-slate-200">{user?.username}</strong>
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 border border-red-500/30 text-red-400 hover:text-white hover:bg-red-500 hover:border-transparent rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-500/5 hover:scale-[1.02]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-28 pb-16 relative z-10 flex flex-col gap-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-850 text-xs font-semibold text-slate-300 mb-4">
            <svg className="text-yellow-500 animate-pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
            <span>AI-Powered Chilli Disease Detection</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Disease Analysis Center</h2>
          <p className="text-slate-400 text-sm md:text-base">
            Upload a photo of your chilli plant leaf for instant machine learning diagnostics and remedies.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'new' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            New Analysis
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'history' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            My History ({history.length})
          </button>
        </div>

        {/* Tab Content: New Analysis */}
        {activeTab === 'new' && (
          <div className="w-full max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="p-8 md:p-10 flex flex-col gap-8">
              
              {/* Drop / Select File Box */}
              {!previewUrl && !isAnalyzing && (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${dragActive ? 'border-red-500 bg-red-500/5 scale-[0.99]' : 'border-white/20 hover:border-white/40 hover:bg-white/[0.02]'}`}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-red-500/15">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" x2="12" y1="15" y2="3"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Leaf Image</h3>
                  <p className="text-slate-400 text-sm mb-4">Click here or drag and drop your chilli leaf photo</p>
                  <span className="text-slate-500 text-xs">Supports JPG, PNG, WebP up to 10MB</span>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              {/* Analysis Loading Screen */}
              {isAnalyzing && (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing Image...</h3>
                  <p className="text-slate-400 text-sm">Our AI is examining your plant for diseases</p>
                </div>
              )}

              {/* Preview Window (Displaying uploaded original or annotated) */}
              {previewUrl && !isAnalyzing && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 flex justify-center items-center relative group">
                  <img
                    src={previewUrl}
                    alt="Chilli leaf analysis"
                    className="max-h-[500px] w-full object-contain"
                  />
                  
                  {/* Floating badge for active report preview */}
                  {analysisResult && (
                    <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-green-500/80 backdrop-blur-md rounded-full text-white text-xs font-bold border border-green-400/20 shadow-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Annotated Bounding Box
                    </div>
                  )}
                </div>
              )}

              {/* Inference Results Section */}
              {analysisResult && !isAnalyzing && (
                <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 flex flex-col gap-6 animate-fadeIn">
                  
                  <div className="flex items-center gap-3 text-orange-400 pb-4 border-b border-white/5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                      <path d="M12 9v4"/>
                      <path d="M12 17h.01"/>
                    </svg>
                    <h3 className="text-lg font-bold text-white">Analysis Complete</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-slate-950/40 rounded-xl p-4 border border-white/5">
                      <span className="text-slate-400 text-xs font-medium uppercase block mb-1">Disease Detected</span>
                      <strong className="text-2xl font-black text-red-400 capitalize">{analysisResult.disease}</strong>
                    </div>
                    
                    <div className="bg-slate-950/40 rounded-xl p-4 border border-white/5">
                      <span className="text-slate-400 text-xs font-medium uppercase block mb-1">Confidence Score</span>
                      <strong className="text-2xl font-black text-green-400">{analysisResult.confidence}%</strong>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-2">
                    <h4 className="flex items-center gap-2 text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                      <svg className="text-green-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      Recommended Treatment Actions
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {analysisResult.remedies.map((remedy, i) => (
                        <li key={i} className="flex gap-3 text-slate-350 text-sm leading-relaxed items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></span>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

              {/* Reset Upload Button */}
              {previewUrl && !isAnalyzing && (
                <div className="text-center border-t border-white/5 pt-6">
                  <button
                    onClick={resetDemo}
                    className="px-6 py-3 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-all hover:scale-[1.01]"
                  >
                    Upload Another Image
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Tab Content: History List */}
        {activeTab === 'history' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            {historyLoading ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="relative w-10 h-10 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div>
                </div>
                <p className="text-slate-400 text-sm">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.03] border border-white/5 rounded-3xl p-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">No analysis history found</h3>
                <p className="text-slate-400 text-sm max-w-xs mb-6">You haven't run any leaf disease tests yet. Click below to run your first test.</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                >
                  Analyze New Leaf
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleSelectHistoryItem(item)}
                    className="p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:scale-[1.005] group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                        <img
                          src={`${API_URL}/uploads/${item.originalName}`}
                          alt={item.disease}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      {/* Metadata */}
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-base capitalize flex items-center gap-2">
                          {item.disease}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.disease.toLowerCase() === 'healthy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {item.confidence}% Conf
                          </span>
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">
                          Report Date: {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Delete action button */}
                    <button
                      onClick={(e) => handleDeleteHistoryItem(e, item._id)}
                      className="p-2.5 rounded-xl border border-transparent hover:border-red-500/30 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                      title="Delete Report"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 bg-slate-950/90 relative z-10 px-6 text-center text-slate-500 text-xs">
        <p>© 2026 Capsiguard. Protecting crops with AI technology.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
