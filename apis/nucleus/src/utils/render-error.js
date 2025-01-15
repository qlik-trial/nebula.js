/**
 * @class RenderError
 * @extends Error
 * @param {string} message
 * @param {Error} originalError
 * @property {Error} originalError
 */

export default class RenderError extends Error {
  constructor(message, originalError) {
    super(message);
    this.originalError = originalError;
    this.name = 'RenderError';
  }
}
