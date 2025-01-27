const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Login API
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    console.log('Invalid request body:', req.body);
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      console.log('Authentication failed for user:', username);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Check user role
    if (user.role === 'admin') {
      console.log('Admin login successful:', username);
      return res.status(200).json({ success: true, redirectTo: '/admin/users-admin' });
    } else {
      console.log('Non-admin access denied:', username);
      return res.status(403).json({ success: false, message: 'You are not an admin' });
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
