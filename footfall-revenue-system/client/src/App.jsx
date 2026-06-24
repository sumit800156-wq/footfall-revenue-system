import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("entries");
    return saved
      ? JSON.parse(saved)
      : [
          {
            outlet: "Murthal",
            date: "2026-06-21",
            footfall: 189,
            revenue: 50000,
          },
        ];
  });

  const [filterOutlet, setFilterOutlet] = useState("All");

  const [form, setForm] = useState({
    outlet: "",
    date: "",
    footfall: "",
    revenue: "",
  });

  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (
      !form.outlet ||
      !form.date ||
      !form.footfall ||
      !form.revenue
    )
      return;

    setEntries([
      ...entries,
      {
        ...form,
        footfall: Number(form.footfall),
        revenue: Number(form.revenue),
      },
    ]);

    setForm({
      outlet: "",
      date: "",
      footfall: "",
      revenue: "",
    });
  };

  const deleteEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const totalRevenue = entries.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const totalFootfall = entries.reduce(
    (sum, item) => sum + item.footfall,
    0
  );

  const avgRevenuePerCustomer =
    totalFootfall > 0
      ? (totalRevenue / totalFootfall).toFixed(2)
      : 0;
      const totalEntries = entries.length;

const topOutlet =
  entries.length > 0
    ? entries.reduce((max, item) =>
        item.revenue > max.revenue ? item : max
      )
    : null;

  const filteredEntries =
    filterOutlet === "All"
      ? entries
      : entries.filter(
          (item) => item.outlet === filterOutlet
        );

  const exportCSV = () => {
    const csv =
      "Outlet,Date,Footfall,Revenue\n" +
      entries
        .map(
          (e) =>
            `${e.outlet},${e.date},${e.footfall},${e.revenue}`
        )
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "footfall-report.csv";
    link.click();
  };

  return (
    
    
    <div className="container mt-4">
      <h1 className="text-center mb-4">
        Mannat Group Hotels
      </h1>

      <h3 className="text-center mb-4">
        Daily Footfall & Revenue Intelligence Dashboard
      </h3>

    <div className="row text-center mb-4">
  <div className="col-md-3">
    <div className="card p-3">
      <h4>Total Revenue</h4>
      <h2>₹{totalRevenue}</h2>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3">
      <h4>Total Footfall</h4>
      <h2>{totalFootfall}</h2>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3">
      <h4>Avg Revenue / Customer</h4>
      <h2>₹{avgRevenuePerCustomer}</h2>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3">
      <h4>Total Entries</h4>
      <h2>{totalEntries}</h2>
    </div>
  </div>
</div>

<div className="card p-3 mb-4 text-center">
  <h3>🏆 Top Performing Outlet</h3>

  {topOutlet && (
    <>
      <h4>{topOutlet.outlet}</h4>
      <h5>Revenue: ₹{topOutlet.revenue}</h5>
      <p>Footfall: {topOutlet.footfall}</p>
    </>
  )}
</div>
      <div className="card p-4 mb-4">
        <h3>Add Entry</h3>

        <select
          className="form-control mb-2"
          value={form.outlet}
          onChange={(e) =>
            setForm({ ...form, outlet: e.target.value })
          }
        >
          <option value="">Select Outlet</option>
          <option>Murthal</option>
          <option>Karnal</option>
          <option>Panipat</option>
          <option>Kurukshetra</option>
        </select>

        <input
          type="date"
          className="form-control mb-2"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Footfall"
          className="form-control mb-2"
          value={form.footfall}
          onChange={(e) =>
            setForm({ ...form, footfall: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Revenue"
          className="form-control mb-2"
          value={form.revenue}
          onChange={(e) =>
            setForm({ ...form, revenue: e.target.value })
          }
        />

        <button
          className="btn btn-primary"
          onClick={addEntry}
        >
          Save Entry
        </button>
      </div>

      <div className="card p-4 mb-4">
        <h3>Revenue Analytics</h3>

        <select
          className="form-control mb-3"
          value={filterOutlet}
          onChange={(e) =>
            setFilterOutlet(e.target.value)
          }
        >
          <option value="All">All Outlets</option>
          <option value="Murthal">Murthal</option>
          <option value="Karnal">Karnal</option>
          <option value="Panipat">Panipat</option>
          <option value="Kurukshetra">Kurukshetra</option>
        </select>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredEntries}>
            <XAxis dataKey="outlet" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#198754" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        className="btn btn-success mb-3"
        onClick={exportCSV}
      >
        Export CSV
      </button>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Outlet</th>
            <th>Date</th>
            <th>Footfall</th>
            <th>Revenue</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredEntries.map((item, index) => (
            <tr key={index}>
              <td>{item.outlet}</td>
              <td>{item.date}</td>
              <td>{item.footfall}</td>
              <td>₹{item.revenue}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteEntry(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;