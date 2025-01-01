import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    this.logger.debug(
      `Auth attempt - User: ${JSON.stringify(user)}, Error: ${err?.message}, Info: ${info?.message}`,
    );

    if (err || !user) {
      throw (
        err || new UnauthorizedException('Invalid token or no token provided')
      );
    }
    return user;
  }
}
