// CrimeSafeNet Backend - Community Safety Platform
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// JWT Secret (in production, use env variables)
const JWT_SECRET = 'your-super-secret-key-change-in-production';

// Setup multer for file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// SQLite Database
const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile);

// Initialize database tables and run migrations
const initializeDatabase = () => {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Users table with encryption
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('citizen', 'police')) NOT NULL,
        location TEXT,
        phone TEXT,
        verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Reports table
      db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        crime_type TEXT,
        status TEXT DEFAULT 'Reported' CHECK(status IN ('Reported', 'Under Investigation', 'Resolved')),
        citizen_id INTEGER NOT NULL,
        assigned_officer_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(citizen_id) REFERENCES users(id),
        FOREIGN KEY(assigned_officer_id) REFERENCES users(id)
      )`);

      // Evidence table
      db.run(`CREATE TABLE IF NOT EXISTS evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT CHECK(file_type IN ('image', 'video')),
        file_name TEXT,
        uploaded_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(report_id) REFERENCES reports(id),
        FOREIGN KEY(uploaded_by) REFERENCES users(id)
      )`);

      // Activity log table
      db.run(`CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        report_id INTEGER,
        action TEXT,
        description TEXT,
        old_value TEXT,
        new_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(report_id) REFERENCES reports(id)
      )`);

      // Comments/Updates table
      db.run(`CREATE TABLE IF NOT EXISTS report_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(report_id) REFERENCES reports(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`, () => {
        // After all tables are created, run migrations
        runMigrations(resolve);
      });
    });
  });
};

// Run database migrations
const runMigrations = (callback) => {
  db.all("PRAGMA table_info(reports)", (err, columns) => {
    if (err) {
      console.error('Error checking reports table:', err);
      callback();
      return;
    }
    
    const hasLatitude = columns.some(col => col.name === 'latitude');
    const hasLongitude = columns.some(col => col.name === 'longitude');
    const hasCrimeType = columns.some(col => col.name === 'crime_type');
    const hasCitizenId = columns.some(col => col.name === 'citizen_id');
    const hasAssignedOfficerId = columns.some(col => col.name === 'assigned_officer_id');
    const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
    
    let migrationsNeeded = 0;
    let migrationsComplete = 0;
    
    // Count migrations needed
    if (!hasLatitude) migrationsNeeded++;
    if (!hasLongitude) migrationsNeeded++;
    if (!hasCrimeType) migrationsNeeded++;
    if (!hasCitizenId) migrationsNeeded++;
    if (!hasAssignedOfficerId) migrationsNeeded++;
    if (!hasUpdatedAt) migrationsNeeded++;
    
    // If no migrations needed, we're done
    if (migrationsNeeded === 0) {
      console.log('✓ Database schema is up to date');
      callback();
      return;
    }
    
    const checkMigrationsComplete = () => {
      migrationsComplete++;
      if (migrationsComplete === migrationsNeeded) {
        console.log('✓ All database migrations completed successfully');
        callback();
      }
    };
    
    if (!hasLatitude) {
      db.run('ALTER TABLE reports ADD COLUMN latitude REAL', (err) => {
        if (err) console.error('Error adding latitude column:', err);
        else console.log('✓ Added latitude column to reports table');
        checkMigrationsComplete();
      });
    }
    
    if (!hasLongitude) {
      db.run('ALTER TABLE reports ADD COLUMN longitude REAL', (err) => {
        if (err) console.error('Error adding longitude column:', err);
        else console.log('✓ Added longitude column to reports table');
        checkMigrationsComplete();
      });
    }
    
    if (!hasCrimeType) {
      db.run('ALTER TABLE reports ADD COLUMN crime_type TEXT', (err) => {
        if (err) console.error('Error adding crime_type column:', err);
        else console.log('✓ Added crime_type column to reports table');
        checkMigrationsComplete();
      });
    }
    
    if (!hasCitizenId) {
      db.run('ALTER TABLE reports ADD COLUMN citizen_id INTEGER', (err) => {
        if (err) console.error('Error adding citizen_id column:', err);
        else console.log('✓ Added citizen_id column to reports table');
        checkMigrationsComplete();
      });
    }
    
    if (!hasAssignedOfficerId) {
      db.run('ALTER TABLE reports ADD COLUMN assigned_officer_id INTEGER', (err) => {
        if (err) console.error('Error adding assigned_officer_id column:', err);
        else console.log('✓ Added assigned_officer_id column to reports table');
        checkMigrationsComplete();
      });
    }
    
    if (!hasUpdatedAt) {
      db.run('ALTER TABLE reports ADD COLUMN updated_at DATETIME', (err) => {
        if (err) console.error('Error adding updated_at column:', err);
        else console.log('✓ Added updated_at column to reports table');
        checkMigrationsComplete();
      });
    }
  });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// AUTHENTICATION ENDPOINTS

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, location, phone } = req.body;

  // Validate input
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    const query = `INSERT INTO users (name, email, password_hash, role, location, phone) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [name, email, hash, role, location || null, phone || null], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: err.message });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: this.lastID, email, name, role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: this.lastID, name, email, role }
      });
    });
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Verify password
    bcrypt.compare(password, user.password_hash, (err, isValid) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location
        }
      });
    });
  });
});

// REPORTS ENDPOINTS

// Get all reports (with filtering)
app.get('/api/reports', (req, res) => {
  const { status, assignedOfficerId } = req.query;
  let query = `SELECT r.*, u.name as citizen_name, u.email as citizen_email,
               po.name as officer_name FROM reports r 
               LEFT JOIN users u ON r.citizen_id = u.id 
               LEFT JOIN users po ON r.assigned_officer_id = po.id`;
  let params = [];

  if (status) {
    query += ' WHERE r.status = ?';
    params.push(status);
  }

  if (assignedOfficerId) {
    query += params.length ? ' AND' : ' WHERE';
    query += ' r.assigned_officer_id = ?';
    params.push(assignedOfficerId);
  }

  query += ' ORDER BY r.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Get citizen's reports
app.get('/api/reports/citizen/:citizenId', verifyToken, (req, res) => {
  const { citizenId } = req.params;

  if (req.user.id != citizenId && req.user.role !== 'police') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.all(
    `SELECT r.*, u.name as citizen_name FROM reports r 
     LEFT JOIN users u ON r.citizen_id = u.id 
     WHERE r.citizen_id = ? ORDER BY r.created_at DESC`,
    [citizenId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Get single report with evidence
app.get('/api/reports/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT r.*, u.name as citizen_name, u.email as citizen_email,
            u.phone as citizen_phone, po.name as officer_name FROM reports r 
     LEFT JOIN users u ON r.citizen_id = u.id 
     LEFT JOIN users po ON r.assigned_officer_id = po.id
     WHERE r.id = ?`,
    [id],
    (err, report) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!report) return res.status(404).json({ error: 'Report not found' });

      // Get evidence
      db.all('SELECT * FROM evidence WHERE report_id = ?', [id], (err, evidence) => {
        if (err) return res.status(500).json({ error: err.message });

        // Get updates/comments
        db.all(
          `SELECT ru.*, u.name as user_name FROM report_updates ru 
           LEFT JOIN users u ON ru.user_id = u.id 
           WHERE ru.report_id = ? ORDER BY ru.created_at DESC`,
          [id],
          (err, updates) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...report, evidence: evidence || [], updates: updates || [] });
          }
        );
      });
    }
  );
});

// Create report
app.post('/api/reports', verifyToken, (req, res) => {
  const { title, description, location, latitude, longitude, crime_type } = req.body;
  const citizen_id = req.user.id;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const finalLocation = location || (latitude && longitude ? `Lat ${latitude}, Lng ${longitude}` : 'Not specified');

  db.run(
    `INSERT INTO reports (title, description, location, latitude, longitude, crime_type, citizen_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, finalLocation, latitude || null, longitude || null, crime_type, citizen_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Log activity
      db.run(
        `INSERT INTO activity_log (user_id, report_id, action, description)
         VALUES (?, ?, ?, ?)`,
        [citizen_id, this.lastID, 'REPORT_CREATED', `Report created: ${title}`]
      );

      db.get('SELECT * FROM reports WHERE id = ?', [this.lastID], (err, report) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(report);
      });
    }
  );
});

// Update report status
app.patch('/api/reports/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const officer_id = req.user.id;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  db.get('SELECT * FROM reports WHERE id = ?', [id], (err, report) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const oldStatus = report.status;

    db.run(
      `UPDATE reports SET status = ?, assigned_officer_id = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, officer_id, id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        // Log activity
        db.run(
          `INSERT INTO activity_log (user_id, report_id, action, description, old_value, new_value)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [officer_id, id, 'STATUS_UPDATED', `Status changed to ${status}`, oldStatus, status]
        );

        db.get('SELECT * FROM reports WHERE id = ?', [id], (err, updatedReport) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(updatedReport);
        });
      }
    );
  });
});

// EVIDENCE ENDPOINTS

// Upload evidence
app.post('/api/evidence/upload/:reportId', verifyToken, upload.single('file'), (req, res) => {
  const { reportId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  const filePathUrl = `/uploads/${req.file.filename}`;

  db.run(
    `INSERT INTO evidence (report_id, file_path, file_type, file_name, uploaded_by)
     VALUES (?, ?, ?, ?, ?)`,
    [reportId, filePathUrl, fileType, req.file.originalname, req.user.id],
    function(err) {
      if (err) {
        // Clean up uploaded file on DB error
        fs.unlink(req.file.path, () => {});
        return res.status(500).json({ error: err.message });
      }

      // Log activity
      db.run(
        `INSERT INTO activity_log (user_id, report_id, action, description)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, reportId, 'EVIDENCE_UPLOADED', `Evidence uploaded: ${req.file.originalname}`]
      );

      res.status(201).json({
        id: this.lastID,
        report_id: reportId,
        file_path: filePathUrl,
        file_type: fileType,
        file_name: req.file.originalname
      });
    }
  );
});

// INTERACTION ENDPOINTS

// Add update/comment
app.post('/api/reports/:id/update', verifyToken, (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: 'Comment required' });
  }

  db.run(
    `INSERT INTO report_updates (report_id, user_id, comment)
     VALUES (?, ?, ?)`,
    [id, req.user.id, comment],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Log activity
      db.run(
        `INSERT INTO activity_log (user_id, report_id, action, description)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, id, 'COMMENT_ADDED', comment]
      );

      db.get(
        `SELECT ru.*, u.name as user_name FROM report_updates ru 
         LEFT JOIN users u ON ru.user_id = u.id 
         WHERE ru.id = ?`,
        [this.lastID],
        (err, update) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(update);
        }
      );
    }
  );
});

// Get activity log
app.get('/api/activity/:reportId', (req, res) => {
  const { reportId } = req.params;

  db.all(
    `SELECT a.*, u.name as user_name FROM activity_log a 
     LEFT JOIN users u ON a.user_id = u.id 
     WHERE a.report_id = ? ORDER BY a.created_at DESC`,
    [reportId],
    (err, activities) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(activities || []);
    }
  );
});

// Get all activities for dashboard
app.get('/api/activity', (req, res) => {
  db.all(
    `SELECT a.*, u.name as user_name, r.title as report_title FROM activity_log a 
     LEFT JOIN users u ON a.user_id = u.id 
     LEFT JOIN reports r ON a.report_id = r.id 
     ORDER BY a.created_at DESC LIMIT 100`,
    (err, activities) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(activities || []);
    }
  );
});

const PORT = process.env.PORT || 5000;

// Initialize database and then start the server
initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`✓ Backend running on http://localhost:${PORT}`));
});
