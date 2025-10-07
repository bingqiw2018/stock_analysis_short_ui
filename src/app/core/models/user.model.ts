import { AuthModel } from './auth.model';

export class UserModel extends AuthModel {
  username: string;
  password: string;
  fullname: string;
  email: string;
  
  setUser(user: any) {
    this.username = user.username || '';
    this.password = user.password || '';
    this.fullname = user.fullname || '';
    this.email = user.email || '';
  }
}
