import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    Usuario: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);
export default User;