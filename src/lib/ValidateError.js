class ValidateError extends Error {
  /**
   * @param {string} message
   * @param {object} [errors] - Optional validation errors object
   */
  constructor(message, errors = {}) {
    super(message);
    this.name = "ValidateError";
    this.errors = errors;
  }
}

export default ValidateError;