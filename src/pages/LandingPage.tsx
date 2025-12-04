import { useState } from 'react';
import { CheckCircle, Zap, Users, TrendingUp, Award, Target, Rocket, Heart, MessageCircle, Share2, Star, Sparkles, Crown, Globe, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import FloatingIcons from '../components/FloatingIcons';
import VideoPlayer from '../components/VideoPlayer';
import juliaoPhoto from '@assets/WhatsApp Image 2025-11-03 at 12.22.04_1762115481254.jpeg';

interface LandingPageProps {
  onNavigate: () => void;
  onNavigateToHome: () => void;
}

function LandingPage({ onNavigate, onNavigateToHome }: LandingPageProps) {
  const [buttonEnabled, setButtonEnabled] = useState(false);

  const handleButtonEnable = () => {
    setButtonEnabled(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]"></div>
      
      <FloatingIcons />

      <div className="relative">
        <header className="container mx-auto px-4 pt-12 pb-8 relative">
          <Logo onClick={onNavigateToHome} />
          
          <Link 
            to="/admin"
            className="fixed top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/40 hover:to-purple-500/40 transition-all duration-300 z-50 cursor-pointer"
            aria-label="Admin"
          />
        </header>

        <main className="container mx-auto px-4 pb-8">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <div className="inline-block mb-8 px-6 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-500/30">
              <p className="text-pink-300 font-semibold">Fórmula Engajamento</p>
            </div>

            <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed">
              Aprenda a transformar cada curtida, comentário e compartilhamento em <span className="text-pink-400 font-semibold">crescimento real</span>.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-16 relative group">
            <VideoPlayer onButtonEnable={handleButtonEnable} />

            {buttonEnabled && (
              <button
                onClick={onNavigate}
                className="w-full mt-6 py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl font-bold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 animate-fadeIn"
              >
                Quero Transformar Meu Engajamento
              </button>
            )}
            
            {!buttonEnabled && (
              <div className="w-full mt-6 py-6 bg-gray-600 text-gray-400 text-xl font-bold rounded-xl text-center cursor-not-allowed opacity-50">
                Continue assistindo para desbloquear
              </div>
            )}

            <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-pink-400" />
                <span>Método Comprovado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                <span>Resultados Reais</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-pink-400" />
                <span>Suporte Exclusivo</span>
              </div>
            </div>
          </div>

          <section className="max-w-6xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
              O Que Você Vai Aprender
            </h2>
            <p className="text-center text-gray-400 text-lg mb-12">
              Desenvolva habilidades práticas que transformarão sua presença digital
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: 'Engajamento Real',
                  description: 'Aprenda técnicas comprovadas para aumentar curtidas, comentários e compartilhamentos de forma orgânica.',
                  color: 'from-pink-500 to-rose-500'
                },
                {
                  icon: Rocket,
                  title: 'Crescimento Acelerado',
                  description: 'Estratégias para fazer seu perfil crescer de forma consistente e sustentável.',
                  color: 'from-purple-500 to-violet-500'
                },
                {
                  icon: Users,
                  title: 'Comunidade Engajada',
                  description: 'Construa uma audiência fiel que realmente se importa com seu conteúdo.',
                  color: 'from-pink-500 to-purple-500'
                },
                {
                  icon: Target,
                  title: 'Conteúdo que Converte',
                  description: 'Crie postagens que gerem conversas e transformem seguidores em clientes.',
                  color: 'from-rose-500 to-pink-500'
                },
                {
                  icon: Zap,
                  title: 'Viralização Estratégica',
                  description: 'Entenda os algoritmos e faça seus conteúdos alcançarem milhares de pessoas.',
                  color: 'from-violet-500 to-purple-500'
                },
                {
                  icon: Award,
                  title: 'Resultados Rápidos',
                  description: 'Implemente as estratégias e veja os resultados já nas primeiras semanas.',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
                >
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Visual Sales Funnel Section */}
          <section className="max-w-6xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                O Poder das Redes Sociais
              </h2>
              <p className="text-gray-400 text-lg">
                Veja como seu engajamento pode crescer exponencialmente
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Funnel Stage 1 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm border-2 border-pink-500/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-pink-500/50">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">Curtidas</h3>
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text mb-2">
                    +500%
                  </div>
                  <p className="text-gray-300 text-sm">Aumento médio em engajamento</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold text-sm">Crescimento Real</span>
                  </div>
                </div>
              </div>

              {/* Funnel Stage 2 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">Comentários</h3>
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text mb-2">
                    +350%
                  </div>
                  <p className="text-gray-300 text-sm">Mais interações autênticas</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-semibold text-sm">Comunidade Ativa</span>
                  </div>
                </div>
              </div>

              {/* Funnel Stage 3 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-sm border-2 border-pink-600/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-pink-600/50">
                    <Share2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">Compartilha-<br/>mentos</h3>
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text mb-2">
                    +600%
                  </div>
                  <p className="text-gray-300 text-sm">Alcance viral orgânico</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Rocket className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold text-sm">Viralização</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-4xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/80 backdrop-blur-sm border-2 border-pink-500/30 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Conheça Seu Mentor
                </h2>
                <p className="text-gray-400 text-lg">
                  Aprenda com quem realmente entende de engajamento nas redes sociais
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full animate-pulse opacity-50"></div>
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-500 p-1.5">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-900">
                      <img 
                        src={juliaoPhoto} 
                        alt="Júlio Calori - Julião" 
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-gray-900 shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                    Júlio Calori
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </h3>
                  <p className="text-pink-400 text-xl mb-4 font-semibold">Conhecido como "Julião"</p>
                  
                  <div className="space-y-3 text-gray-300 leading-relaxed">
                    <p className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <span><strong className="text-white">Cristão e promotor independente</strong>, líder com mais de 20 anos de experiência em empreendedorismo, líder de marketing de rede e formação de equipes.</span>
                    </p>
                    
                    <p className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                      <span>Já impactou muitas pessoas com seu propósito de <strong className="text-pink-300">moldar mentes para pensar grande</strong>, agir com sabedoria e viver com propósito. Aonde tocamos, pisamos e olhamos algo gigantesco sempre acontece.</span>
                    </p>
                    
                    <p className="flex items-start gap-2">
                      <Rocket className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      <span>Aqui, você aprenderá a <strong className="text-purple-300">evoluir de dentro pra fora</strong>. Meu e-book é dinâmico e didático. Convido você, para dar os primeiros passos e transformar sua mentalidade hoje!</span>
                    </p>
                    
                    <p className="flex items-start gap-2">
                      <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                      <span>Aprendendo a <strong className="text-blue-300">crescer nas redes sociais</strong>, alcançando muitos com o mesmo propósito de vida. <strong className="text-white">Conte comigo.</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/30">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span className="text-pink-300 text-sm font-semibold">20+ Anos</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-500/30">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 text-sm font-semibold">Mentor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-3xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-pink-500/50 rounded-2xl p-8 md:p-12 text-center">
              <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                <p className="text-white font-bold">Oferta Especial</p>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comece Sua Transformação
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Invista no seu crescimento digital hoje mesmo
              </p>

              <div className="mb-8">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text mb-2">
                  R$ 89,99
                </div>
                <p className="text-gray-400">Investimento único</p>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 mb-8 text-left">
                <p className="text-white font-semibold mb-4 text-center">O que está incluído:</p>
                <ul className="space-y-3">
                  {[
                    'Acesso vitalício ao curso completo',
                    '8 módulos práticos e objetivos',
                    'Material de apoio em PDF',
                    'Templates prontos para usar',
                    'Grupo exclusivo de alunos',
                    'Certificado de conclusão',
                    'Atualizações gratuitas',
                    'Suporte direto com o Julião'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onNavigate}
                className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl font-bold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 mb-6"
              >
                Quero Garantir Minha Vaga Agora
              </button>

              <div className="space-y-2 text-sm">
                <p className="text-gray-400 flex items-center justify-center gap-2">
                  <span className="text-green-400">🔒</span> Pagamento 100% seguro
                </p>
                <p className="text-gray-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Garantia de 7 dias
                </p>
                <p className="text-pink-400 font-semibold flex items-center justify-center gap-2">
                  <span>⚠️</span> Oferta por tempo limitado - Apenas 15 vagas restantes
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 mb-8 items-start">
                <div className="text-center md:text-left">
                  <Logo />
                  <p className="text-gray-400 mt-4">
                    Transforme seu engajamento em crescimento real.
                  </p>
                  <div className="mt-6">
                    <h4 className="text-white font-semibold mb-3">Contato</h4>
                    <a 
                      href="https://wa.me/5519987340006" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      <Phone className="w-5 h-5 fill-current" />
                      <span>(19) 98734-0006</span>
                    </a>
                    <p className="text-gray-500 text-xs mt-2">Somente via WhatsApp</p>
                  </div>
                </div>

                <div className="flex items-start justify-center md:justify-start mt-16">
                  <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-lg p-6 max-w-md w-full animate-float-fade-delayed">
                    <div className="text-left">
                      <Sparkles className="w-8 h-8 text-pink-400 mb-3" />
                      <h4 className="text-white font-bold mb-2">Seu Sucesso Começa Aqui</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Cada curtida é uma oportunidade. Cada comentário, uma conexão. Cada compartilhamento, um novo começo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                <p>© 2025 Fórmula Engajamento. Todos os direitos reservados.</p>
                <p className="text-gray-500 text-xs mt-2">CNPJ: 57.579.277/0001-38</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
