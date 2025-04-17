import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert('Bejelentkezés sikertelen');
    }
  };

  return (
    <div>
      <h2>Bejelentkezés</h2>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Jelszó" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Bejelentkezés</button>
    </div>
  );
};
