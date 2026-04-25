import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type UserRole = "user" | "admin";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
};

type UserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

const usersPath = path.join(process.cwd(), "data", "users", "accounts.json");

function ensureUsersStore() {
  const folder = path.dirname(usersPath);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, "[]\n", "utf8");
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(derivedKey, "hex")
  );
}

export function getUsers() {
  ensureUsersStore();
  const raw = fs.readFileSync(usersPath, "utf8");
  return JSON.parse(raw) as StoredUser[];
}

export function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return getUsers().find((user) => user.email === normalizedEmail);
}

export function createUser(input: UserInput) {
  const users = getUsers();
  const email = normalizeEmail(input.email);

  if (getUserByEmail(email)) {
    throw new Error("An active user with this email already exists.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
    role: input.role ?? "user",
    createdAt: new Date().toISOString()
  };

  users.push(user);
  fs.writeFileSync(usersPath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  return user;
}
