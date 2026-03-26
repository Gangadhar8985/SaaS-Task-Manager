import { Router, type IRouter } from "express";
import { db, tasksTable, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

async function enrichTask(task: typeof tasksTable.$inferSelect) {
  let assigneeName: string | null = null;
  let assigneeInitials: string | null = null;
  if (task.assigneeId) {
    const [member] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.id, task.assigneeId));
    if (member) {
      assigneeName = member.name;
      assigneeInitials = member.initials;
    }
  }
  return { ...task, assigneeName, assigneeInitials };
}

router.get("/", async (req, res) => {
  const projectId = Number(req.params.id);
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.projectId, projectId))
    .orderBy(tasksTable.createdAt);
  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

export default router;
