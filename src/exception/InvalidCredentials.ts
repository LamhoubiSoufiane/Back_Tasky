const { HttpException, HttpStatus } = require('@nestjs/common');

export class InvalidCredentials extends HttpException {
  constructor(message, status = HttpStatus.NOT_FOUND) {
    super(message,status);
  }
}

//module.exports = { InvalidCredentials };
