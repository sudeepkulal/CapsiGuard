import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API_URL } from '../App';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      login(res.data.token, res.data.user);
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.06)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.06)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(139,92,246,0.06)_0%,transparent_50%)]"></div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[24px] p-10 shadow-2xl relative z-10 before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
        
        <h3 className="text-3xl font-extrabold text-center text-white mb-10 relative">
          Login
          <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[60px] h-[3px] bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></span>
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-5 py-3.5 bg-white/[0.06] border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.1] focus:ring-4 focus:ring-red-500/10 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-5 py-3.5 bg-white/[0.06] border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.1] focus:ring-4 focus:ring-red-500/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <Link
          to="/signup"
          className="mt-8 block text-center py-3 border border-white/10 hover:border-white/20 text-slate-300 font-semibold rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-all hover:scale-[1.01]"
        >
          Signup
        </Link>
      </div>
    </div>
  );
}

export default Login;
