import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import User from "../models/User.js";
import {nanoid} from "nanoid";
import slugify from "slugify";

console.log("Google config loaded:", {
  clientId: !!process.env.GOOGLE_CLIENT_ID,
  clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
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
        console.log("Google OAuth callback triggered for:", profile.emails?.[0]?.value);

        // Try to find existing user by Google ID or email
        let user = await User.findOne({
          $or: [{googleId: profile.id}, {email: profile.emails?.[0]?.value}],
        });

        if (user && !user.googleId) {
          // User exists with this email but doesn't have googleId
          // Link the Google account
          user.googleId = profile.id;
          await user.save();
          console.log("Linked Google account to existing user:", user.email);
        } else if (!user) {
          // Generate base username from Google displayName or givenName
          const base = slugify(
            (profile.displayName || profile.name?.givenName)?.split(" ")[0] || "user",
            {lower: true, strict: true}
          );

          // Append nanoid to ensure uniqueness
          let username = `${base}-${nanoid(6)}`;

          // Double-check uniqueness in DB
          while (await User.exists({username})) {
            username = `${base}-${nanoid(6)}`;
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            username,
          });

          console.log("Created new user via Google:", user.email);
        } else {
          console.log("Found existing Google user:", user.email);
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

// Required even when using session: false
passport.serializeUser((user, done) => {
  done(null, user.shortId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({shortId: id});
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
