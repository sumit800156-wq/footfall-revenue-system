import React, { useEffect, useMemo, useState } from "react";
import "./firebase";
import {db} from "./firebase"

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  /* =========================
     EDITABLE ALERT THRESHOLDS
  ========================= */
  const FOOTFALL_THRESHOLD = 100;
  const COST_PER_VISITOR_THRESHOLD = 80;
  const LOW_REVENUE_THRESHOLD = 20000;

  /* =========================
     DEMO USERS
  ========================= */
  const USERS = {
    admin: {
      email: "admin@mannat.com",
      password: "123456",
      role: "admin",
      name: "Admin",
    },
    staff: {
      email: "staff@mannat.com",
      password: "123456",
      role: "staff",
      name: "Staff",
    },
  };

  const OUTLETS = [
    "Murthal",
    "Karnal",
    "Panipat",
    "Kurukshetra",
    "Ambala",
    "Sonipat",
  ];

  /* =========================
     AUTH STATE
  ========================= */
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "admin",
  });

  const [loginError, setLoginError] = useState("");

  /* =========================
     ENTRIES STATE
  ========================= */
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("entries");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            outlet: "Murthal",
            date: "2026-06-21",
            footfall: 189,
            driverCount: 35,
            dineInRevenue: 30000,
            parcelRevenue: 20000,
            roomRevenue: 12000,
            otherRevenue: 5000,
            marketingSpend: 5000,
          },
        ];
  });

  /* =========================
     FILTERS
  ========================= */
  const [filterOutlet, setFilterOutlet] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  /* =========================
     ENTRY FORM
  ========================= */
  const [form, setForm] = useState({
    outlet: "",
    date: "",
    footfall: "",
    driverCount: "",
    dineInRevenue: "",
    parcelRevenue: "",
    roomRevenue: "",
    otherRevenue: "",
    marketingSpend: "",
  });

  /* =========================
     LOCAL STORAGE
  ========================= */
  useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "footfall"), (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEntries(data);
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  /* =========================
     HELPERS
  ========================= */
  const getTotalRevenue = (item) =>
    Number(item.dineInRevenue || 0) +
    Number(item.parcelRevenue || 0) +
    Number(item.roomRevenue || 0) +
    Number(item.otherRevenue || 0);

  /* =========================
     LOGIN / LOGOUT
  ========================= */
  const handleLogin = () => {
    setLoginError("");
    const selectedUser = USERS[loginForm.role];

    if (
      loginForm.email === selectedUser.email &&
      loginForm.password === selectedUser.password
    ) {
      setIsLoggedIn(true);
      setCurrentUser(selectedUser);
      setLoginForm({ email: "", password: "", role: "admin" });
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
  };

  /* =========================
     DATE FILTER LOGIC
  ========================= */
  const isWithinDateFilter = (entryDate) => {
    if (dateFilter === "All") return true;

    const today = new Date();
    const entry = new Date(entryDate);

    today.setHours(0, 0, 0, 0);
    entry.setHours(0, 0, 0, 0);

    if (dateFilter === "Today") {
      return entry.getTime() === today.getTime();
    }

    if (dateFilter === "Last7Days") {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 6);
      return entry >= last7 && entry <= today;
    }

    if (dateFilter === "Last30Days") {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 29);
      return entry >= last30 && entry <= today;
    }

    return true;
  };

  /* =========================
     FILTERED ENTRIES
  ========================= */
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const outletMatch =
        filterOutlet === "All" ? true : item.outlet === filterOutlet;
      const dateMatch = isWithinDateFilter(item.date);
      return outletMatch && dateMatch;
    });
  }, [entries, filterOutlet, dateFilter]);

  /* =========================
     ADD ENTRY
  ========================= */
  const addEntry = async () => {
  if (
    !form.outlet ||
    !form.date ||
    form.footfall === "" ||
    form.driverCount === "" ||
    form.dineInRevenue === "" ||
    form.parcelRevenue === "" ||
    form.roomRevenue === "" ||
    form.otherRevenue === "" ||
    form.marketingSpend === ""
  ) {
    alert("Please fill all fields");
    return;
  }

  try {
    await addDoc(collection(db, "footfall"), {
      outlet: form.outlet,
      date: form.date,
      footfall: Number(form.footfall),
      driverCount: Number(form.driverCount),
      dineInRevenue: Number(form.dineInRevenue),
      parcelRevenue: Number(form.parcelRevenue),
      roomRevenue: Number(form.roomRevenue),
      otherRevenue: Number(form.otherRevenue),
      marketingSpend: Number(form.marketingSpend),
      createdAt: new Date(),
    });

    alert("Entry Saved Successfully!");

    setForm({
      outlet: "",
      date: "",
      footfall: "",
      driverCount: "",
      dineInRevenue: "",
      parcelRevenue: "",
      roomRevenue: "",
      otherRevenue: "",
      marketingSpend: "",
    });

  } catch (error) {
    console.error(error);
    alert("Failed to save entry");
  }
};

  /* =========================
     DELETE ENTRY
  ========================= */
  const deleteEntry = async (id) => {
  const ok = window.confirm("Delete this entry?");
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "footfall", id));

    alert("Entry Deleted Successfully!");
  } catch (error) {
    console.error(error);
    alert("Failed to delete entry");
  }
};

  /* =========================
     KPI CALCULATIONS
  ========================= */
  const totalRevenue = filteredEntries.reduce(
    (sum, item) => sum + getTotalRevenue(item),
    0
  );

  const totalFootfall = filteredEntries.reduce(
    (sum, item) => sum + Number(item.footfall || 0),
    0
  );

  const totalMarketingSpend = filteredEntries.reduce(
    (sum, item) => sum + Number(item.marketingSpend || 0),
    0
  );

  const totalDrivers = filteredEntries.reduce(
    (sum, item) => sum + Number(item.driverCount || 0),
    0
  );

  const avgRevenuePerCustomer =
    totalFootfall > 0 ? (totalRevenue / totalFootfall).toFixed(2) : "0.00";

  const costPerVisitor =
    totalFootfall > 0
      ? (totalMarketingSpend / totalFootfall).toFixed(2)
      : "0.00";

  const totalEntries = filteredEntries.length;

  /* =========================
     OUTLET SUMMARY
  ========================= */
  const outletSummary = useMemo(() => {
    const summary = {};

    filteredEntries.forEach((item) => {
      if (!summary[item.outlet]) {
        summary[item.outlet] = {
          outlet: item.outlet,
          footfall: 0,
          driverCount: 0,
          dineInRevenue: 0,
          parcelRevenue: 0,
          roomRevenue: 0,
          otherRevenue: 0,
          totalRevenue: 0,
          marketingSpend: 0,
        };
      }

      summary[item.outlet].footfall += Number(item.footfall || 0);
      summary[item.outlet].driverCount += Number(item.driverCount || 0);
      summary[item.outlet].dineInRevenue += Number(item.dineInRevenue || 0);
      summary[item.outlet].parcelRevenue += Number(item.parcelRevenue || 0);
      summary[item.outlet].roomRevenue += Number(item.roomRevenue || 0);
      summary[item.outlet].otherRevenue += Number(item.otherRevenue || 0);
      summary[item.outlet].marketingSpend += Number(item.marketingSpend || 0);
      summary[item.outlet].totalRevenue += getTotalRevenue(item);
    });

    return Object.values(summary).map((item) => ({
      ...item,
      avgRevenuePerCustomer:
        item.footfall > 0
          ? (item.totalRevenue / item.footfall).toFixed(2)
          : "0.00",
      costPerVisitor:
        item.footfall > 0
          ? (item.marketingSpend / item.footfall).toFixed(2)
          : "0.00",
    }));
  }, [filteredEntries]);

  const topOutlet =
    outletSummary.length > 0
      ? [...outletSummary].sort((a, b) => b.totalRevenue - a.totalRevenue)[0]
      : null;

  const lowestOutlet =
    outletSummary.length > 0
      ? [...outletSummary].sort((a, b) => a.totalRevenue - b.totalRevenue)[0]
      : null;

  /* =========================
     ALERTS
  ========================= */
  const alerts = [];

  outletSummary.forEach((item) => {
    if (item.footfall < FOOTFALL_THRESHOLD) {
      alerts.push(
        `⚠ ${item.outlet}: Footfall is low (${item.footfall}) | Threshold: ${FOOTFALL_THRESHOLD}`
      );
    }

    if (Number(item.costPerVisitor) > COST_PER_VISITOR_THRESHOLD) {
      alerts.push(
        `⚠ ${item.outlet}: Cost per visitor is high (₹${item.costPerVisitor}) | Threshold: ₹${COST_PER_VISITOR_THRESHOLD}`
      );
    }

    if (item.totalRevenue < LOW_REVENUE_THRESHOLD) {
      alerts.push(
        `⚠ ${item.outlet}: Revenue is low (₹${item.totalRevenue}) | Threshold: ₹${LOW_REVENUE_THRESHOLD}`
      );
    }
  });

  /* =========================
     CHART DATA
  ========================= */
  const outletChartData = outletSummary.map((item) => ({
    outlet: item.outlet,
    revenue: item.totalRevenue,
    footfall: item.footfall,
    marketingSpend: item.marketingSpend,
  }));

  const dailyChartData = useMemo(() => {
    const grouped = {};

    filteredEntries.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = {
          date: item.date,
          revenue: 0,
          footfall: 0,
          marketingSpend: 0,
        };
      }

      grouped[item.date].revenue += getTotalRevenue(item);
      grouped[item.date].footfall += Number(item.footfall || 0);
      grouped[item.date].marketingSpend += Number(item.marketingSpend || 0);
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [filteredEntries]);

  /* =========================
     CSV EXPORT
  ========================= */
  const exportCSV = () => {
    if (!filteredEntries.length) {
      alert("No data to export");
      return;
    }

    const csv =
      "Outlet,Date,Footfall,Driver Count,Dine-in Revenue,Parcel Revenue,Room Revenue,Other Revenue,Marketing Spend,Total Revenue,Cost Per Visitor\n" +
      filteredEntries
        .map((e) => {
          const totalRev = getTotalRevenue(e);
          const cpv =
            e.footfall > 0 ? (e.marketingSpend / e.footfall).toFixed(2) : 0;

          return `${e.outlet},${e.date},${e.footfall},${e.driverCount},${e.dineInRevenue},${e.parcelRevenue},${e.roomRevenue},${e.otherRevenue},${e.marketingSpend},${totalRev},${cpv}`;
        })
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mannat-footfall-revenue-report.csv";
    link.click();
  };

  /* =========================
     RESET ALL DATA
  ========================= */
  const resetAllData = () => {
    const ok = window.confirm("Are you sure you want to reset all data?");
    if (!ok) return;

    localStorage.removeItem("entries");
    setEntries([]);
  };

  /* =========================
     LOGIN PAGE
  ========================= */
  if (!isLoggedIn) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 40%, #198754 100%)",
          padding: "20px",
        }}
      >
        <div
          className="card shadow-lg border-0"
          style={{ maxWidth: "450px", width: "100%", borderRadius: "20px" }}
        >
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">🏨 Mannat Group Hotels</h2>
              <p className="text-muted mb-0">
                Daily Footfall & Revenue Intelligence System
              </p>
            </div>

            <h4 className="text-center mb-4">Login</h4>

            <div className="mb-3">
              <label className="form-label fw-semibold">Login As</label>
              <select
                className="form-select"
                value={loginForm.role}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, role: e.target.value })
                }
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
            </div>

            {loginError && (
              <div className="alert alert-danger py-2">{loginError}</div>
            )}

            <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>
              Login
            </button>

            <div className="bg-light rounded p-3 small">
              <div className="fw-bold mb-2">Demo Credentials</div>
              <div>
                <strong>Admin:</strong> admin@mannat.com / 123456
              </div>
              <div>
                <strong>Staff:</strong> staff@mannat.com / 123456
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN DASHBOARD
  ========================= */
  return (
    <div className="bg-light min-vh-100">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">
            🏨 Mannat Group Hotels Dashboard
          </span>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-success fs-6">
              {currentUser?.role?.toUpperCase()}
            </span>
            <span className="text-white small">{currentUser?.email}</span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* HEADER */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1">
            Daily Footfall & Revenue Intelligence Dashboard
          </h2>
          <p className="text-muted mb-0">
            Track outlet performance, footfall, revenue, driver visits and
            marketing spend across locations.
          </p>
        </div>

        {/* FILTERS */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Filter by Outlet</label>
                <select
                  className="form-select"
                  value={filterOutlet}
                  onChange={(e) => setFilterOutlet(e.target.value)}
                >
                  <option value="All">All Outlets</option>
                  {OUTLETS.map((outlet) => (
                    <option key={outlet} value={outlet}>
                      {outlet}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Date Range</label>
                <select
                  className="form-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Last7Days">Last 7 Days</option>
                  <option value="Last30Days">Last 30 Days</option>
                </select>
              </div>

              <div className="col-md-4 d-flex gap-2">
                <button className="btn btn-success w-100" onClick={exportCSV}>
                  Export CSV
                </button>
                <button className="btn btn-danger w-100" onClick={resetAllData}>
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* THRESHOLDS INFO */}
        <div className="alert alert-info mb-4">
          <strong>Current Alert Thresholds:</strong>{" "}
          Footfall &lt; {FOOTFALL_THRESHOLD} | Cost / Visitor &gt; ₹
          {COST_PER_VISITOR_THRESHOLD} | Revenue &lt; ₹{LOW_REVENUE_THRESHOLD}
        </div>

        {/* KPI CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Total Revenue</div>
                <h3 className="fw-bold mb-0">₹{totalRevenue}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Total Footfall</div>
                <h3 className="fw-bold mb-0">{totalFootfall}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Marketing Spend</div>
                <h3 className="fw-bold mb-0">₹{totalMarketingSpend}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Avg Revenue / Customer</div>
                <h3 className="fw-bold mb-0">₹{avgRevenuePerCustomer}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Cost / Visitor</div>
                <h3 className="fw-bold mb-0">₹{costPerVisitor}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Driver Visits</div>
                <h3 className="fw-bold mb-0">{totalDrivers}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Total Entries</div>
                <h3 className="fw-bold mb-0">{totalEntries}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">Top Outlet</div>
                <h5 className="fw-bold mb-0">
                  {topOutlet ? topOutlet.outlet : "-"}
                </h5>
                {topOutlet && (
                  <small className="text-muted">
                    Revenue ₹{topOutlet.totalRevenue}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Alerts & Exceptions</h4>

            {alerts.length === 0 ? (
              <div className="alert alert-success mb-0">
                No alerts. All outlets are performing within thresholds.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="alert alert-warning mb-0">
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* LEFT COLUMN */}
          <div className="col-lg-5">
            {/* ENTRY FORM */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Add Daily Entry</h4>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Outlet</label>
                  <select
                    className="form-select"
                    value={form.outlet}
                    onChange={(e) =>
                      setForm({ ...form, outlet: e.target.value })
                    }
                  >
                    <option value="">Select Outlet</option>
                    {OUTLETS.map((outlet) => (
                      <option key={outlet} value={outlet}>
                        {outlet}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Footfall</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter footfall"
                      value={form.footfall}
                      onChange={(e) =>
                        setForm({ ...form, footfall: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Driver Count
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter driver visits"
                      value={form.driverCount}
                      onChange={(e) =>
                        setForm({ ...form, driverCount: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Dine-in Revenue
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter dine-in revenue"
                      value={form.dineInRevenue}
                      onChange={(e) =>
                        setForm({ ...form, dineInRevenue: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Parcel Revenue
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter parcel revenue"
                      value={form.parcelRevenue}
                      onChange={(e) =>
                        setForm({ ...form, parcelRevenue: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Room Revenue
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter room revenue"
                      value={form.roomRevenue}
                      onChange={(e) =>
                        setForm({ ...form, roomRevenue: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Other Revenue
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter other revenue"
                      value={form.otherRevenue}
                      onChange={(e) =>
                        setForm({ ...form, otherRevenue: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Marketing Spend
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter marketing spend"
                      value={form.marketingSpend}
                      onChange={(e) =>
                        setForm({ ...form, marketingSpend: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button className="btn btn-primary mt-4 w-100" onClick={addEntry}>
                  Save Entry
                </button>
              </div>
            </div>

            {/* TOP / LOWEST OUTLET */}
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Outlet Performance Snapshot</h4>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="p-3 rounded bg-success-subtle border">
                      <div className="fw-bold">🏆 Top Performing Outlet</div>
                      {topOutlet ? (
                        <>
                          <div className="mt-2 fs-5 fw-semibold">
                            {topOutlet.outlet}
                          </div>
                          <div>Revenue: ₹{topOutlet.totalRevenue}</div>
                          <div>Footfall: {topOutlet.footfall}</div>
                        </>
                      ) : (
                        <div className="text-muted mt-2">No data available</div>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="p-3 rounded bg-danger-subtle border">
                      <div className="fw-bold">📉 Lowest Performing Outlet</div>
                      {lowestOutlet ? (
                        <>
                          <div className="mt-2 fs-5 fw-semibold">
                            {lowestOutlet.outlet}
                          </div>
                          <div>Revenue: ₹{lowestOutlet.totalRevenue}</div>
                          <div>Footfall: {lowestOutlet.footfall}</div>
                        </>
                      ) : (
                        <div className="text-muted mt-2">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-lg-7">
            {/* OUTLET REVENUE CHART */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Outlet Revenue Comparison</h4>

                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={outletChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="outlet" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#198754" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TREND CHART */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Revenue / Footfall Trend</h4>

                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0d6efd"
                      strokeWidth={3}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="footfall"
                      stroke="#198754"
                      strokeWidth={3}
                      name="Footfall"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* OUTLET SUMMARY TABLE */}
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Outlet-wise Performance Summary</h4>

                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Outlet</th>
                        <th>Footfall</th>
                        <th>Drivers</th>
                        <th>Total Revenue</th>
                        <th>Marketing</th>
                        <th>Avg Rev / Customer</th>
                        <th>Cost / Visitor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outletSummary.length > 0 ? (
                        outletSummary.map((item, index) => (
                          <tr key={index}>
                            <td>{item.outlet}</td>
                            <td>{item.footfall}</td>
                            <td>{item.driverCount}</td>
                            <td>₹{item.totalRevenue}</td>
                            <td>₹{item.marketingSpend}</td>
                            <td>₹{item.avgRevenuePerCustomer}</td>
                            <td>₹{item.costPerVisitor}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED ENTRIES TABLE */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h4 className="fw-bold mb-3">All Daily Entries</h4>

            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Outlet</th>
                    <th>Date</th>
                    <th>Footfall</th>
                    <th>Drivers</th>
                    <th>Dine-in</th>
                    <th>Parcel</th>
                    <th>Room</th>
                    <th>Other</th>
                    <th>Marketing</th>
                    <th>Total Revenue</th>
                    <th>Cost / Visitor</th>
                    {currentUser?.role === "admin" && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((item) => {
                      const totalRev = getTotalRevenue(item);
                      const cpv =
                        item.footfall > 0
                          ? (item.marketingSpend / item.footfall).toFixed(2)
                          : "0.00";

                      return (
                        <tr key={item.id}>
                          <td>{item.outlet}</td>
                          <td>{item.date}</td>
                          <td>{item.footfall}</td>
                          <td>{item.driverCount}</td>
                          <td>₹{item.dineInRevenue}</td>
                          <td>₹{item.parcelRevenue}</td>
                          <td>₹{item.roomRevenue}</td>
                          <td>₹{item.otherRevenue}</td>
                          <td>₹{item.marketingSpend}</td>
                          <td>₹{totalRev}</td>
                          <td>₹{cpv}</td>
                          {currentUser?.role === "admin" && (
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteEntry(item.id)}
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={currentUser?.role === "admin" ? 12 : 11}
                        className="text-center"
                      >
                        No entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {currentUser?.role === "staff" && (
              <div className="alert alert-info mt-3 mb-0">
                Staff view: You can add and view entries. Delete action is
                restricted to Admin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
