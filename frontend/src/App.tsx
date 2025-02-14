// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;