import User from "../models/User.js";

const publicFields = "name email role title department avatarColor";

export async function listUsers(_req, res) {
  const users = await User.find().select(publicFields).sort({ name: 1 });
  res.json(users);
}

export async function updateProfile(req, res) {
  const allowed = ["name", "title", "department", "avatarColor"];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  await req.user.save();
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      title: req.user.title,
      department: req.user.department,
      avatarColor: req.user.avatarColor
    }
  });
}
