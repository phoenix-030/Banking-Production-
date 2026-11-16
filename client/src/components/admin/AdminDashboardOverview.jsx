import {
  Activity as ActivityIcon,
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Layers,
  ShieldCheck,
  Target as TargetIcon,
  Users
} from "lucide-react";

function AdminDashboardOverview({
  stats,
  activity,
  onNavigate
}) {
  const primaryStats = [
    {
      label: "Total Exams",
      value: stats?.total_exams ?? (stats?.published_exams ?? 0),
      subtitle: `${stats?.published_exams ?? 0} published`,
      icon: TargetIcon,
      color: "blue"
    },
    {
      label: "Total Subjects",
      value: stats?.total_subjects ? Math.max(6, Number(stats.total_subjects)) : 6,
      subtitle: "6 Core Banking Domains",
      icon: BookOpen,
      color: "purple"
    },
    {
      label: "Total Topics",
      value: stats?.total_topics ?? 0,
      subtitle: "Organized by syllabus",
      icon: Layers,
      color: "amber"
    },
    {
      label: "Total Questions",
      value: stats?.total_questions ?? 0,
      difficultyBreakdown: {
        easy: stats?.easy_questions ?? 0,
        medium: stats?.medium_questions ?? 0,
        hard: stats?.hard_questions ?? 0
      },
      icon: FileQuestion,
      color: "lavender"
    },
    {
      label: "Total Students",
      value: stats?.total_students ?? (stats?.students ?? 0),
      subtitle: `${stats?.active_students ?? 0} active in 30 days`,
      icon: Users,
      color: "emerald"
    },
    {
      label: "Mock Tests Created",
      value: stats?.mock_tests_created ?? (stats?.published_tests ?? 0),
      subtitle: `${stats?.published_tests ?? 0} published · ${stats?.attempts ?? 0} attempts`,
      icon: ClipboardList,
      color: "indigo"
    }
  ];

  return <>
      <div className="stats-grid admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {primaryStats.map((item) => {
          const Icon = item.icon;
          return (
            <div className="stat-card" key={item.label}>
              <span className={`stat-icon ${item.color || "lavender"}`}>
                <Icon size={17} />
              </span>
              <span className="stat-label">{item.label}</span>
              <div className="stat-value">{item.value}</div>
              {item.difficultyBreakdown ? (
                <div style={{ display: "flex", gap: "6px", marginTop: "6px", fontSize: "11px", fontWeight: 600 }}>
                  <span style={{ color: "var(--success, #16a34a)" }}>Easy: {item.difficultyBreakdown.easy}</span>
                  <span>·</span>
                  <span style={{ color: "var(--warning, #d97706)" }}>Med: {item.difficultyBreakdown.medium}</span>
                  <span>·</span>
                  <span style={{ color: "var(--danger, #dc2626)" }}>Hard: {item.difficultyBreakdown.hard}</span>
                </div>
              ) : item.subtitle ? (
                <small style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  {item.subtitle}
                </small>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="panel admin-panel admin-quicklinks">
        <h2>Continue setup</h2>
        <p>
          Configure the exam pattern and verified question content before
          publishing tests.
        </p>
        <div>
          {[
            "Exam setup",
            "Question bank",
            "Mock tests",
            "Role management",
            "Current affairs",
            "Students"
          ].map((page) => (
            <button
              className="outline-btn admin-action"
              key={page}
              onClick={() => onNavigate(page)}
            >
              {page} <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </div>

      <section className="panel admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="section-kicker">ADMIN ACTIVITY</span>
            <h2>Recent content and account activity</h2>
          </div>
          <span className="stat-label">
            {stats?.import_validation_failures ?? 0} upload validation errors
          </span>
        </div>
        {activity.length ? activity.map((item) => <div className="history-row" key={item.id}>
              <div>
                <strong>{item.action.replaceAll("_", " ")}</strong>
                <span>
                  {item.entity_type} · {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <small>{item.entity_id ?? "\u2014"}</small>
            </div>) : <div className="empty-questions">
            No administrative activity recorded yet.
          </div>}
      </section>
    </>;
}
export {
  AdminDashboardOverview
};
