import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Scale, 
  RefreshCw,
  Mail,
  ArrowLeft,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TermosPage: React.FC = () => {
  const lastUpdated = "15 de dezembro de 2025";

  const sections = [
    {
      id: "aceitacao",
      icon: CheckCircle,
      title: "1. Aceitação dos Termos",
      content: `Ao acessar e utilizar o aplicativo "A Palavra", você concorda em cumprir e estar vinculado aos presentes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.

Estes Termos de Uso constituem um acordo legal entre você ("Usuário") e A Palavra ("Empresa", "nós" ou "nosso"). Ao criar uma conta ou utilizar qualquer funcionalidade do aplicativo, você declara ter lido, compreendido e aceito integralmente estes termos.

Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas através do aplicativo ou por e-mail. O uso continuado do serviço após tais modificações constitui aceitação dos novos termos.`
    },
    {
      id: "servicos",
      icon: BookOpen,
      title: "2. Descrição dos Serviços",
      content: `O aplicativo "A Palavra" oferece os seguintes serviços:

• Versículos Diários Personalizados: Seleção de versículos bíblicos baseados no estado emocional do usuário
• Diário de Reflexões: Ferramenta para registro de reflexões pessoais e espirituais
• Compartilhamento de Versículos: Funcionalidade para criar e compartilhar imagens com versículos
• Favoritos: Sistema para salvar versículos preferidos
• Planos de Assinatura: Acesso a recursos premium mediante pagamento

Os serviços são fornecidos "como estão" e podem ser modificados, suspensos ou descontinuados a qualquer momento, com ou sem aviso prévio, sem que isso gere direito a indenização.`
    },
    {
      id: "conta",
      icon: Users,
      title: "3. Conta do Usuário",
      content: `Para utilizar determinadas funcionalidades, você deverá criar uma conta fornecendo informações precisas e completas. Você é responsável por:

• Manter a confidencialidade de suas credenciais de acesso
• Todas as atividades realizadas em sua conta
• Notificar-nos imediatamente sobre qualquer uso não autorizado
• Manter suas informações de cadastro atualizadas

Requisitos para criação de conta:
• Ter pelo menos 13 anos de idade (ou idade mínima legal em sua jurisdição)
• Fornecer um endereço de e-mail válido
• Não criar múltiplas contas para o mesmo usuário
• Não utilizar identidade falsa ou de terceiros

Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio e sem direito a reembolso.`
    },
    {
      id: "assinatura",
      icon: CreditCard,
      title: "4. Assinaturas e Pagamentos",
      content: `Oferecemos planos de assinatura com diferentes níveis de acesso:

Plano Gratuito:
• Acesso a versículos diários limitados
• Funcionalidades básicas do diário
• Compartilhamento com marca d'água

Plano Premium (Mensal/Anual):
• Acesso ilimitado a todos os versículos
• Diário completo com recursos avançados
• Compartilhamento sem marca d'água
• Suporte prioritário
• Novos recursos em primeira mão

Condições de Pagamento:
• Os pagamentos são processados através de plataformas seguras (Stripe)
• As assinaturas são renovadas automaticamente ao final de cada período
• Os preços podem ser alterados com aviso prévio de 30 dias
• Impostos aplicáveis serão adicionados conforme sua localização

Reembolsos:
• Solicitações de reembolso devem ser feitas em até 7 dias após a cobrança
• Reembolsos são analisados caso a caso
• Não há reembolso proporcional por cancelamento antecipado`
    },
    {
      id: "cancelamento",
      icon: RefreshCw,
      title: "5. Cancelamento de Assinatura",
      content: `Você pode cancelar sua assinatura a qualquer momento através das seguintes opções:

Como Cancelar:
• Através das configurações do aplicativo na seção "Minha Assinatura"
• Enviando e-mail para apalavra.ap.contato@gmail.com
• Através da plataforma de pagamento (App Store, Google Play ou Stripe)

Efeitos do Cancelamento:
• O acesso premium permanece ativo até o final do período já pago
• Após o término, sua conta será convertida para o plano gratuito
• Seus dados e favoritos serão mantidos por até 12 meses
• Você pode reativar a assinatura a qualquer momento

Cancelamento pela Empresa:
Reservamo-nos o direito de cancelar sua assinatura em caso de:
• Violação dos Termos de Uso
• Atividade fraudulenta
• Uso abusivo dos serviços
• Inadimplência

Em caso de cancelamento por nossa parte sem justa causa, você receberá reembolso proporcional ao período não utilizado.`
    },
    {
      id: "uso-aceitavel",
      icon: Shield,
      title: "6. Uso Aceitável",
      content: `Ao utilizar nossos serviços, você concorda em NÃO:

Condutas Proibidas:
• Violar qualquer lei ou regulamento aplicável
• Infringir direitos de propriedade intelectual de terceiros
• Transmitir conteúdo ofensivo, difamatório ou ilegal
• Tentar acessar áreas restritas do sistema
• Realizar engenharia reversa do aplicativo
• Utilizar bots, scrapers ou ferramentas automatizadas
• Compartilhar sua conta com terceiros
• Revender ou redistribuir nosso conteúdo
• Interferir no funcionamento do serviço
• Coletar dados de outros usuários

Conteúdo do Usuário:
• Você mantém os direitos sobre o conteúdo que cria (reflexões, anotações)
• Ao compartilhar conteúdo, você nos concede licença para exibi-lo
• Não nos responsabilizamos por conteúdo criado por usuários
• Conteúdo que viole estes termos será removido`
    },
    {
      id: "propriedade",
      icon: FileText,
      title: "7. Propriedade Intelectual",
      content: `Todo o conteúdo do aplicativo "A Palavra" é protegido por direitos autorais:

Nossos Direitos:
• Design, layout e interface do aplicativo
• Logotipos, marcas e identidade visual
• Código-fonte e tecnologia proprietária
• Seleção e organização de versículos
• Materiais de marketing e comunicação

Conteúdo Bíblico:
• Os textos bíblicos são de domínio público
• Nossa apresentação e formatação são protegidas
• Traduções específicas podem ter direitos de terceiros

Licença de Uso:
Concedemos a você uma licença limitada, não exclusiva, intransferível e revogável para:
• Acessar e usar o aplicativo para fins pessoais
• Baixar e armazenar conteúdo para uso offline
• Compartilhar versículos através das funcionalidades do app

Esta licença não inclui:
• Uso comercial sem autorização
• Modificação ou criação de obras derivadas
• Distribuição ou sublicenciamento`
    },
    {
      id: "limitacao",
      icon: AlertTriangle,
      title: "8. Limitação de Responsabilidade",
      content: `ISENÇÃO DE GARANTIAS:
Os serviços são fornecidos "como estão" e "conforme disponíveis", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a:
• Garantias de comercialização
• Adequação a um propósito específico
• Não violação de direitos de terceiros
• Disponibilidade ininterrupta do serviço

LIMITAÇÃO DE DANOS:
Em nenhuma circunstância seremos responsáveis por:
• Danos indiretos, incidentais ou consequenciais
• Perda de dados, lucros ou oportunidades de negócio
• Danos resultantes de acesso não autorizado
• Falhas de terceiros (provedores, processadores de pagamento)

RESPONSABILIDADE MÁXIMA:
Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses de assinatura.

EXCEÇÕES:
Estas limitações não se aplicam onde proibidas por lei, incluindo casos de dolo ou negligência grave.`
    },
    {
      id: "privacidade",
      icon: Shield,
      title: "9. Privacidade e Dados",
      content: `A coleta e uso de seus dados pessoais são regidos por nossa Política de Privacidade, que é parte integrante destes Termos de Uso.

Principais pontos:
• Coletamos apenas dados necessários para o funcionamento do serviço
• Seus dados são armazenados de forma segura e criptografada
• Não vendemos suas informações pessoais a terceiros
• Você pode solicitar exclusão de seus dados a qualquer momento
• Utilizamos cookies para melhorar sua experiência

Para informações completas sobre como tratamos seus dados, consulte nossa Política de Privacidade.`
    },
    {
      id: "disposicoes",
      icon: Scale,
      title: "10. Disposições Gerais",
      content: `Lei Aplicável:
Estes Termos são regidos pelas leis da República Federativa do Brasil, independentemente de conflitos de princípios legais.

Foro:
Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia a qualquer outro, por mais privilegiado que seja.

Acordo Integral:
Estes Termos constituem o acordo integral entre você e A Palavra, substituindo quaisquer acordos anteriores.

Independência das Cláusulas:
Se qualquer disposição destes Termos for considerada inválida, as demais permanecerão em pleno vigor.

Renúncia:
A falha em exercer qualquer direito não constitui renúncia ao mesmo.

Cessão:
Você não pode ceder seus direitos ou obrigações sem nosso consentimento prévio por escrito.

Comunicações:
Comunicações oficiais serão enviadas para o e-mail cadastrado em sua conta.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-cyan-600 via-teal-600 to-cyan-700 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-amber-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-cyan-200 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Termos de Uso</h1>
                <p className="text-cyan-200">Última atualização: {lastUpdated}</p>
              </div>
            </div>
            
            <p className="text-lg text-cyan-100 max-w-2xl">
              Por favor, leia atentamente estes Termos de Uso antes de utilizar o aplicativo "A Palavra". 
              Ao acessar ou usar nossos serviços, você concorda com estes termos.
            </p>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="bg-white border-b border-cyan-100 sticky top-0 z-20 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto pb-2">
              <span className="font-medium text-cyan-700 whitespace-nowrap">Ir para:</span>
              {sections.slice(0, 5).map((section, index) => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-3 py-1 bg-cyan-50 hover:bg-cyan-100 rounded-full text-cyan-700 transition-colors whitespace-nowrap"
                >
                  {index + 1}. {section.title.split('. ')[1]?.split(' ')[0]}
                </a>
              ))}
              <span className="text-gray-400">...</span>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <div 
                    key={section.id} 
                    id={section.id}
                    className="bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden scroll-mt-24"
                  >
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">{section.title}</h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-cyan max-w-none">
                        {section.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-gray-700 leading-relaxed whitespace-pre-line mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl p-8 text-white text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">Dúvidas sobre os Termos?</h3>
              <p className="text-cyan-100 mb-6 max-w-lg mx-auto">
                Se você tiver qualquer dúvida sobre estes Termos de Uso, entre em contato conosco.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:apalavra.ap.contato@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-cyan-700 font-semibold rounded-xl hover:bg-cyan-50 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Enviar E-mail
                </a>
                <Link 
                  to="/privacidade"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/30 text-white font-semibold rounded-xl hover:bg-cyan-500/50 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Política de Privacidade
                </Link>
              </div>
            </div>

            {/* Back to Top */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
              >
                ↑ Voltar ao topo
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermosPage;
