export interface LoginModel {
  userId:string;
  email: string;
  password: string;
}
export interface UpdateEmailModel{
  oldEmail:string;
  newEmail:string;
}
export interface ResetPasswordModel{
  code:string;
  password:string;
}


