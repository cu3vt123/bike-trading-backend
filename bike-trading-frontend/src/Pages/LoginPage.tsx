
import { useState } from "react";
import { login } from '../services/api';

function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login({ username, password });
      localStorage.setItem("token", res.token);
      alert("Login success!");
    } catch (err) {
      console.error(err);
      alert("Login failed!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <input
        placeholder="Email"
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}

export default LoginPage
