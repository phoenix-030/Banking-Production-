import { lazy, Suspense, useEffect, useState } from "react";
import { ExamOptGroups } from "./utils/examCategories";
import { subscribeCompanionTabLock } from "./utils/examLock";
import { FeedbackProvider } from "./components/common/FeedbackSystem";
import { useAuth, useUI, useFeedback, useExamStore } from "./hooks";
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
// 3. MAIN APPLICATION ROOT SHELL
// ============================================================================
function AppShell() {
  // --------------------------------------------------------------------------
  // Core State Management via Zustand Hooks (client/src/hooks)
  // --------------------------------------------------------------------------
  const { user, loading, checkAuth, logout, setUser } = useAuth();
  const {
    activeTab: active,
    setActiveTab: setActive,
    menuOpen,
    setMenuOpen,
    lockedOutInfo,
    setLockedOutInfo
  } = useUI();

  // Unified Feedback Engine (Toast, Alert, ConfirmModal)
  const { toast, alert, confirm } = useFeedback();

  // --------------------------------------------------------------------------
  // Security: Single-Tab Lockdown Subscription (BroadcastChannel)
  // --------------------------------------------------------------------------
  useEffect(() => subscribeCompanionTabLock(setLockedOutInfo), [setLockedOutInfo]);

  // --------------------------------------------------------------------------
  // Session Authentication: Verify Session with Backend on App Startup
  // --------------------------------------------------------------------------
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // --------------------------------------------------------------------------
  // Universal Toast Dispatcher: Maps to Feedback Engine Toast Tiers
  // --------------------------------------------------------------------------
  function flash(message, type = "success") {
    if (!message) return;
    const text =
      typeof message === "object"
        ? message.message || message.error || JSON.stringify(message)
        : String(message);
    const toastType =
      typeof message === "object" && message.type ? message.type : type;

    if (toastType === "error") toast.error(text);
    else if (toastType === "warning") toast.warning(text);
    else if (toastType === "info") toast.info(text);
    else toast.success(text);
  }

  // --------------------------------------------------------------------------
  // User Sign-Out Handler
  // --------------------------------------------------------------------------
  async function signOut() {
    await logout();
    setActive("Overview");
    toast.info("You have been signed out successfully.");
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
            {/* Alert demonstration on Bell click */}
            <button
              className="icon-btn notification-btn"
              onClick={() => alert.warning("Banking Exam Update", "2026 examination syllabus and pattern models are fully synchronized.")}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <div className="top-divider" />
            {/* Toast demonstration on Help click */}
            <button
              className="help-btn"
              onClick={() => toast.info("Need help? Open the Banking Preparation Guide in your dashboard.")}
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
                onAlert={alert.show}
                onConfirmModal={confirm}
                onNavigate={setActive}
              />
            ) : user.role === "admin" && active === "Question bank" ? (
              <AdminPanel
                section="Question bank"
                onToast={flash}
                onAlert={alert.show}
                onConfirmModal={confirm}
                onNavigate={setActive}
              />
            ) : user.role === "admin" ? (
              <AdminOverview
                section={active}
                onNavigate={setActive}
                onToast={flash}
                onAlert={alert.show}
                onConfirmModal={confirm}
              />
            ) : (
              <StudentWorkspace
                section={active}
                user={user}
                onNavigate={setActive}
                onToast={flash}
                onAlert={alert.show}
                onConfirmModal={confirm}
              />
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// 4. MAIN APPLICATION ROOT WRAPPER (With Unified Feedback Provider)
// ============================================================================
export default function App() {
  return (
    <FeedbackProvider>
      <AppShell />
    </FeedbackProvider>
  );
}

// ============================================================================
// 5. TARGET EXAM SELECTOR WIDGET (Sidebar Component for Students)
// ============================================================================
// Allows students to select their primary target exam (e.g. IBPS PO, SBI Clerk)
function TargetExamSelector({ onToast }) {
  const { exams, fetchExams } = useExamStore();
  const { user, updateTargetExam } = useAuth();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available exams catalogue via Zustand store and student profile
    fetchExams();
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((m) => setSelected(m.profile?.target_exam_id || m.user?.target_exam_id || ""))
      .catch(() => setError("Exam list unavailable"));

    // Listen to custom window sync events across components
    const onSync = (event) => {
      const next = event.detail ?? "";
      setSelected(next);
    };
    window.addEventListener("hhk:target-exam-updated", onSync);
    return () => window.removeEventListener("hhk:target-exam-updated", onSync);
  }, [fetchExams]);

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
          fullName: current.user?.fullName || user?.fullName,
          mobile: current.user?.mobile || user?.mobile,
          targetExamId: id || null
        })
      });
      if (!response.ok) throw new Error();
      if (updateTargetExam) updateTargetExam(id || null);
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
