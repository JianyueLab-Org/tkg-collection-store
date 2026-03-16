import { json } from "@sveltejs/kit";
// @ts-ignore
import db from "$lib/server/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "$env/dynamic/private";

const JWT_SECRET = env.JWT_SECRET || "TAKAGISANWAKAWAIIDESU520";

export async function POST({ request }) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return json({ error: "Missing username or password" }, { status: 400 });
  }

  try {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return json({ error: "Invalid username or password" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    return json(
      {
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
