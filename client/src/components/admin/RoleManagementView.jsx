// ============================================================================
// ROLE MANAGEMENT & USER GOVERNANCE VIEW (Admin Access Control)
// ============================================================================
// This component provides administrators with platform-wide user governance:
// - Summary KPI metrics (Total accounts, Administrators, Students, Active vs Disabled)
// - Real-time account searching by name, email, or mobile number
// - Filtering by Role (Administrator vs Student) and Account Status (Active vs Disabled)
// - One-click Role Promotion/Demotion with confirmation dialogs and self-demote safety checks
// - Account suspension/activation toggling with self-disable protection
// ============================================================================

import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  GraduationCap,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  UserX
} from "lucide-react";

/**
 * RoleManagementView Component
 *
 * @param {Array} users - Filtered list of registered user objects from /api/admin/users
 * @param {Object} summary - Aggregate stats: total_users, total_admins, total_students, total_active, total_disabled
 * @param {string} currentUserId - The authenticated admin's ID (used for self-protection guardrails)
 * @param {string} search - Current search query string
 * @param {string} roleFilter - Active role filter ('all' | 'admin' | 'student')
 * @param {string} statusFilter - Active status filter ('all' | 'active' | 'disabled')
 * @param {boolean} busy - Network request in-flight indicator
 * @param {Function} onSearchChange - Callback when search input changes
 * @param {Function} onRoleFilterChange - Callback when role filter changes
 * @param {Function} onStatusFilterChange - Callback when status filter changes
 * @param {Function} onUpdateRole - (userId, newRole) => Promise
 * @param {Function} onUpdateStatus - (userId, newStatus) => Promise
 */
function RoleManagementView({
  users,
  summary,
  currentUserId,
  search,
  roleFilter,
  statusFilter,
  busy,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onUpdateRole,
  onUpdateStatus
}) {
  return (
    <div className="role-management-view" style={{ display: "grid", gap: "20px" }}>
      {/* -------------------------------------------------------------------- */}
      {/* 1. Header & Quick Summary KPI Cards                                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="stats-grid admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {/* KPI 1: Total Registered Accounts */}
        <div className="stat-card">
          <span className="stat-icon blue">
            <Users size={17} />
          </span>
          <span className="stat-label">Total Registered Accounts</span>
          <div className="stat-value">{summary?.total_users ?? users.length}</div>
          <small style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px", display: "block" }}>
            Platform-wide users
          </small>
        </div>

        {/* KPI 2: Total Administrators */}
        <div className="stat-card">
          <span className="stat-icon lavender">
            <ShieldCheck size={17} />
          </span>
          <span className="stat-label">Administrators</span>
          <div className="stat-value">{summary?.total_admins ?? users.filter((u) => u.role === "admin").length}</div>
          <small style={{ color: "var(--lavender-900, #5b21b6)", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
            Full system & content access
          </small>
        </div>

        {/* KPI 3: Total Students */}
        <div className="stat-card">
          <span className="stat-icon emerald">
            <GraduationCap size={17} />
          </span>
          <span className="stat-label">Students</span>
          <div className="stat-value">{summary?.total_students ?? users.filter((u) => u.role === "student").length}</div>
          <small style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px", display: "block" }}>
            Candidate practice & mocks
          </small>
        </div>

        {/* KPI 4: Active Login Accounts */}
        <div className="stat-card">
          <span className="stat-icon emerald">
            <UserCheck size={17} />
          </span>
          <span className="stat-label">Active Accounts</span>
          <div className="stat-value">{summary?.total_active ?? users.filter((u) => u.is_active).length}</div>
          <small style={{ color: "var(--success, #16a34a)", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
            Authorized for login
          </small>
        </div>

        {/* KPI 5: Suspended / Disabled Accounts */}
        <div className="stat-card">
          <span className="stat-icon amber">
            <UserX size={17} />
          </span>
          <span className="stat-label">Disabled Accounts</span>
          <div className="stat-value">{summary?.total_disabled ?? users.filter((u) => !u.is_active).length}</div>
          <small style={{ color: "var(--danger, #dc2626)", fontSize: "12px", marginTop: "4px", display: "block" }}>
            Access suspended
          </small>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. Role Governance Information Banner                                */}
      {/* -------------------------------------------------------------------- */}
      <div className="panel admin-panel" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <span style={{ background: "#ede9fe", color: "#6366f1", padding: "8px", borderRadius: "8px", display: "inline-flex" }}>
            <Shield size={20} />
          </span>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700 }}>
              System Role Permissions & Governance
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Administrators have unrestricted access to question authoring, exam pattern configurations, mock test generation, student evaluation, and role delegation.
              Students have test-taking access to published mock exams, topic practice, and daily challenges.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. Main Role Management Table & Search / Filter Controls             */}
      {/* -------------------------------------------------------------------- */}
      <section className="panel admin-panel">
        <div className="admin-panel-heading" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="section-kicker">ACCESS CONTROL & GOVERNANCE</span>
            <h2>
              <ShieldCheck size={18} /> User & Role Management
            </h2>
          </div>

          {/* Search and Filter Toolbar */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Filter by Role: All, Administrator, or Student */}
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                fontSize: "13px",
                background: "var(--input-bg, #fff)"
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators only</option>
              <option value="student">Students only</option>
            </select>

            {/* Filter by Account Status: All, Active, or Disabled */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                fontSize: "13px",
                background: "var(--input-bg, #fff)"
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active accounts</option>
              <option value="disabled">Disabled accounts</option>
            </select>

            {/* Instant Search Bar */}
            <div style={{ position: "relative" }}>
              <input
                className="admin-search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, email..."
                style={{ paddingLeft: "32px" }}
              />
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="section-table-wrap" style={{ marginTop: "12px" }}>
          <table className="section-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Target Exam</th>
                <th>Current Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Change Role</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                // Safeguards: Prevent an administrator from accidentally demoting or locking themselves out
                const isSelf = u.id === currentUserId;
                const isAdmin = u.role === "admin";

                return (
                  <tr key={u.id} style={{ background: isSelf ? "rgba(99, 102, 241, 0.03)" : undefined }}>
                    {/* Column 1: User Avatar, Name, Mobile, and "You" Badge */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: isAdmin ? "#ede9fe" : "#e0f2fe",
                            color: isAdmin ? "#6366f1" : "#0284c7",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "12px"
                          }}
                        >
                          {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{u.full_name || "Unnamed User"}</strong>
                          {isSelf && (
                            <span
                              style={{
                                marginLeft: "6px",
                                fontSize: "11px",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "#ede9fe",
                                color: "#5b21b6",
                                fontWeight: 600
                              }}
                            >
                              You
                            </span>
                          )}
                          {u.mobile && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {u.mobile}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Email Address */}
                    <td style={{ fontSize: "13px" }}>{u.email}</td>

                    {/* Column 3: Target Exam Choice */}
                    <td style={{ fontSize: "13px" }}>{u.target_exam ?? "—"}</td>

                    {/* Column 4: Role Badge */}
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: isAdmin ? "#f3e8ff" : "#e0f2fe",
                          color: isAdmin ? "#7e22ce" : "#0369a1"
                        }}
                      >
                        {isAdmin ? <ShieldCheck size={13} /> : <GraduationCap size={13} />}
                        {isAdmin ? "Administrator" : "Student"}
                      </span>
                    </td>

                    {/* Column 5: Status Badge (Active / Disabled) */}
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: u.is_active ? "#dcfce7" : "#fee2e2",
                          color: u.is_active ? "#15803d" : "#b91c1c"
                        }}
                      >
                        {u.is_active ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>

                    {/* Column 6: Date Joined */}
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    {/* Column 7: Interactive Role Selector (Promote / Demote) */}
                    <td>
                      {isSelf ? (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Current Session
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={busy}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            if (newRole !== u.role) {
                              const confirmText =
                                newRole === "admin"
                                  ? `Promote ${u.full_name || u.email} to Administrator? They will receive full administrative privileges.`
                                  : `Demote ${u.full_name || u.email} to Student? They will lose administrative access.`;
                              if (window.confirm(confirmText)) {
                                onUpdateRole(u.id, newRole);
                              }
                            }
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            border: "1px solid var(--border)",
                            background: "var(--input-bg, #fff)",
                            fontWeight: 600,
                            color: isAdmin ? "#7e22ce" : "#0369a1"
                          }}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Administrator</option>
                        </select>
                      )}
                    </td>

                    {/* Column 8: Account Status Toggle (Enable / Disable) */}
                    <td>
                      {isSelf ? (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="outline-btn admin-action"
                          disabled={busy}
                          style={{
                            height: "28px",
                            fontSize: "12px",
                            color: u.is_active ? "var(--danger, #dc2626)" : "var(--success, #16a34a)"
                          }}
                          onClick={() => {
                            const actionName = u.is_active ? "disable" : "enable";
                            if (window.confirm(`Are you sure you want to ${actionName} access for ${u.full_name || u.email}?`)) {
                              onUpdateStatus(u.id, !u.is_active);
                            }
                          }}
                        >
                          {u.is_active ? "Disable" : "Enable"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty Search State */}
        {!users.length && !busy && (
          <div className="empty-questions" style={{ padding: "30px", textAlign: "center" }}>
            No accounts match your search or filter criteria.
          </div>
        )}
      </section>
    </div>
  );
}

export { RoleManagementView };
