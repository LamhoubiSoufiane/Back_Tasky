const { HttpException, HttpStatus } = require('@nestjs/common');

class InvalidCredentials extends HttpException {
  constructor(message, status = HttpStatus.NOT_FOUND) {
    super(message,status);
  }
}

module.exports = { InvalidCredentials };
