// ----------------------------------------------------------------------

declare namespace Express {
  interface Request {
    user: {
      // Define your user properties here
      id: string;
      email: string;
      role: string;
    };
  }
}
