(function () {
  /* ==========================================================================
   * 01. Shared Concierge State
   * Coordinates multiple Nina widgets without leaking state across DOM nodes.
   * ========================================================================== */
  const sharedState = new WeakMap();

  /* ==========================================================================
   * 02. Service Catalog
   * Route metadata, labels, and summaries used in Nina recommendations.
   * ========================================================================== */
  const SERVICE_CATALOG = {
    advisoryConsultation: {
      family: { en: "Advisory", pt: "Consultoria" },
      route: "/services/advisory/consultation/",
      title: { en: "Consultation", pt: "Consulta" },
      summary: {
        en: "A strong starting point when the best route depends on your timeline, documents, or personal facts.",
        pt: "Um bom ponto de partida quando a melhor rota depende do seu cronograma, dos seus documentos ou da sua situacao."
      }
    },
    advisoryStrategy: {
      family: { en: "Advisory", pt: "Consultoria" },
      route: "/services/advisory/strategy/",
      title: { en: "Strategy", pt: "Estrategia" },
      summary: {
        en: "Useful when you need route comparison, stronger planning, or a calmer next step before filing.",
        pt: "Util quando voce precisa comparar rotas, planejar melhor ou definir o proximo passo antes do protocolo."
      }
    },
    advisoryRepresentation: {
      family: { en: "Advisory", pt: "Consultoria" },
      route: "/services/advisory/representation/",
      title: { en: "Representation", pt: "Representacao" },
      summary: {
        en: "Relevant when the case may depend on direct legal representation and more formal support.",
        pt: "Relevante quando o caso pode depender de representacao juridica direta e apoio mais formal."
      }
    },
    advisoryCorporate: {
      family: { en: "Advisory", pt: "Consultoria" },
      route: "/services/advisory/corporate/",
      title: { en: "Corporate", pt: "Corporativo" },
      summary: {
        en: "Helpful for investor, business, startup, and company-linked immigration planning.",
        pt: "Util para planejamento migratorio ligado a investimento, empresa, startup ou atividade corporativa."
      }
    },
    advisoryCompliance: {
      family: { en: "Advisory", pt: "Consultoria" },
      route: "/services/advisory/compliance/",
      title: { en: "Compliance", pt: "Compliance" },
      summary: {
        en: "Useful when the priority is staying aligned with obligations, deadlines, and immigration conditions.",
        pt: "Util quando a prioridade e manter conformidade com obrigacoes, prazos e condicoes migratorias."
      }
    },
    visasHub: {
      family: { en: "Visas", pt: "Vistos" },
      route: "/services/visas/",
      title: { en: "Visa Services", pt: "Servicos de Vistos" },
      summary: {
        en: "The main visa overview for entry routes linked to work, family, investment, study, and specialist matters.",
        pt: "A visao geral de vistos para rotas de entrada ligadas a trabalho, familia, investimento, estudo e casos especializados."
      }
    },
    visaTourist: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/tourist/",
      title: { en: "Tourist Visa", pt: "Visto de Turista" },
      summary: {
        en: "Useful for short-stay planning and for understanding when a tourist route may no longer be enough.",
        pt: "Util para estadias curtas e para entender quando a rota de turista deixa de ser suficiente."
      }
    },
    visaNomad: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/nomad/",
      title: { en: "Digital Nomad Visa", pt: "Visto de Nomade Digital" },
      summary: {
        en: "A strong route to review for remote workers earning income from outside Brazil.",
        pt: "Uma boa rota para trabalhadores remotos com renda vinda de fora do Brasil."
      }
    },
    visaWork: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/work/",
      title: { en: "Work Visa", pt: "Visto de Trabalho" },
      summary: {
        en: "Relevant when the move depends on a Brazilian employer, sponsorship, or a formal job offer.",
        pt: "Relevante quando a mudanca depende de empregador brasileiro, patrocinio ou oferta formal de emprego."
      }
    },
    visaStudent: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/student/",
      title: { en: "Student Visa", pt: "Visto de Estudante" },
      summary: {
        en: "Useful when the move is tied to acceptance by a recognized school or university in Brazil.",
        pt: "Util quando a mudanca esta ligada a uma instituicao de ensino reconhecida no Brasil."
      }
    },
    visaInvestor: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/investor/",
      title: { en: "Investor Visa", pt: "Visto de Investidor" },
      summary: {
        en: "Relevant when investment, business expansion, or capital-based migration is part of the plan.",
        pt: "Relevante quando investimento, expansao empresarial ou migracao baseada em capital faz parte do plano."
      }
    },
    visaFamily: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/family/",
      title: { en: "Family Visa", pt: "Visto Familiar" },
      summary: {
        en: "Useful when family ties in Brazil may support the entry route.",
        pt: "Util quando vinculos familiares no Brasil podem sustentar a rota de entrada."
      }
    },
    visaHumanitarian: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/humanitarian/",
      title: { en: "Humanitarian Visa", pt: "Visto Humanitario" },
      summary: {
        en: "Important when protection concerns, vulnerability, or humanitarian grounds may shape the route.",
        pt: "Importante quando protecao, vulnerabilidade ou fundamentos humanitarios podem moldar a rota."
      }
    },
    visaRetiree: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/retiree/",
      title: { en: "Retiree Visa", pt: "Visto de Aposentado" },
      summary: {
        en: "Useful when pension or retirement income may support the move to Brazil.",
        pt: "Util quando renda de pensao ou aposentadoria pode sustentar a mudanca para o Brasil."
      }
    },
    visaBusiness: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/business/",
      title: { en: "Business Visa", pt: "Visto de Negocios" },
      summary: {
        en: "Helpful when the move connects to commercial activity, business visits, or corporate planning.",
        pt: "Util quando a mudanca se conecta a atividade comercial, visitas de negocios ou planejamento corporativo."
      }
    },
    visaArtistic: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/artistic/",
      title: { en: "Artistic Visa", pt: "Visto Artistico" },
      summary: {
        en: "Useful for creative and performance-based immigration matters.",
        pt: "Util para questoes migratorias ligadas a criacao e performance."
      }
    },
    visaEducational: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/educational/",
      title: { en: "Educational Visa", pt: "Visto Educacional" },
      summary: {
        en: "Useful when the route involves structured educational activity outside the usual student pathway.",
        pt: "Util quando a rota envolve atividade educacional estruturada fora da via tradicional de estudante."
      }
    },
    visaExchange: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/exchange/",
      title: { en: "Exchange Visa", pt: "Visto de Intercambio" },
      summary: {
        en: "Relevant when the route is connected to exchange or temporary academic programs.",
        pt: "Relevante quando a rota esta ligada a intercambio ou programas academicos temporarios."
      }
    },
    visaJournalist: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/journalist/",
      title: { en: "Journalist Visa", pt: "Visto de Jornalista" },
      summary: {
        en: "Useful for media and press activity in Brazil.",
        pt: "Util para atividade de imprensa e midia no Brasil."
      }
    },
    visaMedical: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/medical/",
      title: { en: "Medical Visa", pt: "Visto Medico" },
      summary: {
        en: "Relevant when medical treatment or healthcare planning is part of the immigration question.",
        pt: "Relevante quando tratamento medico ou planejamento de saude faz parte da questao migratoria."
      }
    },
    visaReligious: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/religious/",
      title: { en: "Religious Visa", pt: "Visto Religioso" },
      summary: {
        en: "Useful for religious activity or faith-based relocation questions.",
        pt: "Util para atividade religiosa ou questoes de mudanca ligadas a fe."
      }
    },
    visaResearch: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/research/",
      title: { en: "Research Visa", pt: "Visto de Pesquisa" },
      summary: {
        en: "Relevant when the route depends on academic or institutional research activity.",
        pt: "Relevante quando a rota depende de atividade de pesquisa academica ou institucional."
      }
    },
    visaSports: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/sports/",
      title: { en: "Sports Visa", pt: "Visto Esportivo" },
      summary: {
        en: "Useful for athletes and sports-related immigration matters.",
        pt: "Util para atletas e casos migratorios ligados ao esporte."
      }
    },
    visaStartup: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/startup/",
      title: { en: "Startup Visa", pt: "Visto de Startup" },
      summary: {
        en: "Helpful when innovation, entrepreneurship, or startup activity is central to the move.",
        pt: "Util quando inovacao, empreendedorismo ou atividade de startup esta no centro da mudanca."
      }
    },
    visaTransit: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/transit/",
      title: { en: "Transit Visa", pt: "Visto de Transito" },
      summary: {
        en: "Useful for short transit-related travel planning involving Brazil.",
        pt: "Util para planejamento de viagens curtas de transito envolvendo o Brasil."
      }
    },
    visaVolunteer: {
      family: { en: "Visa", pt: "Visto" },
      route: "/services/visas/volunteer/",
      title: { en: "Volunteer Visa", pt: "Visto de Voluntariado" },
      summary: {
        en: "Relevant when volunteer or mission-based activity may shape the route.",
        pt: "Relevante quando atividade de voluntariado ou missao pode moldar a rota."
      }
    },
    residenciesHub: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/",
      title: { en: "Residency Services", pt: "Servicos de Residencia" },
      summary: {
        en: "The main residency overview for lawful stay, renewals, continuity, and longer-term settlement planning.",
        pt: "A visao geral de residencia para estada regular, renovacoes, continuidade e planejamento de longo prazo."
      }
    },
    residencyNomad: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/nomad/",
      title: { en: "Nomad Residency", pt: "Residencia de Nomade" },
      summary: {
        en: "Useful when remote work may need to become a longer-term lawful stay in Brazil.",
        pt: "Util quando o trabalho remoto pode precisar se transformar em permanencia regular de longo prazo no Brasil."
      }
    },
    residencyReunion: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/reunion/",
      title: { en: "Family Reunion Residency", pt: "Residencia por Reuniao Familiar" },
      summary: {
        en: "A strong page when family ties may support longer-term residence in Brazil.",
        pt: "Uma boa pagina quando vinculos familiares podem sustentar residencia de longo prazo no Brasil."
      }
    },
    residencyRetiree: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/retiree/",
      title: { en: "Retiree Residency", pt: "Residencia de Aposentado" },
      summary: {
        en: "Relevant when retirement income may support lawful long-term stay in Brazil.",
        pt: "Relevante quando renda de aposentadoria pode sustentar permanencia regular de longo prazo no Brasil."
      }
    },
    residencyInvestor: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/investor/",
      title: { en: "Investor Residency", pt: "Residencia de Investidor" },
      summary: {
        en: "Useful when investment-backed residence and continuity planning matter.",
        pt: "Util quando residencia baseada em investimento e planejamento de continuidade importam."
      }
    },
    residencyWork: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/work/",
      title: { en: "Work Residency", pt: "Residencia de Trabalho" },
      summary: {
        en: "Relevant when employment inside Brazil may support a longer stay.",
        pt: "Relevante quando emprego no Brasil pode sustentar permanencia mais longa."
      }
    },
    residencyStudy: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/study/",
      title: { en: "Study Residency", pt: "Residencia de Estudo" },
      summary: {
        en: "Useful when study plans, continuity, and post-arrival steps matter.",
        pt: "Util quando planos de estudo, continuidade e etapas apos a chegada importam."
      }
    },
    residencyHumanitarian: {
      family: { en: "Residency", pt: "Residencia" },
      route: "/services/residencies/humanitarian/",
      title: { en: "Humanitarian Residency", pt: "Residencia Humanitaria" },
      summary: {
        en: "Relevant when humanitarian or protection considerations may continue after entry.",
        pt: "Relevante quando consideracoes humanitarias ou de protecao podem continuar apos a entrada."
      }
    },
    naturalisationHub: {
      family: { en: "Naturalisation", pt: "Naturalizacao" },
      route: "/services/naturalisation/",
      title: { en: "Naturalisation Services", pt: "Servicos de Naturalizacao" },
      summary: {
        en: "The main overview for citizenship, nationality planning, renunciation, and reacquisition matters.",
        pt: "A visao geral para cidadania, planejamento de nacionalidade, renuncia e reaquisição."
      }
    },
    naturalisationOrdinary: {
      family: { en: "Naturalisation", pt: "Naturalizacao" },
      route: "/services/naturalisation/ordinary/",
      title: { en: "Ordinary Naturalisation", pt: "Naturalizacao Ordinaria" },
      summary: {
        en: "Useful when citizenship may depend on residence history, timing, and document review.",
        pt: "Util quando a cidadania pode depender do historico de residencia, do tempo e da revisao documental."
      }
    },
    naturalisationSpecial: {
      family: { en: "Naturalisation", pt: "Naturalizacao" },
      route: "/services/naturalisation/special/",
      title: { en: "Special Naturalisation", pt: "Naturalizacao Especial" },
      summary: {
        en: "Relevant for special scenarios where nationality eligibility may need closer review.",
        pt: "Relevante para cenarios especiais em que a elegibilidade para nacionalidade precisa de analise mais cuidadosa."
      }
    },
    defenseHub: {
      family: { en: "Defense", pt: "Defesa" },
      route: "/services/defense/",
      title: { en: "Defense Services", pt: "Servicos de Defesa" },
      summary: {
        en: "The main overview for urgent, exposed, and sensitive immigration situations.",
        pt: "A visao geral para situacoes migratorias urgentes, sensiveis e expostas."
      }
    },
    defenseAppeals: {
      family: { en: "Defense", pt: "Defesa" },
      route: "/services/defense/appeals/",
      title: { en: "Appeals", pt: "Recursos" },
      summary: {
        en: "Relevant when a notice, refusal, or formal decision may need legal response.",
        pt: "Relevante quando notificacao, negativa ou decisao formal pode precisar de resposta juridica."
      }
    },
    defenseDeportation: {
      family: { en: "Defense", pt: "Defesa" },
      route: "/services/defense/deportation/",
      title: { en: "Deportation", pt: "Deportacao" },
      summary: {
        en: "Useful when deportation risk or removal concerns may already be in play.",
        pt: "Util quando risco de deportacao ou preocupacoes com remocao ja podem estar em jogo."
      }
    },
    defenseExpulsion: {
      family: { en: "Defense", pt: "Defesa" },
      route: "/services/defense/expulsion/",
      title: { en: "Expulsion", pt: "Expulsao" },
      summary: {
        en: "Relevant when expulsion issues may need careful legal review and urgency management.",
        pt: "Relevante quando questoes de expulsao podem exigir analise juridica cuidadosa e gestao de urgencia."
      }
    },
    defenseFines: {
      family: { en: "Defense", pt: "Defesa" },
      route: "/services/defense/fines/",
      title: { en: "Fines", pt: "Multas" },
      summary: {
        en: "Useful when a fine, notice, or compliance concern may affect the next step.",
        pt: "Util quando multa, notificacao ou preocupacao de conformidade pode afetar o proximo passo."
      }
    },
    defenseLitigation: {
      family: { en: "Defense", pt: "Defesa" },
      route: "/services/defense/litigation/",
      title: { en: "Litigation", pt: "Litigio" },
      summary: {
        en: "Relevant when the case may require more formal legal escalation or defense work.",
        pt: "Relevante quando o caso pode exigir escalonamento juridico mais formal ou trabalho de defesa."
      }
    },
    otherRegularization: {
      family: { en: "Other", pt: "Outros" },
      route: "/services/other/regularization/",
      title: { en: "Regularization", pt: "Regularizacao" },
      summary: {
        en: "A strong page when status, continuity, or prior problems may need to be stabilized.",
        pt: "Uma boa pagina quando status, continuidade ou problemas anteriores precisam ser estabilizados."
      }
    },
    processPlanning: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/planning/",
      title: { en: "Planning", pt: "Planejamento" },
      summary: {
        en: "Useful before filing so the route, documents, and chronology are stronger from the start.",
        pt: "Util antes do protocolo para fortalecer a rota, os documentos e a cronologia desde o inicio."
      }
    },
    processConsultation: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/consultation/",
      title: { en: "Consultation Process", pt: "Processo de Consulta" },
      summary: {
        en: "Explains how the first tailored review works and what the team usually needs to assess the case.",
        pt: "Explica como funciona a primeira analise personalizada e o que a equipe costuma precisar para avaliar o caso."
      }
    },
    processAssessment: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/assessment/",
      title: { en: "Assessment", pt: "Avaliacao" },
      summary: {
        en: "Useful when the facts, risks, and strongest route still need to be clarified.",
        pt: "Util quando os fatos, os riscos e a rota mais forte ainda precisam ser esclarecidos."
      }
    },
    processFiling: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/filing/",
      title: { en: "Filing", pt: "Protocolo" },
      summary: {
        en: "Relevant when you are preparing the formal filing step and want stronger case preparation.",
        pt: "Relevante quando voce esta preparando a etapa formal de protocolo e quer fortalecer a preparacao do caso."
      }
    },
    processRenewal: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/renewal/",
      title: { en: "Renewal", pt: "Renovacao" },
      summary: {
        en: "Useful when continuity and timing may matter for lawful stay in Brazil.",
        pt: "Util quando continuidade e tempo podem importar para a permanencia regular no Brasil."
      }
    },
    processPermanent: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/permanent/",
      title: { en: "Permanent Status", pt: "Status Permanente" },
      summary: {
        en: "A strong page when long-term stability and permanent status are part of the goal.",
        pt: "Uma boa pagina quando estabilidade de longo prazo e status permanente fazem parte do objetivo."
      }
    },
    processNaturalisation: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/naturalisation/",
      title: { en: "Naturalisation Process", pt: "Processo de Naturalizacao" },
      summary: {
        en: "Useful when citizenship timing, evidence, and eligibility need more structure.",
        pt: "Util quando tempo, provas e elegibilidade para cidadania precisam de mais estrutura."
      }
    },
    processDeadlines: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/deadlines/",
      title: { en: "Deadlines", pt: "Prazos" },
      summary: {
        en: "Important when time pressure, notices, or missed windows may affect the matter.",
        pt: "Importante quando pressao de tempo, notificacoes ou perda de prazos pode afetar o caso."
      }
    },
    processCompliance: {
      family: { en: "Process", pt: "Processo" },
      route: "/process/compliance/",
      title: { en: "Compliance Process", pt: "Processo de Compliance" },
      summary: {
        en: "Useful when obligations, compliance, and immigration conditions need closer attention.",
        pt: "Util quando obrigacoes, compliance e condicoes migratorias precisam de mais atencao."
      }
    },
    aboutLawyer: {
      family: { en: "About", pt: "Sobre" },
      route: "/about/lawyer/",
      title: { en: "Attorney Monique Fernandes", pt: "Advogada Monique Fernandes" },
      summary: {
        en: "A clear introduction to Monique's legal role, professional responsibility, and immigration-focused work.",
        pt: "Uma introducao clara ao papel juridico da Monique, sua responsabilidade profissional e seu trabalho focado em imigracao."
      }
    },
    brazilLiving: {
      family: { en: "Brazil", pt: "Brasil" },
      route: "/brazil/living/",
      title: { en: "Living in Brazil", pt: "Viver no Brasil" },
      summary: {
        en: "Helpful when immigration planning needs to be considered alongside day-to-day life in Brazil.",
        pt: "Util quando o planejamento migratorio precisa ser analisado junto com a vida cotidiana no Brasil."
      }
    }
  };

  /* ==========================================================================
   * 03. Icon Library
   * Small inline SVG set used by the floating concierge cards and options.
   * ========================================================================== */
  const ICONS = {
    move: "M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5Zm0 3.1L6.6 12l5.4 5.4 1.4-1.4-3-3H17v-2h-6.6l3-3-1.4-1.4Z",
    visa: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm3.2.5v2H18V7H7.2Zm0 4v6H12v-6H7.2Zm6.2 0v1.8H18V11h-4.6Zm0 3.4V17H18v-2.6h-4.6Z",
    residency: "M12 3.5 4 7.4v5.8c0 4.7 3.3 7.8 8 9.3 4.7-1.5 8-4.6 8-9.3V7.4l-8-3.9Zm0 2.2 5.8 2.8v4.7c0 3.3-2.2 5.8-5.8 7.1-3.6-1.3-5.8-3.8-5.8-7.1V8.5L12 5.7Zm-.9 3.3v4.6l4 2.2.9-1.6-3.1-1.7V9h-1.8Z",
    passport: "M7 4h8a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.4a6.8 6.8 0 0 1 0-12H7Zm4.6 0a4.8 4.8 0 0 0 0 12H15a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-3.4Zm0 2c-.8 0-1.5.8-1.8 2h3.6c-.3-1.2-1-2-1.8-2Zm-1.9 4a7 7 0 0 0 0 2h3.8a7 7 0 0 0 0-2H9.7Zm.1 4c.4 1.1 1 1.8 1.8 1.8.7 0 1.4-.7 1.8-1.8H9.8Z",
    urgent: "M12 2.8 2.8 21.2h18.4L12 2.8Zm0 4 6 12H6l6-12Zm-1 3.2v4.8h2V10h-2Zm0 6.3v2h2v-2h-2Z",
    unsure: "M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Zm0 2a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm-.1 8.2h1.8c0-1.7 2.4-1.7 2.4-4.1 0-1.9-1.5-3.1-3.8-3.1-2.1 0-3.7 1.2-4 3.1h1.8c.2-.9.9-1.5 2.1-1.5 1.1 0 2 .5 2 1.5 0 1.3-2.3 1.5-2.3 4.1Zm0 1.9v1.8h1.8v-1.8h-1.8Z",
    human: "M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Zm0 2c-4 0-7.2 2.1-7.2 4.8V20h14.4v-.9c0-2.7-3.2-4.8-7.2-4.8Z",
    remote: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H13v1.5h2.2V19H8.8v-1.5H11V16H6.5A2.5 2.5 0 0 1 4 13.5v-7Zm2 0v7a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5Z",
    family: "M7.6 10.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Zm8.8 0a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6ZM12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM4.6 19v-.6c0-1.8 1.8-3.2 4-3.2.7 0 1.4.2 2 .4.4-.2.9-.3 1.4-.3.5 0 1 .1 1.4.3.6-.2 1.3-.4 2-.4 2.2 0 4 1.4 4 3.2v.6H4.6Z",
    retire: "M12 3.5A8.5 8.5 0 1 0 20.5 12 8.5 8.5 0 0 0 12 3.5Zm0 2a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm-.9 2.2v4.7l3.6 2.1.9-1.6-2.7-1.5V7.7h-1.8Z",
    invest: "M12 3 4 7v5.2C4 17 7.4 20.6 12 22c4.6-1.4 8-5 8-9.8V7l-8-4Zm0 2.2L17.8 8v4.2c0 3.6-2.4 6.1-5.8 7.3-3.4-1.2-5.8-3.7-5.8-7.3V8L12 5.2Zm-1 3.4v1.8h2V8.6h-2Zm0 3.1v3.7h2v-3.7h-2Z",
    work: "M8 5.5V4.3A1.8 1.8 0 0 1 9.8 2.5h4.4A1.8 1.8 0 0 1 16 4.3v1.2h1.5A2.5 2.5 0 0 1 20 8v8.8a2.7 2.7 0 0 1-2.7 2.7H6.7A2.7 2.7 0 0 1 4 16.8V8a2.5 2.5 0 0 1 2.5-2.5H8Zm2-.2h4V4.5h-4v.8ZM6 10.5h12v6.3a.7.7 0 0 1-.7.7H6.7a.7.7 0 0 1-.7-.7v-6.3Zm4.8 1.3v1.8h2.4v-1.8h-2.4Z",
    explore: "M12 3.5 4.5 8v8L12 20.5 19.5 16V8L12 3.5Zm0 2.3 5.5 3-5.5 3-5.5-3 5.5-3Zm-5.5 5.2 4.5 2.4v4.4l-4.5-2.4V11Zm6.5 6.8v-4.4l4.5-2.4v4.4l-4.5 2.4Z",
    company: "M5 20V6.4A2.4 2.4 0 0 1 7.4 4h6.2A2.4 2.4 0 0 1 16 6.4V9h1.6A2.4 2.4 0 0 1 20 11.4V20H5Zm2-2h2v-2H7v2Zm0-4h2v-2H7v2Zm0-4h2V8H7v2Zm4 8h2v-2h-2v2Zm0-4h2v-2h-2v2Zm0-4h2V8h-2v2Zm4 8h3v-6.6a.4.4 0 0 0-.4-.4H15V18Z",
    property: "M4 11.2 12 4l8 7.2V20h-5.5v-5h-5v5H4v-8.8Zm6.5 6.8h3v-3h-3v3Z",
    student: "M12 4 3.5 8.4 12 13l6.8-3.7v4.3h1.7V8.4L12 4Zm-6.8 7.5V15c0 2.2 3 4 6.8 4s6.8-1.8 6.8-4v-3.5L12 15l-6.8-3.5Z",
    tourist: "M11.8 2.5c1.9 0 3.6.6 5 1.6l1.2-.8 1 1.4-1.1.8c1.2 1.5 1.9 3.4 1.9 5.5 0 5-4 9-9 9s-9-4-9-9 4-9 9-9Zm0 2c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7Zm0 1.9.8 2.4h2.6l-2.1 1.5.8 2.5-2.1-1.5-2.1 1.5.8-2.5-2.1-1.5h2.6l.8-2.4Z",
    digitalNomad: "M5 5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5v6A1.5 1.5 0 0 1 17.5 13H14l1 2h1.8V17H7.2v-2H9l1-2H6.5A1.5 1.5 0 0 1 5 11.5v-6Zm2 0v5.5h10V5.5H7Zm4.2 10.5h1.6l-.8-1.6-.8 1.6Z",
    longterm: "M12 3.5 5 7v5c0 4 2.8 6.8 7 8.5 4.2-1.7 7-4.5 7-8.5V7l-7-3.5Zm0 2.2L17 8.2V12c0 2.9-1.9 5.1-5 6.4-3.1-1.3-5-3.5-5-6.4V8.2l5-2.5Zm-1 2.8v4.8h2V8.5h-2Zm0 5.8v2h2v-2h-2Z",
    citizenship: "M12 3.5 4 6.8v4.4c0 5.1 3.2 8.5 8 10.3 4.8-1.8 8-5.2 8-10.3V6.8l-8-3.3Zm0 2.2 6 2.5v3c0 3.9-2.3 6.5-6 8-3.7-1.5-6-4.1-6-8v-3l6-2.5Zm-1.3 3.2v6h2.6v-2h-1.3V8.9h-1.3Z",
    spouse: "M9 6.7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm6 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM12 20l-4.7-4.6A4 4 0 0 1 12.9 10a4 4 0 0 1 5.8 5.4L14 20h-2Z",
    partner: "M12 4.2a3.8 3.8 0 0 1 3.4 2.1 3.8 3.8 0 1 1 4.9 5.3L12 20 3.7 11.6a3.8 3.8 0 1 1 4.9-5.3A3.8 3.8 0 0 1 12 4.2Z",
    marriage: "M9.2 5.5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.6 0a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4ZM8 12.7h8V15H8v-2.3Zm-2 4h12V19H6v-2.3Z",
    yes: "M9.2 16.8 4.6 12.2l1.4-1.4 3.2 3.2 8-8 1.4 1.4-9.4 9.4Z",
    no: "m6 6 12 12m0-12L6 18",
    soon: "M12 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm-1 3v4.2l3 1.8 1-1.6-2-1.2V7h-2Z",
    talk: "M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H9l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 12.5v-7Zm4 3.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm4 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm4 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z",
    deadline: "M7 3.5V5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3.5h-2V5H9V3.5H7Zm-1 5.8h12V17H6V9.3Zm2.4 2.2v2h2v-2h-2Zm3.8 0v2h2v-2h-2Z",
    fine: "M12 3.5 4 7.2v5c0 4.4 2.7 7.5 8 9.3 5.3-1.8 8-4.9 8-9.3v-5L12 3.5Zm0 2.2 6 2.8v3.7c0 3.1-1.8 5.4-6 6.9-4.2-1.5-6-3.8-6-6.9V8.5l6-2.8Zm-1.1 3.4v4.2h2.2V9.1H10.9Zm0 5.4v2.1h2.2v-2.1H10.9Z",
    deportation: "M12 3 3 7.5v5.8C3 18 6.2 21.1 12 23c5.8-1.9 9-5 9-9.7V7.5L12 3Zm0 2.2 6.8 3.2v4.9c0 3.3-2.2 5.8-6.8 7.4-4.6-1.6-6.8-4.1-6.8-7.4V8.4L12 5.2Z",
    email: "M4 6.2A2.2 2.2 0 0 1 6.2 4h11.6A2.2 2.2 0 0 1 20 6.2v11.6a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 17.8V6.2Zm2 .2V7l6 4.3L18 7v-.6a.2.2 0 0 0-.2-.2H6.2a.2.2 0 0 0-.2.2Zm12 3.1-5.4 3.9a1 1 0 0 1-1.2 0L6 9.5v8.3c0 .1.1.2.2.2h11.6c.1 0 .2-.1.2-.2V9.5Z",
    phone: "M7.6 4h2.8l1 4-1.8 1.8a12 12 0 0 0 4.8 4.8l1.8-1.8 4 1v2.8c0 1.1-.9 2-2 2C10 18.6 5.4 14 5.4 8.6c0-1.1.9-2 2.2-2.2Z",
    flag: "M6 4h2v16H6V4Zm3 1h8l-1.8 3L17 11H9V5Z",
    brazil: "M12 3.4 21 12l-9 8.6L3 12l9-8.6Zm0 2.7L5.8 12l6.2 5.9 6.2-5.9L12 6.1Zm0 2.3a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z"
  };

  /* ==========================================================================
   * 04. Locale, URL, Escaping, and Tracking Helpers
   * Keeps route resolution and analytics payloads consistent across locales.
   * ========================================================================== */
  function text(value, isPt) {
    if (value && typeof value === "object") return isPt ? value.pt : value.en;
    return value || "";
  }

  function option(id, en, pt, icon, config = {}) {
    return {
      id,
      label: { en, pt },
      icon,
      description: config.description || null,
      next: config.next || null,
      result: config.result || null,
      action: config.action || null
    };
  }

  function resultConfig(config) {
    return config;
  }

  function getUrls() {
    if (window.ITB_URLS) return window.ITB_URLS;

    function normalizeSitePath(pathname) {
      if (!pathname) return "/";
      let clean = String(pathname).trim();
      if (!clean) return "/";
      clean = clean.replace(/\/index\.html$/i, "/");
      if (!clean.startsWith("/")) clean = `/${clean}`;
      if (!clean.endsWith("/") && !/\.[a-z0-9]+$/i.test(clean)) clean = `${clean}/`;
      return clean;
    }

    function getSitePath() {
      return normalizeSitePath(window.location.pathname || "/");
    }

    function getLocale() {
      const path = getSitePath();
      return path === "/pt-br/" || path.startsWith("/pt-br/") ? "pt-br" : "en";
    }

    function getRootPrefix() {
      const parts = getSitePath().replace(/^\/|\/$/g, "").split("/").filter(Boolean);
      return parts.length ? "../".repeat(parts.length) : "./";
    }

    function resolveSiteUrl(value) {
      if (!value) return value;
      const raw = String(value);
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(raw)) return raw;
      if (!raw.startsWith("/")) return raw;
      return `${getRootPrefix()}${raw.replace(/^\/+/, "")}`;
    }

    return { getLocale, resolveSiteUrl };
  }

  function localizeRoute(route, isPt) {
    if (!route || !String(route).startsWith("/")) return route;
    const clean = String(route).startsWith("/pt-br/") ? String(route).replace(/^\/pt-br/, "") || "/" : String(route);
    if (isPt) return clean === "/" ? "/pt-br/" : `/pt-br${clean}`;
    return clean;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getIcon(name) {
    const path = ICONS[name] || ICONS.unsure || "";
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="currentColor"/></svg>`;
  }

  function track(event, payload) {
    if (!window.dataLayer) return;
    window.dataLayer.push({
      event,
      page_route: window.ITB_SITE?.pageRoute || window.location.pathname,
      ...payload
    });
  }

  /* ==========================================================================
   * 05. Guided Flow Definition
   * Defines each question, option, branch, and recommendation in the chat path.
   * ========================================================================== */
  function buildFlow() {
    return {
      root: {
        message: {
          en: "Hello, I'm Nina. I can help you understand your options for moving to Brazil and guide you to the most suitable next step.",
          pt: "Ola, eu sou a Nina. Posso ajudar voce a entender suas opcoes para se mudar para o Brasil e orientar voce para o proximo passo mais adequado."
        },
        prompt: {
          en: "What would you like to achieve in Brazil?",
          pt: "O que voce gostaria de fazer no Brasil?"
        },
        options: [
          option("move", "I'm planning to move to Brazil", "Estou planejando me mudar para o Brasil", "move", { next: "moveProfile" }),
          option("visa", "I need help understanding visa options", "Preciso de ajuda para entender as opcoes de visto", "visa", { next: "visaStart" }),
          option("longterm", "I want to live in Brazil long-term", "Quero viver no Brasil no longo prazo", "longterm", { next: "longTerm" }),
          option("citizenship", "I'm interested in citizenship or permanent status", "Tenho interesse em cidadania ou status permanente", "citizenship", { next: "citizenship" }),
          option("urgent", "I have an urgent immigration situation", "Tenho uma situacao migratoria urgente", "urgent", { next: "urgent" }),
          option("unsure", "I'm not sure which path is right for me", "Nao tenho certeza de qual caminho e certo para mim", "unsure", { next: "unsure" }),
          option("human", "I'd prefer to speak with someone directly", "Prefiro falar diretamente com alguem", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Before I connect you, may I ask for a few details so the team can better understand your situation?",
                pt: "Claro. Antes de conectar voce, posso pedir alguns detalhes para que a equipe entenda melhor a sua situacao?"
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "Nina will pass this to the team so a human can review the context before replying.",
                pt: "A Nina vai encaminhar isso para a equipe para que uma pessoa possa revisar o contexto antes de responder."
              },
              serviceKeys: ["advisoryConsultation", "aboutLawyer"]
            }
          })
        ]
      },
      moveProfile: {
        message: {
          en: "Great - there are several ways people move to Brazil depending on their goals, work situation, family ties, or investment plans.",
          pt: "Perfeito - existem varias formas de mudar para o Brasil dependendo dos seus objetivos, situacao de trabalho, vinculos familiares ou planos de investimento."
        },
        prompt: { en: "Which best describes you?", pt: "Qual destas opcoes descreve melhor voce?" },
        options: [
          option("remote", "I work remotely", "Eu trabalho remotamente", "remote", { next: "moveRemote" }),
          option("spouse", "I have a Brazilian spouse or partner", "Tenho conjuge ou parceiro brasileiro", "family", { next: "moveFamily" }),
          option("retire", "I want to retire in Brazil", "Quero me aposentar no Brasil", "retire", { next: "moveRetire" }),
          option("invest", "I want to invest or start a business", "Quero investir ou abrir um negocio", "invest", { next: "moveInvest" }),
          option("job", "I have a job opportunity in Brazil", "Tenho uma oportunidade de trabalho no Brasil", "work", { next: "moveJob" }),
          option("explore", "I am still exploring options", "Ainda estou explorando as opcoes", "explore", {
            result: resultConfig({
              message: {
                en: "That is completely normal. Many people are unsure whether they need a visa, residency, or another immigration route. A member of the team can help you compare the main options based on your goals.",
                pt: "Isso e completamente normal. Muitas pessoas nao sabem se precisam de visto, residencia ou outra rota migratoria. Um membro da equipe pode ajudar voce a comparar as principais opcoes com base nos seus objetivos."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are a strong starting point for people still comparing routes.",
                pt: "Estas paginas sao um bom ponto de partida para quem ainda esta comparando rotas."
              },
              serviceKeys: ["advisoryConsultation", "advisoryStrategy", "brazilLiving"]
            })
          }),
          option("none", "None of the above", "Nenhuma das opcoes acima", "unsure", {
            result: resultConfig({
              message: {
                en: "That is fine. A tailored review is usually the strongest next step when the route is still unclear.",
                pt: "Tudo bem. Uma analise personalizada costuma ser o melhor proximo passo quando a rota ainda nao esta clara."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the main route still needs to be clarified.",
                pt: "Estas paginas sao uteis quando a rota principal ainda precisa ser esclarecida."
              },
              serviceKeys: ["advisoryConsultation", "processAssessment", "visasHub"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review what kind of move you are considering.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar que tipo de mudanca voce esta considerando."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This will help the team understand the kind of move you may be planning.",
                pt: "Isso ajudara a equipe a entender que tipo de mudanca voce pode estar planejando."
              },
              serviceKeys: ["advisoryConsultation", "advisoryStrategy"]
            }
          })
        ]
      },
      moveRemote: {
        message: {
          en: "Remote workers often qualify for Brazil's Digital Nomad Visa if they earn income from outside Brazil. Does that sound interesting to you? Are you currently working for a company outside Brazil or running your own business?",
          pt: "Trabalhadores remotos costumam se enquadrar no Visto de Nomade Digital do Brasil quando recebem renda de fora do pais. Isso parece interessante para voce? Voce trabalha para uma empresa de fora ou tem o seu proprio negocio?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("company", "I work for a company", "Eu trabalho para uma empresa", "company", {
            result: resultConfig({
              message: {
                en: "That may be a good route to explore. Brazil may also have residency pathways worth reviewing if you plan to stay long-term.",
                pt: "Essa pode ser uma boa rota para explorar. O Brasil tambem pode ter caminhos de residencia que valem a revisao se voce pretende ficar no longo prazo."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages look closest to the kind of support you may be looking for.",
                pt: "Estas paginas parecem as mais proximas do tipo de apoio que voce pode estar buscando."
              },
              serviceKeys: ["visaNomad", "residencyNomad", "processPlanning"]
            })
          }),
          option("business", "I run my own business", "Eu tenho meu proprio negocio", "invest", {
            result: resultConfig({
              message: {
                en: "That may still be a good route to review, and business structure may also matter depending on how you work remotely.",
                pt: "Ainda pode ser uma boa rota para revisar, e a estrutura do negocio tambem pode importar dependendo de como voce trabalha remotamente."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages may be the strongest starting points for this kind of remote-work situation.",
                pt: "Estas paginas podem ser os pontos de partida mais fortes para esse tipo de situacao de trabalho remoto."
              },
              serviceKeys: ["visaNomad", "advisoryCorporate", "residencyNomad"]
            })
          }),
          option("interesting", "It sounds interesting", "Parece interessante", "digitalNomad", {
            result: resultConfig({
              message: {
                en: "That may be a useful route to review. The team can help compare it with longer-term residency planning if that matters for your goals.",
                pt: "Essa pode ser uma rota util para revisar. A equipe pode ajudar a comparar com planejamento de residencia de longo prazo se isso importar para os seus objetivos."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages will help the team understand the route you are considering.",
                pt: "Estas paginas ajudarao a equipe a entender a rota que voce esta considerando."
              },
              serviceKeys: ["visaNomad", "processAssessment", "processPlanning"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review your remote-work situation directly.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar diretamente a sua situacao de trabalho remoto."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This will help the team understand whether visa, residency, or business-linked planning may matter most.",
                pt: "Isso ajudara a equipe a entender se visto, residencia ou planejamento ligado ao negocio e o que mais importa."
              },
              serviceKeys: ["visaNomad", "residencyNomad", "advisoryCorporate"]
            }
          })
        ]
      },
      moveFamily: {
        message: {
          en: "Family-based residency may be available if you are with a Brazilian citizen or in a stable union. Are you already married or living together?",
          pt: "A residencia por reuniao familiar pode estar disponivel se voce estiver com uma pessoa brasileira ou em uniao estavel. Voces ja sao casados ou moram juntos?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("married", "Married", "Casados", "marriage", {
            result: resultConfig({
              message: {
                en: "You may have a residency pathway available. The team can review the strongest next step with you.",
                pt: "Voce pode ter um caminho de residencia disponivel. A equipe pode revisar com voce qual e o proximo passo mais forte."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant in family-linked cases.",
                pt: "Estas paginas costumam ser relevantes em casos ligados a familia."
              },
              serviceKeys: ["visaFamily", "residencyReunion", "processConsultation"]
            })
          }),
          option("living", "Living together", "Morando juntos", "partner", {
            result: resultConfig({
              message: {
                en: "You may have a residency pathway available, especially if the relationship facts can be documented clearly.",
                pt: "Voce pode ter um caminho de residencia disponivel, especialmente se os fatos da relacao puderem ser documentados com clareza."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are a strong starting point for family-linked planning.",
                pt: "Estas paginas sao um bom ponto de partida para planejamento ligado a familia."
              },
              serviceKeys: ["residencyReunion", "visaFamily", "processAssessment"]
            })
          }),
          option("planning-marriage", "Planning to marry", "Planejando casar", "spouse", {
            result: resultConfig({
              message: {
                en: "That may open a pathway, but timing and preparation can matter a great deal.",
                pt: "Isso pode abrir um caminho, mas o tempo e a preparacao podem importar bastante."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when a family-based route may be developing.",
                pt: "Estas paginas sao uteis quando uma rota familiar pode estar se formando."
              },
              serviceKeys: ["visaFamily", "processPlanning", "processConsultation"]
            })
          }),
          option("planning-together", "Planning to live together", "Planejando morar juntos", "family", {
            result: resultConfig({
              message: {
                en: "That may still lead to a family-based route, but the practical facts will matter.",
                pt: "Isso ainda pode levar a uma rota familiar, mas os fatos praticos vao importar."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the relationship route still needs structure.",
                pt: "Estas paginas sao uteis quando a rota baseada na relacao ainda precisa de estrutura."
              },
              serviceKeys: ["processAssessment", "visaFamily", "residencyReunion"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review your family situation directly.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar diretamente a sua situacao familiar."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This helps the team understand whether a family visa, family reunion residence, or broader planning is more relevant.",
                pt: "Isso ajuda a equipe a entender se visto familiar, reuniao familiar ou planejamento mais amplo e o mais relevante."
              },
              serviceKeys: ["visaFamily", "residencyReunion", "processConsultation"]
            }
          })
        ]
      },
      moveRetire: {
        message: {
          en: "Brazil has options for retirees who receive qualifying pension or retirement income. Do you currently receive retirement or pension income?",
          pt: "O Brasil tem opcoes para aposentados que recebem pensao ou renda de aposentadoria compativel. Voce recebe atualmente renda de aposentadoria ou pensao?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("yes", "Yes", "Sim", "yes", {
            result: resultConfig({
              message: {
                en: "You may be eligible for a retirement-based route. The team can review whether visa planning, residency planning, or both matter most.",
                pt: "Voce pode ser elegivel para uma rota baseada em aposentadoria. A equipe pode revisar se o mais importante e planejamento de visto, de residencia ou ambos."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful for retirement-based moves.",
                pt: "Estas paginas costumam ser uteis para mudancas baseadas em aposentadoria."
              },
              serviceKeys: ["visaRetiree", "residencyRetiree", "processPlanning"]
            })
          }),
          option("no", "No", "Nao", "no", {
            result: resultConfig({
              message: {
                en: "That may mean another route is more suitable, depending on your goals and timeline.",
                pt: "Isso pode significar que outra rota seja mais adequada, dependendo dos seus objetivos e do seu prazo."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages can help narrow down a more suitable path.",
                pt: "Estas paginas podem ajudar a afunilar um caminho mais adequado."
              },
              serviceKeys: ["advisoryConsultation", "residenciesHub", "processAssessment"]
            })
          }),
          option("soon", "Soon", "Em breve", "soon", {
            result: resultConfig({
              message: {
                en: "That may still be worth planning early so the timing and documents are stronger when you are ready.",
                pt: "Ainda pode valer a pena planejar cedo para que o tempo e os documentos estejam mais fortes quando voce estiver pronto."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful if retirement planning is part of the move but the timing is still developing.",
                pt: "Estas paginas sao uteis se o planejamento de aposentadoria faz parte da mudanca, mas o prazo ainda esta se formando."
              },
              serviceKeys: ["processPlanning", "visaRetiree", "advisoryConsultation"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review your retirement plans directly.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar diretamente os seus planos de aposentadoria."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This helps the team understand whether a retirement route or another long-term plan may be more suitable.",
                pt: "Isso ajuda a equipe a entender se uma rota de aposentadoria ou outro plano de longo prazo pode ser mais adequado."
              },
              serviceKeys: ["visaRetiree", "residencyRetiree", "processPlanning"]
            }
          })
        ]
      },
      moveInvest: {
        message: {
          en: "Investor and business visas may be available depending on the type of investment or business activity you plan to pursue. Which sounds closer to your situation?",
          pt: "Vistos de investidor e negocios podem estar disponiveis dependendo do tipo de investimento ou atividade empresarial que voce pretende seguir. O que parece mais proximo da sua situacao?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("open-business", "I want to open a business", "Quero abrir um negocio", "company", {
            result: resultConfig({
              message: {
                en: "There may be a few possible routes depending on your plans. Business structure can make a real difference here.",
                pt: "Pode haver algumas rotas possiveis dependendo dos seus planos. A estrutura do negocio pode fazer uma diferenca real aqui."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant for business-linked moves.",
                pt: "Estas paginas costumam ser relevantes para mudancas ligadas a negocios."
              },
              serviceKeys: ["visaInvestor", "advisoryCorporate", "residencyInvestor"]
            })
          }),
          option("existing-business", "I want to invest in an existing business", "Quero investir em um negocio existente", "invest", {
            result: resultConfig({
              message: {
                en: "There may be a few possible routes depending on your investment structure and timeline.",
                pt: "Pode haver algumas rotas possiveis dependendo da sua estrutura de investimento e do seu cronograma."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when investment is at the center of the move.",
                pt: "Estas paginas costumam ser uteis quando o investimento esta no centro da mudanca."
              },
              serviceKeys: ["visaInvestor", "residencyInvestor", "advisoryCorporate"]
            })
          }),
          option("property", "I want to buy property", "Quero comprar um imovel", "property", {
            result: resultConfig({
              message: {
                en: "That may connect to broader planning, but buying property does not always mean the same thing as having the strongest immigration route.",
                pt: "Isso pode se conectar a um planejamento mais amplo, mas comprar um imovel nem sempre significa ter a rota migratoria mais forte."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when investment ideas need legal route comparison.",
                pt: "Estas paginas sao uteis quando ideias de investimento precisam ser comparadas com as rotas juridicas."
              },
              serviceKeys: ["advisoryStrategy", "visaInvestor", "processAssessment"]
            })
          }),
          option("not-sure", "I am not sure yet", "Ainda nao tenho certeza", "unsure", {
            result: resultConfig({
              message: {
                en: "That is completely fine. Route comparison is often the most useful first step in investor and business planning.",
                pt: "Tudo bem. Comparar rotas costuma ser o primeiro passo mais util no planejamento de investidor e negocios."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are strong starting points for investor and business planning that still needs structure.",
                pt: "Estas paginas sao bons pontos de partida para planejamento de investidor e negocios que ainda precisa de estrutura."
              },
              serviceKeys: ["advisoryConsultation", "advisoryCorporate", "visaInvestor"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review your business or investment plans directly.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar diretamente os seus planos de negocio ou investimento."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This helps the team understand whether investment, corporate planning, or a different route may be more relevant.",
                pt: "Isso ajuda a equipe a entender se investimento, planejamento corporativo ou uma rota diferente pode ser mais relevante."
              },
              serviceKeys: ["advisoryCorporate", "visaInvestor", "residencyInvestor"]
            }
          })
        ]
      },
      moveJob: {
        message: {
          en: "Employment-based visas can depend on the employer, job type, and how developed the offer already is. Has a Brazilian company already offered you a position?",
          pt: "Vistos baseados em emprego podem depender do empregador, do tipo de trabalho e de quanto a oferta ja esta desenvolvida. Uma empresa brasileira ja ofereceu uma vaga para voce?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("yes", "Yes", "Sim", "yes", {
            result: resultConfig({
              message: {
                en: "That can make a major difference in the available visa process. The team can review the strongest next step with you.",
                pt: "Isso pode fazer uma grande diferenca no processo de visto disponivel. A equipe pode revisar com voce qual e o proximo passo mais forte."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant when a Brazilian employer is already involved.",
                pt: "Estas paginas costumam ser relevantes quando um empregador brasileiro ja esta envolvido."
              },
              serviceKeys: ["visaWork", "residencyWork", "processFiling"]
            })
          }),
          option("no", "No", "Nao", "no", {
            result: resultConfig({
              message: {
                en: "That can change the available options significantly. A route review is usually the best place to start.",
                pt: "Isso pode mudar bastante as opcoes disponiveis. Uma revisao de rota costuma ser o melhor lugar para comecar."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages can help narrow down the strongest route before the employment side is fully settled.",
                pt: "Estas paginas podem ajudar a afunilar a rota mais forte antes que a parte de emprego esteja totalmente definida."
              },
              serviceKeys: ["advisoryConsultation", "visaWork", "advisoryRepresentation"]
            })
          }),
          option("discussing", "We are still discussing it", "Ainda estamos conversando", "talk", {
            result: resultConfig({
              message: {
                en: "That may still be workable, but the details can affect which route is realistic and how the process should be prepared.",
                pt: "Isso ainda pode ser viavel, mas os detalhes podem afetar qual rota e realista e como o processo deve ser preparado."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the employment route is still taking shape.",
                pt: "Estas paginas sao uteis quando a rota baseada em emprego ainda esta tomando forma."
              },
              serviceKeys: ["visaWork", "processAssessment", "advisoryRepresentation"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review your work-related plans directly.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar diretamente os seus planos ligados a trabalho."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This helps the team understand whether visa, residency, or employer-linked planning matters most.",
                pt: "Isso ajuda a equipe a entender se o mais importante e visto, residencia ou planejamento ligado ao empregador."
              },
              serviceKeys: ["visaWork", "residencyWork", "advisoryRepresentation"]
            }
          })
        ]
      },
      visaStart: {
        message: {
          en: "Brazil offers different visa options depending on your purpose for coming. Which of these sounds closest to your situation?",
          pt: "O Brasil oferece diferentes opcoes de visto dependendo do seu objetivo para vir. Qual destas parece mais proxima da sua situacao?"
        },
        prompt: { en: "Which visa area sounds closest?", pt: "Qual area de visto parece mais proxima?" },
        options: [
          option("tourist", "Tourist visa", "Visto de turista", "tourist", { next: "visaTourist" }),
          option("nomad", "Digital nomad visa", "Visto de nomade digital", "digitalNomad", { next: "visaNomad" }),
          option("work", "Work visa", "Visto de trabalho", "work", { next: "visaWork" }),
          option("student", "Student visa", "Visto de estudante", "student", { next: "visaStudent" }),
          option("investor", "Investor visa", "Visto de investidor", "invest", { next: "visaInvestor" }),
          option("family", "Family visa", "Visto familiar", "family", { next: "visaFamily" }),
          option("humanitarian", "Humanitarian visa", "Visto humanitario", "urgent", {
            result: resultConfig({
              message: {
                en: "Humanitarian matters usually need a more careful review of your personal circumstances, nationality, and urgency.",
                pt: "Questoes humanitarias normalmente precisam de uma revisao mais cuidadosa das suas circunstancias pessoais, nacionalidade e urgencia."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant when humanitarian grounds may shape the route.",
                pt: "Estas paginas costumam ser relevantes quando fundamentos humanitarios podem moldar a rota."
              },
              serviceKeys: ["visaHumanitarian", "residencyHumanitarian", "advisoryConsultation"]
            })
          }),
          option("other", "Another visa route", "Outra rota de visto", "passport", { next: "visaOther" }),
          option("not-sure", "I am not sure", "Nao tenho certeza", "unsure", {
            result: resultConfig({
              message: {
                en: "That is completely fine. Many people are unsure which visa is most suitable at first. A member of the team can help narrow down the best options based on your goals.",
                pt: "Tudo bem. Muitas pessoas nao sabem qual visto e o mais adequado no inicio. Um membro da equipe pode ajudar a afunilar as melhores opcoes com base nos seus objetivos."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are strong starting points when the visa route still needs to be narrowed down.",
                pt: "Estas paginas sao bons pontos de partida quando a rota de visto ainda precisa ser afunilada."
              },
              serviceKeys: ["visasHub", "advisoryConsultation", "processAssessment"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review which visa area may fit best.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar qual area de visto pode se encaixar melhor."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This helps the team understand which visa route you may be considering.",
                pt: "Isso ajuda a equipe a entender qual rota de visto voce pode estar considerando."
              },
              serviceKeys: ["visasHub", "advisoryConsultation", "aboutLawyer"]
            }
          })
        ]
      },
      visaTourist: {
        message: {
          en: "Tourist visas are generally for short stays. How long are you hoping to stay in Brazil?",
          pt: "Vistos de turista costumam ser para estadias curtas. Quanto tempo voce espera ficar no Brasil?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("under-90", "Less than 90 days", "Menos de 90 dias", "tourist", {
            result: resultConfig({
              message: {
                en: "A tourist route may be relevant here, but it is still worth confirming the practical limits before you rely on it.",
                pt: "Uma rota de turista pode ser relevante aqui, mas ainda vale confirmar os limites praticos antes de depender dela."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful for short-stay planning.",
                pt: "Estas paginas sao uteis para planejamento de curta permanencia."
              },
              serviceKeys: ["visaTourist", "processPlanning", "advisoryConsultation"]
            })
          }),
          option("around-6", "Around 6 months", "Em torno de 6 meses", "deadline", {
            result: resultConfig({
              message: {
                en: "If you are planning a longer stay, another visa or residency route may be more suitable.",
                pt: "Se voce esta planejando uma permanencia mais longa, outro visto ou rota de residencia pode ser mais adequado."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are useful when a tourist route may not be enough on its own.",
                pt: "Estas paginas sao uteis quando a rota de turista pode nao ser suficiente sozinha."
              },
              serviceKeys: ["visaTourist", "residenciesHub", "advisoryStrategy"]
            })
          }),
          option("over-6", "Longer than 6 months", "Mais de 6 meses", "longterm", {
            result: resultConfig({
              message: {
                en: "That usually means another visa or residency route may be more suitable than a tourist approach alone.",
                pt: "Isso normalmente significa que outro visto ou rota de residencia pode ser mais adequado do que uma abordagem apenas de turista."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are a stronger place to start for longer-term planning.",
                pt: "Estas paginas sao um ponto de partida mais forte para planejamento de longo prazo."
              },
              serviceKeys: ["residenciesHub", "advisoryConsultation", "processPlanning"]
            })
          })
        ]
      },
      visaNomad: {
        message: {
          en: "The Digital Nomad Visa is designed for people who work remotely and earn income from outside Brazil. Do you currently work remotely full-time?",
          pt: "O Visto de Nomade Digital e voltado para pessoas que trabalham remotamente e recebem renda de fora do Brasil. Voce trabalha remotamente em tempo integral?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("yes", "Yes", "Sim", "yes", {
            result: resultConfig({
              message: {
                en: "You may have a route available. The team can help confirm whether this route and longer-term planning make sense together.",
                pt: "Voce pode ter uma rota disponivel. A equipe pode ajudar a confirmar se essa rota e o planejamento de longo prazo fazem sentido juntos."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant for remote workers planning a move to Brazil.",
                pt: "Estas paginas costumam ser relevantes para trabalhadores remotos planejando uma mudanca para o Brasil."
              },
              serviceKeys: ["visaNomad", "residencyNomad", "processPlanning"]
            })
          }),
          option("part-time", "Part time", "Meio periodo", "digitalNomad", {
            result: resultConfig({
              message: {
                en: "That may still be worth reviewing, but the exact facts can matter a great deal.",
                pt: "Ainda pode valer a pena revisar, mas os fatos exatos podem importar bastante."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the route may be possible but needs closer review.",
                pt: "Estas paginas sao uteis quando a rota pode ser possivel, mas precisa de revisao mais cuidadosa."
              },
              serviceKeys: ["visaNomad", "processAssessment", "advisoryConsultation"]
            })
          }),
          option("no", "No", "Nao", "no", {
            result: resultConfig({
              message: {
                en: "That may mean another visa or residency route is more suitable for your plans.",
                pt: "Isso pode significar que outro visto ou rota de residencia seja mais adequado para os seus planos."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages can help compare other possible routes.",
                pt: "Estas paginas podem ajudar a comparar outras rotas possiveis."
              },
              serviceKeys: ["visasHub", "advisoryConsultation", "processAssessment"]
            })
          })
        ]
      },
      visaWork: {
        message: {
          en: "Work visas usually require a Brazilian employer. Do you already have a company in mind in Brazil?",
          pt: "Vistos de trabalho normalmente exigem um empregador brasileiro. Voce ja tem uma empresa em mente no Brasil?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("yes", "Yes", "Sim", "yes", {
            result: resultConfig({
              message: {
                en: "That can change the available options significantly and may strengthen the route.",
                pt: "Isso pode mudar bastante as opcoes disponiveis e pode fortalecer a rota."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant when a Brazilian employer is already part of the picture.",
                pt: "Estas paginas costumam ser relevantes quando um empregador brasileiro ja faz parte do quadro."
              },
              serviceKeys: ["visaWork", "residencyWork", "processFiling"]
            })
          }),
          option("no", "No", "Nao", "no", {
            result: resultConfig({
              message: {
                en: "The answer can change the available options significantly. A route review is usually the strongest next step.",
                pt: "A resposta pode mudar bastante as opcoes disponiveis. Uma revisao de rota costuma ser o proximo passo mais forte."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages can help compare the next best route when an employer is not settled yet.",
                pt: "Estas paginas podem ajudar a comparar a melhor rota quando o empregador ainda nao esta definido."
              },
              serviceKeys: ["advisoryConsultation", "visaWork", "advisoryRepresentation"]
            })
          }),
          option("not-sure", "Not sure", "Nao tenho certeza", "unsure", {
            result: resultConfig({
              message: {
                en: "That is still worth reviewing early, because the work route can depend heavily on how the case is structured.",
                pt: "Ainda vale a pena revisar cedo, porque a rota de trabalho pode depender muito de como o caso e estruturado."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the work route is still uncertain.",
                pt: "Estas paginas sao uteis quando a rota de trabalho ainda esta incerta."
              },
              serviceKeys: ["processAssessment", "visaWork", "advisoryConsultation"]
            })
          })
        ]
      },
      visaStudent: {
        message: {
          en: "Student visas are usually tied to enrollment in a recognized educational institution. Have you already been accepted by a school or university in Brazil?",
          pt: "Vistos de estudante normalmente estao ligados a matricula em uma instituicao de ensino reconhecida. Voce ja foi aceito por uma escola ou universidade no Brasil?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("yes", "Yes", "Sim", "yes", {
            result: resultConfig({
              message: {
                en: "That can make the route much more concrete. The team can help you understand the next steps and document planning.",
                pt: "Isso pode tornar a rota muito mais concreta. A equipe pode ajudar voce a entender os proximos passos e o planejamento documental."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when an educational institution is already involved.",
                pt: "Estas paginas costumam ser uteis quando uma instituicao de ensino ja esta envolvida."
              },
              serviceKeys: ["visaStudent", "residencyStudy", "processFiling"]
            })
          }),
          option("no", "No", "Nao", "no", {
            result: resultConfig({
              message: {
                en: "That may mean the route still needs early planning before the formal process can become strong.",
                pt: "Isso pode significar que a rota ainda precisa de planejamento inicial antes de o processo formal se fortalecer."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages can help clarify the route before admission is finalized.",
                pt: "Estas paginas podem ajudar a esclarecer a rota antes que a admissao seja finalizada."
              },
              serviceKeys: ["visaStudent", "advisoryConsultation", "processPlanning"]
            })
          }),
          option("progress", "In progress", "Em andamento", "student", {
            result: resultConfig({
              message: {
                en: "That may still be workable, but the timing and supporting facts can matter.",
                pt: "Isso ainda pode ser viavel, mas o tempo e os fatos de apoio podem importar."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the student route is developing but not finalized yet.",
                pt: "Estas paginas sao uteis quando a rota de estudante esta se desenvolvendo, mas ainda nao foi finalizada."
              },
              serviceKeys: ["visaStudent", "processAssessment", "processPlanning"]
            })
          })
        ]
      },
      visaInvestor: {
        message: {
          en: "Investor visas may be available if you plan to invest in a Brazilian business or company. Do you already have a business or investment idea in mind?",
          pt: "Vistos de investidor podem estar disponiveis se voce pretende investir em uma empresa ou negocio brasileiro. Voce ja tem uma ideia de negocio ou investimento em mente?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("yes", "Yes", "Sim", "yes", {
            result: resultConfig({
              message: {
                en: "There may be more than one possible route depending on your plans. The team can help compare the strongest path.",
                pt: "Pode haver mais de uma rota possivel dependendo dos seus planos. A equipe pode ajudar a comparar o caminho mais forte."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant when the investment idea is already taking shape.",
                pt: "Estas paginas costumam ser relevantes quando a ideia de investimento ja esta tomando forma."
              },
              serviceKeys: ["visaInvestor", "residencyInvestor", "advisoryCorporate"]
            })
          }),
          option("no", "No", "Nao", "no", {
            result: resultConfig({
              message: {
                en: "That may mean route comparison should come first before choosing a formal investor pathway.",
                pt: "Isso pode significar que a comparacao de rotas deve vir primeiro antes de escolher uma via formal de investidor."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the investor route still needs shape and strategy.",
                pt: "Estas paginas sao uteis quando a rota de investidor ainda precisa de forma e estrategia."
              },
              serviceKeys: ["advisoryConsultation", "advisoryCorporate", "processAssessment"]
            })
          }),
          option("exploring", "Exploring options", "Explorando opcoes", "explore", {
            result: resultConfig({
              message: {
                en: "There may be more than one possible route depending on what you ultimately want to do in Brazil.",
                pt: "Pode haver mais de uma rota possivel dependendo do que voce quer fazer no Brasil em ultimo caso."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are a strong starting point for investor and business-linked exploration.",
                pt: "Estas paginas sao um bom ponto de partida para exploracao ligada a investimento e negocios."
              },
              serviceKeys: ["advisoryCorporate", "visaInvestor", "advisoryStrategy"]
            })
          })
        ]
      },
      visaFamily: {
        message: {
          en: "Family-based visas or residency may be possible if you have family ties in Brazil. Do you have a Brazilian spouse, partner, child, or parent?",
          pt: "Vistos ou residencia baseados em familia podem ser possiveis se voce tem vinculos familiares no Brasil. Voce tem conjuge, parceiro, filho ou pai ou mae brasileiro?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("yes", "Yes", "Sim", "yes", {
            result: resultConfig({
              message: {
                en: "Family relationships can create immigration pathways. The team can help review the strongest next step.",
                pt: "Relacoes familiares podem criar caminhos migratorios. A equipe pode ajudar a revisar qual e o proximo passo mais forte."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often relevant when family ties may support the route.",
                pt: "Estas paginas costumam ser relevantes quando vinculos familiares podem sustentar a rota."
              },
              serviceKeys: ["visaFamily", "residencyReunion", "processConsultation"]
            })
          }),
          option("no", "No", "Nao", "no", {
            result: resultConfig({
              message: {
                en: "That may mean another route is more suitable, depending on your goals and timeline.",
                pt: "Isso pode significar que outra rota e mais adequada, dependendo dos seus objetivos e do seu prazo."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages can help compare other likely options.",
                pt: "Estas paginas podem ajudar a comparar outras opcoes provaveis."
              },
              serviceKeys: ["visasHub", "advisoryConsultation", "processAssessment"]
            })
          }),
          option("complicated", "It is complicated", "E complicado", "unsure", {
            result: resultConfig({
              message: {
                en: "That usually means the facts need to be reviewed carefully before the best route becomes clear.",
                pt: "Isso normalmente significa que os fatos precisam ser revisados com cuidado antes que a melhor rota fique clara."
              },
              title: { en: "Suggested starting pages", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when family-linked facts need closer review.",
                pt: "Estas paginas sao uteis quando os fatos ligados a familia precisam de revisao mais cuidadosa."
              },
              serviceKeys: ["processAssessment", "visaFamily", "residencyReunion"]
            })
          })
        ]
      },
      visaOther: {
        message: {
          en: "Brazil also has more specialized visa and entry routes. Which sounds closest to what you have in mind?",
          pt: "O Brasil tambem tem rotas de visto e entrada mais especializadas. Qual parece mais proxima do que voce tem em mente?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("creative", "Artistic or creative work", "Trabalho artistico ou criativo", "visa", {
            result: resultConfig({
              message: {
                en: "That may point to a more specialized route, and the exact activity usually matters.",
                pt: "Isso pode apontar para uma rota mais especializada, e a atividade exata costuma importar."
              },
              title: { en: "Suggested pages to review", pt: "Paginas sugeridas para revisar" },
              copy: {
                en: "These pages are often relevant for creative or specialist entry routes.",
                pt: "Estas paginas costumam ser relevantes para rotas de entrada criativas ou especializadas."
              },
              serviceKeys: ["visaArtistic", "advisoryRepresentation", "visasHub"]
            })
          }),
          option("business", "Business, startup, or investor activity", "Atividade de negocios, startup ou investidor", "company", {
            result: resultConfig({
              message: {
                en: "That may connect to a few different business-linked routes depending on the structure of the activity.",
                pt: "Isso pode se conectar a algumas rotas ligadas a negocios, dependendo da estrutura da atividade."
              },
              title: { en: "Suggested pages to review", pt: "Paginas sugeridas para revisar" },
              copy: {
                en: "These pages are often useful for business and specialist entry planning.",
                pt: "Estas paginas costumam ser uteis para planejamento de entrada ligado a negocios e casos especializados."
              },
              serviceKeys: ["visaBusiness", "visaStartup", "advisoryCorporate"]
            })
          }),
          option("education", "Educational or exchange route", "Rota educacional ou de intercambio", "student", {
            result: resultConfig({
              message: {
                en: "That may depend on the program structure and how formal the educational arrangement already is.",
                pt: "Isso pode depender da estrutura do programa e de quanto o arranjo educacional ja esta formalizado."
              },
              title: { en: "Suggested pages to review", pt: "Paginas sugeridas para revisar" },
              copy: {
                en: "These pages are often relevant for educational and exchange-linked routes.",
                pt: "Estas paginas costumam ser relevantes para rotas ligadas a educacao e intercambio."
              },
              serviceKeys: ["visaEducational", "visaExchange", "visaStudent"]
            })
          }),
          option("specialist", "Journalist, medical, religious, or research route", "Jornalista, medico, religioso ou pesquisa", "passport", {
            result: resultConfig({
              message: {
                en: "That sounds like a more specialized route, where the exact facts usually matter a lot.",
                pt: "Isso parece uma rota mais especializada, em que os fatos exatos costumam importar bastante."
              },
              title: { en: "Suggested pages to review", pt: "Paginas sugeridas para revisar" },
              copy: {
                en: "These pages can help point the team toward the right specialist category.",
                pt: "Estas paginas podem ajudar a direcionar a equipe para a categoria especializada correta."
              },
              serviceKeys: ["visaJournalist", "visaMedical", "visaReligious", "visaResearch"]
            })
          }),
          option("sports", "Sports, volunteer, or transit route", "Rota de esporte, voluntariado ou transito", "visa", {
            result: resultConfig({
              message: {
                en: "That may point to a more specialized route that usually depends on the exact activity and timing.",
                pt: "Isso pode apontar para uma rota mais especializada que costuma depender da atividade exata e do tempo."
              },
              title: { en: "Suggested pages to review", pt: "Paginas sugeridas para revisar" },
              copy: {
                en: "These pages can help the team narrow down the specialist route more quickly.",
                pt: "Estas paginas podem ajudar a equipe a afunilar mais rapidamente a rota especializada."
              },
              serviceKeys: ["visaSports", "visaVolunteer", "visaTransit"]
            })
          }),
          option("not-sure", "I am not sure", "Nao tenho certeza", "unsure", {
            result: resultConfig({
              message: {
                en: "That is fine. A tailored review is usually the best place to start when the route may be more specialized.",
                pt: "Tudo bem. Uma analise personalizada costuma ser o melhor lugar para comecar quando a rota pode ser mais especializada."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are useful when the route may be specialized but still needs to be clarified.",
                pt: "Estas paginas sao uteis quando a rota pode ser especializada, mas ainda precisa ser esclarecida."
              },
              serviceKeys: ["visasHub", "advisoryConsultation", "processAssessment"]
            })
          }),
          option("human", "I want to talk to a human", "Quero falar com uma pessoa", "human", {
            action: {
              type: "lead",
              message: {
                en: "Of course. Please share a few details and the team can review which specialist route may fit best.",
                pt: "Claro. Compartilhe alguns detalhes e a equipe pode revisar qual rota especializada pode se encaixar melhor."
              },
              title: { en: "Share your details", pt: "Compartilhe seus dados" },
              copy: {
                en: "This helps the team understand which specialist route you may be considering.",
                pt: "Isso ajuda a equipe a entender qual rota especializada voce pode estar considerando."
              },
              serviceKeys: ["visasHub", "advisoryConsultation", "aboutLawyer"]
            }
          })
        ]
      },
      longTerm: {
        message: {
          en: "Long-term residency can depend on family ties, work, retirement, investment, or other factors. Which of these best describes your situation?",
          pt: "Residencia de longo prazo pode depender de vinculos familiares, trabalho, aposentadoria, investimento ou outros fatores. Qual destas opcoes descreve melhor a sua situacao?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("family", "I have family ties in Brazil", "Tenho vinculos familiares no Brasil", "family", {
            result: resultConfig({
              message: {
                en: "You may have one or more residency routes available depending on those ties and the supporting facts.",
                pt: "Voce pode ter uma ou mais rotas de residencia disponiveis dependendo desses vinculos e dos fatos de apoio."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful for long-term family-linked residence planning.",
                pt: "Estas paginas costumam ser uteis para planejamento de residencia de longo prazo ligado a familia."
              },
              serviceKeys: ["residencyReunion", "processPermanent", "processConsultation"]
            })
          }),
          option("remote", "I work remotely", "Eu trabalho remotamente", "remote", {
            result: resultConfig({
              message: {
                en: "You may have one or more possible residency routes available, especially if remote work is central to your plans.",
                pt: "Voce pode ter uma ou mais rotas de residencia possiveis, especialmente se o trabalho remoto for central para os seus planos."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful for remote workers considering long-term stay.",
                pt: "Estas paginas costumam ser uteis para trabalhadores remotos considerando permanencia de longo prazo."
              },
              serviceKeys: ["residencyNomad", "processRenewal", "processPlanning"]
            })
          }),
          option("retire", "I want to retire there", "Quero me aposentar la", "retire", {
            result: resultConfig({
              message: {
                en: "A retirement-based residence route may be worth reviewing, depending on the income facts and timeline.",
                pt: "Uma rota de residencia baseada em aposentadoria pode valer a revisao, dependendo dos fatos de renda e do prazo."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful for retirement-linked long-term planning.",
                pt: "Estas paginas costumam ser uteis para planejamento de longo prazo ligado a aposentadoria."
              },
              serviceKeys: ["residencyRetiree", "processPermanent", "processPlanning"]
            })
          }),
          option("invest", "I want to invest", "Quero investir", "invest", {
            result: resultConfig({
              message: {
                en: "Investor and business-linked residence planning may be relevant, depending on the structure of the move.",
                pt: "Planejamento de residencia ligado a investimento e negocios pode ser relevante, dependendo da estrutura da mudanca."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are useful when investment may support long-term residence.",
                pt: "Estas paginas sao uteis quando investimento pode sustentar residencia de longo prazo."
              },
              serviceKeys: ["residencyInvestor", "advisoryCorporate", "processPermanent"]
            })
          }),
          option("other", "I have another reason", "Tenho outro motivo", "unsure", {
            result: resultConfig({
              message: {
                en: "You may still have one or more possible residency routes available, but the facts will matter.",
                pt: "Voce ainda pode ter uma ou mais rotas de residencia possiveis, mas os fatos vao importar."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are strong starting points when long-term residence is the goal but the route is still unclear.",
                pt: "Estas paginas sao bons pontos de partida quando residencia de longo prazo e o objetivo, mas a rota ainda esta incerta."
              },
              serviceKeys: ["residenciesHub", "advisoryConsultation", "processAssessment"]
            })
          })
        ]
      },
      citizenship: {
        message: {
          en: "Citizenship and permanent residency depend on factors like how long you have lived in Brazil, family ties, and immigration history. Which of these sounds closest to your situation?",
          pt: "Cidadania e residencia permanente dependem de fatores como quanto tempo voce viveu no Brasil, vinculos familiares e historico migratorio. Qual destas opcoes parece mais proxima da sua situacao?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("married-brazilian", "I am married to a Brazilian citizen", "Sou casado com uma pessoa brasileira", "spouse", {
            result: resultConfig({
              message: {
                en: "You may already have a pathway available depending on the timeline, the facts, and the supporting documents.",
                pt: "Voce pode ja ter um caminho disponivel dependendo do prazo, dos fatos e dos documentos de apoio."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when family ties may affect permanent status or citizenship planning.",
                pt: "Estas paginas costumam ser uteis quando vinculos familiares podem afetar o planejamento de status permanente ou cidadania."
              },
              serviceKeys: ["processPermanent", "naturalisationHub", "processConsultation"]
            })
          }),
          option("years", "I have lived in Brazil for several years", "Eu vivo no Brasil ha varios anos", "longterm", {
            result: resultConfig({
              message: {
                en: "You may already have a pathway available depending on your timeline and documents.",
                pt: "Voce pode ja ter um caminho disponivel dependendo do seu tempo e dos seus documentos."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when residence history may support citizenship planning.",
                pt: "Estas paginas costumam ser uteis quando o historico de residencia pode sustentar o planejamento de cidadania."
              },
              serviceKeys: ["naturalisationOrdinary", "processNaturalisation", "processAssessment"]
            })
          }),
          option("child", "I have a Brazilian child", "Tenho um filho brasileiro", "family", {
            result: resultConfig({
              message: {
                en: "You may already have a pathway available depending on the facts and your immigration history.",
                pt: "Voce pode ja ter um caminho disponivel dependendo dos fatos e do seu historico migratorio."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when family facts may affect permanent status or citizenship planning.",
                pt: "Estas paginas costumam ser uteis quando fatos familiares podem afetar o planejamento de status permanente ou cidadania."
              },
              serviceKeys: ["processPermanent", "naturalisationHub", "processAssessment"]
            })
          }),
          option("permanent", "I have permanent residency already", "Ja tenho residencia permanente", "passport", {
            result: resultConfig({
              message: {
                en: "That may make citizenship review especially relevant, depending on your timeline and records.",
                pt: "Isso pode tornar a analise de cidadania especialmente relevante, dependendo do seu tempo e dos seus registros."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when permanent status is already in place and citizenship may be the next question.",
                pt: "Estas paginas costumam ser uteis quando o status permanente ja existe e a cidadania pode ser a proxima questao."
              },
              serviceKeys: ["naturalisationHub", "processNaturalisation", "naturalisationOrdinary"]
            })
          }),
          option("not-sure", "I am not sure if I qualify", "Nao tenho certeza se me qualifico", "unsure", {
            result: resultConfig({
              message: {
                en: "That is common. A qualification review is usually the strongest next step before assuming the route.",
                pt: "Isso e comum. Uma revisao de elegibilidade costuma ser o proximo passo mais forte antes de presumir a rota."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are useful when citizenship or permanent status may be relevant but still needs review.",
                pt: "Estas paginas sao uteis quando cidadania ou status permanente podem ser relevantes, mas ainda precisam de revisao."
              },
              serviceKeys: ["naturalisationHub", "processAssessment", "processPermanent"]
            })
          })
        ]
      },
      urgent: {
        message: {
          en: "I'm sorry you are dealing with that. Which of these best describes the issue?",
          pt: "Sinto muito que voce esteja lidando com isso. Qual destas opcoes descreve melhor o problema?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("expired", "My visa has expired", "Meu visto venceu", "urgent", {
            result: resultConfig({
              message: {
                en: "This may require urgent legal guidance. I recommend speaking directly with the team as soon as possible so they can review your situation.",
                pt: "Isso pode exigir orientacao juridica urgente. Recomendo falar diretamente com a equipe o quanto antes para que eles possam revisar a sua situacao."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when status continuity may already be affected.",
                pt: "Estas paginas costumam ser uteis quando a continuidade do status ja pode ter sido afetada."
              },
              serviceKeys: ["otherRegularization", "defenseFines", "processDeadlines"],
              whatsappLabel: { en: "Speak with the team now", pt: "Falar com a equipe agora" },
              secondaryLabel: { en: "Leave my details urgently", pt: "Deixar meus dados com urgencia" }
            })
          }),
          option("overstay", "I overstayed in Brazil", "Ultrapassei o prazo no Brasil", "deadline", {
            result: resultConfig({
              message: {
                en: "This may require urgent legal guidance. I recommend speaking directly with the team as soon as possible so they can review your situation.",
                pt: "Isso pode exigir orientacao juridica urgente. Recomendo falar diretamente com a equipe o quanto antes para que eles possam revisar a sua situacao."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when overstay and regularization issues may need immediate review.",
                pt: "Estas paginas costumam ser uteis quando sobre-estadia e regularizacao podem precisar de revisao imediata."
              },
              serviceKeys: ["otherRegularization", "defenseFines", "processCompliance"],
              whatsappLabel: { en: "Speak with the team now", pt: "Falar com a equipe agora" },
              secondaryLabel: { en: "Leave my details urgently", pt: "Deixar meus dados com urgencia" }
            })
          }),
          option("fine", "I received a notice or fine", "Recebi uma notificacao ou multa", "fine", {
            result: resultConfig({
              message: {
                en: "This may require urgent legal guidance. I recommend speaking directly with the team as soon as possible so they can review your situation.",
                pt: "Isso pode exigir orientacao juridica urgente. Recomendo falar diretamente com a equipe o quanto antes para que eles possam revisar a sua situacao."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when notices, fines, or compliance concerns are involved.",
                pt: "Estas paginas costumam ser uteis quando notificacoes, multas ou preocupacoes de compliance estao envolvidas."
              },
              serviceKeys: ["defenseFines", "defenseAppeals", "processCompliance"],
              whatsappLabel: { en: "Speak with the team now", pt: "Falar com a equipe agora" },
              secondaryLabel: { en: "Leave my details urgently", pt: "Deixar meus dados com urgencia" }
            })
          }),
          option("court", "I have a court or immigration deadline", "Tenho um prazo judicial ou migratorio", "deadline", {
            result: resultConfig({
              message: {
                en: "This may require urgent legal guidance. I recommend speaking directly with the team as soon as possible so they can review your situation.",
                pt: "Isso pode exigir orientacao juridica urgente. Recomendo falar diretamente com a equipe o quanto antes para que eles possam revisar a sua situacao."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when the key issue is urgency, deadlines, and immediate next steps.",
                pt: "Estas paginas costumam ser uteis quando a questao central e urgencia, prazos e proximos passos imediatos."
              },
              serviceKeys: ["processDeadlines", "defenseAppeals", "defenseLitigation"],
              whatsappLabel: { en: "Speak with the team now", pt: "Falar com a equipe agora" },
              secondaryLabel: { en: "Leave my details urgently", pt: "Deixar meus dados com urgencia" }
            })
          }),
          option("removal", "I am facing deportation or removal issues", "Estou enfrentando deportacao ou remocao", "deportation", {
            result: resultConfig({
              message: {
                en: "This may require urgent legal guidance. I recommend speaking directly with the team as soon as possible so they can review your situation.",
                pt: "Isso pode exigir orientacao juridica urgente. Recomendo falar diretamente com a equipe o quanto antes para que eles possam revisar a sua situacao."
              },
              title: { en: "Likely service areas", pt: "Areas de servico mais provaveis" },
              copy: {
                en: "These pages are often useful when deportation, expulsion, or removal concerns may already be active.",
                pt: "Estas paginas costumam ser uteis quando preocupacoes com deportacao, expulsao ou remocao ja podem estar ativas."
              },
              serviceKeys: ["defenseDeportation", "defenseExpulsion", "defenseHub"],
              whatsappLabel: { en: "Speak with the team now", pt: "Falar com a equipe agora" },
              secondaryLabel: { en: "Leave my details urgently", pt: "Deixar meus dados com urgencia" }
            })
          }),
          option("other", "Other urgent matter", "Outro assunto urgente", "urgent", {
            result: resultConfig({
              message: {
                en: "This may require urgent legal guidance. I recommend speaking directly with the team as soon as possible so they can review your situation.",
                pt: "Isso pode exigir orientacao juridica urgente. Recomendo falar diretamente com a equipe o quanto antes para que eles possam revisar a sua situacao."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are useful when the matter is urgent but still needs to be classified more precisely.",
                pt: "Estas paginas sao uteis quando o assunto e urgente, mas ainda precisa ser classificado com mais precisao."
              },
              serviceKeys: ["defenseHub", "processDeadlines", "advisoryConsultation"],
              whatsappLabel: { en: "Speak with the team now", pt: "Falar com a equipe agora" },
              secondaryLabel: { en: "Leave my details urgently", pt: "Deixar meus dados com urgencia" }
            })
          })
        ]
      },
      unsure: {
        message: {
          en: "That is very common. To point you in the right direction, what is your main goal?",
          pt: "Isso e muito comum. Para apontar voce na direcao certa, qual e o seu principal objetivo?"
        },
        prompt: { en: "Which option fits best?", pt: "Qual opcao combina melhor?" },
        options: [
          option("remote", "Work remotely from Brazil", "Trabalhar remotamente a partir do Brasil", "remote", {
            result: resultConfig({
              message: {
                en: "There are likely a few possible options depending on your plans. These pages are a strong place to start.",
                pt: "Provavelmente existem algumas opcoes possiveis dependendo dos seus planos. Estas paginas sao um bom lugar para comecar."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are often useful when remote work is the central goal.",
                pt: "Estas paginas costumam ser uteis quando o trabalho remoto e o objetivo central."
              },
              serviceKeys: ["visaNomad", "residencyNomad", "advisoryConsultation"]
            })
          }),
          option("permanent", "Move permanently", "Mudar de forma permanente", "longterm", {
            result: resultConfig({
              message: {
                en: "There are likely a few possible options depending on your plans, timeline, and ties to Brazil.",
                pt: "Provavelmente existem algumas opcoes possiveis dependendo dos seus planos, prazo e vinculos com o Brasil."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are often useful when the goal is long-term or permanent relocation.",
                pt: "Estas paginas costumam ser uteis quando o objetivo e mudanca de longo prazo ou permanente."
              },
              serviceKeys: ["residenciesHub", "processPermanent", "advisoryStrategy"]
            })
          }),
          option("family", "Join family in Brazil", "Juntar-se a familia no Brasil", "family", {
            result: resultConfig({
              message: {
                en: "There are likely a few possible options depending on the family relationship and supporting facts.",
                pt: "Provavelmente existem algumas opcoes possiveis dependendo da relacao familiar e dos fatos de apoio."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are often useful when family-linked relocation may be possible.",
                pt: "Estas paginas costumam ser uteis quando uma mudanca ligada a familia pode ser possivel."
              },
              serviceKeys: ["visaFamily", "residencyReunion", "processConsultation"]
            })
          }),
          option("study", "Study in Brazil", "Estudar no Brasil", "student", {
            result: resultConfig({
              message: {
                en: "There are likely a few possible options depending on the school, timing, and document planning.",
                pt: "Provavelmente existem algumas opcoes possiveis dependendo da escola, do prazo e do planejamento documental."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are often useful when study is the main goal.",
                pt: "Estas paginas costumam ser uteis quando o estudo e o objetivo principal."
              },
              serviceKeys: ["visaStudent", "residencyStudy", "processFiling"]
            })
          }),
          option("retire", "Retire in Brazil", "Aposentar-se no Brasil", "retire", {
            result: resultConfig({
              message: {
                en: "There are likely a few possible options depending on your retirement income and long-term plans.",
                pt: "Provavelmente existem algumas opcoes possiveis dependendo da sua renda de aposentadoria e dos seus planos de longo prazo."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are often useful when retirement is central to the move.",
                pt: "Estas paginas costumam ser uteis quando a aposentadoria esta no centro da mudanca."
              },
              serviceKeys: ["visaRetiree", "residencyRetiree", "processPlanning"]
            })
          }),
          option("invest", "Start a business or invest", "Abrir um negocio ou investir", "invest", {
            result: resultConfig({
              message: {
                en: "There are likely a few possible options depending on the structure of your plans in Brazil.",
                pt: "Provavelmente existem algumas opcoes possiveis dependendo da estrutura dos seus planos no Brasil."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages are often useful when investment or business is the main goal.",
                pt: "Estas paginas costumam ser uteis quando investimento ou negocio e o objetivo principal."
              },
              serviceKeys: ["visaInvestor", "advisoryCorporate", "residencyInvestor"]
            })
          }),
          option("still-unsure", "I am still not sure", "Ainda nao tenho certeza", "unsure", {
            result: resultConfig({
              message: {
                en: "That is completely fine. A route-comparison review is often the strongest next step when the goal is still unclear.",
                pt: "Tudo bem. Uma revisao de comparacao de rotas costuma ser o proximo passo mais forte quando o objetivo ainda nao esta claro."
              },
              title: { en: "A good place to start", pt: "Um bom lugar para comecar" },
              copy: {
                en: "These pages are useful when the goal still needs to be narrowed down.",
                pt: "Estas paginas sao uteis quando o objetivo ainda precisa ser afunilado."
              },
              serviceKeys: ["advisoryConsultation", "advisoryStrategy", "processAssessment"]
            })
          }),
          option("none", "None of the above", "Nenhuma das opcoes acima", "explore", {
            result: resultConfig({
              message: {
                en: "That is fine. A tailored review is usually the strongest first step when the route does not fit a simple category.",
                pt: "Tudo bem. Uma analise personalizada costuma ser o primeiro passo mais forte quando a rota nao se encaixa em uma categoria simples."
              },
              title: { en: "Suggested pages to start with", pt: "Paginas sugeridas para comecar" },
              copy: {
                en: "These pages can help the team understand the route more clearly before recommending a next step.",
                pt: "Estas paginas podem ajudar a equipe a entender a rota com mais clareza antes de recomendar um proximo passo."
              },
              serviceKeys: ["advisoryConsultation", "processAssessment", "visasHub"]
            })
          })
        ]
      }
    };
  }

  /* ==========================================================================
   * 06. Localized Widget Copy
   * Static EN/PT-BR labels, prompts, form labels, and fallback messages.
   * ========================================================================== */
  function getCopy(isPt) {
    return {
      sectionLabel: isPt ? "Escolha uma opcao" : "Choose an option",
      recommendationTitle: isPt ? "Paginas que parecem mais proximas do seu caso" : "Pages that seem closest to your situation",
      recommendationCopy: isPt
        ? "Com base no que voce compartilhou, estas paginas podem ajudar a equipe a entender melhor o tipo de apoio que voce pode precisar."
        : "Based on what you shared, these pages may help the team understand the kind of support you may need.",
      whatsappDefault: isPt ? "Continuar no WhatsApp" : "Continue on WhatsApp",
      leaveDetails: isPt ? "Deixar meus dados" : "Leave my details",
      reset: isPt ? "Comecar de novo" : "Start again",
      detailsMessage: isPt
        ? "Perfeito. Compartilhe seus dados e a equipe podera revisar sua situacao."
        : "Perfect. Share your details and the team will be able to review your situation.",
      formTitle: isPt ? "Deixe seus dados" : "Leave your details",
      formCopy: isPt
        ? "A Nina encaminhara isso para a equipe junto com o caminho que voce clicou aqui no site."
        : "Nina will pass this to the team together with the path you clicked here on the site.",
      formFields: {
        fullName: isPt ? "Nome completo" : "Full name",
        email: isPt ? "Email" : "Email address",
        phone: isPt ? "Numero do WhatsApp" : "WhatsApp number",
        nationality: isPt ? "Nacionalidade" : "Nationality",
        inBrazil: isPt ? "Voce esta no Brasil neste momento?" : "Are you currently in Brazil?",
        description: isPt ? "Breve descricao da sua situacao" : "Short description of your situation",
        inBrazilOptions: {
          yes: isPt ? "Sim" : "Yes",
          no: isPt ? "Nao" : "No",
          planning: isPt ? "Ainda estou planejando a mudanca" : "I am still planning the move"
        }
      },
      formPlaceholder: {
        fullName: isPt ? "Seu nome" : "Your name",
        email: isPt ? "voce@exemplo.com" : "you@example.com",
        phone: isPt ? "+55..." : "+1 ...",
        nationality: isPt ? "Ex.: americana, britanica, argentina" : "Example: American, British, Argentine",
        description: isPt
          ? "Conte brevemente o que voce esta tentando fazer e qualquer urgencia importante."
          : "Briefly describe what you are trying to do and any urgency that matters."
      },
      submit: isPt ? "Enviar meus dados" : "Submit my details",
      formSuccess: isPt
        ? "Obrigada. Com base no que voce compartilhou, um membro da equipe podera revisar sua situacao e retornar para voce."
        : "Thank you. Based on what you shared, a member of the team will be able to review your situation and follow up with you.",
      formNudge: isPt
        ? "Se preferir uma orientacao mais rapida, voce tambem pode continuar direto no WhatsApp."
        : "If you would like faster guidance, you can also continue directly on WhatsApp.",
      formError: isPt
        ? "Nao foi possivel enviar seus dados agora. Tente novamente ou siga direto para o WhatsApp."
        : "Your details could not be sent right now. Please try again or continue directly on WhatsApp.",
      whatsappClosing: isPt
        ? "Gostaria de falar com a equipe humana sobre o proximo passo."
        : "I would like to speak with the human team about the next step."
    };
  }

  /* ==========================================================================
   * 07. Recommendation and WhatsApp Helpers
   * Converts selected flow outcomes into readable cards and contact messages.
   * ========================================================================== */
  function getLocalizedCatalogItem(key, isPt) {
    const item = SERVICE_CATALOG[key];
    if (!item) return null;
    return {
      key,
      family: text(item.family, isPt),
      route: localizeRoute(item.route, isPt),
      title: text(item.title, isPt),
      summary: text(item.summary, isPt)
    };
  }

  function buildWhatsAppMessage(state) {
    const isPt = state.isPt;
    const lines = [];
    const pathLines = state.answers.map((entry) => `- ${entry.answer}`);
    const services = (state.currentResult?.serviceKeys || [])
      .map((key) => getLocalizedCatalogItem(key, isPt))
      .filter(Boolean)
      .map((item) => item.title);
    const lead = state.leadData || {};

    if (isPt) {
      lines.push("Ola, eu vim pela Nina no site da Monique Fernandes.");
      if (services.length) lines.push(`Servicos mais provaveis: ${services.join(", ")}.`);
      if (pathLines.length) lines.push("Caminho clicado:");
      if (pathLines.length) lines.push(...pathLines);
      if (lead.full_name) lines.push(`Nome: ${lead.full_name}`);
      if (lead.email) lines.push(`Email: ${lead.email}`);
      if (lead.phone_whatsapp) lines.push(`WhatsApp: ${lead.phone_whatsapp}`);
      if (lead.nationality) lines.push(`Nacionalidade: ${lead.nationality}`);
      if (lead.currently_in_brazil_label) lines.push(`No Brasil agora: ${lead.currently_in_brazil_label}`);
      if (lead.message) lines.push(`Resumo: ${lead.message}`);
      lines.push(state.copy.whatsappClosing);
    } else {
      lines.push("Hello, I came through Nina on Monique Fernandes' website.");
      if (services.length) lines.push(`Likely service areas: ${services.join(", ")}.`);
      if (pathLines.length) lines.push("Clicked path:");
      if (pathLines.length) lines.push(...pathLines);
      if (lead.full_name) lines.push(`Name: ${lead.full_name}`);
      if (lead.email) lines.push(`Email: ${lead.email}`);
      if (lead.phone_whatsapp) lines.push(`WhatsApp: ${lead.phone_whatsapp}`);
      if (lead.nationality) lines.push(`Nationality: ${lead.nationality}`);
      if (lead.currently_in_brazil_label) lines.push(`Currently in Brazil: ${lead.currently_in_brazil_label}`);
      if (lead.message) lines.push(`Summary: ${lead.message}`);
      lines.push(state.copy.whatsappClosing);
    }

    return lines.join("\n");
  }

  function buildWhatsAppUrl(widget, state) {
    const base = widget.getAttribute("data-whatsapp-url") || "";
    if (!base) return "#";
    try {
      const url = new URL(base, window.location.href);
      url.searchParams.set("text", buildWhatsAppMessage(state));
      return url.toString();
    } catch {
      return base;
    }
  }

  /* ==========================================================================
   * 08. Typing, Transcript, and Prompt Rendering
   * Renders the conversational history, current question, and option buttons.
   * ========================================================================== */
  function prefersReducedMotion() {
    if (document.body.classList.contains("reduced-motion")) return true;
    return window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  }

  function finishTyping(widget) {
    const state = sharedState.get(widget);
    if (!state) return;

    if (state.typingTimer) {
      window.clearTimeout(state.typingTimer);
      state.typingTimer = null;
    }

    if (typeof state.typingIndex === "number") {
      const entry = state.transcript[state.typingIndex];
      if (entry) entry.displayText = entry.text;
      state.typingIndex = null;
    }
  }

  function startTyping(widget, entryIndex) {
    const state = sharedState.get(widget);
    if (!state) return;
    const entry = state.transcript[entryIndex];
    if (!entry) return;

    finishTyping(widget);

    if (prefersReducedMotion()) {
      entry.displayText = entry.text;
      renderTranscript(widget);
      return;
    }

    entry.displayText = "";
    state.typingIndex = entryIndex;
    let charIndex = 0;

    const tick = () => {
      const current = state.transcript[entryIndex];
      if (!current) {
        state.typingIndex = null;
        state.typingTimer = null;
        return;
      }

      charIndex += 1;
      current.displayText = current.text.slice(0, charIndex);
      renderTranscript(widget);

      const body = widget.querySelector(".nina-concierge__body");
      if (body) body.scrollTop = body.scrollHeight;

      if (charIndex >= current.text.length) {
        state.typingIndex = null;
        state.typingTimer = null;
        return;
      }

      state.typingTimer = window.setTimeout(tick, charIndex < 14 ? 24 : 15);
    };

    state.typingTimer = window.setTimeout(tick, 170);
  }

  function maybeStartIntroTyping(widget) {
    const state = sharedState.get(widget);
    if (!state?.introNeedsTyping) return;
    if (!state.transcript.length) return;
    state.introNeedsTyping = false;
    startTyping(widget, 0);
  }

  function renderTranscript(widget) {
    const state = sharedState.get(widget);
    const node = widget.querySelector("[data-nina-transcript]");
    if (!state || !node) return;
    node.innerHTML = state.transcript
      .map((entry) => {
        const roleClass = entry.role === "user" ? "nina-concierge__bubble--user" : "nina-concierge__bubble--bot";
        const textValue = typeof entry.displayText === "string" ? entry.displayText : entry.text;
        const typingClass = typeof entry.displayText === "string" && entry.displayText !== entry.text ? " nina-concierge__bubble--typing" : "";
        return `<div class="nina-concierge__bubble ${roleClass}${typingClass}">${escapeHtml(textValue)}</div>`;
      })
      .join("");
    node.scrollTop = node.scrollHeight;
  }

  function scrollBodyToBottom(widget) {
    const body = widget.querySelector(".nina-concierge__body");
    if (!body) return;
    body.scrollTo({
      top: body.scrollHeight,
      behavior: document.body.classList.contains("reduced-motion") ? "auto" : "smooth"
    });
  }

  function renderPrompt(widget) {
    const state = sharedState.get(widget);
    const shell = widget.querySelector(".nina-concierge__prompt-shell");
    const label = widget.querySelector("[data-nina-prompt-label]");
    const options = widget.querySelector("[data-nina-options]");
    if (!state || !shell || !label || !options) return;

    if (state.currentResult || state.formOpen) {
      shell.hidden = true;
      label.textContent = "";
      options.innerHTML = "";
      return;
    }

    const step = state.flow[state.currentStep];
    if (!step) {
      shell.hidden = true;
      return;
    }

    label.textContent = text(step.prompt, state.isPt) || state.copy.sectionLabel;
    options.innerHTML = (step.options || [])
      .map((item) => {
        const optionLabel = text(item.label, state.isPt);
        const description = text(item.description, state.isPt);
        return `<button class="nina-concierge__option" type="button" data-nina-option="${escapeHtml(item.id)}">
  <span class="nina-concierge__option-icon" aria-hidden="true">${getIcon(item.icon)}</span>
  <span class="nina-concierge__option-copy">
    <strong>${escapeHtml(optionLabel)}</strong>
    ${description ? `<small>${escapeHtml(description)}</small>` : ""}
  </span>
</button>`;
      })
      .join("");
    shell.hidden = false;
  }

  function renderRecommendations(widget) {
    const state = sharedState.get(widget);
    const shell = widget.querySelector("[data-nina-recommendations]");
    const title = widget.querySelector("[data-nina-recommendation-title]");
    const copyNode = widget.querySelector("[data-nina-recommendation-copy]");
    const results = widget.querySelector("[data-nina-results]");
    if (!state || !shell || !title || !copyNode || !results) return;

    const result = state.currentResult;
    if (!result || !Array.isArray(result.serviceKeys) || !result.serviceKeys.length) {
      shell.hidden = true;
      results.innerHTML = "";
      return;
    }

    const items = result.serviceKeys.map((key) => getLocalizedCatalogItem(key, state.isPt)).filter(Boolean);
    title.textContent = text(result.title, state.isPt) || state.copy.recommendationTitle;
    copyNode.textContent = text(result.copy, state.isPt) || state.copy.recommendationCopy;
    results.innerHTML = items
      .map(
        (item, index) => `<article class="nina-concierge__result">
  <div class="nina-concierge__result-meta">
    <span class="nina-concierge__family">${escapeHtml(item.family)}</span>
    ${index === 0 ? `<span class="nina-concierge__best">${escapeHtml(state.isPt ? "Comece aqui" : "Start here")}</span>` : ""}
  </div>
  <strong><a href="${escapeHtml(getUrls().resolveSiteUrl(item.route))}" data-itb-route="${escapeHtml(item.route)}">${escapeHtml(item.title)}</a></strong>
  <p>${escapeHtml(item.summary)}</p>
</article>`
      )
      .join("");
    shell.hidden = false;
  }

  /* ==========================================================================
   * 09. Lead Capture Rendering
   * Builds the concierge handoff form and success state after details are sent.
   * ========================================================================== */
  function buildLeadFormHtml(state) {
    const fields = state.copy.formFields;
    const placeholder = state.copy.formPlaceholder;
    const data = state.leadData || {};
    return `<div class="nina-concierge__lead-head">
  <p class="nina-concierge__eyebrow">${escapeHtml(state.copy.formTitle)}</p>
  <h3>${escapeHtml(state.currentResult ? text(state.currentResult.title, state.isPt) || state.copy.formTitle : state.copy.formTitle)}</h3>
  <p>${escapeHtml(state.currentResult ? text(state.currentResult.formCopy || state.currentResult.copy, state.isPt) || state.copy.formCopy : state.copy.formCopy)}</p>
</div>
<form class="nina-concierge__lead-form" data-nina-lead-form novalidate>
  <div class="nina-concierge__lead-grid nina-concierge__lead-grid--two">
    <label class="nina-concierge__field">
      <span>${escapeHtml(fields.fullName)}</span>
      <input class="nina-concierge__field-input" type="text" name="full_name" value="${escapeHtml(data.full_name || "")}" placeholder="${escapeHtml(placeholder.fullName)}" required />
    </label>
    <label class="nina-concierge__field">
      <span>${escapeHtml(fields.email)}</span>
      <input class="nina-concierge__field-input" type="email" name="email" value="${escapeHtml(data.email || "")}" placeholder="${escapeHtml(placeholder.email)}" required />
    </label>
    <label class="nina-concierge__field">
      <span>${escapeHtml(fields.phone)}</span>
      <input class="nina-concierge__field-input" type="tel" name="phone_whatsapp" value="${escapeHtml(data.phone_whatsapp || "")}" placeholder="${escapeHtml(placeholder.phone)}" required />
    </label>
    <label class="nina-concierge__field">
      <span>${escapeHtml(fields.nationality)}</span>
      <input class="nina-concierge__field-input" type="text" name="nationality" value="${escapeHtml(data.nationality || "")}" placeholder="${escapeHtml(placeholder.nationality)}" required />
    </label>
  </div>
  <label class="nina-concierge__field">
    <span>${escapeHtml(fields.inBrazil)}</span>
    <select class="nina-concierge__field-input" name="currently_in_brazil" required>
      <option value="">${escapeHtml(state.isPt ? "Selecione" : "Select")}</option>
      <option value="yes"${data.currently_in_brazil === "yes" ? " selected" : ""}>${escapeHtml(fields.inBrazilOptions.yes)}</option>
      <option value="no"${data.currently_in_brazil === "no" ? " selected" : ""}>${escapeHtml(fields.inBrazilOptions.no)}</option>
      <option value="planning"${data.currently_in_brazil === "planning" ? " selected" : ""}>${escapeHtml(fields.inBrazilOptions.planning)}</option>
    </select>
  </label>
  <label class="nina-concierge__field">
    <span>${escapeHtml(fields.description)}</span>
    <textarea class="nina-concierge__field-input nina-concierge__field-input--textarea" name="message" rows="4" placeholder="${escapeHtml(placeholder.description)}" required>${escapeHtml(data.message || "")}</textarea>
  </label>
  <div class="nina-concierge__lead-actions">
    <button class="btn btn-secondary btn-sm" type="submit">${escapeHtml(state.copy.submit)}</button>
  </div>
  <p class="nina-concierge__lead-status" data-nina-lead-status>${state.formStatus ? escapeHtml(state.formStatus) : ""}</p>
</form>`;
  }

  function renderLeadShell(widget) {
    const state = sharedState.get(widget);
    const shell = widget.querySelector("[data-nina-lead-shell]");
    if (!state || !shell) return;

    if (!state.formOpen) {
      shell.hidden = true;
      shell.innerHTML = "";
      return;
    }

    if (state.formSubmitted) {
      shell.innerHTML = `<div class="nina-concierge__lead-head">
  <p class="nina-concierge__eyebrow">${escapeHtml(state.copy.formTitle)}</p>
  <h3>${escapeHtml(state.isPt ? "Dados enviados" : "Details received")}</h3>
  <p>${escapeHtml(state.copy.formSuccess)}</p>
  <p>${escapeHtml(state.copy.formNudge)}</p>
</div>`;
      shell.hidden = false;
      return;
    }

    shell.innerHTML = buildLeadFormHtml(state);
    shell.hidden = false;
  }

  function updateFooter(widget) {
    const state = sharedState.get(widget);
    const footer = widget.querySelector("[data-nina-footer]");
    const whatsapp = widget.querySelector("[data-nina-whatsapp]");
    const secondary = widget.querySelector("[data-nina-secondary]");
    const reset = widget.querySelector("[data-nina-reset]");
    if (!state || !footer || !whatsapp || !secondary || !reset) return;

    const showFooter = Boolean(state.currentResult || state.formOpen);
    footer.hidden = !showFooter;
    if (!showFooter) return;

    whatsapp.href = buildWhatsAppUrl(widget, state);
    whatsapp.textContent = state.currentResult?.whatsappLabel ? text(state.currentResult.whatsappLabel, state.isPt) : state.copy.whatsappDefault;
    whatsapp.dataset.whatsappClick = "true";

    if (state.formOpen) {
      secondary.hidden = true;
    } else {
      secondary.hidden = false;
      secondary.textContent = state.currentResult?.secondaryLabel ? text(state.currentResult.secondaryLabel, state.isPt) : state.copy.leaveDetails;
    }

    reset.textContent = state.copy.reset;
  }

  function renderAll(widget) {
    renderTranscript(widget);
    renderPrompt(widget);
    renderRecommendations(widget);
    renderLeadShell(widget);
    updateFooter(widget);
    scrollBodyToBottom(widget);
  }

  /* ==========================================================================
   * 10. Flow State and Lead Submission
   * Moves through the decision tree and sends captured details to Formspree.
   * ========================================================================== */
  function enterStep(widget, stepId) {
    const state = sharedState.get(widget);
    if (!state) return;
    const step = state.flow[stepId];
    if (!step) return;
    finishTyping(widget);
    state.currentStep = stepId;
    state.currentResult = null;
    state.formOpen = false;
    state.formSubmitted = false;
    state.formStatus = "";
    state.transcript.push({ role: "bot", text: text(step.message, state.isPt) });
    renderAll(widget);
  }

  function setResult(widget, result) {
    const state = sharedState.get(widget);
    if (!state) return;
    finishTyping(widget);
    state.currentResult = result;
    state.formOpen = false;
    state.formSubmitted = false;
    state.formStatus = "";
    state.transcript.push({ role: "bot", text: text(result.message, state.isPt) });
    renderAll(widget);
  }

  function openLeadForm(widget, config) {
    const state = sharedState.get(widget);
    if (!state) return;
    finishTyping(widget);

    if (config) {
      state.currentResult = config;
      state.transcript.push({ role: "bot", text: text(config.message, state.isPt) });
    } else if (!state.formOpen) {
      state.transcript.push({ role: "bot", text: state.copy.detailsMessage });
    }

    state.formOpen = true;
    state.formSubmitted = false;
    state.formStatus = "";
    renderAll(widget);
  }

  function getCurrentStepOption(state, optionId) {
    const step = state.flow[state.currentStep];
    if (!step) return null;
    return (step.options || []).find((item) => item.id === optionId) || null;
  }

  function handleOptionSelection(widget, optionId) {
    const state = sharedState.get(widget);
    if (!state) return;
    const item = getCurrentStepOption(state, optionId);
    if (!item) return;
    finishTyping(widget);

    const step = state.flow[state.currentStep];
    state.answers.push({
      stepId: state.currentStep,
      prompt: text(step.prompt, state.isPt),
      optionId: item.id,
      answer: text(item.label, state.isPt)
    });
    state.transcript.push({ role: "user", text: text(item.label, state.isPt) });
    track("nina_option_selected", {
      locale: state.isPt ? "pt-br" : "en",
      nina_step: state.currentStep,
      nina_value: optionId
    });

    if (item.action?.type === "lead") {
      openLeadForm(widget, item.action);
      return;
    }

    if (item.result) {
      setResult(widget, item.result);
      return;
    }

    if (item.next) enterStep(widget, item.next);
  }

  function getInBrazilLabel(copy, value) {
    return copy.formFields.inBrazilOptions[value] || value || "";
  }

  async function submitLeadForm(widget, form) {
    const state = sharedState.get(widget);
    if (!state || !form) return;
    finishTyping(widget);

    const endpoint = widget.getAttribute("data-formspree-endpoint");
    if (!endpoint) {
      state.formStatus = state.copy.formError;
      renderLeadShell(widget);
      return;
    }

    const formData = new FormData(form);
    const lead = {
      full_name: String(formData.get("full_name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone_whatsapp: String(formData.get("phone_whatsapp") || "").trim(),
      nationality: String(formData.get("nationality") || "").trim(),
      currently_in_brazil: String(formData.get("currently_in_brazil") || "").trim(),
      message: String(formData.get("message") || "").trim()
    };

    if (!lead.full_name || !lead.email || !lead.phone_whatsapp || !lead.nationality || !lead.currently_in_brazil || !lead.message) {
      state.formStatus = state.copy.formError;
      renderLeadShell(widget);
      return;
    }

    lead.currently_in_brazil_label = getInBrazilLabel(state.copy, lead.currently_in_brazil);
    state.leadData = lead;

    const serviceInterest = (state.currentResult?.serviceKeys || [])
      .map((key) => getLocalizedCatalogItem(key, state.isPt))
      .filter(Boolean)
      .map((item) => item.title)
      .join(", ");
    const clickedPath = state.answers.map((entry) => entry.answer).join(" -> ");
    const composedMessage = [
      lead.message,
      "",
      state.isPt ? "Caminho clicado:" : "Clicked path:",
      clickedPath || (state.isPt ? "Sem caminho registrado." : "No path recorded."),
      "",
      state.isPt ? "Servicos mais provaveis:" : "Likely service areas:",
      serviceInterest || (state.isPt ? "Nao definido." : "Not defined.")
    ].join("\n");

    const payload = new FormData();
    payload.append("_subject", state.isPt ? "Nina chatbot lead | PT" : "Nina chatbot lead | EN");
    payload.append("form_name", state.isPt ? "nina-chatbot-pt" : "nina-chatbot-en");
    payload.append("form_locale", state.isPt ? "pt-br" : "en");
    payload.append("full_name", lead.full_name);
    payload.append("email", lead.email);
    payload.append("phone_whatsapp", lead.phone_whatsapp);
    payload.append("nationality", lead.nationality);
    payload.append("currently_in_brazil", lead.currently_in_brazil_label);
    payload.append("service_interest", serviceInterest || (state.isPt ? "Nao definido" : "Not defined"));
    payload.append("message", composedMessage);
    payload.append("nina_path", clickedPath);
    payload.append("page_route", window.ITB_SITE?.pageRoute || window.location.pathname);
    payload.append("page_title", document.title || "");
    payload.append("page_language", state.isPt ? "pt-BR" : "en");
    payload.append("page_family", window.ITB_SITE?.pageFamily || "");
    payload.append("site_domain", window.location.hostname || "immigratetobrazil.com");
    payload.append("current_url", window.location.href);
    payload.append("canonical_url", document.querySelector("link[rel='canonical']")?.getAttribute("href") || window.location.href);
    payload.append("referrer_url", document.referrer || "");
    try {
      payload.append("referrer_domain", document.referrer ? new URL(document.referrer).hostname : "");
    } catch {
      payload.append("referrer_domain", "");
    }
    payload.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    payload.append("submitted_at", new Date().toISOString());
    payload.append("lead_source", "nina-chatbot");

    const statusNode = form.querySelector("[data-nina-lead-status]");
    if (statusNode) statusNode.textContent = state.isPt ? "Enviando..." : "Sending...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Form submission failed with ${response.status}`);

      state.formSubmitted = true;
      state.formStatus = "";
      state.transcript.push({ role: "bot", text: state.copy.formSuccess });
      track("nina_lead_submitted", {
        locale: state.isPt ? "pt-br" : "en",
        nina_services: serviceInterest,
        nina_path: clickedPath
      });
      renderAll(widget);
    } catch (error) {
      console.error(error);
      state.formStatus = state.copy.formError;
      renderLeadShell(widget);
    }
  }

  /* ==========================================================================
   * 11. Widget Lifecycle
   * Handles open, close, nudges, reset, and one-time widget initialization.
   * ========================================================================== */
  function openWidget(widget) {
    const state = sharedState.get(widget);
    const panel = widget.querySelector("[data-nina-panel]");
    const launcher = widget.querySelector("[data-nina-launcher]");
    if (!state || !panel || !launcher || state.isOpen) return;
    state.isOpen = true;
    widget.classList.add("is-open");
    widget.classList.remove("is-nudging");
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => {
      widget.classList.add("is-live");
      maybeStartIntroTyping(widget);
    });
    track("nina_open", { locale: state.isPt ? "pt-br" : "en" });
  }

  function closeWidget(widget) {
    const state = sharedState.get(widget);
    const panel = widget.querySelector("[data-nina-panel]");
    const launcher = widget.querySelector("[data-nina-launcher]");
    if (!state || !panel || !launcher || !state.isOpen) return;
    state.isOpen = false;
    widget.classList.remove("is-open", "is-live");
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  }

  function scheduleNudge(widget) {
    const state = sharedState.get(widget);
    if (!state) return;
    window.clearTimeout(state.nudgeTimer);
    state.nudgeTimer = window.setTimeout(() => {
      if (!state.isOpen) widget.classList.add("is-nudging");
    }, 9000);
  }

  function resetWidget(widget) {
    const state = sharedState.get(widget);
    if (!state) return;
    const root = state.flow.root;
    finishTyping(widget);
    state.answers = [];
    state.leadData = {};
    state.currentStep = "root";
    state.currentResult = null;
    state.formOpen = false;
    state.formSubmitted = false;
    state.formStatus = "";
    state.introNeedsTyping = true;
    state.transcript = [{ role: "bot", text: text(root.message, state.isPt), displayText: "" }];
    renderAll(widget);
    if (state.isOpen) maybeStartIntroTyping(widget);
    scheduleNudge(widget);
  }

  function initWidget(widget) {
    if (!widget || widget.dataset.itbBoundAshaChat === "true") return;

    const isPt = widget.getAttribute("data-locale") === "pt-br" || getUrls().getLocale() === "pt-br";
    sharedState.set(widget, {
      isPt,
      copy: getCopy(isPt),
      flow: buildFlow(),
      currentStep: "root",
      currentResult: null,
      answers: [],
      leadData: {},
      formOpen: false,
      formSubmitted: false,
      formStatus: "",
      introNeedsTyping: true,
      transcript: [],
      isOpen: false,
      typingIndex: null,
      typingTimer: null,
      nudgeTimer: null
    });

    const launcher = widget.querySelector("[data-nina-launcher]");
    const close = widget.querySelector("[data-nina-close]");
    const reset = widget.querySelector("[data-nina-reset]");
    const options = widget.querySelector("[data-nina-options]");
    const secondary = widget.querySelector("[data-nina-secondary]");
    const leadShell = widget.querySelector("[data-nina-lead-shell]");

    launcher?.addEventListener("click", () => {
      const state = sharedState.get(widget);
      if (!state?.isOpen) openWidget(widget);
      else closeWidget(widget);
    });
    close?.addEventListener("click", () => closeWidget(widget));
    reset?.addEventListener("click", () => resetWidget(widget));
    options?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-nina-option]");
      if (!button) return;
      openWidget(widget);
      handleOptionSelection(widget, button.getAttribute("data-nina-option") || "");
    });
    secondary?.addEventListener("click", () => {
      openWidget(widget);
      openLeadForm(widget);
    });
    leadShell?.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-nina-lead-form]");
      if (!form) return;
      event.preventDefault();
      submitLeadForm(widget, form).catch((error) => console.error(error));
    });
    document.addEventListener("click", (event) => {
      const state = sharedState.get(widget);
      if (!state?.isOpen) return;
      const eventPath = typeof event.composedPath === "function" ? event.composedPath() : [];
      if (eventPath.includes(widget) || widget.contains(event.target)) return;
      closeWidget(widget);
    });
    document.addEventListener("keydown", (event) => {
      const state = sharedState.get(widget);
      if (!state?.isOpen) return;
      if (event.key === "Escape") closeWidget(widget);
    });

    widget.dataset.itbBoundAshaChat = "true";
    resetWidget(widget);
  }

  /* ==========================================================================
   * 12. Public Init API
   * Exposes Nina initialization hooks for static pages and injected partials.
   * ========================================================================== */
  function initAshaChat() {
    document.querySelectorAll("[data-asha-chat='true']").forEach(initWidget);
  }

  function openAshaChat() {
    const widget = document.querySelector("[data-asha-chat='true']");
    if (!widget) return false;
    initWidget(widget);
    openWidget(widget);
    return true;
  }

  window.ITB = window.ITB || {};
  window.ITB.initAshaChat = initAshaChat;
  window.ITB.openAshaChat = openAshaChat;

  if (!window.__ITB_PARTIALS_ACTIVE__) initAshaChat();
})();
