import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  Clock,
  Heart,
  BookOpen,
  Crown,
  Shield,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'O que é o A Palavra?',
    answer: 'A Palavra é um aplicativo de versículos bíblicos personalizados que oferece reflexões diárias baseadas no seu estado emocional. Nossa missão é conectar você com a sabedoria bíblica de forma significativa e pessoal, ajudando você a encontrar conforto, orientação e inspiração nas Escrituras.',
    category: 'Geral'
  },
  {
    id: '2',
    question: 'Como funciona a seleção de versículos por emoção?',
    answer: 'Ao acessar o aplicativo, você pode selecionar como está se sentindo no momento (ansioso, grato, triste, esperançoso, etc.). Com base na sua escolha, nosso sistema seleciona versículos bíblicos cuidadosamente curados que se relacionam com esse estado emocional, oferecendo palavras de conforto, encorajamento ou reflexão.',
    category: 'Funcionalidades'
  },
  {
    id: '3',
    question: 'Preciso criar uma conta para usar o aplicativo?',
    answer: 'Não é obrigatório criar uma conta para acessar os versículos diários. No entanto, ao criar uma conta gratuita, você pode salvar seus versículos favoritos, manter um diário de reflexões e sincronizar seus dados entre dispositivos. Usuários Premium têm acesso a recursos adicionais.',
    category: 'Conta'
  },
  {
    id: '4',
    question: 'O que está incluído no plano Premium?',
    answer: 'O plano Premium oferece: acesso ilimitado a todos os versículos e reflexões, diário de reflexões completo sem limites, versículos personalizados por IA, compartilhamento de imagens personalizadas, sincronização em tempo real entre dispositivos, e suporte prioritário. Você pode escolher entre planos mensais, trimestrais ou anuais.',
    category: 'Premium'
  },
  {
    id: '5',
    question: 'Como posso cancelar minha assinatura Premium?',
    answer: 'Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta ou entrando em contato conosco pelo email apalavra.ap.contato@gmail.com. Após o cancelamento, você continuará tendo acesso aos recursos Premium até o final do período já pago.',
    category: 'Premium'
  },
  {
    id: '6',
    question: 'Meus favoritos são sincronizados entre dispositivos?',
    answer: 'Sim! Se você estiver logado na sua conta, seus versículos favoritos são automaticamente sincronizados entre todos os seus dispositivos. Mesmo se você salvar favoritos offline, eles serão sincronizados assim que você se conectar à internet. Utilizamos um sistema inteligente que evita duplicatas e resolve conflitos automaticamente.',
    category: 'Funcionalidades'
  },
  {
    id: '7',
    question: 'Posso usar o aplicativo offline?',
    answer: 'Sim! O A Palavra funciona offline para recursos básicos. Você pode acessar versículos já carregados e salvar favoritos mesmo sem conexão. Quando você voltar a ficar online, todas as suas ações serão sincronizadas automaticamente com sua conta.',
    category: 'Funcionalidades'
  },
  {
    id: '8',
    question: 'Como compartilho um versículo nas redes sociais?',
    answer: 'Cada versículo possui um botão de compartilhamento. Ao clicar, você pode criar uma imagem personalizada com o versículo, escolhendo entre diferentes fundos e estilos. Depois, é só compartilhar diretamente no WhatsApp, Instagram, Facebook, Twitter ou baixar a imagem para usar onde quiser.',
    category: 'Funcionalidades'
  },
  {
    id: '9',
    question: 'Qual tradução da Bíblia é utilizada?',
    answer: 'Atualmente utilizamos principalmente a tradução Almeida Revista e Atualizada (ARA), conhecida por sua fidelidade ao texto original e linguagem acessível. Estamos trabalhando para adicionar mais traduções em futuras atualizações.',
    category: 'Geral'
  },
  {
    id: '10',
    question: 'Como posso reportar um problema ou sugerir melhorias?',
    answer: 'Adoramos ouvir nossos usuários! Você pode entrar em contato conosco através do formulário nesta página ou enviando um email diretamente para apalavra.ap.contato@gmail.com. Lemos todas as mensagens e trabalhamos constantemente para melhorar o aplicativo com base no feedback da comunidade.',
    category: 'Suporte'
  },
  {
    id: '11',
    question: 'O aplicativo é gratuito?',
    answer: 'Sim! O A Palavra oferece uma versão gratuita com acesso a versículos diários, seleção por emoção, e recursos básicos de favoritos. Para usuários que desejam uma experiência mais completa, oferecemos planos Premium com recursos adicionais.',
    category: 'Geral'
  },
  {
    id: '12',
    question: 'Meus dados estão seguros?',
    answer: 'Absolutamente! Levamos a segurança dos seus dados muito a sério. Utilizamos criptografia de ponta a ponta, servidores seguros, e seguimos as melhores práticas de proteção de dados. Nunca compartilhamos suas informações pessoais com terceiros. Você pode ler mais em nossa Política de Privacidade.',
    category: 'Segurança'
  }
];

const categories = ['Todos', 'Geral', 'Funcionalidades', 'Conta', 'Premium', 'Suporte', 'Segurança'];

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos do formulário.',
        variant: 'destructive'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um endereço de email válido.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call - in production, this would send to a backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mailto link as fallback
      const mailtoLink = `mailto:apalavra.ap.contato@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Nome: ${formData.name}\nEmail: ${formData.email}\n\nMensagem:\n${formData.message}`
      )}`;
      
      setSubmitStatus('success');
      toast({
        title: 'Mensagem enviada!',
        description: 'Recebemos sua mensagem e responderemos em breve.',
      });
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Open mailto as backup
      window.open(mailtoLink, '_blank');
      
    } catch (error) {
      setSubmitStatus('error');
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um erro. Tente novamente ou envie email diretamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQs = selectedCategory === 'Todos' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Geral': return <HelpCircle className="w-4 h-4" />;
      case 'Funcionalidades': return <Smartphone className="w-4 h-4" />;
      case 'Conta': return <Shield className="w-4 h-4" />;
      case 'Premium': return <Crown className="w-4 h-4" />;
      case 'Suporte': return <MessageCircle className="w-4 h-4" />;
      case 'Segurança': return <Shield className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
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
            
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-cyan-100 text-sm mb-6">
            <MessageCircle className="w-4 h-4" />
            Estamos aqui para ajudar
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Tem alguma dúvida, sugestão ou precisa de ajuda? 
            Nossa equipe está pronta para atendê-lo.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Envie sua mensagem</h2>
                    <p className="text-gray-500 text-sm">Responderemos o mais breve possível</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-white"
                      required
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="Dúvida geral">Dúvida geral</option>
                      <option value="Suporte técnico">Suporte técnico</option>
                      <option value="Assinatura Premium">Assinatura Premium</option>
                      <option value="Sugestão de melhoria">Sugestão de melhoria</option>
                      <option value="Reportar problema">Reportar problema</option>
                      <option value="Parceria">Parceria</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Escreva sua mensagem aqui..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : submitStatus === 'success'
                        ? 'bg-green-500 hover:bg-green-600'
                        : submitStatus === 'error'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Mensagem enviada!
                      </>
                    ) : submitStatus === 'error' ? (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Erro ao enviar
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar mensagem
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Email Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h2>
                
                <div className="space-y-6">
                  <a 
                    href="mailto:apalavra.ap.contato@gmail.com"
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100 hover:border-cyan-300 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-cyan-600 font-medium">apalavra.ap.contato@gmail.com</p>
                      <p className="text-gray-500 text-sm mt-1">Resposta em até 24 horas úteis</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horário de Atendimento</h3>
                      <p className="text-gray-600">Segunda a Sexta</p>
                      <p className="text-gray-500 text-sm">9h às 18h (Horário de Brasília)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Links Úteis</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/"
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 transition-all text-sm font-medium"
                  >
                    <BookOpen className="w-4 h-4" />
                    Versículos
                  </Link>
                  <Link 
                    to="/"
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 transition-all text-sm font-medium"
                  >
                    <Heart className="w-4 h-4" />
                    Favoritos
                  </Link>
                  <Link 
                    to="/"
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-600 transition-all text-sm font-medium"
                  >
                    <Crown className="w-4 h-4" />
                    Premium
                  </Link>
                  <Link 
                    to="/"
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all text-sm font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    Privacidade
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 rounded-full text-cyan-700 text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              Perguntas Frequentes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dúvidas sobre o A Palavra?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encontre respostas para as perguntas mais comuns sobre nosso aplicativo
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 border border-gray-200'
                }`}
              >
                {category !== 'Todos' && getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.category === 'Premium' ? 'bg-amber-100 text-amber-700' :
                      item.category === 'Segurança' ? 'bg-green-100 text-green-700' :
                      item.category === 'Funcionalidades' ? 'bg-blue-100 text-blue-700' :
                      item.category === 'Conta' ? 'bg-purple-100 text-purple-700' :
                      item.category === 'Suporte' ? 'bg-rose-100 text-rose-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.category}
                    </span>
                    <span className="font-medium text-gray-900">{item.question}</span>
                  </div>
                  <div className={`ml-4 flex-shrink-0 transition-transform ${expandedFAQ === item.id ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                
                {expandedFAQ === item.id && (
                  <div className="px-5 pb-5">
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-2">Ainda tem dúvidas?</h3>
              <p className="text-cyan-100 mb-6">
                Nossa equipe está pronta para ajudar você com qualquer questão
              </p>
              <a
                href="mailto:apalavra.ap.contato@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-cyan-600 rounded-xl font-semibold hover:bg-cyan-50 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Enviar email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="text-white font-bold text-lg">A Palavra</span>
            </div>
            
            <p className="flex items-center gap-1 text-cyan-200/70 text-sm">
              Feito com <Heart className="w-4 h-4 text-amber-400 fill-current" /> © 2025 A Palavra
            </p>
            
            <Link 
              to="/"
              className="text-cyan-200/70 hover:text-white transition-colors text-sm"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
