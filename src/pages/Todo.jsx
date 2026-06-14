import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 
import TaskCard from "../components/TaskCard";
import TaskDetail from "../components/TaskDetail";
import DeadlineModal from "../components/DeadlineModal";
import "../style/todo.css";

import {
  CheckSquare,
  BookOpen,
  Briefcase,
  Dumbbell,
  Gamepad2,
  NotebookPen,
  Wallet,
  Target,
  House,
} from "lucide-react";

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskIcon, setTaskIcon] = useState("");
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState("");
  const [taskForDeadline, setTaskForDeadline] = useState(null);

  const iconOptions = [
    { icon: <BookOpen size={18} />, value: "book" },
    { icon: <Briefcase size={18} />, value: "work" },
    { icon: <Dumbbell size={18} />, value: "sport" },
    { icon: <Gamepad2 size={18} />, value: "game" },
    { icon: <NotebookPen size={18} />, value: "note" },
    { icon: <Wallet size={18} />, value: "money" },
    { icon: <Target size={18} />, value: "target" },
    { icon: <House size={18} />, value: "home" },
  ];
  
  const iconMap = {
    book: <BookOpen size={18} />,
    work: <Briefcase size={18} />,
    sport: <Dumbbell size={18} />,
    game: <Gamepad2 size={18} />,
    note: <NotebookPen size={18} />,
    money: <Wallet size={18} />,
    target: <Target size={18} />,
    home: <House size={18} />,
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        const cached = localStorage.getItem("resonote-tasks");
        setTasks(cached ? JSON.parse(cached) : []);
      } else {
        setTasks(data || []);
        localStorage.setItem("resonote-tasks", JSON.stringify(data));
      }
    };
    
    loadTasks();
  }, [userId]);

  // EFFECT 3: Sync tasks to Supabase
  useEffect(() => {
    if (!userId || tasks.length === 0) return;
    
    supabase
      .from('tasks')
      .upsert(
        tasks.map(t => ({
          ...t,
          user_id: userId,
        }))
      )
      .catch(err => console.error('Sync error:', err));
    
    localStorage.setItem("resonote-tasks", JSON.stringify(tasks));
  }, [tasks, userId]);

  // EFFECT 4: Clear selected task if deleted
  useEffect(() => {
    if (!selectedTask) return;
    const stillExist = tasks.find((t) => t.id === selectedTask.id);
    if (!stillExist) setSelectedTask(null);
  }, [tasks, selectedTask]);

  // HANDLERS
  const addTask = () => {
    if (!taskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: taskTitle,
      icon: taskIcon,
      done: false,
      deadline: null,
      subtasks: [],
      reminded: false,
    };
    setTasks([...tasks, newTask]);
    setTaskTitle("");
    setTaskIcon("");
  };

  const toggleTask = (taskId) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    setTasks(updated);
    if (selectedTask?.id === taskId)
      setSelectedTask(updated.find((t) => t.id === taskId));
  };

  const deleteTask = (taskId) => {
    if (!confirm("Hapus task ini?")) return;
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const editTask = (task) => {
    const newTitle = prompt("Edit task:", task.title);
    if (!newTitle) return;
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, title: newTitle } : t
    );
    setTasks(updated);
    if (selectedTask?.id === task.id)
      setSelectedTask(updated.find((t) => t.id === task.id));
  };

  const setDeadline = (task) => {
    setTaskForDeadline(task);
    setDeadlineValue(task.deadline || "");
    setDeadlineModalOpen(true);
  };

  const saveDeadline = (finalDeadline) => {
    if (!taskForDeadline) return;
    const updated = tasks.map((t) =>
      t.id === taskForDeadline.id
        ? { ...t, deadline: finalDeadline, reminded: false }
        : t
    );
    setTasks(updated);
    if (selectedTask?.id === taskForDeadline.id)
      setSelectedTask(updated.find((t) => t.id === taskForDeadline.id));
    setDeadlineModalOpen(false);
    setTaskForDeadline(null);
    setDeadlineValue("");
  };

  const getProgress = (task) => {
    if (task.subtasks.length === 0) return task.done ? 100 : 0;
    return Math.round(
      (task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "done") return task.done;
    if (filter === "undone") return !task.done;
    return true;
  });

  // RENDER
  return (
    <div className="todo-container">
      <h1><CheckSquare size={22} /> Todo</h1>

      <input
        type="text"
        placeholder="🔍 Cari task..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="filter-buttons">
        {[
          { key: "all", label: "Semua" },
          { key: "undone", label: "Belum Selesai" },
          { key: "done", label: "Selesai" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="add-task-row">
        <input
          type="text"
          placeholder="Nama Task..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <div className="icon-dropdown">
        <button
          type="button"
          className="icon-dropdown-btn"
          onClick={() => setShowIconMenu(!showIconMenu)}
        >
          {taskIcon
            ? iconOptions.find((i) => i.value === taskIcon)?.icon
            : "⭕"}
          <span>
            {taskIcon
              ? {
                  book: "Belajar",
                  work: "Kerja",
                  sport: "Olahraga",
                  game: "Hiburan",
                  note: "Catatan",
                  money: "Keuangan",
                  target: "Target",
                  home: "Pribadi",
                }[taskIcon]
              : "Tanpa Icon"}
          </span>
          ▼
        </button>

        {showIconMenu && (
          <div className="icon-dropdown-menu">
            <button
              type="button"
              className="icon-option"
              onClick={() => {
                setTaskIcon("");
                setShowIconMenu(false);
              }}
            >
              ⭕ Tanpa Icon
            </button>

            {iconOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                className="icon-option"
                onClick={() => {
                  setTaskIcon(item.value);
                  setShowIconMenu(false);
                }}
              >
                {item.icon}
                <span>
                  {{
                    book: "Belajar",
                    work: "Kerja",
                    sport: "Olahraga",
                    game: "Hiburan",
                    note: "Catatan",
                    money: "Keuangan",
                    target: "Target",
                    home: "Pribadi",
                  }[item.value]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
        <button onClick={addTask} className="btn-add">
          + Tambah
        </button>
      </div>

      <DeadlineModal
        isOpen={deadlineModalOpen}
        deadline={deadlineValue}
        onSave={saveDeadline}
        onClose={() => {
          setDeadlineModalOpen(false);
          setTaskForDeadline(null);
        }}
      />

      <TaskDetail
        selectedTask={selectedTask}
        tasks={tasks}
        setTasks={setTasks}
        setSelectedTask={setSelectedTask}
      />

      {filteredTasks.length === 0 && (
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "40px" }}>
          {tasks.length === 0 ? "Belum ada task. Tambah sekarang!" : "Tidak ada task yang cocok."}
        </p>
      )}

      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          iconMap={iconMap}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          toggleTask={toggleTask}
          getProgress={getProgress}
          deleteTask={deleteTask}
          editTask={editTask}
          setDeadline={setDeadline}
        />
      ))}
    </div>
  );
} 

export default Todo;