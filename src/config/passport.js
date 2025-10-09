import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { nanoid } from "nanoid";
import slugify from "slugify";

console.log("Google config loaded:", {
  clientId: !!process.env.GOOGLE_CLIENT_ID,
  clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: !!process.env.GOOGLE_CALLBACK_URL,
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find existing user by Google ID or email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0]?.value },
          ],
        });

        if (!user) {
          // Generate base username from Google displayName or givenName
          const base = slugify(
            profile.displayName || profile.name?.givenName || "user",
            { lower: true, strict: true }
          );

          // Append nanoid to ensure uniqueness
          let username = `${base}-${nanoid(6)}`;

          // Double-check uniqueness in DB
          while (await User.exists({ username })) {
            username = `${base}-${nanoid(4)}`;
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            username,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
