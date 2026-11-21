import { useEffect, useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import type { NewTask } from "./components/TaskForm";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

import { getCurrentUser, logout } from "./services/authService";

import type { Task } from "./types/Task";
import type { User } from "./types/User";

const API_URL = "http://localhost:3000/api/tasks";

type AuthPage = "login" | "register";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Vérifier la session au chargement
  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch (err) {
        if (active) {
          setAuthError(
            err instanceof Error
              ? err.message
              : "Impossible de vérifier la session",
          );
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    };

    void checkAuth();

    return () => {
      active = false;
    };
  }, []);

  // Charger les tâches de l'utilisateur connecté
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    let active = true;

    const loadTasks = async () => {
      setError("");

      try {
        const response = await fetch(API_URL, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Impossible de charger les tâches");
        }

        const data: Task[] = await response.json();

        if (active) {
          setTasks(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Une erreur est survenue",
          );
        }
      }
    };

    void loadTasks();

    return () => {
      active = false;
    };
  }, [user]);

  // Après une connexion ou une inscription
  const handleAuthSuccess = (connectedUser: User) => {
    setAuthError("");
    setError("");
    setTasks([]);
    setUser(connectedUser);
  };

  // Déconnexion
  const handleLogout = async () => {
    setLoggingOut(true);
    setAuthError("");

    try {
      await logout();

      setUser(null);
      setTasks([]);
      setAuthPage("login");
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Impossible de se déconnecter",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  // Ajouter une tâche

  // Ajouter une tâche

  // Ajouter une tâche
  const handleAddTask = async (newTask: NewTask) => {
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          status: "todo",
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de créer la tâche");
      }

      const createdTask: Task = await response.json();

      setTasks((previousTasks) => [createdTask, ...previousTasks]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";

      setError(message);
      throw err;
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (id: string) => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer la tâche");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  // Modifier le statut d'une tâche
  const handleStatusChange = async (id: string, status: Task["status"]) => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Impossible de modifier le statut");
      }

      const updatedTask: Task = await response.json();

      setTasks((previousTasks) =>
        previousTasks.map((task) => (task._id === id ? updatedTask : task)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  // Modifier le titre d'une tâche
  const handleUpdateTask = async (id: string, title: string) => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Impossible de modifier la tâche");
      }

      const updatedTask: Task = await response.json();

      setTasks((previousTasks) =>
        previousTasks.map((task) => (task._id === id ? updatedTask : task)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  // Chargement de la session
  if (checkingAuth) {
    return (
      <div className="auth-container">
        <p>Chargement de TaskFlow...</p>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return (
      <>
        {authError && (
          <p className="auth-error" role="alert">
            {authError}
          </p>
        )}

        {authPage === "login" ? (
          <LoginForm
            onLogin={handleAuthSuccess}
            onSwitchToRegister={() => setAuthPage("register")}
          />
        ) : (
          <RegisterForm
            onRegister={handleAuthSuccess}
            onSwitchToLogin={() => setAuthPage("login")}
          />
        )}
      </>
    );
  }

  // Utilisateur connecté
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>TaskFlow</h1>
          <p>Bienvenue, {user.name} !</p>
        </div>

        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Déconnexion..." : "Se déconnecter"}
        </button>
      </header>

      {authError && (
        <p className="auth-error" role="alert">
          {authError}
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <TaskForm onAdd={handleAddTask} />

      <TaskList
        tasks={tasks}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
}

export default App;
