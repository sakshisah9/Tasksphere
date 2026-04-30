import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    department: user.department,
    avatarColor: user.avatarColor
  };
}

export async function signup(req, res) {
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) return res.status(409).json({ message: "Email is already registered" });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ token: signToken(user), user: userPayload(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ token: signToken(user), user: userPayload(user) });
}

export async function me(req, res) {
  res.json({ user: userPayload(req.user) });
}
