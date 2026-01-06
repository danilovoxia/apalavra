// Reflexões por emoção - ajudam o usuário a conectar o versículo com seu estado emocional
// Cada emoção tem múltiplas reflexões que são selecionadas de forma variada

export interface EmotionReflections {
  [emotion: string]: string[];
}

export const reflectionsByEmotion: EmotionReflections = {
  paz: [
    "A paz verdadeira não depende das circunstâncias ao seu redor, mas da presença de Deus em seu coração. Quando você se sente em paz, está experimentando um pedacinho do céu aqui na terra.",
    "Seu coração encontrou um lugar de descanso. A paz que você sente agora é um presente de Deus, um lembrete de que Ele está no controle de todas as coisas.",
    "A paz interior é como uma âncora em meio às tempestades da vida. Guarde esse momento de serenidade e lembre-se: Deus é maior que qualquer turbulência.",
    "Quando a paz enche seu coração, você está alinhado com o propósito de Deus para sua vida. Permita que essa tranquilidade guie suas decisões e relacionamentos.",
    "A paz que excede todo entendimento é um dom divino. Ela não faz sentido para o mundo, mas faz todo sentido para quem confia em Deus.",
    "Neste momento de paz, seu espírito está em sintonia com o Espírito de Deus. Aproveite para ouvir Sua voz suave e reconfortante.",
  ],
  
  ansiedade: [
    "A ansiedade tenta roubar sua paz, mas Deus convida você a depositar todas as suas preocupações nEle. Ele se importa profundamente com cada detalhe da sua vida.",
    "Quando a ansiedade aperta seu coração, lembre-se: você não precisa carregar esse peso sozinho. Deus está estendendo Suas mãos para aliviar sua carga.",
    "Seus pensamentos ansiosos não definem sua realidade. A verdade de Deus é maior que seus medos. Respire fundo e confie no cuidado dEle por você.",
    "A ansiedade fala sobre o futuro incerto, mas Deus já está lá. Ele conhece cada passo do seu caminho e promete nunca te abandonar.",
    "Neste momento de inquietação, Deus oferece Sua paz. Não uma paz como o mundo dá, mas uma paz que acalma as tempestades mais intensas do coração.",
    "Sua ansiedade mostra que você se importa, mas Deus quer transformar essa preocupação em confiança. Entregue a Ele o que você não pode controlar.",
  ],
  
  gratidao: [
    "Um coração grato é um coração que reconhece a mão de Deus em todas as coisas. Sua gratidão hoje é um perfume agradável aos céus.",
    "A gratidão transforma o que temos em suficiente. Quando você agradece, está declarando que Deus é bom e que Suas bênçãos são reais em sua vida.",
    "Cada momento de gratidão é uma oração silenciosa. Você está reconhecendo que tudo o que tem vem das mãos generosas do Pai.",
    "A gratidão não ignora as dificuldades, mas escolhe focar nas bênçãos. Esse é o segredo de um coração alegre e uma vida plena.",
    "Quando agradecemos, nossos olhos se abrem para ver mais razões de gratidão. É um ciclo virtuoso que enche a vida de significado.",
    "Sua gratidão hoje planta sementes de alegria para amanhã. Continue cultivando esse coração agradecido, pois ele atrai mais bênçãos.",
  ],
  
  tristeza: [
    "Sua tristeza é vista e acolhida por Deus. Ele não se afasta de você nos momentos difíceis – Ele se aproxima ainda mais para te consolar.",
    "As lágrimas que você derrama não são desperdiçadas. Deus guarda cada uma delas e promete transformar seu lamento em dança no tempo certo.",
    "A tristeza faz parte da jornada humana, mas não é o fim da história. Deus está escrevendo capítulos de restauração e esperança em sua vida.",
    "Neste momento de dor, permita-se sentir, mas também permita que Deus entre. Ele é especialista em curar corações quebrantados.",
    "A noite pode ser longa e escura, mas a manhã sempre chega. Deus promete que a alegria virá, e Suas promessas nunca falham.",
    "Você não precisa fingir estar bem. Deus conhece sua dor e oferece Seu colo como lugar de refúgio e cura.",
  ],
  
  alegria: [
    "A alegria que você sente é um reflexo da bondade de Deus em sua vida. Celebre esse momento e compartilhe essa luz com quem está ao seu redor.",
    "A verdadeira alegria não depende de circunstâncias perfeitas, mas de um coração conectado com Deus. Você encontrou essa fonte inesgotável.",
    "Sua alegria é contagiante! Deus se alegra quando você se alegra. Esse é um momento de comunhão especial entre você e o Pai.",
    "A alegria do Senhor é sua força. Quando você está alegre, está fortalecido para enfrentar qualquer desafio que surgir.",
    "Momentos de alegria são presentes de Deus. Guarde-os em seu coração como tesouros que te sustentarão nos dias mais difíceis.",
    "Sua alegria hoje é uma declaração de fé. Você está dizendo ao mundo que Deus é bom e que vale a pena confiar nEle.",
  ],
  
  medo: [
    "O medo é real, mas o poder de Deus é maior. Ele não te deu espírito de covardia, mas de força, amor e equilíbrio.",
    "Quando o medo bate à porta, deixe a fé atender. Deus está com você, e nada pode te separar do Seu amor protetor.",
    "Seus medos não definem seu futuro. Deus já venceu tudo o que você teme, e Ele caminha ao seu lado em cada passo.",
    "O medo tenta paralisar, mas Deus te convida a avançar. Com Ele, você pode enfrentar gigantes e atravessar vales escuros.",
    "Neste momento de temor, lembre-se: o mesmo Deus que acalmou tempestades está ao seu lado. Ele é maior que qualquer ameaça.",
    "O medo grita, mas a fé sussurra verdades eternas. Escolha ouvir a voz de Deus que diz: 'Não temas, eu estou contigo'.",
  ],
  
  esperanca: [
    "A esperança é a âncora da alma. Mesmo quando as ondas são fortes, você está firmemente ancorado nas promessas de Deus.",
    "Sua esperança não é um desejo vazio – é uma certeza baseada no caráter fiel de Deus. Ele nunca falhou e não vai começar agora.",
    "A esperança olha para o futuro com confiança, não porque as circunstâncias são favoráveis, mas porque Deus é soberano.",
    "Quando você tem esperança, está declarando que acredita em um Deus que faz todas as coisas novas. O melhor ainda está por vir.",
    "A esperança não nega a realidade difícil, mas se recusa a deixar que ela tenha a última palavra. Deus sempre tem o final da história.",
    "Sua esperança inspira outros a também acreditarem. Continue firme, pois sua fé está plantando sementes de transformação.",
  ],
  
  amor: [
    "O amor que você sente é um eco do amor infinito de Deus. Ele te amou primeiro, e agora você pode amar porque foi amado.",
    "O amor verdadeiro não é apenas sentimento – é escolha, compromisso e entrega. Deus exemplificou isso ao dar Seu Filho por você.",
    "Quando você ama, está refletindo a natureza de Deus. O amor é a marca registrada dos filhos do Pai celestial.",
    "O amor cobre multidão de falhas e constrói pontes onde havia muros. Continue amando, mesmo quando for difícil.",
    "Nenhum amor humano é perfeito, mas o amor de Deus preenche todas as lacunas. Deixe-se ser amado para poder amar melhor.",
    "O amor que você dá volta multiplicado. É a lei espiritual mais poderosa do universo, estabelecida pelo próprio Deus.",
  ],
  
  forca: [
    "A força que você precisa não vem de você mesmo, mas de Deus que habita em você. Quando você é fraco, Ele é forte.",
    "Sua força interior é renovada a cada dia pela graça de Deus. Não desanime – você é mais forte do que imagina.",
    "A verdadeira força não é ausência de fraqueza, mas a presença de Deus em meio à sua limitação. Ele te capacita para o impossível.",
    "Você foi criado para vencer. A força do Senhor está disponível para você enfrentar qualquer batalha que surgir.",
    "Nos momentos em que você se sente mais fraco, Deus está mais perto. Sua força se aperfeiçoa na fraqueza humana.",
    "Continue firme! A força que te sustenta não é sua – é o poder do Deus Todo-Poderoso operando através de você.",
  ],
  
  proposito: [
    "Você não está aqui por acaso. Deus te criou com um propósito único e especial. Cada dia é uma oportunidade de cumprir esse chamado.",
    "Seu propósito não é algo que você precisa inventar – é algo que você descobre ao caminhar com Deus. Ele já preparou obras para você realizar.",
    "Quando você vive com propósito, cada ação ganha significado. Até as tarefas mais simples se tornam atos de adoração.",
    "Deus conhece seus dons, suas paixões e suas experiências. Ele está tecendo tudo isso em um propósito maior do que você pode imaginar.",
    "Seu propósito não é apenas sobre você – é sobre impactar vidas e glorificar a Deus. Você é parte de uma história muito maior.",
    "Não compare seu propósito com o de outros. Deus tem um plano específico para você, e ele é perfeito para quem você é.",
  ],
};

// Função para obter uma reflexão baseada na emoção e no ID do versículo
// Usa o ID do versículo para garantir que o mesmo versículo sempre tenha a mesma reflexão
export const getReflectionForVerse = (emotion: string, verseId: string): string => {
  const emotionKey = emotion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const reflections = reflectionsByEmotion[emotionKey];
  
  if (!reflections || reflections.length === 0) {
    return "Este versículo é um lembrete do amor e cuidado de Deus por você. Medite nessas palavras e permita que elas transformem seu coração.";
  }
  
  // Usa o ID do versículo para selecionar uma reflexão de forma consistente
  const numericId = parseInt(verseId.replace(/\D/g, '')) || 0;
  const index = numericId % reflections.length;
  
  return reflections[index];
};

// Reflexão padrão para quando a emoção não é reconhecida
export const defaultReflection = "Este versículo é uma mensagem especial de Deus para você hoje. Permita que essas palavras penetrem em seu coração e tragam paz, esperança e direção para sua vida.";
