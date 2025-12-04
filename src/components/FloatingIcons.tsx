import { Heart, MessageCircle, Share2, Star, Sparkles, Lightbulb, Users, TrendingUp, Zap, BarChart3, Target, Award, Rocket, Globe } from 'lucide-react';

function FloatingIcons() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <Heart className="fixed top-[5vh] left-[10%] w-8 h-8 text-pink-500/20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
      <MessageCircle className="fixed top-[12vh] right-[15%] w-10 h-10 text-purple-500/20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
      <Share2 className="fixed top-[20vh] left-[5%] w-7 h-7 text-pink-400/20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
      <Star className="fixed top-[28vh] right-[8%] w-9 h-9 text-yellow-400/20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
      <TrendingUp className="fixed top-[35vh] left-[12%] w-11 h-11 text-green-400/20 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.8s' }} />
      <Users className="fixed top-[42vh] right-[20%] w-8 h-8 text-blue-400/20 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4.2s' }} />
      <Sparkles className="fixed top-[50vh] right-[25%] w-6 h-6 text-pink-300/20 animate-bounce" style={{ animationDelay: '3s', animationDuration: '3.3s' }} />
      <Zap className="fixed top-[58vh] left-[18%] w-7 h-7 text-purple-300/20 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '4s' }} />
      <BarChart3 className="fixed top-[65vh] right-[5%] w-10 h-10 text-green-300/20 animate-bounce" style={{ animationDelay: '1.8s', animationDuration: '3.6s' }} />
      <Lightbulb className="fixed top-[72vh] left-[25%] w-8 h-8 text-yellow-300/20 animate-bounce" style={{ animationDelay: '2.2s', animationDuration: '4.3s' }} />
      <Target className="fixed top-[80vh] right-[12%] w-9 h-9 text-pink-400/20 animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '3.7s' }} />
      <Award className="fixed top-[88vh] left-[8%] w-8 h-8 text-purple-400/20 animate-bounce" style={{ animationDelay: '2.8s', animationDuration: '4.1s' }} />
      <Rocket className="fixed top-[95vh] right-[18%] w-10 h-10 text-yellow-500/20 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '3.9s' }} />
      
      <Globe className="fixed top-[15vh] left-[22%] w-7 h-7 text-blue-300/20 animate-bounce" style={{ animationDelay: '1.7s', animationDuration: '4.4s' }} />
      <Heart className="fixed top-[38vh] right-[3%] w-6 h-6 text-pink-500/20 animate-bounce" style={{ animationDelay: '2.3s', animationDuration: '3.2s' }} />
      <MessageCircle className="fixed top-[62vh] left-[3%] w-8 h-8 text-purple-400/20 animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '4.6s' }} />
      <Star className="fixed top-[75vh] right-[22%] w-7 h-7 text-yellow-400/20 animate-bounce" style={{ animationDelay: '1.4s', animationDuration: '3.4s' }} />
      <Share2 className="fixed top-[92vh] left-[28%] w-9 h-9 text-pink-300/20 animate-bounce" style={{ animationDelay: '2.6s', animationDuration: '4.8s' }} />
      <Sparkles className="fixed top-[8vh] right-[28%] w-8 h-8 text-purple-300/20 animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '3.1s' }} />
      <TrendingUp className="fixed top-[45vh] left-[30%] w-9 h-9 text-green-400/20 animate-bounce" style={{ animationDelay: '1.9s', animationDuration: '4.7s' }} />
    </div>
  );
}

export default FloatingIcons;
