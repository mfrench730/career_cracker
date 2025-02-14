import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../../components/auth/SignInForm';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(username, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        login();
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-bold">Sign In</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <SignInForm onSubmit={handleSignIn} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default SignIn;