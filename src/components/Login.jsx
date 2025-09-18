import React, { useState } from 'react';
import { User, Lock, Building2 } from 'lucide-react';

const demoUsers = {
  'admin@company.com': { role: 'admin', name: 'Admin User', password: 'password123' },
  'hr@company.com': { role: 'hr', name: 'HR Manager', password: 'password123' },
  'manager@company.com': { role: 'manager', name: 'Team Manager', password: 'password123' },
  'employee@company.com': { role: 'employee', name: 'John Employee', password: 'password123' }
};

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = demoUsers[email];
    
    if (user && user.password === password) {
      onLogin({ email, name: user.name, role: user.role });
    } else {
      setError('Invalid credentials');
    }
  };

  const handleDemoLogin = (role) => {
    const userEntry = Object.entries(demoUsers).find(([_, user]) => user.role === role);
    if (userEntry) {
      const [email, user] = userEntry;
      onLogin({ email, name: user.name, role: user.role });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">HR Management System</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8">
          <div className="text-center text-sm text-gray-600 mb-4">Quick Demo Login</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoLogin('hr')}
              className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
            >
              HR
            </button>
            <button
              onClick={() => handleDemoLogin('manager')}
              className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            >
              Manager
            </button>
            <button
              onClick={() => handleDemoLogin('employee')}
              className="px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}