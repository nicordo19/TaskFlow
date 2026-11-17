import type { Task } from "../types/Task";
import TaskItem from "./TaskItem";

type Props = {
  tasks: Task[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onUpdate: (id: string, title: string) => Promise<void>;
};

function TaskList({ tasks, onDelete, onStatusChange, onUpdate }: Props) {
  if (tasks.length === 0) {
    return <p>Aucune tâche pour le moment.</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}

export default TaskList;
