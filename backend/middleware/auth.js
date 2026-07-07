module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    next();
  } catch (error) {
    console.error("Auth middleware failed:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication check failed",
    });
  }
};
