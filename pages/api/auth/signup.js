import { connectToDatabase } from "../../../lib/db.js";
import { hashPassword } from "../../../lib/auth.js";

async function handler(req, res) {
  if (req.method !== "POST") {
    return;
  }

  const data = req.body;

  const { email, password } = data;
  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 7
  ) {
    res.status(422).json({
      message: "invalid input password or email do not meet requirements",
    });
    return;
  }

  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error connecting to database" });
    return;
  }

  const db = client.db("auth");

  const existingUser = await db.collection("users").findOne({ email: email });

  if (existingUser) {
    res.status(422).json({ message: "user with email already exists" });
    return;
  }

  const hashedPassword = await hashPassword(password);

  try {
    const result = await db.collection("users").insertOne({
      email: email,
      password: hashedPassword,
    });
    res.status(201).json({ message: "Created user!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error creating user..." });
    client.close();
    return;
  }

  client.close();
}

export default handler;
