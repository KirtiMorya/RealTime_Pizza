
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

function init(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            // Find user by email
            const user = await User.findOne({ email: email });

            if (!user) {
                return done(null, false, { message: 'No user with this email' });
            }

            // Match password
            bcrypt.compare(password, user.password).then(match => {
                if (match) {
                    return done(null, user, { message: 'Logged in successfully' });
                }
                return done(null, false, { message: 'Wrong username or password' });
            }).catch(err => {
                return done(null, false, { message: 'Something went wrong' });
            });

        } catch (err) {
            return done(err);
        }
    }));

    // Serialize user to store user ID in the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user to retrieve user object from the session using user ID
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        }catch (err) {
            done(err);
        }
    });
}

module.exports = init;
