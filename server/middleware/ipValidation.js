// IP Validation Middleware
// This middleware restricts access to certain endpoints based on IP address

const allowedIPs = [
  // Add your laptop's IP address here
  '127.0.0.1',        // Localhost
  '::1',              // Localhost IPv6
  '192.168.1.5',      // Your laptop's IPv4 address
  '2401:4900:a019:5126:c43a:b1e5:6d07:67c7',  // Your laptop's temporary IPv6 address
  '2401:4900:a019:5126:cb78:c88f:8ec4:cc20'   // Your laptop's permanent IPv6 address
];

const checkIPAccess = (req, res, next) => {
  const clientIP = req.ip || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   req.connection.socket?.remoteAddress ||
                   req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'];

  // Check if client IP is in allowed list
  if (allowedIPs.includes(clientIP)) {
    next();
  } else {
    // For development, allow all local network IPs and your specific IPv6 range
    // In production, you would restrict this to specific IPs
    if (clientIP.startsWith('192.168.') || 
        clientIP.startsWith('10.') || 
        clientIP.startsWith('172.') ||
        clientIP.startsWith('2401:4900:')) {  // Your IPv6 range
      next();
    } else {
      // IP access denied
      res.status(403).json({ 
        error: 'Access denied. This endpoint is restricted to authorized IP addresses only.',
        clientIP: clientIP
      });
    }
  }
};

module.exports = { checkIPAccess };
