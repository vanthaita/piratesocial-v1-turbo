import { User as PassportUser } from 'passport';

declare global {
  namespace Express {
    interface User {
      id: any;
      accessToken: string;
      email: string;
    }

    interface Request {
      user?: User;
    }
  }
}
