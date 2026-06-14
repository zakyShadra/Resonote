import { useState } from "react";
import AddSubtaskModal from "./AddSubtaskModal";

import {
    BookOpen,
    Briefcase,
    Dumbbell,
    Gamepad2,
    NotebookPen,
    Wallet,
    Target,
    House,
} from "lucide-react";

function TaskDetail({
    selectedTask,
    tasks,
    setTasks,
    setSelectedTask,
    }) {
    const [subtaskModalOpen, setSubtaskModalOpen] = useState(false);

    if (!selectedTask) return null;
    const iconMap = {
        book: <BookOpen size={20} />,
        work: <Briefcase size={20} />,
        sport: <Dumbbell size={20} />,
        game: <Gamepad2 size={20} />,
        note: <NotebookPen size={20} />,
        money: <Wallet size={20} />,
        target: <Target size={20} />,
        home: <House size={20} />,
    };
    const addSubtask = (subtaskText) => {
        const updatedTasks =
        tasks.map((task) =>
            task.id === selectedTask.id
            ? {
                ...task,
                subtasks: [
                    ...task.subtasks,
                    {
                    id: Date.now(),
                    text: subtaskText,
                    done: false,
                    },
                ],
                }
            : task
        );

        setTasks(updatedTasks);

        const updatedTask =
        updatedTasks.find(
            (task) =>
            task.id === selectedTask.id
        );

        setSelectedTask(updatedTask);
        setSubtaskModalOpen(false);
    };

    const toggleSubtask = (
        subtaskId
    ) => {
        const updatedTasks =
        tasks.map((task) =>
            task.id === selectedTask.id
            ? {
                ...task,
                subtasks:
                    task.subtasks.map(
                    (subtask) =>
                        subtask.id ===
                        subtaskId
                        ? {
                            ...subtask,
                            done:
                                !subtask.done,
                            }
                        : subtask
                    ),
                }
            : task
        );

        setTasks(updatedTasks);

        const updatedTask =
        updatedTasks.find(
            (task) =>
            task.id === selectedTask.id
        );

        setSelectedTask(updatedTask);
    };

    const deleteSubtask = (
        subtaskId
    ) => {
        if (
        !confirm(
            "Hapus subtask ini?"
        )
        )
        return;

        const updatedTasks =
        tasks.map((task) =>
            task.id === selectedTask.id
            ? {
                ...task,
                subtasks:
                    task.subtasks.filter(
                    (subtask) =>
                        subtask.id !==
                        subtaskId
                    ),
                }
            : task
        );

        setTasks(updatedTasks);

        const updatedTask =
        updatedTasks.find(
            (task) =>
            task.id === selectedTask.id
        );

        setSelectedTask(updatedTask);
    };

    return (
        <div className="task-detail">
        <div className="task-detail-header">
            <div>
            <span className="task-detail-eyebrow">Task aktif</span>
            <h2
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
                >
                {iconMap[selectedTask.icon]}
                {selectedTask.title}
            </h2>
            </div>

            <div className="task-detail-header-actions">
              <button
                className="task-detail-close"
                type="button"
                onClick={() => setSelectedTask(null)}
                title="Tutup task"
              >
                ✕
              </button>

              <button
                className="add-subtask-btn"
                type="button"
                onClick={() => {
                  setSubtaskModalOpen(true);
                }}
              >
                <span className="add-subtask-icon">+</span>
                <span>Subtask</span>
              </button>
            </div>
        </div>

        {selectedTask.subtasks
            .length === 0 && (
            <p className="subtask-empty">
            Belum ada subtask.
            </p>
        )}

        {selectedTask.subtasks.map(
            (subtask) => (
            <div
                key={subtask.id}
                className="subtask-row"
            >
                <div
                className="subtask-left"
                >
                <input
                    type="checkbox"
                    checked={
                    subtask.done
                    }
                    onChange={() =>
                    toggleSubtask(
                        subtask.id
                    )
                    }
                />

                <span
                    style={{
                    textDecoration:
                        subtask.done
                        ? "line-through"
                        : "none",
                    }}
                >
                    {subtask.text}
                </span>
                </div>

                <button
                className="subtask-delete"
                onClick={() =>
                    deleteSubtask(
                    subtask.id
                    )
                }
                >
                🗑
                </button>
            </div>
            )
        )}

        <AddSubtaskModal
            isOpen={subtaskModalOpen}
            onClose={() => {
              setSubtaskModalOpen(false);
            }}
            onAdd={addSubtask}
        />
        </div>
    );
    }

export default TaskDetail;
