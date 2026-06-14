import { CalendarDays, PencilLine, Trash2 } from "lucide-react";

function TaskMenu({
  task,
  onEdit,
  onDeadline,
  onDelete,
}) {
  return (
    <div className="task-menu">
      <button onClick={() => onEdit(task)}>
        <span className="task-menu-icon">
          <PencilLine size={18} />
        </span>
        Edit Task
      </button>

      <button onClick={() => onDeadline(task)}>
        <span className="task-menu-icon">
          <CalendarDays size={18} />
        </span>
        Atur Deadline
      </button>

      <button onClick={() => onDelete(task.id)}>
        <span className="task-menu-icon">
          <Trash2 size={18} />
        </span>
        Hapus Task
      </button>
    </div>
  );
}

export default TaskMenu;

