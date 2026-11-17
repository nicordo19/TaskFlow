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
          <span>{task.title}</span>
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
