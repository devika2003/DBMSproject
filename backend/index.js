const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'LoginSystem'
});

db.connect(err => {
  if (err) {
    console.log('DB connection error:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Register endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error registering user' });
    } else {
      res.send({ message: 'User registered successfully' });
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error logging in' });
    } else if (results.length === 0) {
      res.status(400).send({ message: 'User not found' });
    } else {
      const user = results[0];
      const isMatch = bcrypt.compareSync(password, user.password);
      if (isMatch) {
        res.send({ message: 'Login successful' });
      } else {
        res.status(400).send({ message: 'Invalid credentials' });
      }
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
