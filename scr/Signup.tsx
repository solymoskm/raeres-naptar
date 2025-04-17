import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert('Regisztráció sikertelen');
    }
  };

  return (
    <div>
      <h2>Regisztráció</h2>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Jelszó" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Regisztráció</button>
    </div>
  );
};
