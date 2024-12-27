import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ['KAM', 'ADMIN'],
        default: 'KAM',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    try {
      if (!this.isModified('password')) {
        return next();
      }
      const hashed = await bcrypt.hash(this.password, 10);
      this.password = hashed;
      return next();
    } catch (err) {
      return next(err);
    }
});  

userSchema.methods.comparePassword = async function(attempt, next) {
    try {
      return await bcrypt.compare(attempt, this.password);
    } catch (err) {
      next(err);
    }
  }

const User = mongoose.model('User', userSchema);
export default User;