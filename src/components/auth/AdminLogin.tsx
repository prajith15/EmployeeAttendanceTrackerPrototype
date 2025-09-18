import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting admin login with:', email);
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        setLoading(false);
      } else {
        console.log('Login successful, navigating to dashboard');
        // Navigate to role-based redirect to ensure proper authorization
        navigate('/dashboard-redirect');
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    } finally {
      // Loading is handled in the success/error cases above
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-red-700">
              Admin Portal
            </CardTitle>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Administrative access only
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<EnvelopeIcon className="w-5 h-5" />}
                required
              />
              
              <Input
                type="password"
                label="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<LockClosedIcon className="w-5 h-5" />}
                required
              />
              
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                loading={loading}
              >
                Sign In as Admin
              </Button>
            </form>
            
            <div className="mt-4 sm:mt-6 text-center">
              <div className="text-xs sm:text-sm text-gray-600 space-y-2">
                <p>Other login portals:</p>
                <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-1 sm:space-y-0">
                  <Link to="/hr-login" className="text-green-600 hover:text-green-700">
                    HR Portal →
                  </Link>
                  <Link to="/manager-login" className="text-blue-600 hover:text-blue-700">
                    Manager Portal →
                  </Link>
                  <Link to="/employee-login" className="text-purple-600 hover:text-purple-700">
                    Employee Portal →
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;