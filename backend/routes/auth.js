const router = require("express").Router();
const passport = require("passport");

const frontendUrl = () =>
  (process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

/*
Google Login
*/

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/*
Google Callback
*/

router.get(
  "/google/callback",
  (req, res) => {
    passport.authenticate("google", (error, user) => {
      if (error || !user) {
        console.error("Google OAuth callback failed:", error);
        return res.redirect(`${frontendUrl()}/?login=failed`);
      }

      req.logIn(user, (loginError) => {
        if (loginError) {
          console.error("Google OAuth login failed:", loginError);
          return res.redirect(`${frontendUrl()}/?login=failed`);
        }

        req.session.save((sessionError) => {
          if (sessionError) {
            console.error("Session save failed after Google OAuth:", sessionError);
            return res.redirect(`${frontendUrl()}/?login=failed`);
          }

          return res.redirect(`${frontendUrl()}/events`);
        });
      });
    })(req, res);
  }
);

/*
Current User
*/

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.json(null);
  }

  res.json({
    _id: req.user._id,
    googleId: req.user.googleId,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    phone: req.user.phone,
    college: req.user.college,
    role: req.user.role,
  });
});

/*
Logout
*/

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({
          success: false,
          message:
            "Session destruction failed",
        });
      }

      res.clearCookie("connect.sid");
      res.clearCookie("eventhub.sid");

      return res.json({
        success: true,
        message:
          "Logged out successfully",
      });
    });
  });
});

module.exports = router;
