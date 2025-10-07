import { user } from "@/db/schema";
import { db } from "@/db";
import { desc, eq, gte, inArray } from "drizzle-orm";

export async function insertUser(
  data: typeof user.$inferInsert
): Promise<typeof user.$inferSelect | undefined> {
  const [userRecord] = await db().insert(user).values(data).returning();

  return userRecord;
}

export async function findUserByEmail(
  email: string
): Promise<typeof user.$inferSelect | undefined> {
  const [userRecord] = await db()
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return userRecord;
}

export async function findUserByUuid(
  uuid: string
): Promise<typeof user.$inferSelect | undefined> {
  const [userRecord] = await db()
    .select()
    .from(user)
    .where(eq(user.uuid, uuid))
    .limit(1);

  return userRecord;
}

export async function getUsers(
  page: number = 1,
  limit: number = 50
): Promise<(typeof user.$inferSelect)[] | undefined> {
  const offset = (page - 1) * limit;

  const data = await db()
    .select()
    .from(user)
    .orderBy(desc(user.created_at))
    .limit(limit)
    .offset(offset);

  return data;
}

export async function updateUserInviteCode(
  user_uuid: string,
  invite_code: string
): Promise<typeof user.$inferSelect | undefined> {
  const [userRecord] = await db()
    .update(user)
    .set({ invite_code, updated_at: new Date() })
    .where(eq(user.uuid, user_uuid))
    .returning();

  return userRecord;
}

export async function updateUserInvitedBy(
  user_uuid: string,
  invited_by: string
): Promise<typeof user.$inferSelect | undefined> {
  const [userRecord] = await db()
    .update(user)
    .set({ invited_by, updated_at: new Date() })
    .where(eq(user.uuid, user_uuid))
    .returning();

  return userRecord;
}

export async function getUsersByUuids(
  user_uuids: string[]
): Promise<(typeof user.$inferSelect)[] | undefined> {
  const data = await db()
    .select()
    .from(user)
    .where(inArray(user.uuid, user_uuids));

  return data;
}

export async function findUserByInviteCode(
  invite_code: string
): Promise<typeof user.$inferSelect | undefined> {
  const [userRecord] = await db()
    .select()
    .from(user)
    .where(eq(user.invite_code, invite_code))
    .limit(1);

  return userRecord;
}

export async function getUserUuidsByEmail(
  email: string
): Promise<string[] | undefined> {
  const data = await db()
    .select({ uuid: user.uuid })
    .from(user)
    .where(eq(user.email, email));

  return data.map((userRecord) => userRecord.uuid);
}

export async function getUsersTotal(): Promise<number> {
  const total = await db().$count(user);

  return total;
}

export async function getUserCountByDate(
  startTime: string
): Promise<Map<string, number> | undefined> {
  const data = await db()
    .select({ created_at: user.created_at })
    .from(user)
    .where(gte(user.created_at, new Date(startTime)));

  data.sort((a, b) => a.created_at!.getTime() - b.created_at!.getTime());

  const dateCountMap = new Map<string, number>();
  data.forEach((item) => {
    const date = item.created_at!.toISOString().split("T")[0];
    dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1);
  });

  return dateCountMap;
}
