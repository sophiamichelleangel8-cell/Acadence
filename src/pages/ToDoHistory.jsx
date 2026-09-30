import React, { useEffect, useState } from "react";

function ToDoHistory() {
  const [history, setHistory] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("task-history") || "{}");
    setHistory(data);
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>📚 To-Do History</h2>

      {Object.keys(history).length === 0 ? (
        <p>No saved tasks yet</p>
      ) : (
        Object.entries(history).reverse().map(([date, tasks]) => (
          <div key={date} style={{
            marginBottom: "20px",
            background: "#fff",
            padding: "15px",
            borderRadius: "10px"
          }}>
            <h4>{date}</h4>

            <ul>
              {tasks.map((t, i) => (
                <li key={i}>
                  {t.checked ? "✔️" : "⬜"} {t.text}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default ToDoHistory;