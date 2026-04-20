import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/authService';

function getRedirectPath(roles: string[]): string {
  if (roles.includes('admin')) return '/owner';
  if (roles.includes('affiliate')) return '/affiliate';
  return '/book/calendar';
}

const MagicLinkPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    authService.verifyMagicLink(token)
      .then(async (tokens) => {
        const user = await loginWithToken(tokens.access_token, tokens.refresh_token);
        navigate(getRedirectPath(user.roles), { replace: true });
      })
      .catch(() => {
        navigate('/?magic_link_error=expired', { replace: true });
      });
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-primary-700 font-medium">Logging you in...</p>
      </div>
    </div>
  );
};

export default MagicLinkPage;
