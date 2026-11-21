import type { Task } from "../types/Task";
import TaskItem from "./TaskItem";

type Props = {
  tasks: Task[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onUpdate: (id: string, title: string) => Promise<void>;
};

const columns = [
  { status: "todo", title: "À faire" },
  { status: "doing", title: "En cours" },
  { status: "done", title: "Terminées" },
] as const;

function TaskList({ tasks, onDelete, onStatusChange, onUpdate }: Props) {
  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const filteredTasks = tasks.filter(
          (task) => task.status === column.status,
        );

        return (
          <div className="kanban-column" key={column.status}>
            <h3>
              {column.title} ({filteredTasks.length})
            </h3>

            <div className="kanban-cards">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskList;
