import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

// ----------------------------------------------------------------------

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  validate(email: string, password: string) {
    // This validate function return will be appended to the request object
    // Access data to the request.user object
    return this.authService.validateLocalUser(email, password);
  }
}
