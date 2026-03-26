import { Router, type IRouter } from "express";
import { db, tasksTable, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  projectId: z.number().int().nullable().optional(),
  assigneeId: z.number().int().nullable().optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  projectId: z.number().int().nullable().optional(),
  assigneeId: z.number().int().nullable().optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
});

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

router.get("/tasks", async (req, res) => {
  const tasks = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);
  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

router.post("/tasks", async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const [task] = await db.insert(tasksTable).values(parsed.data).returning();
  const enriched = await enrichTask(task);
  res.status(201).json(enriched);
});

router.get("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(await enrichTask(task));
});

router.put("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const [updated] = await db
    .update(tasksTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tasksTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(await enrichTask(updated));
});

router.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.status(204).send();
});

export default router;
