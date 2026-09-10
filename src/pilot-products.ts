import { getProduct, saveProduct } from "./products.js";

const escaleraES = `# LA ESCALERA — 21 días de disciplina, hábitos y acción

## Cómo usar este programa
Durante 21 días vas a trabajar sobre una secuencia: observar tu realidad, declarar compromisos, actuar aun con miedo, ordenar hábitos, fortalecer cuerpo y mente, mejorar conversaciones, negociar, crear valor y vender.

No busques hacerlo perfecto. Cada día exige una acción concreta y una evidencia simple.

## Día 1 — El Pozo
Escribe tu situación actual en cinco áreas: energía, hábitos, relaciones, dinero y trabajo. No expliques ni justifiques. Registra hechos observables.

**Acción:** elige un resultado que quieras cambiar en los próximos 21 días.

## Día 2 — Cambiar el observador
Mira tu problema desde tres profesiones distintas: vendedor, ingeniero y diseñador. Anota qué ve cada uno que tú no estabas viendo.

**Acción:** encuentra tres posibilidades nuevas.

## Día 3 — Compromiso
Formula una promesa concreta, medible y con fecha. Un compromiso no es deseo: es una declaración que organiza acciones presentes.

**Acción:** escribe una promesa que puedas verificar al final del día.

## Día 4 — Miedo
Identifica el miedo principal que aparece cuando actúas. Separa el hecho de la interpretación.

**Acción:** realiza una acción pequeña que avanzarías si el miedo no decidiera por ti.

## Día 5 — Disciplina
Elige un hábito que te fortalece y uno que te debilita.

**Acción:** elimina durante 24 horas el hábito debilitante y cumple el fortalecedor.

## Día 6 — Relaciones
Revisa tres conversaciones pendientes.

**Acción:** inicia una conversación clara, escuchando antes de argumentar.

## Día 7 — Cuerpo
Organiza sueño, movimiento y alimentación para sostener energía de ejecución.

**Acción:** programa por escrito tu próxima jornada física.

## Día 8 — Desintoxicación 360
Detecta ruido: pantallas, interrupciones, conversaciones, objetos o rutinas que consumen atención.

**Acción:** elimina tres fuentes de ruido por 24 horas.

## Día 9 — Decidir
Toma una decisión que vienes postergando. Define opciones, costo de no decidir y próxima acción.

## Día 10 — Emociones
Registra durante el día qué emoción precede a tus decisiones importantes.

**Acción:** cambia corporalidad, lenguaje o entorno antes de responder impulsivamente.

## Día 11 — Compromiso en movimiento
Revisa las promesas hechas durante los primeros diez días.

**Acción:** cumple hoy una promesa pendiente.

## Día 12 — Sabiduría
Separa en una hoja: hechos, juicios e interpretaciones de un problema actual.

**Acción:** toma una decisión usando primero los hechos.

## Día 13 — Negociación
Elige una negociación real. Define tu objetivo, el interés de la otra parte, alternativas y concesiones posibles.

**Acción:** presenta una propuesta concreta.

## Día 14 — Crear valor
Responde: ¿qué problema puedo resolver, para quién y cuánto vale resolverlo?

**Acción:** formula una oferta en una sola frase.

## Día 15 — El mapa
Define objetivo económico, fecha, oferta, cliente, canal y número de ventas necesarias.

## Día 16 — Sistema comercial
Identifica dónde están tus compradores y cómo llegar a ellos sin depender de publicidad paga.

**Acción:** crea una lista de 20 prospectos o comunidades.

## Día 17 — Primera salida al mercado
Publica o presenta tu oferta a cinco personas reales.

**Métrica:** conversaciones iniciadas, respuestas y objeciones.

## Día 18 — Aprender del rechazo
Agrupa las objeciones recibidas. No las discutas: úsalas como información de mercado.

**Acción:** mejora una parte de la oferta.

## Día 19 — Segunda salida
Presenta la versión mejorada a otros cinco prospectos.

## Día 20 — La Gran Batalla
El aprendizaje se mide en resultados. Busca una transacción, reserva, compromiso de compra o avance comercial verificable.

## Día 21 — El Cáliz
Compara tu situación con el Día 1. Identifica qué acciones produjeron resultados y cuáles fueron ruido.

**Cierre:** conserva tres hábitos, una práctica de conversación y un sistema de creación de valor que puedas repetir durante 90 días.

## Tablero semanal
- Promesas realizadas / cumplidas
- Horas de trabajo enfocado
- Conversaciones comerciales
- Ofertas presentadas
- Ventas o compromisos
- Hábitos fortalecidos
- Fuentes de ruido eliminadas

La Escalera continúa cuando conviertes aprendizaje en acciones repetibles y resultados medibles.`;

const escaleraPT = `# A ESCADA — 21 dias de disciplina, hábitos e ação

Um programa prático de 21 dias para sair do ponto atual e transformar aprendizado em ação mensurável.

## Sequência
1. Observe sua realidade atual sem justificativas.
2. Mude o observador: veja o mesmo problema como vendedor, engenheiro e designer.
3. Declare um compromisso concreto e com prazo.
4. Aja mesmo quando o medo estiver presente.
5. Escolha um hábito que fortalece e elimine um que enfraquece.
6. Resolva uma conversa pendente ouvindo antes de argumentar.
7. Organize sono, movimento e alimentação para sustentar energia.
8. Faça uma desintoxicação de ruído: telas, interrupções e rotinas inúteis.
9. Tome uma decisão que você vem adiando.
10. Observe a relação entre emoção, linguagem e decisão.
11. Cumpra uma promessa pendente.
12. Separe fatos, julgamentos e interpretações.
13. Prepare uma negociação real: objetivo, interesses, alternativas e concessões.
14. Responda: que problema posso resolver, para quem e quanto vale resolvê-lo?
15. Construa um mapa econômico: objetivo, data, oferta, cliente, canal e vendas necessárias.
16. Localize seus compradores sem depender de anúncios pagos.
17. Apresente sua oferta a cinco pessoas reais.
18. Use objeções como informação de mercado e melhore a oferta.
19. Faça uma segunda rodada com a versão melhorada.
20. Busque um resultado verificável: venda, reserva ou compromisso comercial.
21. Compare com o primeiro dia e escolha o que repetirá por 90 dias.

## Painel semanal
- Promessas feitas / cumpridas
- Horas de foco
- Conversas comerciais
- Ofertas apresentadas
- Vendas
- Hábitos fortalecidos
- Ruído eliminado

A Escada não termina no último dia: ela vira um sistema de execução.`;

const missionEN = `# MISSION — 12 Secret Real-Life Adventures

## The rule
Real life is the game. Pick a mission, keep it legal and consensual, and complete it within the stated time. Third parties always participate voluntarily.

### Mission 01 — The Unexpected Interview
**Level:** 3/10 · **Time:** 3 days
Find someone with an extraordinary story connected to one of your interests and obtain a consensual 15-minute interview.
Hints: list five possible paths; use communities or events; if one candidate declines, move on immediately.

### Mission 02 — Three Generations
**Level:** 3/10 · **Time:** 48 hours
Ask the same original question to three adults from different generations. Compare how their answers differ.

### Mission 03 — The Hidden Expert
**Level:** 3/10 · **Time:** 3 days
Find an apparently ordinary person with an unusual skill and, with permission, document a short demonstration.

### Mission 04 — A Day in Another Life
**Level:** 4/10 · **Time:** 7 days
Arrange an authorized visit or observation period with someone working in a profession you have always been curious about.

### Mission 05 — The Founder
**Level:** 4/10 · **Time:** 7 days
Have a conversation with someone who built a company, club or organization from zero. Ask about the first real obstacle and first paying customer or supporter.

### Mission 06 — Your City Has a Voice
**Level:** 5/10 · **Time:** 7 days
Meet or interview someone locally known for cultural, social, business or sports work.

### Mission 07 — The First Sale
**Level:** 4/10 · **Time:** 72 hours
Choose one object, skill or legitimate service you can offer. Create a simple proposition and obtain a real buyer or booking.

### Mission 08 — Authorized Access
**Level:** 5/10 · **Time:** 14 days
Get legitimate permission to visit a workplace, workshop, vessel, studio, kitchen, backstage area or other environment you normally would not see.

### Mission 09 — Learn It Fast
**Level:** 4/10 · **Time:** 7 days
Choose a practical skill you do not know. Find a person willing to teach you and produce a small result that proves you learned the basics.

### Mission 10 — Create Something Public
**Level:** 4/10 · **Time:** 3 days
Create a small work — photo essay, micro-video, illustration, short article or prototype — and publish or exhibit it in a legitimate public channel.

### Mission 11 — The Improbable Dream
**Level:** 5/10 · **Time:** 14 days
Interview someone who achieved something they once considered improbable. Document the sequence of decisions that made it possible.

### Mission 12 — Build a Team
**Level:** 5/10 · **Time:** 7 days
Bring together three people who did not previously work as a team and complete a small shared project with a visible result.

## Evidence
Use only evidence that respects privacy: your own notes, a confirmation message, an authorized photo/video, a receipt, a published artifact or another non-invasive proof.

## Scoring
Complete mission = 10 points. Complete within half the deadline = +3. Find a creative legal route nobody expected = +2. Help another player complete theirs = +2.

Pick one. The exact path is yours.`;

const firstSaleES = `# MISIÓN: TU PRIMERA VENTA EN 7 DÍAS

Una misión comercial para convertir una idea en una transacción real.

## Día 1 — Inventario de valor
Haz una lista de 10 cosas que sabes hacer, resolver, conseguir, diseñar, enseñar o producir. Elige una que puedas entregar sin inversión inicial.

## Día 2 — Comprador específico
No vendas "a todo el mundo". Define una persona o negocio con un problema concreto. Escribe 20 prospectos reales.

## Día 3 — Oferta de una frase
Estructura: "Ayudo a [tipo de cliente] a conseguir [resultado] mediante [entregable] por [precio]".
Elimina características que el comprador no necesita.

## Día 4 — Prueba de mercado
Presenta la oferta a cinco prospectos. No intentes convencer a quien no tiene el problema. Registra preguntas, silencios y objeciones.

## Día 5 — Negociación
Corrige precio, alcance o promesa según información real. Define qué puedes conceder y qué no.

## Día 6 — Segunda ronda
Presenta la versión mejorada a diez prospectos o en dos comunidades donde esté tu público. Utiliza mensajes individuales y publicaciones honestas.

## Día 7 — Cierre
Busca una acción verificable: pago, reserva, pedido o aceptación formal. Si todavía no existe, identifica exactamente en qué punto se rompe el embudo: oferta, público, confianza, precio o canal.

## Tablero de misión
- Prospectos identificados
- Contactos realizados
- Respuestas
- Conversaciones
- Objeciones
- Ofertas enviadas
- Cierres
- Ingreso

## Condición de victoria
No es "sentirse preparado". Es obtener una transacción o producir suficiente evidencia de mercado para saber qué cambiar en la siguiente ronda.`;

const seeds = [
  {slug:"la-escalera-21-dias",title:"La Escalera — 21 días de disciplina y acción",description:"Programa práctico de 21 días para convertir compromiso, hábitos, negociación y creación de valor en acciones medibles.",priceUsd:4.9,content:escaleraES,format:"markdown" as const,language:"es",targetMarket:"Latinoamérica y España",tags:["disciplina","hábitos","emprendimiento","21 días"],active:true},
  {slug:"a-escada-21-dias",title:"A Escada — 21 dias de disciplina e ação",description:"Programa de 21 dias em português para transformar disciplina, hábitos e criação de valor em execução diária.",priceUsd:4.9,content:escaleraPT,format:"markdown" as const,language:"pt-BR",targetMarket:"Brasil",tags:["disciplina","hábitos","empreendedorismo"],active:true},
  {slug:"mission-12-secret-adventures",title:"MISSION — 12 Secret Real-Life Adventures",description:"Twelve ready-to-play real-world missions for individuals, couples or friends. Instant digital delivery.",priceUsd:3.9,content:missionEN,format:"markdown" as const,language:"en",targetMarket:"Global English",tags:["adventure","date night","missions","game"],active:true},
  {slug:"mision-primera-venta",title:"Misión — Tu primera venta en 7 días",description:"Una misión comercial de siete días para convertir una habilidad o idea en una oferta y buscar una primera transacción real.",priceUsd:5.9,content:firstSaleES,format:"markdown" as const,language:"es",targetMarket:"Latinoamérica y España",tags:["ventas","emprendimiento","reto","negocios"],active:true}
];

export function seedPilotProducts(){
  const created:string[]=[];
  for(const p of seeds){
    if(!getProduct(p.slug)){saveProduct(p);created.push(p.slug);}
  }
  if(created.length) console.log("[pilot] Seeded products:",created.join(", "));
  return created;
}
