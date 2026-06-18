const router = require("express").Router();
const passport = require("passport");

/*
====================================
Google Login
GET /auth/google
====================================
*/

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/*
====================================
Google Callback
GET /auth/google/callback
====================================
*/

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect(
      process.env.FRONTEND_URL ||
        "http://localhost:5173/events"
    );
  }
);

/*
====================================
Current User
GET /auth/me
====================================
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
====================================
Logout
GET /auth/logout
====================================
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

      return res.json({
        success: true,
        message:
          "Logged out successfully",
      });
    });
  });
});

module.exports = router;