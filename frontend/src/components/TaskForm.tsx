import { useState } from "react";

type Props = {
  onAdd: (title: string) => Promise<void>;
};

function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || loading) return;

    setLoading(true);

    try {
      await onAdd(title.trim());
      setTitle("");
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Titre de la nouvelle tâche"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={120}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}

export default TaskForm;
