import {
  Activity as ActivityIcon,
  ArrowRight,
  ClipboardList,
  FileQuestion,
  ShieldCheck,
  Target as TargetIcon,
  Users
} from "lucide-react";
function AdminDashboardOverview({
  stats,
  activity,
  onNavigate
}) {
  const statItems = [
    ["Students", stats?.students ?? "\u2014", Users],
    ["Active students", stats?.active_students ?? "\u2014", ActivityIcon],
    ["Total questions", stats?.total_questions ?? "\u2014", FileQuestion],
    ["Published mock tests", stats?.published_tests ?? "\u2014", ClipboardList],
    ["Published exams", stats?.published_exams ?? "\u2014", TargetIcon],
    ["Completed attempts", stats?.attempts ?? "\u2014", ShieldCheck]
  ];
  return <>
      <div className="stats-grid admin-stats">
        {statItems.map(([label, value, Icon]) => <div className="stat-card" key={label}>
            <span className="stat-icon lavender">
              <Icon size={17} />
            </span>
            <span className="stat-label">{label}</span>
            <div className="stat-value">{value}</div>
          </div>)}
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
    "Current affairs",
    "Students"
  ].map((page) => <button
    className="outline-btn admin-action"
    key={page}
    onClick={() => onNavigate(page)}
  >
              {page} <ArrowRight size={14} />
            </button>)}
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
