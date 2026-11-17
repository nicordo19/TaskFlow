import { useEffect, useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import type { Task } from "./types/Task";

const API_URL = "http://localhost:3000/api/tasks";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Impossible de récupérer les tâches");
        }

        const data: { items: Task[] } = await response.json();
        setTasks(data.items);
      } catch (error) {
        console.error(error);
        setError("Erreur lors du chargement des tâches");
      }
    };

    void loadTasks();
  }, []);

  const addTask = async (title: string): Promise<void> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        status: "todo",
      }),
    });

    if (!response.ok) {
      throw new Error("Impossible de créer la tâche");
    }

    const data: { task: Task } = await response.json();

    setTasks((previous) => [...previous, data.task]);
    setError("");
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer la tâche");
      }

      setTasks((previous) => previous.filter((task) => task._id !== id));
      setError("");
    } catch (error) {
      console.error(error);
      setError("Erreur lors de la suppression");
    }
  };

  const updateTaskStatus = async (
    id: string,
    status: Task["status"],
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Impossible de modifier le statut");
      }

      setTasks((previous) =>
        previous.map((task) => (task._id === id ? { ...task, status } : task)),
      );

      setError("");
    } catch (error) {
      console.error(error);
      setError("Erreur lors de la modification du statut");
    }
  };

  const updateTask = async (id: string, title: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Impossible de modifier la tâche");
    }

    setTasks((previous) =>
      previous.map((task) => (task._id === id ? { ...task, title } : task)),
    );
  };

  return (
    <main>
      <h1>TaskFlow</h1>
      <p>Bienvenue dans mon gestionnaire de tâches !</p>

      <section>
        <h2>Mes tâches</h2>

        <TaskForm onAdd={addTask} />

        {error && <p role="alert">{error}</p>}

        <TaskList
          tasks={tasks}
          onDelete={deleteTask}
          onStatusChange={updateTaskStatus}
          onUpdate={updateTask}
        />
      </section>
    </main>
  );
}

export default App;
