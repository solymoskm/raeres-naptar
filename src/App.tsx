import { useState } from 'react';
import { useAuth, AuthProvider } from './AuthProvider';
import { Login } from './Login';
import { Signup } from './Signup';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  console.log("Aktuális felhasználó:", user)

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
