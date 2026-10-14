const userModel = require('../models/user.model');

// Create a new user
async function createUser({ firstname, lastname, email, password }) {
  if (!firstname || !lastname || !email || !password) {
    throw new Error('All fields are required');
  }
  const user = await userModel.create({
    fullname: { firstname, lastname },
    email,
    password,
  });
  return user;
}


// logout ?


// Export all functions
module.exports = {
  createUser
};