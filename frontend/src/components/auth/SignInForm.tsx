import React, { useState } from 'react';

interface SignInFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
}

// Form component to collect username and password
const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username Input */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        disabled={isLoading}
        className="w-full p-2 border rounded"
      />
      {/* Password Input */}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={isLoading}
        className="w-full p-2 border rounded"
      />
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default SignInForm;
