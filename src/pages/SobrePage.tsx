import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  BookOpen, 
  Share2, 
  Target, 
  Eye, 
  Sparkles,
  Quote,
  TrendingUp,
  Globe,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Mail
} from 'lucide-react';
import Footer from '@/components/Footer';

const SobrePage: React.FC = () => {
  const stats = [
    { icon: BookOpen, value: '50.000+', label: 'Versículos Compartilhados', color: 'from-cyan-500 to-teal-500' },
    { icon: Users, value: '12.000+', label: 'Usuários Ativos', color: 'from-amber-500 to-orange-500' },
    { icon: Share2, value: '25.000+', label: 'Reflexões Salvas', color: 'from-purple-500 to-pink-500' },
    { icon: Globe, value: '15+', label: 'Países Alcançados', color: 'from-emerald-500 to-green-500' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Amor',
      description: 'Acreditamos que o amor é a base de tudo. Cada versículo, cada reflexão é entregue com amor e cuidado.',
      color: 'bg-rose-100 text-rose-600'
    },
    {
      icon: BookOpen,
      title: 'Fidelidade à Palavra',
      description: 'Mantemos total fidelidade às Escrituras Sagradas, preservando a integridade e o significado original.',
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Construímos uma comunidade acolhedora onde todos podem crescer juntos na fé.',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      icon: Sparkles,
      title: 'Excelência',
      description: 'Buscamos a excelência em tudo que fazemos, oferecendo a melhor experiência possível.',
      color: 'bg-purple-100 text-purple-600'
    },
  ];




  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-cyan-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">A Palavra</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/contato" 
                className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contato
              </Link>
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-cyan-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Heart className="w-4 h-4 text-amber-300" />
            <span className="text-cyan-100 text-sm font-medium">Nossa História</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Sobre o <span className="text-amber-300">A Palavra</span>
          </h1>
          
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-8">
            Nascemos do desejo de conectar pessoas com a sabedoria bíblica de forma 
            personalizada, moderna e acessível. Cada versículo é uma semente de esperança.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-white text-cyan-700 px-6 py-3 rounded-xl font-semibold hover:bg-cyan-50 transition-colors"
            >
              Conhecer o App
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="https://instagram.com/apalavra_ap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              <Instagram className="w-5 h-5" />
              Siga-nos
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-cyan-100/50 hover:shadow-xl transition-shadow text-center group"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full mb-6">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Nossa Jornada</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Uma história de <span className="text-cyan-600">fé</span> e <span className="text-amber-500">tecnologia</span>
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  O <strong>A Palavra</strong> nasceu em 2025, fruto de uma visão simples, mas poderosa: 
                  usar a tecnologia para levar a Palavra de Deus ao coração das pessoas de forma 
                  personalizada e significativa.
                </p>
                <p>
                  A ideia de oferecer versículos baseados no estado emocional do usuário surgiu como 
                  uma ponte entre a necessidade humana e a sabedoria divina.
                </p>
                <p>
                  Cada compartilhamento, cada reflexão salva, cada coração tocado nos motiva a 
                  continuar essa missão.
                </p>
              </div>

            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-cyan-200 to-amber-200 rounded-3xl blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-cyan-600 to-teal-700 rounded-3xl p-8 text-white">
                <Quote className="w-12 h-12 text-amber-300 mb-4" />
                <p className="text-xl md:text-2xl font-medium italic mb-6">
                  "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho."
                </p>
                <p className="text-cyan-200">— Salmos 119:105</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision Section */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Missão & Visão
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Guiados por propósito, movidos pela fé
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-cyan-100/50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Nossa Missão</h3>
              <p className="text-gray-600 leading-relaxed">
                Conectar pessoas com a Palavra de Deus de forma personalizada e acessível, 
                oferecendo versículos e reflexões que tocam o coração e transformam vidas. 
                Queremos ser uma ponte entre a sabedoria bíblica milenar e a vida moderna, 
                tornando a leitura bíblica uma experiência diária, relevante e transformadora.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-cyan-100/50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Nossa Visão</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser a principal plataforma de conexão com a Bíblia em língua portuguesa, 
                alcançando milhões de pessoas ao redor do mundo. Sonhamos com um futuro onde 
                cada pessoa possa começar seu dia com uma palavra de esperança, conforto e 
                direção, independente de onde esteja ou qual seja sua situação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Nossos Pilares</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nossos Valores
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Os princípios que guiam cada decisão e cada linha de código
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-cyan-200 hover:shadow-lg transition-all group"
              >
                <div className={`w-14 h-14 ${value.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-br from-cyan-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-medium text-cyan-100">Nosso Impacto</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transformando vidas através da Palavra
            </h2>
            <p className="text-cyan-100 max-w-2xl mx-auto">
              Cada número representa uma vida tocada, um coração aquecido, uma esperança renovada
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-amber-300 mb-2">98%</div>
              <p className="text-cyan-100">dos usuários relatam melhora no bem-estar espiritual</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-amber-300 mb-2">4.9</div>
              <p className="text-cyan-100">avaliação média dos usuários</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-amber-300 mb-2">85%</div>
              <p className="text-cyan-100">usam o app diariamente</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Faça parte dessa história
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já descobriram o poder de começar o dia 
            com a Palavra de Deus. Sua jornada de transformação começa agora.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg shadow-cyan-200"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/contato"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Fale Conosco
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SobrePage;
