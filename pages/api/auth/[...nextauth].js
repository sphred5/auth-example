import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConnectToDatabase } from "../../../lib/db.js";
import { verifyPassword } from "../../../lib/auth.js";

export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const client = await ConnectToDatabase();
        const usersCollection = client.db("auth").collection("users");

        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error("No user found!");
        }
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!valid) {
          client.close();
          throw new Error("Could not log you in!");
        }

        client.close();
        return { email: user.email };
      },
    }),
  ],
});