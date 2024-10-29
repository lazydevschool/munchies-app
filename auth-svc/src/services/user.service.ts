import { db, users, profiles } from '@/database';
import { hashPassword } from '@/lib/password';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

interface CreateUserInput {
  username: string;
  password: string;
  email?: string;
  full_name?: string;
  bio?: string;
  favorite_color?: string;
}

// Why are we using a class with static methods vs just a function?
export class UserService {
  static async createUser(input: CreateUserInput) {
    const { username, password, email, full_name, bio, favorite_color } = input;

    // Use a transaction to ensure both user and profile are created
    return await db.transaction(async (tx) => {
      // Create user
      const userId = nanoid(20);
      const user = await tx
        .insert(users)
        .values({
          id: userId,
          username,
          hashed_pass: await hashPassword(password),
        })
        .returning();

      // Create associated profile
      const profile = await tx
        .insert(profiles)
        .values({
          user_id: userId,
          email: email || null,
          full_name: full_name || null,
          bio: bio || null,
          favorite_color: favorite_color || '#efefef',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return {
        user: user[0],
        profile: profile[0],
      };
    });
  }

  static async getUserByUsername(username: string) {
    return await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
  }
}
