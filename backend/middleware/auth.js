const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Middleware: No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token || token === 'null' || token === 'undefined') {
    console.log('❌ Middleware: Invalid token value');
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Middleware: Token verified for user: ${decoded.userId}`);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(`❌ Middleware: Invalid token: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};