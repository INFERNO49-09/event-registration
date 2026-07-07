module.exports = (req, res, next) => {
  try {
    // Must be logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Must be admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware failed:", error);

    return res.status(500).json({
      success: false,
      message: "Admin authorization check failed",
    });
  }
};
