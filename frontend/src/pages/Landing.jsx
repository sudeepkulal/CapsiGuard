import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative">
      {/* Background Gradients & Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] floating-blob" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] floating-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-orange-900/10 rounded-full blur-[80px] floating-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl border-b ${scrolled ? 'bg-slate-950/90 py-3 border-slate-800' : 'bg-slate-950/40 py-5 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <span>Capsiguard</span>
          </Link>
          
          <ul className="hidden md:flex gap-8 text-slate-300 font-medium">
            <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
          </ul>

          <div className="flex gap-4 items-center">
            <Link to="/login" className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 text-white rounded-xl font-medium transition-all hover:bg-white/5">
              Login
            </Link>
            <Link to="/signup" className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 hover:scale-[1.02]">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 pt-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 mb-8 animate-pulse">
            <svg className="text-yellow-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
            <span>AI-Powered Agricultural Innovation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Protect Your <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Chilli Crops</span><br />
            with Smart AI Detection
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Revolutionary machine learning technology that identifies plant diseases instantly, helping farmers save crops and maximize yields.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/25 transition-all hover:-translate-y-1 hover:scale-105">
              Get Started Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-slate-700 hover:border-slate-500 text-white font-bold rounded-2xl transition-all backdrop-blur-xl hover:bg-white/5">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-950/80 border-y border-slate-900 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Powerful Features</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Advanced AI technology combined with agricultural expertise to protect your crops
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 hover:border-red-500/40 hover:-translate-y-2 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 mb-6 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2h-5L9.5 3h-3A2 2 0 0 0 4 5v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3c0-.552-.448-1-1-1"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Detection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload a photo and get immediate AI-powered analysis identifying diseases like anthracnose, leaf spot, and mosaic virus with 95% accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 hover:border-orange-500/40 hover:-translate-y-2 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Expert Remedies</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Receive personalized treatment recommendations from agricultural experts, including organic and chemical solutions tailored to your specific situation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 hover:border-purple-500/40 hover:-translate-y-2 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Early Warning</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Proactive monitoring and alerts help you catch diseases before they spread, potentially saving entire harvests from devastating losses.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 hover:border-blue-500/40 hover:-translate-y-2 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Seamless Access</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Access Capsiguard from anywhere with our responsive web platform, ensuring you can monitor your crop status on the go from any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-red-500/5 to-orange-500/5 relative z-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">95%</div>
            <div className="text-slate-300 font-medium">Detection Accuracy</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">10K+</div>
            <div className="text-slate-300 font-medium">Farmers Assisted</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">24/7</div>
            <div className="text-slate-300 font-medium">Monitoring Response</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">12+</div>
            <div className="text-slate-300 font-medium">Diseases Identified</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative z-10 text-center">
        <div className="max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Protect Your Crops?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of farmers who trust Capsiguard to keep their chilli crops healthy and productive.
          </p>
          
          <Link to="/signup" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 transition-all hover:-translate-y-1 hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950/90 relative z-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <span className="font-bold text-lg">Capsiguard</span>
          </div>

          <p className="text-slate-500 text-sm">
            © 2026 Capsiguard. All rights reserved. Protecting crops with cutting-edge AI.
          </p>

          <div className="flex gap-6 text-slate-400 text-sm">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <a href="#support" className="hover:text-white transition-colors">Support</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
