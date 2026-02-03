const bcrypt = require('bcryptjs');

// Generate hash for "admin123"
bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});