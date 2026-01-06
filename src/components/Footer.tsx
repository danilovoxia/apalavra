import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, MessageCircle, HelpCircle, Instagram, Info, FileText, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="text-white font-bold text-lg">A Palavra</span>
            </div>
            <p className="text-sm text-cyan-200/70 mb-4">Conectando você com a sabedoria bíblica através de reflexões diárias personalizadas.</p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com/apalavra_ap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity group"
                aria-label="Siga-nos no Instagram"
              >
                <Instagram className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-cyan-200/70 hover:text-white transition-colors">Versículos</a></li>
              <li><a href="#" className="text-cyan-200/70 hover:text-white transition-colors">Diário</a></li>
              <li><a href="#" className="text-cyan-200/70 hover:text-white transition-colors">Planos</a></li>
              <li>
                <Link to="/sobre" className="text-cyan-200/70 hover:text-white transition-colors flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contato" className="text-cyan-200/70 hover:text-white transition-colors flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/contato#faq" className="text-cyan-200/70 hover:text-white transition-colors flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </Link>
              </li>
            </ul>
            
            <h4 className="text-white font-semibold mb-4 mt-6">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/termos" className="text-cyan-200/70 hover:text-white transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-cyan-200/70 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="mailto:apalavra.ap.contato@gmail.com" 
                  className="text-cyan-200/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  apalavra.ap.contato@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/apalavra_ap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-200/70 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  @apalavra_ap
                </a>
              </li>
              <li className="pt-2">
                <Link 
                  to="/contato" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-700/50 hover:bg-cyan-600/50 rounded-lg text-cyan-100 hover:text-white transition-all text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar mensagem
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cyan-700/50 mt-8 pt-8 text-center text-sm">
          <p className="flex items-center justify-center gap-1 text-cyan-200/70">
            Feito com <Heart className="w-4 h-4 text-amber-400 fill-current" /> © 2025 A Palavra
          </p>
          <p className="mt-2 text-cyan-300/50 text-xs">
            <Link to="/termos" className="hover:text-cyan-200 transition-colors">Termos de Uso</Link>
            {' • '}
            <Link to="/privacidade" className="hover:text-cyan-200 transition-colors">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
