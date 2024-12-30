import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        select: false
    },
    role: {
        type: String,
        enum: ['KAM', 'ADMIN'],
        default: 'KAM'
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deactivationReason: {
        type: String
    },
    deactivatedAt: {
        type: Date
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;