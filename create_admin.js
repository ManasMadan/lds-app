#!/usr/bin/env node

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();
const prisma = new PrismaClient();

async function hashPassword(plainPassword) {
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS)); // Using a default of 10 rounds
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

async function createUser(inputs) {
  const hashed = await hashPassword(inputs.password);
  const user = await prisma.user.create({
    data: {
      email: inputs.email,
      name: inputs.name,
      password: hashed,
      role: inputs.role,
    },
  });
  return user;
}

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter email: ", (email) => {
  rl.question("Enter password: ", async (password) => {
    try {
      const newUser = await createUser({
        email,
        password,
        name: "Admin User",
        role: "ADMIN",
      });

      console.log("New ADMIN user created successfully:");
      console.log(newUser);
    } catch (error) {
      console.error("Error creating ADMIN user:", error.message);
    } finally {
      await prisma.$disconnect();
      rl.close();
    }
  });
});
