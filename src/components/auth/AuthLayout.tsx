import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, User } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon?: 'login' | 'register' | 'forgot';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  icon = 'login',
}) => {
  const IconComponent = {
    login: Shield,
    register: User,
    forgot: Lock,
  }[icon];

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted hover:text-dark transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
              <IconComponent size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-muted">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted mt-8">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary hover:text-primary-dark font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:text-primary-dark font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;