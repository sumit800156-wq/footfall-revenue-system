import React, { useMemo, useState, useEffect } from "react";

export default function App() {
  // =========================
  // CONFIG
  // =========================
  const OUTLETS = [
    "Murthal",
    "Karnal",
    "Jalandhar Hub",
    "Ambala",
    "Kurukshetra",
    "Ludhiana",
    "Panipat",
    "Sonipat",
    "Delhi Border",
    "Chandigarh Highway",
  ];

  const USERS = [
    { username: "admin", password: "1234", role: "admin", outlet: null },
    { username: "murthal", password: "1234", role: "staff", outlet: "Murthal" },
    { username: "karnal", password: "1234", role: "staff", outlet: "Karnal" },
    { username: "jalandhar", password: "1234", role: "staff", outlet: "Jalandhar Hub" },
    { username: "ambala", password: "1234", role: "staff", outlet: "Ambala" },
    { username: "kurukshetra", password: "1234", role: "staff", outlet: "Kurukshetra" },
    { username: "ludhiana", password: "1234", role: "staff", outlet: "Ludhiana" },
    { username: "panipat", password: "1234", role: "staff", outlet: "Panipat" },
    { username: "sonipat", password: "1234", role: "staff", outlet: "Sonipat" },
    { username: "delhi", password: "1234", role: "staff", outlet: "Delhi Border" },
    { username: "chandigarh", password: "1234", role: "staff", outlet: "Chandigarh Highway" },
  ];

  const STORAGE_KEYS = {
    entries: "mannat_entries_v2",
    user: "mannat_logged_user_v2",
  };

  // =========================
  // HELPERS
  // =========================
  const todayDate = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const formatCurrencyShort = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    return dateStr;
  };

  // =========================
  // LOGIN STATE
  // =========================
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.user);
    return saved ? JSON.parse(saved) : null;
  });

  // =========================
  // DATA STATE
  // =========================
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.entries);
    return saved ? JSON.parse(saved) : [];
  });

  // =========================
  // FILTERS
  // =========================
  const [selectedOutlet, setSelectedOutlet] = useState("All Outlets");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // =========================
  // FORM STATE
  // =========================
  const getInitialForm = (user = currentUser) => ({
    id: null,
    outlet:
      user?.role === "staff" && user?.outlet ? user.outlet : "",
    date: todayDate(),
    footfall: "",
    drivers: "",
    restaurantRevenue: "",
    roomRevenue: "",
    otherRevenue: "",
    marketingExpense: "",
    remarks: "",
  });

  const [form, setForm] = useState(getInitialForm(currentUser));
  const [formError, setFormError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // =========================
  // LOCAL STORAGE SAVE
  // =========================
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [currentUser]);

  useEffect(() => {
    setForm(getInitialForm(currentUser));
    setSelectedOutlet(
      currentUser?.role === "staff" && currentUser?.outlet
        ? currentUser.outlet
        : "All Outlets"
    );
    setFromDate("");
    setToDate("");
  }, [currentUser]);

  // =========================
  // LOGIN HANDLERS
  // =========================
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    const user = USERS.find(
      (u) =>
        u.username.trim().toLowerCase() === loginForm.username.trim().toLowerCase() &&
        u.password === loginForm.password
    );

    if (!user) {
      setLoginError("Invalid username or password");
      return;
    }

    setCurrentUser(user);
    setLoginForm({ username: "", password: "" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: "", password: "" });
    setLoginError("");
  };

  // =========================
  // FILTERED ENTRIES
  // =========================
  const visibleEntries = useMemo(() => {
    let data = [...entries];

    // staff sees only own outlet
    if (currentUser?.role === "staff") {
      data = data.filter((e) => e.outlet === currentUser.outlet);
    }

    // outlet filter
    if (selectedOutlet !== "All Outlets") {
      data = data.filter((e) => e.outlet === selectedOutlet);
    }

    // date range filter
    if (fromDate) {
      data = data.filter((e) => e.date >= fromDate);
    }
    if (toDate) {
      data = data.filter((e) => e.date <= toDate);
    }

    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, currentUser, selectedOutlet, fromDate, toDate]);

  // =========================
  // KPIs
  // =========================
  const summary = useMemo(() => {
    const totalRevenue = visibleEntries.reduce(
      (sum, e) => sum + (e.totalRevenue || 0),
      0
    );
    const totalFootfall = visibleEntries.reduce(
      (sum, e) => sum + (e.footfall || 0),
      0
    );
    const totalDrivers = visibleEntries.reduce(
      (sum, e) => sum + (e.drivers || 0),
      0
    );
    const totalMarketing = visibleEntries.reduce(
      (sum, e) => sum + (e.marketingExpense || 0),
      0
    );
    const totalEntries = visibleEntries.length;
    const avgRevenuePerCustomer =
      totalFootfall > 0 ? totalRevenue / totalFootfall : 0;

    return {
      totalRevenue,
      totalFootfall,
      totalDrivers,
      totalMarketing,
      totalEntries,
      avgRevenuePerCustomer,
    };
  }, [visibleEntries]);

  // =========================
  // TOP OUTLET
  // =========================
  const topOutlet = useMemo(() => {
    if (!visibleEntries.length) return null;

    const outletMap = {};
    visibleEntries.forEach((e) => {
      if (!outletMap[e.outlet]) {
        outletMap[e.outlet] = 0;
      }
      outletMap[e.outlet] += e.totalRevenue || 0;
    });

    const sorted = Object.entries(outletMap).sort((a, b) => b[1] - a[1]);
    return sorted.length
      ? { outlet: sorted[0][0], revenue: sorted[0][1] }
      : null;
  }, [visibleEntries]);

  // =========================
  // ALERTS
  // =========================
  const alerts = useMemo(() => {
    const list = [];

    visibleEntries.forEach((e) => {
      const costPerVisitor =
        e.footfall > 0 ? e.marketingExpense / e.footfall : 0;

      if (e.footfall > 0 && e.footfall < 100) {
        list.push({
          type: "Low Footfall",
          message: `${e.outlet}: Footfall is low (${e.footfall})`,
        });
      }

      if (e.marketingExpense > 5000) {
        list.push({
          type: "High Marketing Spend",
          message: `${e.outlet}: Marketing expense is high (${formatCurrencyShort(
            e.marketingExpense
          )})`,
        });
      }

      if (e.totalRevenue < 10000) {
        list.push({
          type: "Low Revenue",
          message: `${e.outlet}: Revenue is low (${formatCurrencyShort(
            e.totalRevenue
          )})`,
        });
      }

      if (costPerVisitor > 80) {
        list.push({
          type: "High Cost / Visitor",
          message: `${e.outlet}: Cost per visitor is high (${formatCurrencyShort(
            costPerVisitor
          )})`,
        });
      }
    });

    return list;
  }, [visibleEntries]);

  // =========================
  // OUTLET PERFORMANCE
  // =========================
  const outletPerformance = useMemo(() => {
    const map = {};

    visibleEntries.forEach((e) => {
      if (!map[e.outlet]) {
        map[e.outlet] = {
          outlet: e.outlet,
          revenue: 0,
          footfall: 0,
          drivers: 0,
          marketing: 0,
        };
      }

      map[e.outlet].revenue += e.totalRevenue || 0;
      map[e.outlet].footfall += e.footfall || 0;
      map[e.outlet].drivers += e.drivers || 0;
      map[e.outlet].marketing += e.marketingExpense || 0;
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [visibleEntries]);

  // =========================
  // FORM HANDLERS
  // =========================
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(getInitialForm(currentUser));
    setIsEditMode(false);
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    // validation
    if (!form.outlet) {
      setFormError("Please select an outlet");
      return;
    }
    if (!form.date) {
      setFormError("Please select a date");
      return;
    }

    const footfall = toNumber(form.footfall);
    const drivers = toNumber(form.drivers);
    const restaurantRevenue = toNumber(form.restaurantRevenue);
    const roomRevenue = toNumber(form.roomRevenue);
    const otherRevenue = toNumber(form.otherRevenue);
    const marketingExpense = toNumber(form.marketingExpense);

    // कम से कम कुछ useful value enter honi chahiye
    const hasSomeData =
      footfall > 0 ||
      drivers > 0 ||
      restaurantRevenue > 0 ||
      roomRevenue > 0 ||
      otherRevenue > 0 ||
      marketingExpense > 0 ||
      form.remarks.trim() !== "";

    if (!hasSomeData) {
      setFormError("Please enter at least one value before saving.");
      return;
    }

    const totalRevenue =
      restaurantRevenue + roomRevenue + otherRevenue;

    const payload = {
      id: isEditMode && form.id ? form.id : Date.now(),
      outlet: form.outlet,
      date: form.date,
      footfall,
      drivers,
      restaurantRevenue,
      roomRevenue,
      otherRevenue,
      marketingExpense,
      totalRevenue,
      remarks: form.remarks.trim(),
      createdBy: currentUser?.username || "admin",
      role: currentUser?.role || "admin",
    };

    if (isEditMode) {
      setEntries((prev) =>
        prev.map((item) => (item.id === form.id ? payload : item))
      );
    } else {
      setEntries((prev) => [payload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (entry) => {
    // staff can only edit own outlet
    if (
      currentUser?.role === "staff" &&
      entry.outlet !== currentUser.outlet
    ) {
      return;
    }

    setForm({
      id: entry.id,
      outlet: entry.outlet,
      date: entry.date,
      footfall: entry.footfall,
      drivers: entry.drivers,
      restaurantRevenue: entry.restaurantRevenue,
      roomRevenue: entry.roomRevenue,
      otherRevenue: entry.otherRevenue,
      marketingExpense: entry.marketingExpense,
      remarks: entry.remarks || "",
    });

    setIsEditMode(true);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;

    if (
      currentUser?.role === "staff" &&
      target.outlet !== currentUser.outlet
    ) {
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this entry?");
    if (!ok) return;

    setEntries((prev) => prev.filter((e) => e.id !== id));

    if (isEditMode && form.id === id) {
      resetForm();
    }
  };

  // =========================
  // CSV EXPORT
  // =========================
  const handleExportCSV = () => {
    if (!visibleEntries.length) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Outlet",
      "Date",
      "Footfall",
      "Drivers",
      "Restaurant Revenue",
      "Room Revenue",
      "Other Revenue",
      "Marketing Expense",
      "Total Revenue",
      "Remarks",
      "Created By",
      "Role",
    ];

    const rows = visibleEntries.map((e) => [
      e.outlet,
      e.date,
      e.footfall,
      e.drivers,
      e.restaurantRevenue,
      e.roomRevenue,
      e.otherRevenue,
      e.marketingExpense,
      e.totalRevenue,
      e.remarks || "",
      e.createdBy || "",
      e.role || "",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mannat_entries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================
  // RESET DATA
  // =========================
  const handleResetData = () => {
    const ok = window.confirm(
      "This will delete all saved entries from local storage. Continue?"
    );
    if (!ok) return;

    localStorage.removeItem(STORAGE_KEYS.entries);
    setEntries([]);
    resetForm();
  };

  // =========================
  // LOGIN SCREEN
  // =========================
  if (!currentUser) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={{ marginBottom: 20 }}>Mannat Group Login</h1>

          <form onSubmit={handleLogin}>
            <input
              style={styles.input}
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            />

            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />

            <button style={styles.primaryButton} type="submit">
              Login
            </button>
          </form>

          {loginError && (
            <p style={{ color: "#dc2626", marginTop: 14 }}>{loginError}</p>
          )}

          <div style={{ marginTop: 20, fontSize: 14, color: "#444" }}>
            <p><strong>Demo Admin:</strong> admin / 1234</p>
            <p><strong>Demo Staff:</strong> murthal / 1234</p>
            <p><strong>Demo Staff:</strong> karnal / 1234</p>
            <p><strong>Demo Staff:</strong> jalandhar / 1234</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN APP
  // =========================
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.topbar}>
        <div style={{ fontWeight: 800, fontSize: 28 }}>🏨 Mannat Group Hotels Dashboard</div>
        <div style={styles.topbarRight}>
          <div style={styles.userBadge}>
            {currentUser.role === "admin"
              ? "Admin"
              : `Staff - ${currentUser.outlet}`}
          </div>
          <button style={styles.resetBtn} onClick={handleResetData}>
            Reset Data
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {/* TITLE */}
        <div style={styles.heroCard}>
          <h1 style={styles.mainTitle}>Mannat Group Hotels</h1>
          <p style={styles.subTitle}>
            Daily Footfall, Driver Visits & Revenue Intelligence Dashboard
          </p>
        </div>

        {/* FILTERS */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Filters</h2>
          <div style={styles.filterGrid}>
            <div>
              <label style={styles.label}>Outlet</label>
              <select
                style={styles.input}
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                disabled={currentUser.role === "staff"}
              >
                {currentUser.role === "admin" && (
                  <option>All Outlets</option>
                )}
                {(currentUser.role === "staff"
                  ? [currentUser.outlet]
                  : OUTLETS
                ).map((outlet) => (
                  <option key={outlet} value={outlet}>
                    {outlet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>From Date</label>
              <input
                style={styles.input}
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>To Date</label>
              <input
                style={styles.input}
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div style={styles.kpiGrid}>
          <KpiCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} />
          <KpiCard title="Total Footfall" value={summary.totalFootfall} />
          <KpiCard title="Total Driver Visits" value={summary.totalDrivers} />
          <KpiCard
            title="Avg Revenue / Customer"
            value={`₹${summary.avgRevenuePerCustomer.toFixed(2)}`}
          />
          <KpiCard
            title="Total Marketing Expense"
            value={formatCurrency(summary.totalMarketing)}
          />
          <KpiCard title="Total Entries" value={summary.totalEntries} />
        </div>

        {/* TOP OUTLET */}
        <div style={styles.card}>
          <h2 style={{ ...styles.sectionTitle, textAlign: "center" }}>
            🏆 Top Performing Outlet
          </h2>
          {topOutlet ? (
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: 0, fontSize: 28 }}>{topOutlet.outlet}</h3>
              <p style={{ marginTop: 10, fontSize: 20, fontWeight: 700 }}>
                Revenue: {formatCurrency(topOutlet.revenue)}
              </p>
            </div>
          ) : (
            <p style={styles.noData}>No data available</p>
          )}
        </div>

        {/* ENTRY FORM */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            {isEditMode ? "Edit Entry" : "Add Daily Entry"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Outlet</label>
                <select
                  style={styles.input}
                  name="outlet"
                  value={form.outlet}
                  onChange={handleFormChange}
                  disabled={currentUser.role === "staff"}
                >
                  <option value="">Select Outlet</option>
                  {(currentUser.role === "staff"
                    ? [currentUser.outlet]
                    : OUTLETS
                  ).map((outlet) => (
                    <option key={outlet} value={outlet}>
                      {outlet}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Date</label>
                <input
                  style={styles.input}
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <label style={styles.label}>Footfall</label>
                <input
                  style={styles.input}
                  type="number"
                  name="footfall"
                  value={form.footfall}
                  onChange={handleFormChange}
                  placeholder="Footfall"
                />
              </div>

              <div>
                <label style={styles.label}>Driver Visits</label>
                <input
                  style={styles.input}
                  type="number"
                  name="drivers"
                  value={form.drivers}
                  onChange={handleFormChange}
                  placeholder="Driver Visits"
                />
              </div>

              <div>
                <label style={styles.label}>Restaurant Revenue</label>
                <input
                  style={styles.input}
                  type="number"
                  name="restaurantRevenue"
                  value={form.restaurantRevenue}
                  onChange={handleFormChange}
                  placeholder="Restaurant Revenue"
                />
              </div>

              <div>
                <label style={styles.label}>Room Revenue</label>
                <input
                  style={styles.input}
                  type="number"
                  name="roomRevenue"
                  value={form.roomRevenue}
                  onChange={handleFormChange}
                  placeholder="Room Revenue"
                />
              </div>

              <div>
                <label style={styles.label}>Other Revenue</label>
                <input
                  style={styles.input}
                  type="number"
                  name="otherRevenue"
                  value={form.otherRevenue}
                  onChange={handleFormChange}
                  placeholder="Other Revenue"
                />
              </div>

              <div>
                <label style={styles.label}>Marketing Expense</label>
                <input
                  style={styles.input}
                  type="number"
                  name="marketingExpense"
                  value={form.marketingExpense}
                  onChange={handleFormChange}
                  placeholder="Marketing Expense"
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={styles.label}>Remarks</label>
              <input
                style={styles.input}
                type="text"
                name="remarks"
                value={form.remarks}
                onChange={handleFormChange}
                placeholder="Remarks (optional)"
              />
            </div>

            {formError && (
              <p style={{ color: "#dc2626", marginTop: 14 }}>{formError}</p>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <button style={styles.primaryButton} type="submit">
                {isEditMode ? "Update Entry" : "Save Entry"}
              </button>

              {isEditMode && (
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ALERTS */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>⚠ Alerts</h2>
          {alerts.length ? (
            <div style={{ display: "grid", gap: 12 }}>
              {alerts.map((a, idx) => (
                <div key={idx} style={styles.alertBox}>
                  <div style={{ fontWeight: 800, color: "#b91c1c" }}>{a.type}</div>
                  <div style={{ marginTop: 6 }}>{a.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noData}>No alerts found</p>
          )}
        </div>

        {/* REVENUE ANALYTICS */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Revenue Analytics</h2>
          {outletPerformance.length ? (
            <div style={{ display: "grid", gap: 16 }}>
              {outletPerformance.map((item) => {
                const maxRevenue = Math.max(
                  ...outletPerformance.map((x) => x.revenue || 0),
                  1
                );
                const width = `${(item.revenue / maxRevenue) * 100}%`;

                return (
                  <div key={item.outlet}>
                    <div style={styles.analyticsRow}>
                      <div style={styles.analyticsOutlet}>{item.outlet}</div>
                      <div style={styles.analyticsBarWrap}>
                        <div style={{ ...styles.analyticsBar, width }}>
                          {formatCurrencyShort(item.revenue)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={styles.noData}>No analytics data available</p>
          )}
        </div>

        {/* OUTLET PERFORMANCE */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Outlet Performance</h2>
          {outletPerformance.length ? (
            <div style={styles.performanceGrid}>
              {outletPerformance.map((item) => {
                const avg =
                  item.footfall > 0 ? item.revenue / item.footfall : 0;

                return (
                  <div key={item.outlet} style={styles.performanceCard}>
                    <h3 style={{ marginTop: 0 }}>{item.outlet}</h3>
                    <p><strong>Revenue:</strong> {formatCurrency(item.revenue)}</p>
                    <p><strong>Footfall:</strong> {item.footfall}</p>
                    <p><strong>Drivers:</strong> {item.drivers}</p>
                    <p><strong>Marketing:</strong> {formatCurrency(item.marketing)}</p>
                    <p><strong>Revenue / Customer:</strong> ₹{avg.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={styles.noData}>No outlet performance data</p>
          )}
        </div>

        {/* EXPORT */}
        <div style={{ marginBottom: 20 }}>
          <button style={styles.exportBtn} onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>

        {/* TABLE */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Entries Table</h2>

          {visibleEntries.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Outlet</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Footfall</th>
                    <th style={styles.th}>Drivers</th>
                    <th style={styles.th}>Restaurant</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Other</th>
                    <th style={styles.th}>Marketing</th>
                    <th style={styles.th}>Total Revenue</th>
                    <th style={styles.th}>Remarks</th>
                    <th style={styles.th}>Created By</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td style={styles.td}>{entry.outlet}</td>
                      <td style={styles.td}>{formatDateDisplay(entry.date)}</td>
                      <td style={styles.td}>{entry.footfall}</td>
                      <td style={styles.td}>{entry.drivers}</td>
                      <td style={styles.td}>{formatCurrencyShort(entry.restaurantRevenue)}</td>
                      <td style={styles.td}>{formatCurrencyShort(entry.roomRevenue)}</td>
                      <td style={styles.td}>{formatCurrencyShort(entry.otherRevenue)}</td>
                      <td style={styles.td}>{formatCurrencyShort(entry.marketingExpense)}</td>
                      <td style={styles.td}>{formatCurrencyShort(entry.totalRevenue)}</td>
                      <td style={styles.td}>{entry.remarks || "-"}</td>
                      <td style={styles.td}>{entry.createdBy || "-"}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            style={styles.editBtn}
                            onClick={() => handleEdit(entry)}
                          >
                            Edit
                          </button>
                          <button
                            style={styles.deleteBtn}
                            onClick={() => handleDelete(entry.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.noData}>No entries available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================
// SMALL COMPONENT
// =========================
function KpiCard({ title, value }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value}</div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f4f5",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: 1300,
    margin: "0 auto",
    padding: 20,
  },

  topbar: {
    background: "#0f172a",
    color: "white",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  userBadge: {
    background: "#1e293b",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
  },

  heroCard: {
    background: "white",
    borderRadius: 16,
    padding: 28,
    marginTop: 24,
    marginBottom: 20,
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    textAlign: "center",
  },

  mainTitle: {
    margin: 0,
    fontSize: 42,
    fontWeight: 800,
  },

  subTitle: {
    marginTop: 12,
    color: "#52525b",
    fontSize: 20,
  },

  card: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: 18,
    fontSize: 32,
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 15,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #d4d4d8",
    fontSize: 16,
    boxSizing: "border-box",
    outline: "none",
  },

  primaryButton: {
    background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    minWidth: 180,
  },

  cancelBtn: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: 12,
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 160,
  },

  resetBtn: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  logoutBtn: {
    background: "#7f1d1d",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
    marginBottom: 20,
  },

  kpiCard: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  kpiTitle: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 14,
  },

  kpiValue: {
    fontSize: 38,
    fontWeight: 900,
  },

  alertBox: {
    borderLeft: "5px solid #dc2626",
    background: "#fef2f2",
    borderRadius: 12,
    padding: 16,
  },

  analyticsRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 16,
    alignItems: "center",
  },

  analyticsOutlet: {
    fontWeight: 800,
    fontSize: 18,
  },

  analyticsBarWrap: {
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    minHeight: 42,
  },

  analyticsBar: {
    minHeight: 42,
    background: "#0f172a",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    borderRadius: 999,
    minWidth: 90,
  },

  performanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },

  performanceCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 18,
    background: "#fafafa",
  },

  exportBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "14px 22px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1100,
  },

  th: {
    background: "#111827",
    color: "white",
    padding: 14,
    textAlign: "left",
    fontSize: 14,
  },

  td: {
    borderBottom: "1px solid #e5e7eb",
    padding: 14,
    fontSize: 14,
    verticalAlign: "top",
  },

  editBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },

  deleteBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },

  noData: {
    color: "#6b7280",
    fontSize: 16,
  },

  loginPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f5",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },

  loginCard: {
    width: "100%",
    maxWidth: 460,
    background: "white",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
};
