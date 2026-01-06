import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Database, 
  Cookie, 
  UserCheck, 
  Lock, 
  Share2, 
  Trash2,
  Mail,
  ArrowLeft,
  Eye,
  Server,
  Globe,
  Bell,
  FileText,
  Baby
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PrivacidadePage: React.FC = () => {
  const lastUpdated = "15 de dezembro de 2025";

  const sections = [
    {
      id: "introducao",
      icon: Shield,
      title: "1. Introdução",
      content: `A Palavra ("nós", "nosso" ou "Empresa") está comprometida em proteger a privacidade dos usuários do nosso aplicativo. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais.

Esta política se aplica a todos os usuários do aplicativo "A Palavra", incluindo visitantes, usuários registrados e assinantes premium.

Ao utilizar nossos serviços, você concorda com a coleta e uso de informações de acordo com esta política. Se você não concordar com qualquer parte desta política, recomendamos que não utilize nossos serviços.

Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e outras legislações aplicáveis de proteção de dados.`
    },
    {
      id: "coleta",
      icon: Database,
      title: "2. Dados que Coletamos",
      content: `Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:

DADOS FORNECIDOS POR VOCÊ:
• Informações de Cadastro: Nome, e-mail, senha (criptografada)
• Perfil: Foto de perfil (opcional), preferências de versículos
• Conteúdo do Usuário: Reflexões, anotações, favoritos
• Comunicações: Mensagens de suporte, feedback

DADOS COLETADOS AUTOMATICAMENTE:
• Dados de Uso: Páginas visitadas, funcionalidades utilizadas, tempo de uso
• Dados do Dispositivo: Tipo de dispositivo, sistema operacional, versão do app
• Dados de Conexão: Endereço IP, provedor de internet, localização aproximada
• Dados de Performance: Erros, crashes, tempo de carregamento

DADOS DE TERCEIROS:
• Login Social: Se você usar login com Google ou Apple, recebemos nome e e-mail
• Processadores de Pagamento: Confirmação de transações (não armazenamos dados de cartão)

DADOS SENSÍVEIS:
• Estado Emocional: Coletamos informações sobre seu estado emocional para personalizar versículos
• Estes dados são tratados com especial cuidado e nunca compartilhados com terceiros`
    },
    {
      id: "uso",
      icon: Eye,
      title: "3. Como Usamos seus Dados",
      content: `Utilizamos suas informações para os seguintes propósitos:

FORNECIMENTO DO SERVIÇO:
• Criar e gerenciar sua conta
• Personalizar versículos baseados em seu estado emocional
• Sincronizar seus dados entre dispositivos
• Processar pagamentos de assinatura
• Salvar suas reflexões e favoritos

MELHORIA DO SERVIÇO:
• Analisar padrões de uso para melhorar funcionalidades
• Identificar e corrigir problemas técnicos
• Desenvolver novos recursos baseados em feedback
• Realizar pesquisas e análises estatísticas

COMUNICAÇÃO:
• Enviar notificações sobre versículos diários (se autorizado)
• Informar sobre atualizações importantes do serviço
• Responder a solicitações de suporte
• Enviar comunicações de marketing (com seu consentimento)

SEGURANÇA E LEGAL:
• Detectar e prevenir fraudes
• Cumprir obrigações legais
• Proteger direitos e segurança dos usuários
• Resolver disputas e fazer cumprir nossos termos`
    },
    {
      id: "cookies",
      icon: Cookie,
      title: "4. Cookies e Tecnologias Similares",
      content: `Utilizamos cookies e tecnologias similares para melhorar sua experiência:

O QUE SÃO COOKIES:
Cookies são pequenos arquivos de texto armazenados em seu dispositivo que nos ajudam a reconhecê-lo e lembrar suas preferências.

TIPOS DE COOKIES QUE USAMOS:

Cookies Essenciais:
• Necessários para o funcionamento do aplicativo
• Mantêm você logado durante a sessão
• Não podem ser desativados

Cookies de Preferências:
• Lembram suas configurações e preferências
• Idioma, tema (claro/escuro), tamanho de fonte
• Podem ser desativados nas configurações

Cookies de Análise:
• Nos ajudam a entender como você usa o app
• Coletam dados anônimos e agregados
• Utilizamos Google Analytics
• Podem ser desativados nas configurações

Cookies de Marketing:
• Usados apenas com seu consentimento explícito
• Permitem comunicações personalizadas
• Podem ser desativados a qualquer momento

COMO GERENCIAR COOKIES:
• Nas configurações do aplicativo
• Nas configurações do seu navegador
• Através do banner de consentimento`
    },
    {
      id: "compartilhamento",
      icon: Share2,
      title: "5. Compartilhamento de Dados",
      content: `Não vendemos suas informações pessoais. Compartilhamos dados apenas nas seguintes situações:

PRESTADORES DE SERVIÇO:
Compartilhamos dados com empresas que nos ajudam a operar o serviço:
• Supabase: Armazenamento de dados e autenticação
• Stripe: Processamento de pagamentos
• Google Analytics: Análise de uso
• Serviços de e-mail: Envio de comunicações

Todos os prestadores estão sujeitos a acordos de confidencialidade e processam dados apenas conforme nossas instruções.

REQUISITOS LEGAIS:
Podemos divulgar informações quando exigido por lei:
• Ordens judiciais ou intimações
• Solicitações de autoridades governamentais
• Proteção de direitos legais
• Investigação de fraudes

TRANSFERÊNCIAS EMPRESARIAIS:
Em caso de fusão, aquisição ou venda de ativos, seus dados podem ser transferidos. Você será notificado sobre qualquer mudança de propriedade.

DADOS AGREGADOS:
Podemos compartilhar estatísticas agregadas e anônimas que não identificam você individualmente.

COM SEU CONSENTIMENTO:
Compartilharemos dados com terceiros apenas com sua autorização explícita.`
    },
    {
      id: "armazenamento",
      icon: Server,
      title: "6. Armazenamento e Segurança",
      content: `Implementamos medidas técnicas e organizacionais para proteger seus dados:

ONDE ARMAZENAMOS:
• Servidores seguros na nuvem (Supabase/AWS)
• Data centers localizados nos Estados Unidos e Europa
• Backups redundantes em múltiplas localizações

MEDIDAS DE SEGURANÇA:
• Criptografia em trânsito (TLS/SSL)
• Criptografia em repouso (AES-256)
• Senhas armazenadas com hash seguro (bcrypt)
• Autenticação de dois fatores disponível
• Monitoramento contínuo de segurança
• Testes regulares de vulnerabilidade

PERÍODO DE RETENÇÃO:
• Dados da conta: Enquanto a conta estiver ativa
• Após exclusão: Até 30 dias para backup
• Dados de uso: 24 meses
• Dados de pagamento: Conforme exigências fiscais (5 anos)
• Logs de segurança: 12 meses

INCIDENTES DE SEGURANÇA:
Em caso de violação de dados que afete suas informações, notificaremos você e as autoridades competentes dentro de 72 horas, conforme exigido pela LGPD.`
    },
    {
      id: "direitos",
      icon: UserCheck,
      title: "7. Seus Direitos (LGPD)",
      content: `De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:

DIREITO DE ACESSO:
Você pode solicitar uma cópia de todos os dados pessoais que mantemos sobre você.

DIREITO DE CORREÇÃO:
Você pode corrigir dados incompletos, inexatos ou desatualizados.

DIREITO DE EXCLUSÃO:
Você pode solicitar a exclusão de seus dados pessoais, exceto quando houver obrigação legal de retenção.

DIREITO DE PORTABILIDADE:
Você pode solicitar seus dados em formato estruturado para transferência a outro serviço.

DIREITO DE OPOSIÇÃO:
Você pode se opor ao processamento de seus dados para determinadas finalidades.

DIREITO DE REVOGAÇÃO:
Você pode revogar consentimentos previamente concedidos a qualquer momento.

DIREITO À INFORMAÇÃO:
Você tem direito a informações claras sobre como seus dados são tratados.

COMO EXERCER SEUS DIREITOS:
• Através das configurações do aplicativo
• Enviando e-mail para: apalavra.ap.contato@gmail.com
• Prazo de resposta: até 15 dias úteis

ENCARREGADO DE DADOS (DPO):
Para questões relacionadas à proteção de dados, entre em contato com nosso Encarregado de Dados através do e-mail: apalavra.ap.contato@gmail.com`
    },
    {
      id: "menores",
      icon: Baby,
      title: "8. Privacidade de Menores",
      content: `A proteção da privacidade de crianças é especialmente importante para nós:

IDADE MÍNIMA:
• Nosso serviço é destinado a usuários com 13 anos ou mais
• Se você tem menos de 18 anos, deve ter autorização dos pais ou responsáveis

COLETA DE DADOS DE MENORES:
• Não coletamos intencionalmente dados de menores de 13 anos
• Se tomarmos conhecimento de que coletamos dados de uma criança sem consentimento parental, excluiremos essas informações imediatamente

RESPONSABILIDADE DOS PAIS:
• Pais e responsáveis devem supervisionar o uso do aplicativo por menores
• Recomendamos que pais conversem com seus filhos sobre segurança online

DENÚNCIAS:
Se você acredita que coletamos informações de um menor de 13 anos, entre em contato imediatamente através do e-mail: apalavra.ap.contato@gmail.com`
    },
    {
      id: "internacional",
      icon: Globe,
      title: "9. Transferências Internacionais",
      content: `Seus dados podem ser transferidos e processados em países fora do Brasil:

LOCALIZAÇÕES:
• Estados Unidos (servidores principais)
• União Europeia (backup e redundância)

SALVAGUARDAS:
Garantimos proteção adequada através de:
• Cláusulas contratuais padrão aprovadas
• Certificações de privacidade (Privacy Shield, quando aplicável)
• Acordos de processamento de dados com todos os fornecedores

SEUS DIREITOS:
Independentemente de onde seus dados são processados, você mantém todos os direitos previstos na LGPD e nesta Política de Privacidade.

BASE LEGAL:
As transferências são realizadas com base em:
• Seu consentimento
• Execução de contrato
• Cumprimento de obrigação legal
• Interesse legítimo (quando aplicável)`
    },
    {
      id: "notificacoes",
      icon: Bell,
      title: "10. Comunicações e Notificações",
      content: `Podemos enviar diferentes tipos de comunicações:

COMUNICAÇÕES TRANSACIONAIS:
• Confirmação de cadastro e pagamentos
• Alterações na conta ou assinatura
• Alertas de segurança
• Estas não podem ser desativadas

COMUNICAÇÕES DE SERVIÇO:
• Atualizações importantes do aplicativo
• Mudanças nos termos ou políticas
• Manutenções programadas

COMUNICAÇÕES DE MARKETING:
• Novidades e recursos do aplicativo
• Promoções e ofertas especiais
• Newsletter com conteúdo inspiracional
• Podem ser desativadas a qualquer momento

NOTIFICAÇÕES PUSH:
• Versículo do dia
• Lembretes de reflexão
• Podem ser configuradas nas preferências

COMO GERENCIAR:
• Configurações do aplicativo > Notificações
• Link de descadastro em cada e-mail
• Solicitação por e-mail para apalavra.ap.contato@gmail.com`
    },
    {
      id: "alteracoes",
      icon: FileText,
      title: "11. Alterações nesta Política",
      content: `Podemos atualizar esta Política de Privacidade periodicamente:

QUANDO ATUALIZAMOS:
• Para refletir mudanças em nossas práticas
• Para cumprir novos requisitos legais
• Para melhorar a clareza e transparência

COMO NOTIFICAMOS:
• Aviso destacado no aplicativo
• E-mail para usuários registrados
• Atualização da data "Última modificação"

ALTERAÇÕES SIGNIFICATIVAS:
Para mudanças materiais que afetem como usamos seus dados:
• Notificação com pelo menos 30 dias de antecedência
• Solicitação de novo consentimento quando necessário
• Opção de exclusão da conta se não concordar

HISTÓRICO:
Mantemos versões anteriores desta política disponíveis mediante solicitação.

SEU CONSENTIMENTO:
O uso continuado do serviço após alterações constitui aceitação da nova política.`
    },
    {
      id: "contato",
      icon: Mail,
      title: "12. Contato",
      content: `Para questões sobre esta Política de Privacidade ou sobre seus dados pessoais:

E-MAIL:
apalavra.ap.contato@gmail.com

INSTAGRAM:
@apalavra_ap

ENCARREGADO DE DADOS (DPO):
E-mail: apalavra.ap.contato@gmail.com

PRAZO DE RESPOSTA:
• Solicitações simples: até 5 dias úteis
• Solicitações complexas: até 15 dias úteis
• Solicitações de exclusão: até 30 dias

AUTORIDADE NACIONAL:
Se você não estiver satisfeito com nossa resposta, pode entrar em contato com a Autoridade Nacional de Proteção de Dados (ANPD):
• Site: www.gov.br/anpd
• E-mail: anpd@anpd.gov.br`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-60 h-60 bg-amber-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-teal-200 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Política de Privacidade</h1>
                <p className="text-teal-200">Última atualização: {lastUpdated}</p>
              </div>
            </div>
            
            <p className="text-lg text-teal-100 max-w-2xl">
              Sua privacidade é importante para nós. Esta política descreve como coletamos, 
              usamos e protegemos suas informações pessoais no aplicativo "A Palavra".
            </p>

            {/* LGPD Badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Em conformidade com a LGPD</span>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-white border-b border-cyan-100 py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <Lock className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Dados Criptografados</p>
                <p className="text-xs text-gray-500">AES-256</p>
              </div>
              <div className="p-4">
                <Shield className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">LGPD Compliant</p>
                <p className="text-xs text-gray-500">Lei 13.709/2018</p>
              </div>
              <div className="p-4">
                <UserCheck className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Seus Direitos</p>
                <p className="text-xs text-gray-500">Garantidos</p>
              </div>
              <div className="p-4">
                <Trash2 className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Exclusão de Dados</p>
                <p className="text-xs text-gray-500">A qualquer momento</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="bg-cyan-50/50 border-b border-cyan-100 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto pb-2">
              <span className="font-medium text-teal-700 whitespace-nowrap">Seções:</span>
              {sections.slice(0, 6).map((section, index) => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-3 py-1 bg-white hover:bg-teal-100 rounded-full text-teal-700 transition-colors whitespace-nowrap shadow-sm"
                >
                  {section.title.split('. ')[1]?.split(' ')[0]}
                </a>
              ))}
              <span className="text-gray-400">...</span>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Summary Box */}
            <div className="bg-gradient-to-r from-cyan-100 to-teal-100 rounded-2xl p-6 mb-12 border border-cyan-200">
              <h3 className="text-lg font-bold text-cyan-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Resumo da Política
              </h3>
              <ul className="space-y-2 text-cyan-800">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Coletamos apenas dados necessários para fornecer nossos serviços</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Nunca vendemos suas informações pessoais a terceiros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Você pode acessar, corrigir ou excluir seus dados a qualquer momento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Utilizamos criptografia de ponta para proteger suas informações</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Estamos em total conformidade com a LGPD (Lei Geral de Proteção de Dados)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-12">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <div 
                    key={section.id} 
                    id={section.id}
                    className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden scroll-mt-24"
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">{section.title}</h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-teal max-w-none">
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
            <div className="mt-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">Sua Privacidade Importa</h3>
              <p className="text-teal-100 mb-6 max-w-lg mx-auto">
                Se você tiver qualquer dúvida sobre como tratamos seus dados ou quiser exercer seus direitos, estamos aqui para ajudar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:apalavra.ap.contato@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Falar com DPO
                </a>
                <Link 
                  to="/termos"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500/30 text-white font-semibold rounded-xl hover:bg-teal-500/50 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Termos de Uso
                </Link>
              </div>
            </div>

            {/* Back to Top */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
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

export default PrivacidadePage;
