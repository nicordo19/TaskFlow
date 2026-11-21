import { useState, type FormEvent } from "react";
import { login } from "../services/authService";
import type { User } from "../types/User";

type LoginFormProps = {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
};

export default function LoginForm({
  onLogin,
  onSwitchToRegister,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);

      onLogin(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>TaskFlow</h1>

        <h2>Connexion</h2>

        <p className="auth-subtitle">Connecte-toi pour retrouver tes tâches.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Adresse email</label>

            <input
              id="login-email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Mot de passe</label>

            <input
              id="login-password"
              type="password"
              placeholder="Ton mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-footer">
          Tu n'as pas encore de compte ?{" "}
          <button
            type="button"
            className="auth-link"
            onClick={onSwitchToRegister}
          >
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}
