import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Check } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid || !passwordsMatch) return;
    
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    
    if (!error) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Conta criada com sucesso!
            </h1>
            <p className="text-gray-500 mb-6">
              Enviamos um email de confirmação para <strong>{email}</strong>. 
              Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Ir para Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">AP</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              A Palavra
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Criar sua conta
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Junte-se a milhares de pessoas encontrando paz na Palavra
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password requirements */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1">
                  <PasswordCheck passed={passwordChecks.length} text="Mínimo 8 caracteres" />
                  <PasswordCheck passed={passwordChecks.uppercase} text="Uma letra maiúscula" />
                  <PasswordCheck passed={passwordChecks.lowercase} text="Uma letra minúscula" />
                  <PasswordCheck passed={passwordChecks.number} text="Um número" />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1">As senhas não coincidem</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !fullName || !email}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-gray-400 text-sm mt-4">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link to="/termos" className="text-cyan-600 hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link to="/privacidade" className="text-cyan-600 hover:underline">Política de Privacidade</Link>
          </p>

          {/* Sign in link */}
          <p className="text-center text-gray-500 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">
              Entrar
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar para o início
          </Link>
        </p>
      </div>
    </div>
  );
};

// Password check component
const PasswordCheck: React.FC<{ passed: boolean; text: string }> = ({ passed, text }) => (
  <div className={`flex items-center gap-2 text-sm ${passed ? 'text-green-600' : 'text-gray-400'}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-gray-100'}`}>
      {passed && <Check className="w-3 h-3" />}
    </div>
    {text}
  </div>
);

export default RegisterPage;
