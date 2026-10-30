const adminAuth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Valid admin key required.",
    });
  }

  next();
};

module.exports = adminAuth;