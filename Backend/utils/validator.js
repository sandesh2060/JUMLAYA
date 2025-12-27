// Email validation regex
const emailRegex = /^\S+@\S+\.\S+$/

// Phone validation regex
const phoneRegex = /^[0-9]{10,15}$/

// Username validation regex
const usernameRegex = /^[a-zA-Z0-9_]+$/

// Validate email
const validateEmail = (email) => {
  return emailRegex.test(email)
}

// Validate phone
const validatePhone = (phone) => {
  return phoneRegex.test(phone)
}

// Validate username
const validateUsername = (username) => {
  if (username.length < 3 || username.length > 30) return false
  return usernameRegex.test(username)
}

// Validate password strength
const validatePassword = (password) => {
  if (password.length < 8) return false
  // At least one uppercase, one lowercase, one number
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)

  return hasUpperCase && hasLowerCase && hasNumbers
}

module.exports = {
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
}
