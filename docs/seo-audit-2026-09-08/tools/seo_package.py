from pathlib import Path
import json,csv,re,html,collections,urllib.parse
O=Path('docs/seo-audit-2026-09-08');B='https://immigratetobrazil.com';L=json.loads((O/'local-evidence.json').read_text());D=json.loads((O/'live-evidence.json').read_text());H=json.loads((O/'heading-live-evidence.json').read_text()); inventory=list(csv.DictReader((O/'02-url-inventory.csv').open()))
for f in ['pages','metadata','schema']: (O/f).mkdir(exist_ok=True)
# Explicit editorial ownership. No changes to public website files.
en={
'/':'Brazil Immigration Lawyer | Monique Fernandes', '/services/':'Brazil Immigration Legal Services', '/services/all/':'Browse All Immigration Services', '/services/visas/':'Brazil Visa Services', '/services/residencies/':'Brazil Residence Permit Services', '/services/naturalisation/':'Brazilian Citizenship and Naturalization Services', '/services/defense/':'Immigration Defense in Brazil', '/services/advisory/':'Brazil Immigration Advice and Case Planning', '/services/other/':'Immigration Documents and Supporting Services',
'/start-consultation/':'Request a Brazil Immigration Consultation', '/contact/':'Contact Monique Fernandes', '/about/':'About Immigrate to Brazil', '/about/profile/':'Monique Fernandes: Brazilian Immigration Lawyer', '/about/lawyer/':'Monique Fernandes: Professional Registration and Legal Practice', '/about/about/':'Meet Monique Fernandes', '/about/atlas/':'Monique Fernandes: Practice Overview', '/about/story/':'The Story Behind Monique Fernandes’ Practice', '/about/stories/':'Client Experiences: How Immigration Matters Unfold', '/about/results/':'How Immigration Case Outcomes Are Assessed',
'/brazil/':'Planning Your Move to Brazil', '/brazil/cities/':'Compare Cities for Living in Brazil', '/brazil/brazil/':'Brazil: An Introduction for New Residents', '/brazil/cost/':'Cost of Living in Brazil: Planning Your Budget', '/brazil/living/':'Everyday Life in Brazil for New Residents', '/brazil/quality/':'Quality of Life in Brazil: What to Compare', '/brazil/housing/':'Finding Housing in Brazil', '/brazil/healthcare/':'Healthcare in Brazil for New Residents', '/brazil/education/':'Education in Brazil for Relocating Families', '/brazil/safety/':'Safety Planning for Living in Brazil', '/brazil/investment/':'Planning an Investment in Brazil', '/brazil/faqs/':'Moving to Brazil: Common Planning Questions',
'/countries/':'Moving to Brazil: Guides by Country of Origin', '/process/':'Working With Monique: The Immigration Process', '/rights/':'Immigrant Rights and Responsibilities in Brazil', '/insights/':'Brazil Immigration Guides and Insights',
'/process/consultation/':'What Happens During an Immigration Consultation', '/services/advisory/consultation/':'Brazil Immigration Consultation Services', '/process/refund/':'How to Request a Consultation or Service Refund', '/rights/refund/':'Your Rights When Requesting a Service Refund', '/legal/refund/':'Refund Policy', '/services/visas/nomad/':'Brazil Digital Nomad Visa Assistance', '/services/residencies/nomad/':'Digital Nomad Residence Authorization in Brazil', '/services/visas/family/':'Brazil Family Reunion Visa Assistance', '/services/residencies/reunion/':'Family Reunion Residence Authorization in Brazil', '/services/residencies/health/':'Residence in Brazil for Medical Treatment', '/services/naturalisation/renunciation/':'Renunciation of Brazilian Nationality', '/services/naturalisation/reacquisition/':'Reacquiring Brazilian Nationality',
}
pt={
'/':'Advogada de imigração no Brasil | Monique Fernandes', '/services/':'Serviços jurídicos de imigração no Brasil', '/services/all/':'Todos os serviços de imigração', '/services/visas/':'Assessoria para vistos brasileiros', '/services/residencies/':'Assessoria para autorização de residência no Brasil', '/services/naturalisation/':'Assessoria para naturalização brasileira', '/services/defense/':'Defesa em questões migratórias no Brasil', '/services/advisory/':'Consultoria e planejamento migratório', '/services/other/':'Documentos e serviços de apoio à imigração', '/start-consultation/':'Solicite uma consulta sobre imigração', '/contact/':'Fale com Monique Fernandes', '/about/':'Sobre a Immigrate to Brazil', '/about/profile/':'Monique Fernandes: advogada de imigração', '/about/lawyer/':'Monique Fernandes: registro profissional e atuação jurídica', '/about/about/':'Conheça Monique Fernandes', '/about/atlas/':'Monique Fernandes: visão geral da atuação', '/brazil/':'Planeje sua mudança para o Brasil', '/brazil/cities/':'Compare cidades para morar no Brasil', '/brazil/brazil/':'Brasil: uma introdução para novos residentes', '/brazil/cost/':'Custo de vida no Brasil: planejamento do orçamento', '/brazil/living/':'Vida cotidiana no Brasil para novos residentes', '/brazil/quality/':'Qualidade de vida no Brasil: o que comparar', '/brazil/housing/':'Como procurar moradia no Brasil', '/brazil/healthcare/':'Saúde no Brasil para novos residentes', '/brazil/education/':'Educação no Brasil para famílias em mudança', '/brazil/safety/':'Segurança ao morar no Brasil', '/brazil/investment/':'Planejamento de investimento no Brasil', '/brazil/faqs/':'Mudança para o Brasil: dúvidas frequentes', '/countries/':'Mudança para o Brasil: guias por país de origem', '/process/':'Como funciona o atendimento migratório com Monique', '/rights/':'Direitos e responsabilidades dos imigrantes no Brasil', '/insights/':'Guias e informações sobre imigração no Brasil', '/process/consultation/':'Como funciona uma consulta sobre imigração', '/services/advisory/consultation/':'Consulta jurídica sobre imigração no Brasil', '/process/refund/':'Como solicitar reembolso de consulta ou serviço', '/rights/refund/':'Direitos ao solicitar reembolso de um serviço', '/legal/refund/':'Política de reembolso', '/services/visas/nomad/':'Assessoria para visto de nômade digital no Brasil', '/services/residencies/nomad/':'Autorização de residência para nômade digital no Brasil', '/services/visas/family/':'Assessoria para visto de reunião familiar no Brasil', '/services/residencies/reunion/':'Autorização de residência por reunião familiar', '/services/naturalisation/renunciation/':'Renúncia à nacionalidade brasileira', '/services/naturalisation/reacquisition/':'Reaquisição da nacionalidade brasileira',
}
# Service topics distinguish consular entry from residence inside Brazil.
route_names={'work':('Work','trabalho'),'student':('Student','estudante'),'investor':('Investor','investidor'),'retiree':('Retirement','aposentadoria'),'volunteer':('Volunteer','voluntariado'),'religious':('Religious Activity','atividade religiosa'),'humanitarian':('Humanitarian','acolhida humanitária'),'research':('Research','pesquisa'),'exchange':('Exchange','intercâmbio'),'educational':('Education-Related','atividades educacionais'),'business':('Business Visit','negócios'),'tourist':('Tourist','turismo'),'medical':('Medical Treatment','tratamento de saúde'),'artistic':('Artistic Activity','atividade artística'),'sports':('Sports Activity','atividade esportiva'),'diplomatic':('Diplomatic','diplomático'),'journalist':('Journalism','atividade jornalística'),'transit':('Transit','trânsito'),'startup':('Startup and Entrepreneur','empreendedorismo'),'study':('Study','estudo'),'mercosul':('MERCOSUR','Mercosul'),'cplp':('CPLP','CPLP'),'skilled':('Skilled Professional','profissional qualificado'),'youth':('Youth Mobility','mobilidade de jovens'),'health':('Medical Treatment','tratamento de saúde')}
for slug,(a,b) in route_names.items():
 en.setdefault('/services/visas/'+slug+'/',f'Brazil {a} Visa Assistance');pt.setdefault('/services/visas/'+slug+'/',f'Assessoria para visto brasileiro: {b}')
 en.setdefault('/services/residencies/'+slug+'/',f'{a} Residence Authorization in Brazil');pt.setdefault('/services/residencies/'+slug+'/',f'Autorização de residência no Brasil: {b}')
proc={'aftercare':('After Approval: Immigration Follow-Up','Após a aprovação: acompanhamento migratório'),'regularization':('Immigration Regularization: Preparing Your Case','Regularização migratória: preparação do pedido'),'timeline':('Immigration Timelines: Planning Each Stage','Prazos de imigração: planejamento das etapas'),'strategy':('Building Your Immigration Case Strategy','Estratégia para seu processo migratório'),'planning':('Planning Your Immigration Application','Planejamento do pedido de imigração'),'responsibilities':('Your Responsibilities During Legal Representation','Suas responsabilidades durante a representação jurídica'),'obligations':('Obligations During Your Immigration Application','Obrigações durante o pedido de imigração'),'approval':('What Happens After Immigration Approval','O que acontece após a aprovação do pedido'),'deadlines':('Managing Immigration Application Deadlines','Controle de prazos do pedido de imigração'),'permanent':('Planning for Indefinite Residence in Brazil','Planejamento para residência por prazo indeterminado'),'transparency':('Communication and Transparency During Your Case','Comunicação e transparência durante o processo'),'conversion':('Changing Your Immigration Status in Brazil','Mudança de condição migratória no Brasil'),'failures':('When an Immigration Application Goes Wrong','Quando há problemas no pedido de imigração'),'fees':('Immigration Legal Fees and Application Costs','Honorários e custos do pedido de imigração'),'assessment':('What an Immigration Case Assessment Covers','O que a análise do caso migratório abrange'),'mistakes':('Avoiding Immigration Application Mistakes','Como evitar erros no pedido de imigração'),'alone':('Applying Independently or Hiring an Immigration Lawyer','Fazer o pedido por conta própria ou contratar uma advogada'),'rights':('Your Rights as a Legal Services Client','Seus direitos como cliente de serviços jurídicos'),'compliance':('Immigration Compliance During and After Filing','Cumprimento de obrigações migratórias'),'naturalisation':('Preparing for the Naturalization Process','Preparação para o processo de naturalização'),'filing':('Preparing and Submitting Your Immigration Application','Preparação e protocolo do pedido migratório'),'renewal':('Preparing a Residence Renewal in Brazil','Preparação para renovação da residência no Brasil')}
for slug,(a,b) in proc.items():en['/process/'+slug+'/']=a;pt['/process/'+slug+'/']=b
rights={'regularization':('Rights During Immigration Regularization','Direitos durante a regularização migratória'),'timeline':('Immigration Delays: Rights and Next Steps','Demora no processo migratório: direitos e próximos passos'),'strategy':('Protecting Your Rights in Immigration Decisions','Proteção de direitos em decisões migratórias'),'planning':('Rights to Consider Before Moving to Brazil','Direitos a considerar antes da mudança para o Brasil'),'responsibilities':('Responsibilities of Immigrants in Brazil','Responsabilidades dos imigrantes no Brasil'),'obligations':('Legal Obligations of Foreign Residents in Brazil','Obrigações legais dos residentes estrangeiros no Brasil'),'permanent':('Rights of Residents With Indefinite Authorization','Direitos de residentes com autorização por prazo indeterminado'),'transparency':('Access to Information About Your Immigration Case','Acesso às informações do processo migratório'),'naturalisation':('Rights and Responsibilities After Naturalization','Direitos e responsabilidades após a naturalização'),'renewal':('Residence Renewal: Rights and Responsibilities','Renovação de residência: direitos e responsabilidades')}
for slug,(a,b) in rights.items():en['/rights/'+slug+'/']=a;pt['/rights/'+slug+'/']=b
custom_desc={
'/':('Brazil immigration legal support from Monique Fernandes. Discuss visa, residence or citizenship plans in English or Portuguese and request a consultation.','Assessoria de Monique Fernandes para imigração no Brasil. Converse sobre vistos, residência ou naturalização em português ou inglês e solicite uma consulta.'),
'/start-consultation/':('Request an immigration consultation with Monique Fernandes. Explain your situation and review the payment and written-confirmation steps before booking.','Solicite uma consulta com Monique Fernandes. Conte sua situação e confira as etapas de pagamento e confirmação por escrito antes do agendamento.'),
'/services/':('Compare visa, residence, naturalization and immigration defense services in Brazil. Find the relevant legal support and request a case consultation.','Conheça os serviços de vistos, residência, naturalização e defesa migratória no Brasil. Encontre a assessoria adequada e solicite uma consulta.'),
'/services/visas/nomad/':('Planning remote work from Brazil? Discuss digital nomad visa preparation, consular applications and supporting documents with Monique Fernandes.','Planeja trabalhar remotamente no Brasil? Converse com Monique Fernandes sobre o visto de nômade digital, o pedido consular e os documentos de apoio.'),
'/services/residencies/nomad/':('Already in Brazil and considering digital nomad residence? Review your application plans, supporting records and next steps with Monique Fernandes.','Já está no Brasil e considera a residência como nômade digital? Analise seu pedido, os documentos e os próximos passos com Monique Fernandes.'),
'/about/profile/':('Meet Monique Fernandes and learn about her Brazil immigration practice, professional background, and work with clients in English and Portuguese.','Conheça Monique Fernandes, sua atuação em imigração no Brasil, trajetória profissional e atendimento a clientes em português e inglês.'),
'/contact/':('Contact Monique Fernandes about a Brazil immigration matter. Find email and WhatsApp details, or request a consultation for advice on your case.','Fale com Monique Fernandes sobre imigração no Brasil. Encontre e-mail e WhatsApp ou solicite uma consulta para orientação sobre seu caso.')}
custom_open={
'/':('Moving to Brazil starts with understanding which legal route fits your plans. Attorney Monique Fernandes assists individuals, families and businesses with visas, residence authorization, naturalization and immigration problems. Consultations are available in English and Portuguese.\n\nIf you are applying from abroad, start with the visa services. If you are already in Brazil, explore residence and regularization support. For citizenship plans, review the naturalization services. Each section explains the kind of legal assistance available so you can find the relevant next step.\n\nTo discuss your own circumstances, request a consultation and share your current country, immigration status and main objective. The practice reviews requests before confirming the engagement and appointment in writing.','Mudar para o Brasil começa pela escolha de um caminho jurídico adequado aos seus planos. A advogada Monique Fernandes atende pessoas, famílias e empresas em questões de vistos, autorização de residência, naturalização e problemas migratórios. O atendimento pode ser realizado em português ou inglês.\n\nSe você pretende solicitar um visto no exterior, consulte os serviços de vistos. Se já está no Brasil, conheça a assessoria para residência e regularização. Para planos de cidadania, veja os serviços de naturalização. Cada seção apresenta o tipo de apoio disponível e ajuda a identificar o próximo passo.\n\nPara tratar da sua situação, solicite uma consulta e informe seu país atual, sua condição migratória e seu objetivo. O pedido é analisado antes da confirmação do atendimento e do agendamento por escrito.'),
'/start-consultation/':('Use this form to request a consultation with attorney Monique Fernandes about a Brazil immigration matter. Tell us where you currently live, what you want to do in Brazil, and whether there is an application, notice or deadline already involved. A short factual summary is enough to begin the review.\n\nSubmitting the form does not reserve an appointment. The practice first reviews your request, then provides the applicable payment instructions. Payment proof must be verified before scheduling; appointments must be at least 36 hours after payment confirmation and are confirmed manually in writing.\n\nBefore proceeding, read the payment, refund and intake policies linked below. If your matter involves an urgent deadline, mention the date in your initial message so the practice can assess the request.','Use este formulário para solicitar uma consulta com a advogada Monique Fernandes sobre imigração no Brasil. Informe onde você mora, o que pretende fazer no país e se já existe um pedido, notificação ou prazo em andamento. Um breve relato dos fatos permite iniciar a análise.\n\nO envio do formulário não reserva um horário. Primeiro, o pedido é analisado; depois, são fornecidas as orientações de pagamento aplicáveis. O comprovante precisa ser verificado antes do agendamento. A consulta deve ocorrer pelo menos 36 horas após a confirmação do pagamento e depende de confirmação manual por escrito.\n\nAntes de prosseguir, leia as políticas de pagamento, reembolso e envio de informações indicadas abaixo. Se houver um prazo urgente, informe a data na mensagem inicial para que o pedido possa ser avaliado.')}
# Candidate consolidations require GSC/backlink/contract checks; no redirects applied.
pairs=[('/services/visas/educational/','/services/visas/student/','Study-based visa assistance','Brazil student visa','HIGH'),('/services/residencies/educational/','/services/residencies/study/','Study-based residence','Brazil student residence','HIGH'),('/about/lawyer/','/about/profile/','Professional biography','Monique Fernandes lawyer','HIGH'),('/about/about/','/about/profile/','Professional biography','Monique Fernandes profile','HIGH'),('/about/atlas/','/about/profile/','Professional biography','Monique Fernandes profile','HIGH'),('/process/refund/','/legal/refund/','Service refund conditions','Monique Fernandes refund','HIGH'),('/rights/refund/','/legal/refund/','Service refund rights','immigration consultation refund','HIGH'),('/services/advisory/consultation/','/process/consultation/','Consultation offer versus explanation','Brazil immigration consultation','MEDIUM')]
for slug in rights:pairs.append(('/rights/'+slug+'/','/process/'+slug+'/','Rights versus procedural guidance',slug+' Brazil immigration','MEDIUM'))
def csvout(name,rows):
 with (O/name).open('w') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
can=[]
for a,b,over,q,severity in pairs:
 for pre in ['', '/pt-br']:
  if B+pre+a in L and B+pre+b in L:can.append(dict(page_a=B+pre+a,page_b=B+pre+b,overlapping_intent=over,overlapping_query=q,severity=severity,evidence='OBSERVED content overlap; INFERENCE query competition',solution='Differentiate pending evidence; consolidate only if unique value cannot be established',precondition='Query×page performance, incoming links, conversion and source-content review'))
csvout('06-cannibalization.csv',can)
# Metadata and dossiers are proposals, not automatic publication approval.
assets=[];kmap=[];links=[];ledger=[]
for i,row in enumerate(inventory,1):
 u=row['url'];p=urllib.parse.urlparse(u).path;ispt=p.startswith('/pt-br/');base=p[6:] if ispt else p;loc='pt-BR' if ispt else 'en';x=D.get(u,{}).get('live',L.get(u,{}).get('local',{}));oldh=H.get(u,{}).get('h1',L.get(u,{}).get('local',{}).get('h1',[]));original=oldh[0] if oldh else x.get('title','').split(' | ')[0];typ=row['page_type'];parts=base.strip('/').split('/');topic=(pt if ispt else en).get(base)
 state='DRAFT — editorial review required';action=row['action'];priority='P1' if typ in ['home','service','start-consultation','about'] else 'P2';country=typ=='country guide';article=typ=='article';noindex=action=='NOINDEX';unknown='google55' in p
 if not topic:
  if country:
   topic=original
  elif typ=='service':
   topic=original+(' no Brasil' if ispt else ' in Brazil')
  elif typ=='brazil' and len(parts)>1:
   topic=original+(': guia para morar no Brasil' if ispt else ': A Guide for Living in Brazil')
  elif typ=='insights':topic=original+(': informações sobre imigração no Brasil' if ispt else ': Brazil Immigration Reading')
  elif typ=='about':topic=original+(' | Monique Fernandes' if ispt else ' | Monique Fernandes')
  else:topic=original
 topic=topic.strip()
 if article:
  state='SOURCE REVIEW REQUIRED — no publication-ready rewrite';priority='P1' if 'brings earlier' in ' '.join(x.get('paragraphs',[])) else 'P2'
 if country:state='COUNTRY EVIDENCE REQUIRED — conditional editorial draft'
 if base.startswith('/rights/') and base!='/rights/':state='LEGAL CONTENT REVIEW REQUIRED — conditional retargeting draft'
 if base in ['/countries/brazil/','/services/visas/educational/','/services/residencies/educational/']:
  state='CONSOLIDATION REVIEW REQUIRED';action='INVESTIGATE FURTHER'
 if unknown:state='UTILITY — preserve verification token';topic='Google site verification'
 if noindex:state='UTILITY — preserve noindex';priority='P3'
 brand='Immigrate to Brazil';title=topic if 'Monique Fernandes' in topic else topic+' | '+brand
 if article:title=x.get('title','') # Do not turn a fragment into an invented factual article.
 if unknown:title=''
 if base in custom_desc:desc=custom_desc[base][ispt]
 elif article:desc=x.get('description','')
 elif country:desc=(f'{topic}. Consulte opções de imigração e planeje documentos, traduções e etapas da mudança com Monique Fernandes.' if ispt else f'{topic}. Explore immigration options and plan documents, translations and the next steps of your move with Monique Fernandes.')
 elif typ=='service':desc=(f'{topic}. Converse com Monique Fernandes sobre seu objetivo, os documentos e o apoio jurídico adequado ao seu caso.' if ispt else f'{topic}. Discuss your plans, supporting documents and the legal assistance your case may need with Monique Fernandes.')
 elif typ in ['process','rights']:desc=(f'{topic}. Entenda as questões a avaliar, organize suas dúvidas e identifique quando solicitar orientação sobre seu caso.' if ispt else f'{topic}. Identify the questions to resolve, prepare for your next step and understand when advice on your circumstances may help.')
 elif typ in ['brazil','city guide']:desc=(f'{topic}. Compare aspectos da vida cotidiana e organize as decisões práticas da sua mudança.' if ispt else f'{topic}. Explore everyday-life considerations and organize the practical decisions involved in your move.')
 elif typ=='insights':desc=(f'{topic}. Encontre leituras sobre vistos, residência e planejamento da mudança, com links para temas relacionados.' if ispt else f'{topic}. Find articles on visas, residence and relocation planning, with links to related topics and services.')
 else:desc=x.get('description','') or (f'{topic}. Informações da Immigrate to Brazil.' if ispt else f'{topic}. Information from Immigrate to Brazil.')
 h1=original if article or noindex else topic
 canonical=B+'/sitemap' if base=='/sitemap.html' else u
 robots='noindex,follow' if noindex else 'index,follow'
 intent='informational' if article or country or typ in ['brazil','city guide','rights','process','insights'] else 'transactional' if typ=='start-consultation' else 'commercial investigation' if typ=='service' or typ=='home' else 'navigational'
 audience='Leitores em português que planejam ou já vivem uma situação migratória no Brasil' if ispt else 'International clients planning a move to Brazil or managing an existing immigration matter'
 secondary=[];entities=[];questions=[];outline=[];opening='';add=[];remove=[];verify=[]
 oldparas=x.get('paragraphs',[])
 if typ=='service':
  family=parts[1] if len(parts)>1 else ''
  secondary=[topic+(' documentos' if ispt else ' documents'),topic+(' consulta' if ispt else ' consultation')]
  entities=['Ministério das Relações Exteriores','Polícia Federal','Ministério da Justiça e Segurança Pública','Monique Fernandes']
  outline=(['Quando este serviço é adequado','O que a assessoria inclui','Documentos e informações para análise','Etapas e órgão responsável','Honorários, despesas e limites do serviço','Solicite uma consulta'] if ispt else ['When this service fits your plans','What legal assistance includes','Documents and facts to review','Application stages and responsible authority','Fees, expenses and scope limits','Request a consultation'])
  questions=(['Qual é o órgão responsável pelo pedido?','Quais documentos precisam de análise?','O que está incluído nos honorários?'] if ispt else ['Which authority handles this application?','Which documents need review?','What is included in the legal fee?'])
  add=['Replace generic eligibility prose with a reviewed route-specific eligibility table, including exclusions and source URLs.','Separate the practice’s work from the public authority’s decision; show the actual engagement scope and separate legal fees from government charges.']
  verify=['Applicable route name and current legal basis; eligibility, renewals, fees and deadlines require primary-source/legal review.']
  if family=='visas':
   add+=['Explain consular jurisdiction using the applicant’s place of residence; distinguish obtaining a visa abroad from seeking residence in Brazil.']
  if family=='residencies':add+=['Explain the in-country application pathway and any subsequent registration; cross-link the corresponding entry visa without claiming the processes are interchangeable.']
  if family=='naturalisation':add+=['State the modality-specific basis, residence evidence and language evidence only after legal review; separate nationality renunciation/reacquisition from naturalization.']
  remove=['Repetitions of “route fit”, “calmer reading”, “legal clarity” and unsupported suggestions that most prior advice is deficient.']
  opening=(f'{topic}. O primeiro passo é analisar seu objetivo, sua situação atual e os documentos disponíveis. Monique Fernandes oferece orientação jurídica para avaliar o pedido e definir o apoio necessário. Informe se você está no Brasil ou no exterior e se já recebeu alguma decisão, notificação ou solicitação de documentos.\n\nA análise deve distinguir a preparação do pedido, a apresentação à autoridade competente e as etapas posteriores. Os documentos exigidos e o procedimento aplicável precisam ser confirmados para o caso concreto. Antes da contratação, esclareça quais atividades estão incluídas, quais despesas são separadas e como ocorrerá a comunicação.\n\nPara iniciar a conversa, solicite uma consulta e descreva os fatos principais, incluindo qualquer prazo conhecido. O atendimento e seu escopo dependem de confirmação por escrito.' if ispt else f'{topic} starts with reviewing what you want to do, where you currently live and the records available to support your application. Monique Fernandes provides legal guidance to assess your plans and identify the assistance your case needs. Mention any previous application, official decision or outstanding request for documents when you make contact.\n\nThe review should distinguish preparing the application, submitting it to the responsible authority and completing any later steps. Requirements and the applicable procedure need to be checked against your circumstances. Before engaging legal support, clarify which tasks are included, which expenses are separate and how updates will be communicated.\n\nTo begin, request a consultation with a short summary of your situation and any known deadline. The engagement and its scope depend on written confirmation.')
 elif country:
  name=original.replace('Moving to Brazil from ','');secondary=[name+' Brazil documents',name+' Brazil consulate'];entities=[name,'Brazil','consular jurisdiction','document authentication','sworn translation']
  outline=(['Nacionalidade e país de residência','Consulado competente e fontes oficiais','Documentos emitidos no país de origem','Autenticação e tradução dos documentos','Escolha do visto ou da residência','Preparação da mudança'] if ispt else ['Citizenship and current country of residence','Relevant consulate and official sources','Documents issued in the origin country','Authentication and translation','Choosing the visa or residence pathway','Preparing the move'])
  questions=['Does consular jurisdiction follow citizenship or current residence?','Who issues the required civil and criminal records?','Which authentication process applies to each record?']
  add=[f'Build a sourced document table specifically for {original}: issuing authority, request URL, authentication route, translation step, date verified and exceptions.','Link the relevant official consular directory and explain why nationality and residence can lead to different checks.']
  remove=['Unsupported claim in “Cities in Brazil often considered by people from…”; replace with one neutral link to the city comparison hub.','Repeated generic service descriptions already explained on visa and residence hubs.']
  verify=['[OWNER INPUT REQUIRED] Priority market and evidence of actual service demand; current origin-country issuing authorities and consular rules.']
  opening=(f'{topic}. Para preparar a mudança, separe duas informações: sua nacionalidade e o país onde você reside atualmente. Elas ajudam a identificar quais regras de entrada e quais orientações consulares precisam ser verificadas. O local de emissão dos documentos também importa para planejar a autenticação e a tradução.\n\nComece pelo motivo da mudança, como família, trabalho, estudo ou outro objetivo. Depois, organize os registros que já possui e identifique o que ainda precisa solicitar. Uma lista genérica de vistos não substitui essa análise, nem confirma que uma categoria se aplica ao seu caso.\n\nUse este guia com as fontes oficiais indicadas em cada seção. Para discutir os documentos e a sequência adequada ao seu plano, solicite uma consulta com Monique Fernandes.' if ispt else f'{topic} involves more than choosing a visa category. Start by separating your citizenship, current country of residence and the country that issued each supporting document. These details help identify which entry rules, consular instructions and document-authentication procedures need to be checked.\n\nNext, define why you want to live in Brazil: family, employment, study, retirement or another purpose. Make a list of the civil records and other evidence you already have, along with documents you still need to obtain. General information about visa options cannot establish whether a particular route applies to your circumstances.\n\nUse the official sources listed with each country-specific step in this guide. To discuss your own records and application sequence, request a consultation with Monique Fernandes.')
 elif article:
  secondary=['Not finalized: reconcile original title and actual article before assigning secondary queries'];entities=[];questions=['What complete question was the original post answering?','Does the present body answer that question?','Which current primary source supports the answer?'];outline=['Answer the complete question stated in the title','Who the rule or explanation applies to','Relevant evidence and practical example','Exceptions and next steps','Sources and genuine review date'];add=['Recover the complete original post or source research; the current title is not sufficient evidence for a new legal answer.','Compare the recovered subject with existing service and educational owners before retaining a separate article.'];remove=['Template introduction and three generic takeaways where they do not answer the title.','Residual social commands such as “link in bio”, “View all comments” and repeated truncated sentences when present.'];verify=['[OWNER INPUT REQUIRED] Original text/source and factual review where the existing page does not support its title.','Check historical GSC, backlinks and conversions before consolidation.'];opening='WITHHELD: source-grounded opening cannot be supplied from a fragmentary or mismatched article without inventing its answer. Existing text and exact required repairs are recorded below.'
 elif typ in ['process','rights']:
  outline=(['O que esta etapa significa','Informações e documentos necessários','Responsabilidades e limites','Próximos passos e fontes'] if ispt else ['What this stage means','Facts and documents needed','Responsibilities and limits','Next steps and sources']);questions=['What changes at this specific stage?','Which obligation belongs to the client, lawyer or authority?'];add=[f'Rewrite the generic introduction around the actual task: {topic}.','Use a concrete input → action → output checklist; distinguish legal rights from contractual practice policies.'];remove=['Repeated passages describing every topic as a “real stage” without explaining it.'];verify=['Current legal claims and any contractual promises; retargeting must be reflected in the visible body.']
 elif typ in ['brazil','city guide']:
  outline=[z['text'] for z in x.get('headings',[]) if z['level']=='h2'];add=['Add a dated comparison table using original observations or named data sources for costs, transport and services relevant to this page.'];remove=['Superlatives and universal safety/quality claims without evidence.'];verify=['Neighborhood descriptions, dates and source of cost figures; do not imply a local office.'];questions=['What practical decision does this page help a relocating household make?']
 else:
  outline=[z['text'] for z in x.get('headings',[]) if z['level']=='h2'];add=['Keep the page focused on the specific navigational task identified by its heading; move unrelated service summaries to their owners.'];remove=['Repeated headings or introductions that add no information.'];verify=['Professional facts, testimonials and any promised service conditions.']
 if base in custom_open:opening=custom_open[base][ispt]
 if not opening:opening='Retain factual opening pending the specific additions above; do not publish the new targeting until the visible introduction supports it.'
 prefix='/pt-br' if ispt else ''
 targetpaths=[]
 if typ=='service':
  if len(parts)>2:targetpaths.append('/'+('/'.join(parts[:-1]))+'/')
  targetpaths+=['/start-consultation/','/about/profile/']
  if '/visas/' in base:
   slug=parts[-1];mapped={'family':'reunion','student':'study','medical':'health'}.get(slug,slug);targetpaths.append('/services/residencies/'+mapped+'/')
  elif '/residencies/' in base:targetpaths.append('/process/renewal/')
 elif country:targetpaths=['/services/visas/','/services/residencies/','/brazil/cities/','/countries/']
 elif article:targetpaths=['/'+('/'.join(parts[:-1]))+'/','/insights/']
 elif typ in ['process','rights']:targetpaths=['/process/','/rights/','/start-consultation/']
 elif typ in ['brazil','city guide']:targetpaths=['/brazil/cities/','/brazil/cost/','/services/residencies/']
 else:targetpaths=['/services/','/about/profile/','/start-consultation/']
 targets=[]
 for t in dict.fromkeys(targetpaths):
  v=B+prefix+t
  if v in L and v!=u:
   anchor=(pt if ispt else en).get(t,L[v]['local']['h1'][0] if L[v]['local']['h1'] else t)
   targets.append({'url':v,'anchor':anchor,'context':'Relevant explanation before the closing CTA; only where the target resolves the next user question'})
   if not noindex and not unknown:links.append(dict(source=u,target=v,anchor=anchor,location='Contextual paragraph on the related topic',reason='Distinct next task; connect educational/service stages',status='PROPOSED; use only after content review' if article else 'PROPOSED'))
 sourcepath='/'+parts[0]+'/' if len(parts)>1 else '/';source=B+prefix+sourcepath
 if source in L and source!=u and not noindex and not unknown:links.append(dict(source=source,target=u,anchor=h1,location='Relevant topic group in hub directory',reason='Expose this page within its owning section',status='PROPOSED; retain only if page earns separate intent'))
 exclusions=[t['url']+' owns '+t['anchor'] for t in targets if t['url']!=B+prefix+'/start-consultation/']
 if article:exclusions+=['Do not assign a service head term based only on keywords in the slug.']
 canonical=canonical if not unknown else ''
 # Stable IDs preserve existing site identity. Minimal graph; no invented address, founder, ratings or price.
 orgid=B+'#organization';siteid=B+'#website';pageid=canonical+'#webpage';graph=[]
 if base=='/':graph+=[{'@type':'Organization','@id':orgid,'name':'Immigrate to Brazil','url':B+'/','logo':B+'/assets/logo/logo.png','email':'moniquefadv@gmail.com','telephone':'+55 43 9961-4034'},{'@type':'WebSite','@id':siteid,'url':B+'/','name':'Immigrate to Brazil','publisher':{'@id':orgid},'inLanguage':['en','pt-BR']}]
 schema_type='AboutPage' if typ=='about' else 'ContactPage' if typ in ['contact','start-consultation'] else 'CollectionPage' if typ=='insights' or base in ['/services/','/countries/','/brazil/cities/'] else 'WebPage'
 graph.append({'@type':schema_type,'@id':pageid,'url':canonical,'name':h1,'description':desc,'inLanguage':loc,'isPartOf':{'@id':siteid}})
 crumb=[(B+prefix+'/', 'Início' if ispt else 'Home')]
 for n in range(1,len(parts)):
  t='/'+('/'.join(parts[:n]))+'/'
  if B+prefix+t in L:crumb.append((B+prefix+t,(pt if ispt else en).get(t,L[B+prefix+t]['local']['h1'][0] if L[B+prefix+t]['local']['h1'] else parts[n-1])))
 if canonical!=crumb[0][0]:crumb.append((canonical,h1))
 if len(crumb)>1:
  graph[0 if base!='/' else 2]['breadcrumb']={'@id':canonical+'#breadcrumb'}
  graph.append({'@type':'BreadcrumbList','@id':canonical+'#breadcrumb','itemListElement':[{'@type':'ListItem','position':j,'name':name,'item':url} for j,(url,name) in enumerate(crumb,1)]})
 if typ=='service' and len(parts)>2:
  graph.append({'@type':'Service','@id':canonical+'#service','name':h1,'url':canonical,'provider':{'@id':orgid},'mainEntityOfPage':{'@id':pageid}});graph[0]['mainEntity']={'@id':canonical+'#service'}
 if base=='/about/profile/':graph.append({'@type':'Person','@id':B+'#person-monique-fernandes','name':'Monique Fernandes','url':canonical,'jobTitle':'Advogada' if ispt else 'Attorney'});graph[0]['mainEntity']={'@id':B+'#person-monique-fernandes'}
 if article:
  graph.append({'@type':'Article','@id':canonical+'#article','headline':original,'mainEntityOfPage':{'@id':pageid},'inLanguage':loc,'publisher':{'@id':orgid}})
 schema={'@context':'https://schema.org','@graph':graph}
 stem=f'{i:04d}-'+('home' if p=='/' else p.strip('/').replace('/','--'))
 ogimage=x.get('og_image',''); esc=lambda s:html.escape(s,quote=True)
 tags=[f'<title>{esc(title)}</title>',f'<meta name="description" content="{esc(desc)}">',f'<link rel="canonical" href="{esc(canonical)}">',f'<meta name="robots" content="{robots}">',f'<meta property="og:title" content="{esc(title)}">',f'<meta property="og:description" content="{esc(desc)}">',f'<meta property="og:url" content="{esc(canonical)}">',f'<meta property="og:type" content="{"article" if article else "website"}">',f'<meta name="twitter:card" content="{"summary_large_image" if ogimage else "summary"}">',f'<meta name="twitter:title" content="{esc(title)}">',f'<meta name="twitter:description" content="{esc(desc)}">']
 if ogimage:tags += [f'<meta property="og:image" content="{esc(ogimage)}">',f'<meta name="twitter:image" content="{esc(ogimage)}">']
 breadcrumb_html='<nav aria-label="Breadcrumb">'+ ' → '.join(f'<a href="{esc(url)}">{esc(name)}</a>' for url,name in crumb)+'</nav>' if len(crumb)>1 else ''
 if not unknown:
  (O/'metadata'/f'{stem}.html').write_text('<!-- PROPOSAL: '+state+'; replace existing matching tags, do not append duplicates. -->\n'+'\n'.join(tags)+'\n')
  (O/'schema'/f'{stem}.json').write_text(json.dumps(schema,ensure_ascii=False,indent=2))
 image_notes='Retain accurate geographic/photo alt text where the picture conveys information; use alt="" for purely decorative repeated landscapes. No new image URL invented. Existing first image: '+json.dumps((x.get('images') or [])[:1],ensure_ascii=False)
 keep='Existing factual service scope, contact path and relevant source links; preserve statutory distinctions.' if typ=='service' else 'Factual material that directly supports this page’s distinct purpose.'
 why='OBSERVED: current title/H1/body extracted in evidence. BEST PRACTICE: give the page one clear identity; INFERENCE: clearer presentation may improve qualified clicks. No CTR uplift is measured.'
 if article:why='OBSERVED: archive text and title recorded below. Publication-ready rewriting is withheld until the original subject, completeness and current accuracy are established; metadata must not promise an answer absent from the body.'
 body=f'''# {u}

Status: **{state}**. Priority: **{priority}**. URL action: **{action}**. No production edits applied.

## A–C. URL, intent and targeting

Current URL: {u}
Recommended URL: {canonical or 'Preserve verification URL'}
URL migration: KEEP unless the reviewed consolidation map establishes a justified move.
Audience: {audience}
Primary intent: {intent}
Secondary intent: finding the appropriate next step or related explanation.
User problem / SEO objective: {topic}
Desired action: {'Request a consultation after reviewing scope' if typ in ['home','service','start-consultation'] else 'Resolve the page-specific question; follow the relevant next-step link'}.
Primary topic/query: {topic}
Primary keyword/focus field: {topic}; editorial aid only, no meta keywords.
Secondary / long-tail candidates: {json.dumps(secondary,ensure_ascii=False)}
Entities/concepts: {json.dumps(entities,ensure_ascii=False)}
Questions: {json.dumps(questions,ensure_ascii=False)}
Excluded intent owners: {json.dumps(exclusions,ensure_ascii=False)}

## D–F. Before / after change log

BEFORE title: {x.get('title','')}
BEFORE description: {x.get('description','')}
BEFORE H1: {' | '.join(oldh)}
BEFORE apparent targeting: {row['apparent_topic']}

AFTER title: {title}
Alternative A: {topic+" — informações e próximos passos" if ispt else topic+" — Overview and Next Steps"}
Alternative B: {"Entenda: "+topic if ispt else "Understanding "+topic}
AFTER description: {desc}
AFTER H1: {h1}
AFTER targeting: {topic} — {intent}
H1 decision: {'Retain pending source review' if article else 'Use the explicit topic above; replace generic labels only alongside corresponding body edits'}.
WHY / strongest title: {why}

## G–J. Visible content

H1: {h1}
{chr(10).join('H2: '+z for z in outline)}

Opening proposal:

{opening}

KEEP: {keep}
ADD: {' '.join(add)}
REMOVE: {' '.join(remove)}
MERGE: Review any matching rows in 06-cannibalization.csv; no automatic consolidation.
UPDATE: Align visible introduction, title, H1, OG name and schema name to the final selected intent; preserve true historical publication dates.
VERIFY: {' '.join(verify)}
MOVE HIGHER: Direct explanation of this page’s subject and the most relevant next step.
MOVE LOWER: Repeated general practice promotion and unrelated route lists.
Search-intent gaps: {'; '.join(questions+add)}

Observed opening / content evidence:

{chr(10).join(oldparas[:3])}

## K–L. Links and media

Links FROM this page:
{chr(10).join('- '+t['url']+' → '+t['anchor']+' → '+t['context'] for t in targets)}

Links TO this page: {source if source in L and source!=u else B+prefix+'/services/'} in the relevant topic group, using “{h1}”; see the complete source/target table. A new contextual link is conditional on retaining the page’s distinct value.
Media: {image_notes}
Recommended original media: {'A route/application decision diagram reviewed by the responsible lawyer; never substitute an invented document screenshot.' if typ=='service' else 'A source-linked document checklist for this country.' if country else 'Only add a diagram, photograph or comparison that explains this page’s actual subject.'}

## M–O. Canonical, robots and social metadata

Canonical: {canonical}
Robots: {robots}. {'Preserves a utility page exclusion.' if noindex else 'Self-canonical indexable proposal; actual Google index state unavailable.'}
Exact HTML: ../metadata/{stem}.html
Existing social image: {ogimage or 'None verified; image tags omitted.'}

## Structured data

Required for organic indexing? NO. Optional types: {', '.join(z['@type'] for z in graph)}.
Purpose: semantic identity and, for a truthful visible trail, possible Breadcrumb eligibility. Service/WebPage/Person do not create a generic rich result. Article is conditional on a complete genuine article. No FAQ rich-result claim.
JSON-LD: ../schema/{stem}.json. Wrap this valid JSON in `<script type="application/ld+json">` and replace the existing graph; do not append conflicting entities. Source-review gates apply to schema too.
Visible breadcrumb accompanying the proposal:

```html
{breadcrumb_html}
```

Expected strategic benefit: clearer ownership and navigation for the page’s specific task. This is an inference, not a ranking or traffic forecast.
'''
 (O/'pages'/f'{stem}.md').write_text(body)
 ledger.append(dict(url=u,page_file='pages/'+stem+'.md',status=state,action=action,priority=priority,metadata='metadata/'+stem+'.html' if not unknown else '',schema='schema/'+stem+'.json' if not unknown else '',factual_review='REQUIRED' if article or country or typ in ['service','rights','process'] else 'CHECK EXISTING CLAIMS',deployment='NOT APPLIED'))
 assets.append(dict(url=u,title=title,description=desc,h1=h1,canonical=canonical,robots=robots,state=state))
 kmap.append(dict(url=u,language=loc,primary_topic=topic,intent=intent,secondary=' | '.join(secondary),entities=' | '.join(entities),questions=' | '.join(questions),exclusions=' | '.join(exclusions),status=state))
csvout('05-keyword-url-map.csv',kmap);csvout('08-internal-link-plan.csv',links);csvout('master-ledger.csv',ledger);(O/'proposed-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2))
# Explicit HTTP map versus conditional content consolidation.
redirects=[dict(old='http://immigratetobrazil.com/*',new='https://immigratetobrazil.com/{same path and query}',action='KEEP EXISTING 301',reason='Observed protocol normalization'),dict(old='https://www.immigratetobrazil.com/*',new='https://immigratetobrazil.com/{same path and query}',action='PROPOSED EDGE 301',reason='Consolidate host variants; preserve path/query; verify deep links'),dict(old=B+'/sitemap.html',new=B+'/sitemap',action='KEEP EXISTING 308; UPDATE CANONICAL AND LINKS',reason='Observed Cloudflare extension normalization')]
for c in can:redirects.append(dict(old=c['page_a'],new=c['page_b'],action='CONDITIONAL ONLY — no redirect until evidence review',reason=c['overlapping_intent']))
csvout('12-redirect-consolidation-map.csv',redirects)
print('Created',len(ledger),'dossiers;',len(links),'link recommendations')
