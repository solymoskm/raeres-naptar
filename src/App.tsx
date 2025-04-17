import { useAuth, AuthProvider } from './AuthProvider';
import { Login } from './Login';
import { Signup } from './Signup';
import { useState } from 'react';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (!user) {
    return (
      <div>
        {showSignup ? <Signup /> : <Login />}
        <button onClick={() => setShowSignup(!showSignup)}>
          {showSignup ? 'Már van fiókod? Bejelentkezés' : 'Nincs fiókod? Regisztráció'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Ráérés naptár működik! ✅</h1>
      <p>Bejelentkezve: {user.email}</p>
      <button onClick={logout}>Kijelentkezés</button>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
