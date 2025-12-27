const { errorResponse } = require("../utils/response")
const AppError = require("../utils/AppError")

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || "Internal Server Error"

  // Log error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(err)
  }

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    return errorResponse(res, 400, "Validation Error", message)
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    return errorResponse(res, 409, "Duplicate Field", message)
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, 401, "Invalid Token", "Your token is invalid")
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, 401, "Token Expired", "Your token has expired")
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.message)
  }

  // Default error response
  errorResponse(res, err.statusCode, err.message)
}

module.exports = errorHandler
