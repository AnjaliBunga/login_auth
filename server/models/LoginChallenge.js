const mongoose = require('mongoose');

const LoginChallengeSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        codeHash: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: true },
        consumedAt: { type: Date },
        channel: { type: String, enum: ['email'], default: 'email' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('LoginChallenge', LoginChallengeSchema);


