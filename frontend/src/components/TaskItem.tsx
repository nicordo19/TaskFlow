import { useState } from "react";
import type { Task } from "../types/Task";

type Props = {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onUpdate: (id: string, title: string) => Promise<void>;
};

function TaskItem({ task, onDelete, onStatusChange, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const [description, setDescription] = useState(task.description || "");

  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : "",
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      await onUpdate(task._id, title.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur modification :", error);
    }
  };

  return (
    <li className={`task-${task.status}`}>
      {isEditing ? (
        <>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description de la tâche"
            rows={4}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
          />

          <button type="button" onClick={handleSave}>
            Enregistrer
          </button>

          <button
            type="button"
            onClick={() => {
              setTitle(task.title);
              setIsEditing(false);
            }}
          >
            Annuler
          </button>
        </>
      ) : (
        <>
          {/* Titre */}
          <span className="task-title">{task.title}</span>

          {/* Description */}
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {/* Date limite */}
          {task.dueDate && (
            <p className="task-date">
              📅 Date limite : {formatDate(task.dueDate)}
            </p>
          )}

          {/* Date de création */}
          {task.createdAt && (
            <p className="task-created">
              Créée le {formatDate(task.createdAt)}
            </p>
          )}

          <button type="button" onClick={() => setIsEditing(true)}>
            Modifier
          </button>
        </>
      )}

      <select
        value={task.status}
        onChange={(event) =>
          onStatusChange(task._id, event.target.value as Task["status"])
        }
      >
        <option value="todo">À faire</option>
        <option value="doing">En cours</option>
        <option value="done">Terminée</option>
      </select>

      <button type="button" onClick={() => onDelete(task._id)}>
        Supprimer
      </button>
    </li>
  );
}

export default TaskItem;
