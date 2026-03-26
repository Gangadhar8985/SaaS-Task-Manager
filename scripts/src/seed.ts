import { db, projectsTable, membersTable, tasksTable } from "@workspace/db";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

async function seed() {
  console.log("Seeding database...");

  const memberData = [
    { name: "Alice Chen", email: "alice@company.com", role: "Product Manager" },
    { name: "Bob Martinez", email: "bob@company.com", role: "Engineer" },
    { name: "Carol Smith", email: "carol@company.com", role: "Designer" },
    { name: "David Lee", email: "david@company.com", role: "Engineer" },
  ];

  const members = await db
    .insert(membersTable)
    .values(memberData.map((m) => ({ ...m, initials: getInitials(m.name) })))
    .onConflictDoNothing()
    .returning();
  console.log(`Seeded ${members.length} members`);

  const projectData = [
    { name: "Website Redesign", description: "Revamp company website with new branding", status: "active" as const, color: "#6366f1" },
    { name: "Mobile App v2", description: "Launch second version of mobile application", status: "active" as const, color: "#0ea5e9" },
    { name: "API Integration", description: "Integrate with third-party payment processors", status: "on_hold" as const, color: "#f59e0b" },
    { name: "Q1 Marketing Campaign", description: "Plan and execute Q1 go-to-market push", status: "completed" as const, color: "#10b981" },
  ];

  const projects = await db.insert(projectsTable).values(projectData).returning();
  console.log(`Seeded ${projects.length} projects`);

  const allMembers = await db.select().from(membersTable);
  const allProjects = await db.select().from(projectsTable);

  if (allMembers.length === 0 || allProjects.length === 0) {
    console.log("No members or projects to seed tasks for");
    return;
  }

  const m = allMembers;
  const p = allProjects;

  const taskData = [
    { title: "Create wireframes", status: "done" as const, priority: "high" as const, projectId: p[0].id, assigneeId: m[2]?.id, dueDate: new Date("2026-03-10") },
    { title: "Write homepage copy", status: "in_progress" as const, priority: "medium" as const, projectId: p[0].id, assigneeId: m[0]?.id, dueDate: new Date("2026-04-01") },
    { title: "Implement new nav", status: "todo" as const, priority: "high" as const, projectId: p[0].id, assigneeId: m[1]?.id, dueDate: new Date("2026-04-15") },
    { title: "Performance audit", status: "todo" as const, priority: "low" as const, projectId: p[0].id, assigneeId: m[3]?.id, dueDate: new Date("2026-04-20") },
    { title: "Design onboarding flow", status: "done" as const, priority: "high" as const, projectId: p[1].id, assigneeId: m[2]?.id, dueDate: new Date("2026-03-01") },
    { title: "Build auth screens", status: "done" as const, priority: "high" as const, projectId: p[1].id, assigneeId: m[1]?.id, dueDate: new Date("2026-03-15") },
    { title: "Push notification setup", status: "in_progress" as const, priority: "medium" as const, projectId: p[1].id, assigneeId: m[3]?.id, dueDate: new Date("2026-04-05") },
    { title: "App store submission", status: "todo" as const, priority: "high" as const, projectId: p[1].id, assigneeId: m[0]?.id, dueDate: new Date("2026-05-01") },
    { title: "Research payment providers", status: "done" as const, priority: "medium" as const, projectId: p[2].id, assigneeId: m[0]?.id, dueDate: new Date("2026-02-15") },
    { title: "Build webhook handler", status: "todo" as const, priority: "high" as const, projectId: p[2].id, assigneeId: m[1]?.id, dueDate: new Date("2026-05-15") },
    { title: "Write campaign brief", status: "done" as const, priority: "medium" as const, projectId: p[3].id, assigneeId: m[0]?.id, dueDate: new Date("2026-01-10") },
    { title: "Design ad creative", status: "done" as const, priority: "medium" as const, projectId: p[3].id, assigneeId: m[2]?.id, dueDate: new Date("2026-01-20") },
    { title: "Launch campaign", status: "done" as const, priority: "high" as const, projectId: p[3].id, assigneeId: m[0]?.id, dueDate: new Date("2026-02-01") },
  ];

  const tasks = await db.insert(tasksTable).values(taskData).returning();
  console.log(`Seeded ${tasks.length} tasks`);

  console.log("Done seeding!");
}

seed().catch(console.error);
