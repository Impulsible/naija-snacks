export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}