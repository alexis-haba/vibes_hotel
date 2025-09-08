module.exports = (roles) => (req, res, next) => {
  const userRole = req.user?.role;
  console.log('Role check for /tariffs:', userRole, 'allowed roles:', roles); // Débogage
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ msg: 'Access denied' });
  }
  next();
};