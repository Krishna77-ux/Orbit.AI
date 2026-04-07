import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resumeUploadsRemaining: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  try {
    const user = await User.create({
      name: 'Test Administrator',
      email: 'admin@test.com',
      password: hashedPassword,
      resumeUploadsRemaining: 10
    });
    console.log('Test user created:', user.email);
  } catch (err) {
    // If user exists, just update their quota
    await User.updateOne({ email: 'admin@test.com' }, { resumeUploadsRemaining: 10 });
    console.log('Existing user quota reset to 10');
  }

  await mongoose.disconnect();
}

createTestUser();
