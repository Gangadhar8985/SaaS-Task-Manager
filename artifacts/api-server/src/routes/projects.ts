import { Router, type IRouter } from "express";
import { db, projectsTable, tasksTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "completed", "on_hold", "archived"]).optional().default("active"),
  color: z.string().nullable().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "completed", "on_hold", "archived"]).optional(),
  color: z.string().nullable().optional(),
});

async function getProjectWithCounts(id: number) {
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) return null;
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, id));
  return {
    ...project,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "done").length,
  };
}

router.get("/projects", async (req, res) => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  const result = await Promise.all(
    projects.map(async (p) => {
      const tasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, p.id));
      return {
        ...p,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "done").length,
      };
    })
  );
  res.json(result);
});

router.post("/projects", async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const [project] = await db
    .insert(projectsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json({ ...project, totalTasks: 0, completedTasks: 0 });
});

router.get("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const project = await getProjectWithCounts(id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

router.put("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const [updated] = await db
    .update(projectsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projectsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const project = await getProjectWithCounts(id);
  res.json(project);
});

router.delete("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.status(204).send();
});

export default router;
