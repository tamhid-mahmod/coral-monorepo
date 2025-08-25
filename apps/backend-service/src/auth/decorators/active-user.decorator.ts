import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// ----------------------------------------------------------------------

export interface ActiveUserType {
  id: string;
  name: string;
  role: string;
}

export const ActiveUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: ActiveUserType }>();

    return request.user;
  },
);
