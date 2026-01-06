import React from 'react';
interface HeroProps {
  onGetStarted: () => void;
}
const Hero: React.FC<HeroProps> = ({
  onGetStarted
}) => {
  return <div className="relative h-[500px] flex items-center justify-center text-center px-4" style={{
    backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/690baee8a07244980a411d53_1762373398505_ae454211.webp)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-900/40"></div>
      
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">A PALAVRA</h1>
        <p className="text-xl text-white/90 mb-8">
          Receba um versículo bíblico especial a cada dia, escolhido de acordo com seu estado emocional
        </p>
        <button onClick={onGetStarted} className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg text-lg">
          Começar Jornada
        </button>
      </div>
    </div>;
};
export default Hero;