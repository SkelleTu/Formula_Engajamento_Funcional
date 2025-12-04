import { useState, FormEvent } from 'react';
import { User, Phone, Mail } from 'lucide-react';
import Logo from '../components/Logo';
import FloatingIcons from '../components/FloatingIcons';
import BackButton from '../components/BackButton';
import { analytics } from '../utils/analytics';

interface RegistrationPageProps {
  onComplete: (data: { name: string; phone: string; email: string }) => void;
  onNavigateToHome: () => void;
  onBack: () => void;
}

function RegistrationPage({ onComplete, onNavigateToHome, onBack }: RegistrationPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.email) {
      await analytics.trackRegistration(formData);
      onComplete(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]"></div>
      
      <FloatingIcons />

      <div className="relative w-full max-w-md">
        <div className="py-8 flex items-center justify-between">
          <BackButton onClick={onBack} />
          <Logo onClick={onNavigateToHome} />
          <div className="w-24"></div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-pink-500/30 rounded-2xl p-8 shadow-2xl shadow-pink-500/20">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full mb-4">
              <User className="w-12 h-12 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Últimos Passos
            </h2>
            <p className="text-gray-400">
              Preencha seus dados para continuar sua transformação
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105"
            >
              Concluir Cadastro
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span className="text-green-400">🔒</span>
              <span>Seus dados estão seguros e protegidos</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Ao continuar, você concorda com nossos termos de uso
          </p>
          <p className="text-gray-500 text-xs mt-2">
            CNPJ: 57.579.277/0001-38
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;
