import { CheckCircle, ShoppingCart, MessageCircle, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';
import FloatingIcons from '../components/FloatingIcons';
import BackButton from '../components/BackButton';

interface ConfirmationPageProps {
  userData: {
    name: string;
    phone: string;
    email: string;
  };
  onNavigateToHome: () => void;
  onBack?: () => void;
}

function ConfirmationPage({ userData, onNavigateToHome, onBack }: ConfirmationPageProps) {
  const firstName = userData.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]"></div>
      
      <FloatingIcons />

      <div className="relative w-full max-w-2xl">
        <div className="py-8 flex items-center justify-between">
          {onBack && <BackButton onClick={onBack} />}
          <Logo onClick={onNavigateToHome} />
          <div className="w-24"></div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-pink-500/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-pink-500/20">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full mb-4 animate-pulse">
              <CheckCircle className="w-16 h-16 text-pink-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Cadastro Concluído, {firstName}!
            </h2>
            <p className="text-gray-300 text-lg">
              Você está a um passo de transformar seu engajamento
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">Escolha sua próxima ação:</h3>
                  <p className="text-gray-400 text-sm">
                    Complete sua jornada garantindo seu acesso ao curso ou entre no grupo para receber atualizações exclusivas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="https://hotm.art/dc7aAC"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <button className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                Garantir Meu Acesso Agora
              </button>
            </a>

            <button
              onClick={() => alert('Link do WhatsApp será disponibilizado em breve!')}
              className="w-full py-5 bg-gray-800/50 hover:bg-gray-800 border-2 border-pink-500/30 hover:border-pink-500/50 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-6 h-6 text-pink-400" />
              Entrar no Grupo WhatsApp
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-500/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-pink-400" />
                Seus dados foram registrados:
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  <span className="text-gray-500">Nome:</span> <span className="text-white">{userData.name}</span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Telefone:</span> <span className="text-white">{userData.phone}</span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">E-mail:</span> <span className="text-white">{userData.email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <span className="text-green-400">🔒</span>
              Compra 100% segura e protegida
            </p>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <div className="inline-block px-6 py-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
            <p className="text-pink-400 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              Aproveite enquanto há vagas disponíveis!
            </p>
          </div>

          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Entre em contato conosco: <span className="text-pink-400">(19) 98734-0006</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            CNPJ: 57.579.277/0001-38
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
