class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
  
      // Maintains proper stack trace for where our error was thrown
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ErrorResponse);
      }
  
      this.name = 'ErrorResponse';
      this.date = new Date();
    }
  }
  
  module.exports = ErrorResponse;