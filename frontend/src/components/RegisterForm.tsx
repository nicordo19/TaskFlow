import { useState, type FormEvent } from "react";
import { register } from "../services/authService";
import type { User } from "../types/User";

type RegisterFormProps = {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
};

export default function RegisterForm({
  onRegister,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);

    try {
      const response = await register(name, email, password);

      onRegister(response.user);
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

        <h2>Créer un compte</h2>

        <p className="auth-subtitle">Inscris-toi pour organiser tes tâches.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Nom</label>

            <input
              id="register-name"
              type="text"
              placeholder="Ton nom"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Adresse email</label>

            <input
              id="register-email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Mot de passe</label>

            <input
              id="register-password"
              type="password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm-password">
              Confirmer le mot de passe
            </label>

            <input
              id="register-confirm-password"
              type="password"
              placeholder="Confirme ton mot de passe"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Création du compte..." : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-footer">
          Tu as déjà un compte ?{" "}
          <button type="button" className="auth-link" onClick={onSwitchToLogin}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
