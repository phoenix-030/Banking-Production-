import "dotenv/config";
import assert from "node:assert/strict";
import { pool } from "../server/db.js";

async function testRoleManagement() {
  console.log("--- RUNNING ROLE MANAGEMENT VERIFICATION ---");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Query existing users
    const usersRes = await client.query(`
      SELECT id, email, full_name, role, is_active FROM users LIMIT 10
    `);
    console.log(`Found ${usersRes.rowCount} users in database`);
    assert.ok(usersRes.rowCount > 0, "Users table must have at least 1 user");

    // 2. Insert temporary test user
    const testEmail = `test_role_${Date.now()}@example.com`;
    const insertRes = await client.query(`
      INSERT INTO users (email, password_hash, full_name, mobile, role, is_active)
      VALUES ($1, 'hash_test_dummy', 'Test Role Aspirant', '9876543210', 'student', TRUE)
      RETURNING id, email, role, is_active
    `, [testEmail]);
    const testUser = insertRes.rows[0];
    assert.equal(testUser.role, "student", "Initial role must be student");
    console.log(`✓ Created test user ${testUser.email} with role: ${testUser.role}`);

    // 3. Test promoting user from student to admin
    const promoteRes = await client.query(`
      UPDATE users SET role = 'admin', updated_at = now()
      WHERE id = $1
      RETURNING id, email, role, is_active
    `, [testUser.id]);
    assert.equal(promoteRes.rows[0].role, "admin", "User promoted to admin");
    console.log(`✓ Successfully promoted ${testUser.email} to: ${promoteRes.rows[0].role}`);

    // 4. Test demoting user from admin back to student
    const demoteRes = await client.query(`
      UPDATE users SET role = 'student', updated_at = now()
      WHERE id = $1
      RETURNING id, email, role, is_active
    `, [testUser.id]);
    assert.equal(demoteRes.rows[0].role, "student", "User demoted to student");
    console.log(`✓ Successfully demoted ${testUser.email} to: ${demoteRes.rows[0].role}`);

    // 5. Test disabling user account
    const disableRes = await client.query(`
      UPDATE users SET is_active = FALSE, updated_at = now()
      WHERE id = $1
      RETURNING id, email, role, is_active
    `, [testUser.id]);
    assert.equal(disableRes.rows[0].is_active, false, "Account disabled");
    console.log(`✓ Successfully disabled account for: ${testUser.email}`);

    // 6. Test re-enabling user account
    const enableRes = await client.query(`
      UPDATE users SET is_active = TRUE, updated_at = now()
      WHERE id = $1
      RETURNING id, email, role, is_active
    `, [testUser.id]);
    assert.equal(enableRes.rows[0].is_active, true, "Account re-enabled");
    console.log(`✓ Successfully re-enabled account for: ${testUser.email}`);

    // 7. Test summary query
    const summaryRes = await client.query(`
      SELECT
        count(*)::int total_users,
        count(*) FILTER (WHERE role = 'admin')::int total_admins,
        count(*) FILTER (WHERE role = 'student')::int total_students,
        count(*) FILTER (WHERE is_active = TRUE)::int total_active,
        count(*) FILTER (WHERE is_active = FALSE)::int total_disabled
      FROM users
    `);
    const summary = summaryRes.rows[0];
    assert.ok(summary.total_users >= 1, "Summary has total_users");
    assert.ok(summary.total_admins >= 1, "Summary has at least 1 admin");
    console.log(`✓ Summary query verified: ${JSON.stringify(summary)}`);

  } finally {
    // Rollback test changes so zero DB pollution
    await client.query("ROLLBACK");
    client.release();
    console.log("✓ Test transactions cleanly rolled back (0 DB pollution)");
  }

  await pool.end();
  console.log("--- ALL ROLE MANAGEMENT TESTS PASSED CLEANLY ---");
}

testRoleManagement().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
