export const verifyAdmin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      message: "Unauthorized access. Please log in as admin.",
      success: false,
    });
  }
  next();
};
