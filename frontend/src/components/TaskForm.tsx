import { useState } from "react";

export type NewTask = {
  title: string;
  description: string;
  dueDate: string | null;
};

type Props = {
  onAdd: (task: NewTask) => Promise<void>;
};

function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || loading) return;

    setLoading(true);

    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
      });

      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Erreur création :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-fields">
        <label htmlFor="task-title">Titre de la tâche *</label>
        <input
          id="task-title"
          type="text"
          placeholder="Ex : Terminer mon projet EFREI"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
        />

        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          placeholder="Décris ta tâche..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />

        <label htmlFor="task-date">Date limite</label>
        <input
          id="task-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Ajout en cours..." : "Ajouter la tâche"}
      </button>
    </form>
  );
}

export default TaskForm;
