import { Router, type IRouter } from "express";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const createMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().nullable().optional(),
});

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

router.get("/members", async (req, res) => {
  const members = await db.select().from(membersTable).orderBy(membersTable.createdAt);
  res.json(members);
});

router.post("/members", async (req, res) => {
  const parsed = createMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const initials = getInitials(parsed.data.name);
  const [member] = await db
    .insert(membersTable)
    .values({ ...parsed.data, initials })
    .returning();
  res.status(201).json(member);
});

router.delete("/members/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(membersTable).where(eq(membersTable.id, id));
  res.status(204).send();
});

export default router;
