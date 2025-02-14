import React, { useState } from 'react';

interface SignUpFormProps {
  onSubmit: (username: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, isLoading }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(username, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        disabled={isLoading}
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isLoading}
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={isLoading}
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUpForm;