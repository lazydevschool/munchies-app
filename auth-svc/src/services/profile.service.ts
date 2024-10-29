import { db, profiles } from '@/database';
import { eq } from 'drizzle-orm';

export class ProfileService {
  static async getProfile(userId: string) {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    return profile[0];
  }

  static async updateProfile(
    userId: string,
    data: Partial<typeof profiles.$inferInsert>
  ) {
    return await db
      .update(profiles)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(profiles.user_id, userId))
      .returning();
  }
}
