const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ensureUserRoleColumn = async () => {
  try {
    await db.execute(
      "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'viewer'"
    );
  } catch (error) {
    if (!/already exists|Duplicate column/i.test(error.message)) {
      console.error("Role column setup error:", error);
    }
  }
};

// ======================
// Register User
// ======================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    await ensureUserRoleColumn();

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const [user] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (user.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = (role || "viewer").toLowerCase();

    await db.execute(
      "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({
      success: true,
      message: "Registration Successful",
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

// ======================
// Login User
// ======================
const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    await ensureUserRoleColumn();

    const [user] = await db.execute(
      "SELECT id, name, email, password, role FROM users WHERE email=?",
      [email]
    );

    if (user.length === 0) {
      return res.status(400).json({
        message: "Invalid Email"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const role = (user[0].role || "viewer").toLowerCase();

    const token = jwt.sign(
      {
        id: user[0].id,
        email: user[0].email,
        role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        role
      }
    });

  } catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
      message: error.message || "Server Error"
    });

  }

};

const getUserCounts = async (req, res) => {
  try {
    await ensureUserRoleColumn();

    const [rows] = await db.execute(
      "SELECT role, COUNT(*) AS count FROM users GROUP BY role"
    );

    const counts = {
      admin: 0,
      editor: 0,
      viewer: 0,
    };

    rows.forEach((row) => {
      const role = (row.role || "viewer").toLowerCase();
      if (role === "admin") counts.admin = row.count;
      else if (role === "editor") counts.editor = row.count;
      else counts.viewer = row.count;
    });

    res.status(200).json(counts);
  } catch (error) {
    console.error("Get user counts error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    await ensureUserRoleColumn();

    const requestedRole = (req.query.role || "viewer").toString().toLowerCase();
    const validRoles = ["admin", "editor", "viewer"];
    const role = validRoles.includes(requestedRole) ? requestedRole : "viewer";

    const [rows] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE role = ? ORDER BY name ASC",
      [role]
    );

    res.status(200).json({ role, users: rows });
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserCounts,
  getUsersByRole,
};