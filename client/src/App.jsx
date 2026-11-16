import { lazy, Suspense, useEffect, useState } from "react";
import { ExamOptGroups } from "./utils/examCategories";
import { subscribeCompanionTabLock } from "./utils/examLock";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Flame,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  UserCheck,
  X
} from "lucide-react";

// ============================================================================
// 1. LAZY-LOADED CORE APPLICATION MODULES (Code-Splitting for Fast Initial Load)
// ============================================================================
const AdminPanel = lazy(() => import("./AdminPanel"));
const AdminOverview = lazy(() => import("./AdminOverview"));
const AuthPage = lazy(() => import("./AuthPage"));
const StudentWorkspace = lazy(() => import("./StudentWorkspace"));

// ============================================================================
// 2. NAVIGATION CONFIGURATIONS (Role-Specific Sidebar Menus)
// ============================================================================
// Student preparation sections: Dashboard, Tests, Practice, Streaks, Profile
const studentPages = [
  ["Overview", LayoutDashboard],
  ["Daily challenge", Flame],
  ["Practice", BookOpen],
  ["Bookmarks", Bookmark],
  ["Mock tests", Target],
  ["Performance", Activity],
  ["Current affairs", CalendarDays],
  ["Leaderboard", Trophy],
  ["Achievements", ShieldCheck],
  ["Profile", Settings]
];

// Administrator control center: Setup, Questions, Mocks, Governance, Reports
const adminPages = [
  ["Admin dashboard", LayoutDashboard],
  ["Exam setup", Settings],
  ["Question bank", BookOpen],
  ["Mock tests", Target],
  ["Role management", UserCheck],
  ["Reports", ShieldCheck],
  ["Activity Logs", ShieldCheck]
];

// ============================================================================
// 3. MAIN APPLICATION ROOT COMPONENT
// ============================================================================
function App() {
  // --------------------------------------------------------------------------
  // Core State Management
  // --------------------------------------------------------------------------
  const [user, setUser] = useState(null);               // Authenticated user object (id, email, fullName, role)
  const [loading, setLoading] = useState(true);           // Initial session verification loader
  const [active, setActive] = useState("Overview");       // Currently active navigation tab
  const [menuOpen, setMenuOpen] = useState(false);        // Mobile responsive sidebar toggle
  const [toasts, setToasts] = useState([]);               // Floating toast notifications stack
  const [lockedOutInfo, setLockedOutInfo] = useState(null); // Proctoring lockdown for duplicate browser tabs

  // --------------------------------------------------------------------------
  // Security: Single-Tab Lockdown Subscription (BroadcastChannel)
  // --------------------------------------------------------------------------
  useEffect(() => subscribeCompanionTabLock(setLockedOutInfo), []);

  // --------------------------------------------------------------------------
  // Session Authentication: Check Active Cookie/Session with Backend
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (r) => (r.ok ? (await r.json()).user : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // --------------------------------------------------------------------------
  // Universal Toast Dispatcher: Displays Success, Error, Info, or Warning Toasts
  // --------------------------------------------------------------------------
  function flash(message, type = "success") {
    if (!message) return;
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const text =
      typeof message === "object"
        ? message.message || message.error || JSON.stringify(message)
        : String(message);
    const toastType =
      typeof message === "object" && message.type ? message.type : type;

    // Keep up to 3 most recent notifications visible concurrently
    setToasts((prev) => [...prev.slice(-3), { id, text, type: toastType }]);

    // Auto-dismiss after 4.5 seconds
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }

  // Dismiss a specific toast notification manually
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // --------------------------------------------------------------------------
  // User Sign-Out Handler
  // --------------------------------------------------------------------------
  async function signOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    }).catch(() => void 0);
    setUser(null);
    setActive("Overview");
    flash("You have been signed out successfully.", "info");
  }

  // --------------------------------------------------------------------------
  // Screen 1: Exam Lockdown Screen (Prevents multiple tabs during mock tests)
  // --------------------------------------------------------------------------
  if (lockedOutInfo)
    return (
      <div className="cbt-locked-tab" role="alertdialog" aria-modal="true">
        <div className="panel">
          <span className="exam-pill">SINGLE-TAB EXAM LOCKDOWN</span>
          <h1>This companion tab has been locked</h1>
          <p>
            An active examination ({lockedOutInfo.testName}) is running in your
            primary browser tab. Other HHK tabs are automatically closed or
            locked to preserve exam integrity.
          </p>
          <button
            type="button"
            className="primary-btn"
            onClick={() => window.close()}
          >
            Close this tab
          </button>
        </div>
      </div>
    );

  // --------------------------------------------------------------------------
  // Screen 2: Initial App Session Loading Screen
  // --------------------------------------------------------------------------
  if (loading)
    return <div className="auth-loading">Loading your secure HHK workspace…</div>;

  // --------------------------------------------------------------------------
  // Screen 3: Unauthenticated State -> Render Authentication Flow (Login/Register)
  // --------------------------------------------------------------------------
  if (!user)
    return (
      <Suspense fallback={<div className="auth-loading">Loading HHK…</div>}>
        <AuthPage
          onAuthenticated={(u) => {
            setUser(u);
            setActive(u.role === "admin" ? "Admin dashboard" : "Overview");
            flash(`Welcome back, ${u.fullName || u.email}!`, "success");
          }}
          onToast={flash}
        />
        {/* Floating toast notifications for auth errors and feedback */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </Suspense>
    );

  // --------------------------------------------------------------------------
  // Screen 4: Authenticated Application Shell (Admin or Student Workspace)
  // --------------------------------------------------------------------------
  const pages = user.role === "admin" ? adminPages : studentPages;

  return (
    <div className="app-shell">
      {/* -------------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION                                                    */}
      {/* -------------------------------------------------------------------- */}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        {/* App Logo & Brand Header */}
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="HHK logo" />
          <span className="brand-name">HHK</span>
          <button
            className="mobile-close icon-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Role Category Indicator */}
        <div className="workspace-label">
          {user.role === "admin" ? "ADMINISTRATION" : "STUDENT WORKSPACE"}
        </div>

        {/* Dynamic Nav Links (Filtered by Role) */}
        <nav
          className="main-nav"
          aria-label={user.role === "admin" ? "Admin navigation" : "Student navigation"}
        >
          {pages.map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-link ${active === label ? "active" : ""}`}
              onClick={() => {
                setActive(label);
                setMenuOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Student-Exclusive Sidebar Widgets (Target Exam Selector & Daily Streak) */}
        {user.role === "student" && (
          <>
            <div className="side-separator" />
            <div className="workspace-label">YOUR PREPARATION</div>
            <TargetExamSelector onToast={flash} />
            <div className="side-separator" />
            <SidebarStreak
              userId={user.id}
              onOpenAchievements={() => {
                setActive("Achievements");
                setMenuOpen(false);
              }}
            />
          </>
        )}

        {/* Bottom User Profile Card & Sign-Out Button */}
        <div className="sidebar-bottom">
          <button className="profile-row" onClick={signOut}>
            <div className="avatar">
              {(user.fullName || user.email || "U")
                .split(/\s+/)
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="profile-copy">
              <strong>{user.fullName || "User"}</strong>
              <span>
                {user.role === "admin"
                  ? "Administrator · Sign out"
                  : "Student · Sign out"}
              </span>
            </div>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {menuOpen && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA & TOPBAR                                            */}
      {/* -------------------------------------------------------------------- */}
      <main className="main-area">
        {/* Top Header Bar: Mobile Hamburger, Breadcrumb, Top Actions */}
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span>HHK</span>
            <ChevronRight size={15} />
            <strong>{active}</strong>
          </div>

          <div className="top-actions">
            <button
              className="icon-btn notification-btn"
              onClick={() => flash("You are all caught up.", "info")}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <div className="top-divider" />
            <button
              className="help-btn"
              onClick={() => flash("Help center will be available soon.", "info")}
            >
              <CircleHelp size={17} /> Help
            </button>
          </div>
        </header>

        {/* Workspace Views (Lazy Loaded Router) */}
        <div className="content">
          <Suspense
            fallback={<div className="auth-loading">Loading your workspace…</div>}
          >
            {user.role === "admin" && active === "Exam setup" ? (
              <AdminPanel
                section="Exam setup"
                onToast={flash}
                onNavigate={setActive}
              />
            ) : user.role === "admin" && active === "Question bank" ? (
              <AdminPanel
                section="Question bank"
                onToast={flash}
                onNavigate={setActive}
              />
            ) : user.role === "admin" ? (
              <AdminOverview
                section={active}
                onNavigate={setActive}
                onToast={flash}
              />
            ) : (
              <StudentWorkspace
                section={active}
                user={user}
                onNavigate={setActive}
                onToast={flash}
              />
            )}
          </Suspense>
        </div>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* GLOBAL TOAST NOTIFICATION CONTAINER                                  */}
      {/* -------------------------------------------------------------------- */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

// ============================================================================
// 4. FLOATING TOAST NOTIFICATION COMPONENT
// ============================================================================
// Renders animated floating messages for success, error, warning, and info
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {t.type === "error" ? (
                <AlertCircle size={18} />
              ) : t.type === "warning" ? (
                <AlertTriangle size={18} />
              ) : t.type === "info" ? (
                <Info size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </span>
            <span>{t.text}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 5. TARGET EXAM SELECTOR WIDGET (Sidebar Component for Students)
// ============================================================================
// Allows students to select their primary target exam (e.g. IBPS PO, SBI Clerk)
function TargetExamSelector({ onToast }) {
  const [exams, setExams] = useState([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available exams catalogue and current user target exam profile
    Promise.all([
      fetch("/api/exams").then((r) => r.json()),
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json())
    ])
      .then(([e, m]) => {
        setExams(e.exams ?? []);
        setSelected(m.profile?.target_exam_id ?? "");
      })
      .catch(() => setError("Exam list unavailable"));

    // Listen to custom window sync events across components
    const onSync = (event) => {
      const next = event.detail ?? "";
      setSelected(next);
    };
    window.addEventListener("hhk:target-exam-updated", onSync);
    return () => window.removeEventListener("hhk:target-exam-updated", onSync);
  }, []);

  // Persist target exam selection to database
  async function change(id) {
    setSelected(id);
    try {
      const current = await fetch("/api/auth/me", {
        credentials: "include"
      }).then((r) => r.json());
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: current.user.fullName,
          mobile: current.user.mobile,
          targetExamId: id || null
        })
      });
      if (!response.ok) throw new Error();
      window.dispatchEvent(
        new CustomEvent("hhk:target-exam-updated", { detail: id })
      );
      onToast("Target examination saved.", "success");
    } catch {
      setError("Could not save target examination.");
      onToast("Could not save target examination.", "error");
    }
  }

  return (
    <div className="target-card">
      <div className="target-card-top">
        <span className="tiny-label">TARGET EXAM</span>
        <ChevronDown size={15} />
      </div>
      <select
        value={selected}
        onChange={(e) => change(e.target.value)}
        aria-label="Target examination"
      >
        <option value="">Choose target exam</option>
        <ExamOptGroups
          exams={exams}
          getKey={(e) => e.id}
          getValue={(e) => e.id}
          getLabel={(e) => e.name}
        />
      </select>
      <div className="target-date">
        <CalendarDays size={14} />
        {exams.length
          ? `${exams.length} banking exams available`
          : "No active exams in catalogue"}
      </div>
      {error && <small className="target-error">{error}</small>}
    </div>
  );
}

// ============================================================================
// 6. SIDEBAR STREAK WIDGET (Student Daily Practice Motivation Tracker)
// ============================================================================
// Polls and displays consecutive active study days with streak flames
function SidebarStreak({ userId, onOpenAchievements }) {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/achievements", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (active && d?.streak) setStreak(d.streak);
        })
        .catch(() => void 0);
    };
    load();

    // Auto-refresh streak periodically when tab is active
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 3e4);

    window.addEventListener("hhk:activity-updated", load);
    document.addEventListener("visibilitychange", load);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("hhk:activity-updated", load);
      document.removeEventListener("visibilitychange", load);
    };
  }, [userId]);

  const days = streak?.currentDays ?? 0;
  const status = streak?.status ?? "inactive";
  const title =
    status === "active_today"
      ? `${days}-day streak active`
      : days > 0
      ? `Keep your ${days}-day streak`
      : "Start your daily streak";
  const subtitle =
    status === "active_today"
      ? `${streak?.todayQuestions ?? 0} solved today · View milestones`
      : days > 0
      ? "Solve 1 question today to extend"
      : "Solve a question to ignite today";

  return (
    <button
      type="button"
      className={`student-streak ${status}`}
      onClick={onOpenAchievements}
      title="Open live streaks and achievements"
    >
      <span>
        <Flame size={17} fill="currentColor" />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
    </button>
  );
}

export { App as default };
