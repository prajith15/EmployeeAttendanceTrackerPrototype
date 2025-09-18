import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { EnvelopeIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const HRLogin: React.FC = () => {
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
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        navigate('/dashboard-redirect');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    } finally {
      // Loading is handled in the success/error cases above
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-green-700">
              HR Portal
            </CardTitle>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Human Resources access
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
                label="HR Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<EnvelopeIcon className="w-5 h-5" />}
                required
              />
              
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<LockClosedIcon className="w-5 h-5" />}
                required
              />
              
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                loading={loading}
              >
                Sign In to HR Portal
              </Button>
            </form>
            
            <div className="mt-4 sm:mt-6 text-center">
              <div className="text-xs sm:text-sm text-gray-600 space-y-2">
                <p>Other login portals:</p>
                <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-1 sm:space-y-0">
                  <Link to="/admin-login" className="text-red-600 hover:text-red-700">
                    Admin Portal →
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

export default HRLogin;