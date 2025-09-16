import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFound extends HttpException {
  constructor(message: string) {
    super({ message }, HttpStatus.NOT_FOUND);
  }
}
