import React from 'react';

const WHATS_ADS_URL =
  "https://wa.me/5581994728217?text=" +
  encodeURIComponent("Quero anunciar no A Palavra. Falar com Danilo Portela.");

interface AdBannerProps {
  variant?: 'top' | 'mid' | 'footer';
}

const AdBanner: React.FC<AdBannerProps> = ({ variant = 'mid' }) => {
  return (
    <div className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
      <div>
        <h4 className="text-lg font-bold">Anuncie aqui</h4>
        <p className="text-sm opacity-90">
          Sua marca conectada a uma audiência engajada e recorrente
        </p>
      </div>

      <a
        href={WHATS_ADS_URL}
        target="_blank"
        rel="noreferrer"
        className="bg-white text-cyan-700 font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition"
      >
        Falar com Danilo
      </a>
    </div>
  );
};

export default AdBanner;
