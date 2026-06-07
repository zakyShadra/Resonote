import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Todo from "./pages/Todo";
import Calendar from "./pages/Calendar";
import Reminder from "./pages/Reminder";
import Notes from "./pages/Notes";
import Expense from "./pages/Expense";
import Export from "./pages/Export";

import "./App.css";

function App() {
  const [currentPage, setCurrentPage] =
    useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;

      case "todo":
        return <Todo />;

      case "calendar":
        return <Calendar />;

      case "reminder":
        return <Reminder />;

      case "notes":
        return <Notes />;

      case "expense":
        return <Expense />;

      case "export":
        return <Export />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;