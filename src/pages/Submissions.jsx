import React, { useState } from "react";
import "./Submissions.css";

function Submissions() {
  const [tasks, setTasks] = useState([
    createRow(),
  ]);

  function createRow() {
    return {
      id: Date.now() + Math.random(),
      title: "",
      status: "Not started",
      dueDate: "",
      assignee: "",
      pastDue: false
    };
  }

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const addRow = () => {
    setTasks([...tasks, createRow()]);
  };

  const styles = {
  heading: {
    background: "#102146",
    color: "#f8d8e4",
    width: "100vw",
    padding: "15px 0",
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "30px",
    textAlign: "center",
    marginLeft: "calc(-50vw + 50%)"
  }
};

  return (
    <div className="submissions-page">
      <h2 style={styles.heading}>📄 Submissions</h2>

      <div className="table">
        <div className="table-header">
          <span>Task Name</span>
          <span>Status</span>
          <span>Assignee</span>
          <span>Due Date</span>
          <span>Past Due</span>
        </div>

        {tasks.map((task, index) => {
  const isPastDue =
    task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      className={`table-row ${isPastDue ? "past-due" : ""}`}
      key={task.id}
    >
            
            <input
              placeholder="Task name"
              value={task.title}
              onChange={(e) =>
                updateTask(index, "title", e.target.value)
              }
            />

            <select
              value={task.status}
              onChange={(e) =>
                updateTask(index, "status", e.target.value)
              }
            >
              <option>Not started</option>
              <option>In progress</option>
              <option>Done</option>
            </select>

            <input
              placeholder="Assignee"
              value={task.assignee}
              onChange={(e) =>
                updateTask(index, "assignee", e.target.value)
              }
            />

            <input
              type="date"
              value={task.dueDate}
              onChange={(e) =>
                updateTask(index, "dueDate", e.target.value)
              }
            />

            <input
  type="checkbox"
  checked={
    task.pastDue ||
    (task.dueDate && new Date(task.dueDate) < new Date())
  }
  onChange={(e) =>
    updateTask(index, "pastDue", e.target.checked)
  }
/>
          </div>
  );
})}
      </div>

      <button onClick={addRow} className="add-btn">
        + Add Task
      </button>
    </div>
  );
}

export default Submissions;