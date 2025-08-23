import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// ----------------------------------------------------------------------

export const ActiveUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Express.Request>();

    return request.user;
  },
);
