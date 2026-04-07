(function () {
  const STYLE_ID = 'monique-external-resources-styles';
  const SECTION_PRESETS = {
    'general-core': linesToUrls(`
https://www.gov.br/pt-br
https://www.gov.br/planalto/pt-br
https://www.in.gov.br
https://www.cnj.jus.br
https://www.stj.jus.br
https://portal.stf.jus.br
https://www.gov.br/mre/pt-br
https://www.gov.br/pf/pt-br
    `),
    'immigration-core': linesToUrls(`
https://www.gov.br/mj/pt-br/assuntos/seus-direitos/migracoes
https://www.gov.br/pf/pt-br
https://www.gov.br/mre/pt-br
https://www.gov.br/trabalho-e-emprego/pt-br
https://www.gov.br/planalto/pt-br
https://www.gov.br/pt-br
https://www.unhcr.org/where-we-work/countries/brazil
https://brazil.iom.int
    `),
    'citizenship-core': linesToUrls(`
https://www.gov.br/pt-br
https://www.gov.br/planalto/pt-br
https://www.in.gov.br
https://www.cnj.jus.br
https://www.stj.jus.br
https://portal.stf.jus.br
https://www.gov.br/mre/pt-br
https://www.gov.br/pf/pt-br
    `),
    'family-core': linesToUrls(`
https://www.cnj.jus.br
https://www.stj.jus.br
https://portal.stf.jus.br
https://www.gov.br/mdh/pt-br
https://www.gov.br/mulheres/pt-br
https://www.unicef.org/brazil
https://www.onumulheres.org.br
https://www.oas.org/en/iachr
    `),
    'human-rights-core': linesToUrls(`
https://www.gov.br/mdh/pt-br
https://www.ohchr.org/en/special-procedures/sr-migrants
https://www.oas.org/en/iachr
https://www.corteidh.or.cr
https://www.unhcr.org/where-we-work/countries/brazil
https://www.acnur.org/br
https://www.onumulheres.org.br
https://www.unicef.org/brazil
    `),
    'civil-core': linesToUrls(`
https://www.gov.br/cgu/pt-br
https://www.gov.br/pt-br
https://www.gov.br/planalto/pt-br
https://www.in.gov.br
https://www.cnj.jus.br
https://www.stj.jus.br
https://portal.stf.jus.br
https://www.gov.br/receitafederal/pt-br
    `),
    'international-core': linesToUrls(`
https://www.gov.br/mre/pt-br
https://www.unhcr.org/where-we-work/countries/brazil
https://brazil.iom.int
https://www.oas.org/en/iachr
https://www.migrationdataportal.org
https://www.oecd.org/migration
https://www.worldbank.org
https://www.who.int
    `),
    'posts-core': linesToUrls(`
https://www.gov.br/mj/pt-br/assuntos/seus-direitos/migracoes
https://www.gov.br/pf/pt-br
https://www.gov.br/mre/pt-br
https://www.gov.br/trabalho-e-emprego/pt-br
https://www.unhcr.org/where-we-work/countries/brazil
https://www.acnur.org/br
https://brazil.iom.int
https://www.onumulheres.org.br
    `),
    'news-reference': linesToUrls(`
https://www.gov.br/planalto/pt-br
https://www.in.gov.br
https://www.cnj.jus.br
https://www.stj.jus.br
https://portal.stf.jus.br
https://www.ohchr.org/en/special-procedures/sr-migrants
https://www.migrationdataportal.org
https://publications.iom.int
https://www.oecd.org/migration
https://www.who.int
    `),
    'privacy-governance': linesToUrls(`
https://www.gov.br/casacivil/pt-br
https://www.gov.br/cgu/pt-br
https://www.gov.br/planalto/pt-br
https://www.gov.br/pt-br
https://www.in.gov.br
https://www.cnj.jus.br
https://www.stj.jus.br
https://portal.stf.jus.br
    `)
  };

  const RESOURCE_GROUPS = [
    {
      hubId: 'brazil-federal',
      hubLabel: 'Brazilian Federal Ministries, Agencies & Central Bodies',
      hubSummary:
        'Core Brazilian public institutions used for legislation, immigration procedure research, institutional verification, oversight, and public service guidance.',
      icon: 'fa-building-columns',
      clusters: [
        {
          label: 'Federal ministries, agencies and central bodies',
          kind: 'brazil-federal',
          urls: linesToUrls(`
https://www.gov.br/agu
https://www.bcb.gov.br
https://www.gov.br/casacivil/pt-br
https://www.gov.br/cgu/pt-br
https://www.gov.br/gsi/pt-br
https://www.gov.br/agricultura/pt-br
https://www.gov.br/cidades/pt-br
https://www.gov.br/mcti/pt-br
https://www.gov.br/mcom/pt-br
https://www.gov.br/cultura/pt-br
https://www.gov.br/defesa/pt-br
https://www.gov.br/mda/pt-br
https://www.gov.br/memp/pt-br
https://www.gov.br/esporte/pt-br
https://www.gov.br/mpa/pt-br
https://www.gov.br/mds/pt-br
https://www.gov.br/mdic/pt-br
https://www.gov.br/mdh/pt-br
https://www.gov.br/mec/pt-br
https://www.gov.br/fazenda/pt-br
https://www.gov.br/gestao/pt-br
https://www.gov.br/igualdaderacial/pt-br
https://www.gov.br/mdr/pt-br
https://www.gov.br/mj/pt-br
https://www.gov.br/mj/pt-br/assuntos/seus-direitos/migracoes
https://www.gov.br/mma/pt-br
https://www.gov.br/mme/pt-br
https://www.gov.br/mulheres/pt-br
https://www.gov.br/planejamento/pt-br
https://www.gov.br/previdencia/pt-br
https://www.gov.br/portos-e-aeroportos/pt-br
https://www.gov.br/povosindigenas/pt-br
https://www.gov.br/mre/pt-br
https://www.gov.br/saude/pt-br
https://www.gov.br/trabalho-e-emprego/pt-br
https://www.gov.br/transportes/pt-br
https://www.gov.br/turismo/pt-br
https://www.gov.br/planalto/pt-br
https://www.gov.br/secom/pt-br
https://www.gov.br/sri/pt-br
https://www.gov.br/secretariageral/pt-br
https://www.gov.br/pf/pt-br
https://www.gov.br/pf/pt-br/assuntos/imigracao
https://www.gov.br/receitafederal/pt-br
https://www.cnj.jus.br
https://www.in.gov.br
https://www.gov.br/pt-br
https://www.stj.jus.br
https://portal.stf.jus.br
          `)
        }
      ]
    },
    {
      hubId: 'un-system',
      hubLabel: 'United Nations System',
      hubSummary:
        'United Nations institutions, country pages, treaty bodies, and thematic agencies that are frequently relevant in migration, human rights, gender, health, and development research.',
      icon: 'fa-earth-americas',
      clusters: [
        {
          label: 'Core UN and country presence',
          kind: 'un-core',
          urls: linesToUrls(`
https://www.un.org
https://brasil.un.org/pt-br
          `)
        },
        {
          label: 'Refugees, migration and displacement',
          kind: 'un-migration',
          urls: linesToUrls(`
https://www.unhcr.org
https://www.unhcr.org/where-we-work/countries/brazil
https://www.acnur.org/br
https://www.iom.int
https://brazil.iom.int
https://lac.iom.int
https://www.globalcompactrefugees.org
https://www.globalcompactmigration.org
          `)
        },
        {
          label: 'Human rights system',
          kind: 'un-rights',
          urls: linesToUrls(`
https://www.ohchr.org
https://www.ohchr.org/en/treaty-bodies
https://www.ohchr.org/en/treaty-bodies/ccpr
https://www.ohchr.org/en/treaty-bodies/cescr
https://www.ohchr.org/en/treaty-bodies/cedaw
https://www.ohchr.org/en/treaty-bodies/cat
https://www.ohchr.org/en/treaty-bodies/crc
https://www.ohchr.org/en/treaty-bodies/crpd
https://www.ohchr.org/en/treaty-bodies/cerd
https://www.ohchr.org/en/special-procedures
https://www.ohchr.org/en/special-procedures/sr-migrants
          `)
        },
        {
          label: 'Development, governance and data',
          kind: 'un-development',
          urls: linesToUrls(`
https://www.undp.org
https://www.undp.org/brazil
https://www.unep.org
https://www.unhabitat.org
https://data.un.org
          `)
        },
        {
          label: 'Gender, children and health',
          kind: 'un-social',
          urls: linesToUrls(`
https://www.unwomen.org
https://www.onumulheres.org.br
https://www.unicef.org
https://www.unicef.org/brazil
https://www.unfpa.org
https://www.who.int
          `)
        }
      ]
    },
    {
      hubId: 'international-law',
      hubLabel: 'International Law, Courts & Legal Harmonization',
      hubSummary:
        'Courts, tribunals, and transnational legal harmonization bodies that support comparative legal research, treaty interpretation, and cross-border dispute understanding.',
      icon: 'fa-scale-balanced',
      clusters: [
        {
          label: 'Courts and tribunals',
          kind: 'intl-courts',
          urls: linesToUrls(`
https://www.icj-cij.org
https://www.icc-cpi.int
          `)
        },
        {
          label: 'Private international law and legal harmonization',
          kind: 'intl-harmonization',
          urls: linesToUrls(`
https://www.hcch.net
https://www.unidroit.org
https://uncitral.un.org
          `)
        },
        {
          label: 'Arbitration and investment',
          kind: 'intl-arbitration',
          urls: linesToUrls(`
https://icsid.worldbank.org
          `)
        }
      ]
    },
    {
      hubId: 'americas',
      hubLabel: 'Regional Systems - Americas',
      hubSummary:
        'Inter-American human rights bodies, integration platforms, and regional development institutions relevant to mobility, rights, trade, and policy coordination in the Americas.',
      icon: 'fa-globe',
      clusters: [
        {
          label: 'Inter-American human rights system',
          kind: 'americas-rights',
          urls: linesToUrls(`
https://www.oas.org
https://www.oas.org/en/iachr
https://www.corteidh.or.cr
          `)
        },
        {
          label: 'Regional integration and mobility',
          kind: 'americas-mobility',
          urls: linesToUrls(`
https://www.mercosur.int
https://www.parlamentomercosur.org
https://www.aladi.org
          `)
        },
        {
          label: 'Regional development and policy',
          kind: 'americas-development',
          urls: linesToUrls(`
https://www.cepal.org/en
https://www.caf.com
          `)
        }
      ]
    },
    {
      hubId: 'europe',
      hubLabel: 'European System',
      hubSummary:
        'European institutions, courts, and agencies that are particularly useful for comparative migration, asylum, border, and human-rights research.',
      icon: 'fa-landmark-flag',
      clusters: [
        {
          label: 'European institutions and agencies',
          kind: 'europe-system',
          urls: linesToUrls(`
https://www.coe.int
https://www.echr.coe.int
https://home-affairs.ec.europa.eu
https://www.euaa.europa.eu
https://frontex.europa.eu
          `)
        }
      ]
    },
    {
      hubId: 'global-governance',
      hubLabel: 'Global Economic & Migration Governance',
      hubSummary:
        'Global economic governance institutions and migration policy references that are useful for macro context, standards, and research on movement, work, and development.',
      icon: 'fa-chart-line',
      clusters: [
        {
          label: 'Economic and migration governance',
          kind: 'global-governance',
          urls: linesToUrls(`
https://www.worldbank.org
https://www.imf.org
https://www.wto.org
https://www.oecd.org
https://www.oecd.org/migration
          `)
        }
      ]
    },
    {
      hubId: 'migration-data',
      hubLabel: 'Migration Policy, Data & Analytics',
      hubSummary:
        'Data and research resources for migration, remittances, mobility, and displacement trends, useful for evidence-based analysis and contextual research.',
      icon: 'fa-database',
      clusters: [
        {
          label: 'Data, publications and analytics',
          kind: 'migration-data',
          urls: linesToUrls(`
https://www.migrationdataportal.org
https://www.knomad.org
https://publications.iom.int
https://www.internal-displacement.org
          `)
        }
      ]
    },
    {
      hubId: 'protection',
      hubLabel: 'Trafficking, Smuggling & Protection',
      hubSummary:
        'Protection-focused organizations and programmes dealing with trafficking, smuggling, detention, and broader safety frameworks affecting migrants and vulnerable persons.',
      icon: 'fa-shield-heart',
      clusters: [
        {
          label: 'Protection and anti-trafficking bodies',
          kind: 'protection',
          urls: linesToUrls(`
https://www.unodc.org
https://www.ungift.org
https://www.icmpd.org
          `)
        }
      ]
    },
    {
      hubId: 'legal-orgs',
      hubLabel: 'International Legal & Bar Organizations',
      hubSummary:
        'Professional legal associations and bar networks with publications, standards, policy statements, and continuing reference material for practitioners and researchers.',
      icon: 'fa-gavel',
      clusters: [
        {
          label: 'Legal and bar organizations',
          kind: 'legal-orgs',
          urls: linesToUrls(`
https://www.ibanet.org
https://www.asil.org
https://www.ccbe.eu
          `)
        }
      ]
    },
    {
      hubId: 'specialized',
      hubLabel: 'Specialized / Niche High-Value Bodies',
      hubSummary:
        'Focused organizations that are especially useful for statelessness, asylum, detention, and refugee-law research where mainstream institutional portals are not enough.',
      icon: 'fa-puzzle-piece',
      clusters: [
        {
          label: 'Statelessness and nationality',
          kind: 'specialized-statelessness',
          urls: linesToUrls(`
https://www.institutesi.org
https://www.statelessness.eu
          `)
        },
        {
          label: 'Refugee and asylum advocacy',
          kind: 'specialized-asylum',
          urls: linesToUrls(`
https://www.ecre.org
          `)
        },
        {
          label: 'Less obvious but important',
          kind: 'specialized-other',
          urls: linesToUrls(`
https://www.unescwa.org
https://www.unocha.org
https://www.globaldetentionproject.org
https://www.refugeelawinitiative.org
          `)
        }
      ]
    },
    {
      hubId: 'brazil-consular',
      hubLabel: 'Brazilian Embassies & Consulates Abroad',
      hubSummary:
        'Official Brazilian diplomatic mission pages with consular services, jurisdiction details, public notices, and contact information for Brazilians and foreign nationals abroad.',
      icon: 'fa-passport',
      clusters: [
        {
          label: 'Embassies and consulates',
          kind: 'brazil-diplomatic',
          urls: linesToUrls(`
https://www.gov.br/mre/pt-br/consulado-washington
https://www.gov.br/mre/pt-br/consulado-atlanta
https://www.gov.br/mre/pt-br/consulado-boston
https://www.gov.br/mre/pt-br/consulado-chicago
https://www.gov.br/mre/pt-br/consulado-los-angeles
https://www.gov.br/mre/pt-br/consulado-miami
https://www.gov.br/mre/pt-br/consulado-nova-york
https://www.gov.br/mre/pt-br/consulado-houston
https://www.gov.br/mre/pt-br/consulado-san-francisco
https://www.gov.br/mre/pt-br/consulado-hartford
https://www.gov.br/mre/pt-br/consulado-orlando
https://www.gov.br/mre/pt-br/embaixada-washington
https://www.gov.br/mre/pt-br/embaixada-londres
https://www.gov.br/mre/pt-br/embaixada-paris
https://www.gov.br/mre/pt-br/embaixada-berlim
https://www.gov.br/mre/pt-br/consulado-zurique
https://www.gov.br/mre/pt-br/embaixada-moscou
https://www.gov.br/mre/pt-br/consulado-hongkong
https://www.gov.br/mre/pt-br/embaixada-madrid
https://www.gov.br/mre/pt-br/consulado-montreal
https://www.gov.br/mre/pt-br/embaixada-ottawa
https://www.gov.br/mre/pt-br/consulado-toronto
https://www.gov.br/mre/pt-br/consulado-vancouver
https://www.gov.br/mre/pt-br/embaixada-bruxelas
https://www.gov.br/mre/pt-br/consulado-amsterdam
https://www.gov.br/mre/pt-br/embaixada-roma
https://www.gov.br/mre/pt-br/consulado-milao
https://www.gov.br/mre/pt-br/embaixada-lisboa
https://www.gov.br/mre/pt-br/consulado-porto
https://www.gov.br/mre/pt-br/embaixada-bogota
https://www.gov.br/mre/pt-br/embaixada-buenos-aires
https://www.gov.br/mre/pt-br/embaixada-santiago
https://www.gov.br/mre/pt-br/embaixada-lima
https://www.gov.br/mre/pt-br/embaixada-caracas
https://www.gov.br/mre/pt-br/consulado-mexico
https://www.gov.br/mre/pt-br/embaixada-havana
https://www.gov.br/mre/pt-br/embaixada-panama
https://www.gov.br/mre/pt-br/embaixada-tokyo
https://www.gov.br/mre/pt-br/consulado-shanghai
https://www.gov.br/mre/pt-br/embaixada-beijing
https://www.gov.br/mre/pt-br/embaixada-seul
https://www.gov.br/mre/pt-br/embaixada-nova-delhi
https://www.gov.br/mre/pt-br/consulado-dubai
https://www.gov.br/mre/pt-br/embaixada-abu-dhabi
https://www.gov.br/mre/pt-br/embaixada-pretoria
https://www.gov.br/mre/pt-br/embaixada-luanda
https://www.gov.br/mre/pt-br/embaixada-maputo
https://www.gov.br/mre/pt-br/embaixada-nairobi
https://www.gov.br/mre/pt-br/embaixada-cairo
https://www.gov.br/mre/pt-br/embaixada-tel-aviv
https://www.gov.br/mre/pt-br/embaixada-ankara
https://www.gov.br/mre/pt-br/consulado-istambul
https://www.gov.br/mre/pt-br/embaixada-teer%C3%A3
https://www.gov.br/mre/pt-br/embaixada-bangkok
https://www.gov.br/mre/pt-br/embaixada-jakarta
https://www.gov.br/mre/pt-br/embaixada-manila
https://www.gov.br/mre/pt-br/embaixada-canberra
https://www.gov.br/mre/pt-br/consulado-sydney
https://www.gov.br/mre/pt-br/embaixada-wellington
https://www.gov.br/mre/pt-br/embaixada-estocolmo
https://www.gov.br/mre/pt-br/embaixada-oslo
https://www.gov.br/mre/pt-br/embaixada-copenhague
https://www.gov.br/mre/pt-br/embaixada-helsinque
https://www.gov.br/mre/pt-br/embaixada-viena
https://www.gov.br/mre/pt-br/embaixada-praga
https://www.gov.br/mre/pt-br/embaixada-bucareste
https://www.gov.br/mre/pt-br/embaixada-sofia
https://www.gov.br/mre/pt-br/embaixada-budapeste
https://www.gov.br/mre/pt-br/embaixada-varsovia
https://www.gov.br/mre/pt-br/embaixada-ucrania
https://www.gov.br/mre/pt-br/embaixada-atenas
https://www.gov.br/mre/pt-br/consulado-barcelona
https://www.gov.br/mre/pt-br/consulado-valencia
https://www.gov.br/mre/pt-br/embaixada-dublin
https://www.gov.br/mre/pt-br/consulado-edimburgo
https://www.gov.br/mre/pt-br/consulado-manchester
          `)
        }
      ]
    },
    {
      hubId: 'municipal-rights',
      hubLabel: 'Municipal Secretariats - Human Rights & Citizenship',
      hubSummary:
        'Municipal public bodies in major Brazilian cities that may offer local citizenship, human-rights, social assistance, and protection services.',
      icon: 'fa-city',
      clusters: [
        {
          label: 'Major city secretariats',
          kind: 'municipal-rights',
          urls: linesToUrls(`
https://www.prefeitura.sp.gov.br/cidade/secretarias/direitos_humanos
https://prefeitura.rio/cidadania
https://prefeitura.pbh.gov.br/cidadania
https://www.curitiba.pr.gov.br/secretarias/direitos-humanos
https://prefeitura.poa.br/smds
https://www.sejus.df.gov.br
https://www.salvador.ba.gov.br/secretarias
https://www.fortaleza.ce.gov.br
https://www.recife.pe.gov.br
          `)
        }
      ]
    },
    {
      hubId: 'state-legal-aid',
      hubLabel: 'Defensorias Publicas Estaduais (Public Legal Aid)',
      hubSummary:
        'Official state public defender portals across Brazil, useful for legal aid access, rights guidance, contact channels, and institution-specific service information.',
      icon: 'fa-handshake-angle',
      clusters: [
        {
          label: 'North (Norte)',
          kind: 'state-legal-aid',
          urls: linesToUrls(`
https://www.defensoria.am.def.br
https://www.defensoria.ap.def.br
https://www.defensoria.pa.def.br
https://www.defensoria.ro.def.br
https://www.defensoria.rr.def.br
https://www.defensoria.to.def.br
https://www.defensoria.ac.def.br
          `)
        },
        {
          label: 'Northeast (Nordeste)',
          kind: 'state-legal-aid',
          urls: linesToUrls(`
https://www.defensoria.ba.def.br
https://www.defensoria.ce.def.br
https://www.defensoria.ma.def.br
https://www.defensoria.pb.def.br
https://www.defensoria.pe.def.br
https://www.defensoria.pi.def.br
https://www.defensoria.rn.def.br
https://www.defensoria.se.def.br
https://www.defensoria.al.def.br
          `)
        },
        {
          label: 'Southeast (Sudeste)',
          kind: 'state-legal-aid',
          urls: linesToUrls(`
https://www.defensoria.sp.def.br
https://www.defensoria.rj.def.br
https://www.defensoria.mg.def.br
https://www.defensoria.es.def.br
          `)
        },
        {
          label: 'South (Sul)',
          kind: 'state-legal-aid',
          urls: linesToUrls(`
https://www.defensoria.rs.def.br
https://www.defensoria.sc.def.br
https://www.defensoria.pr.def.br
          `)
        },
        {
          label: 'Central-West (Centro-Oeste)',
          kind: 'state-legal-aid',
          urls: linesToUrls(`
https://www.defensoria.df.def.br
https://www.defensoria.go.def.br
https://www.defensoria.mt.def.br
https://www.defensoria.ms.def.br
          `)
        }
      ]
    }
  ];

  const TITLE_OVERRIDES = {
    'https://www.gov.br/agu': "Attorney-General's Office (AGU)",
    'https://www.bcb.gov.br': 'Central Bank of Brazil (BCB)',
    'https://www.gov.br/casacivil/pt-br': 'Civil House of the Presidency',
    'https://www.gov.br/cgu/pt-br': 'Office of the Comptroller General (CGU)',
    'https://www.gov.br/gsi/pt-br': 'Institutional Security Office (GSI)',
    'https://www.gov.br/agricultura/pt-br': 'Ministry of Agriculture and Livestock',
    'https://www.gov.br/cidades/pt-br': 'Ministry of Cities',
    'https://www.gov.br/mcti/pt-br': 'Ministry of Science, Technology and Innovation',
    'https://www.gov.br/mcom/pt-br': 'Ministry of Communications',
    'https://www.gov.br/cultura/pt-br': 'Ministry of Culture',
    'https://www.gov.br/defesa/pt-br': 'Ministry of Defense',
    'https://www.gov.br/mda/pt-br': 'Ministry of Agrarian Development and Family Farming',
    'https://www.gov.br/memp/pt-br': 'Ministry of Entrepreneurship, Microenterprise and Small Business',
    'https://www.gov.br/esporte/pt-br': 'Ministry of Sports',
    'https://www.gov.br/mpa/pt-br': 'Ministry of Fisheries and Aquaculture',
    'https://www.gov.br/mds/pt-br': 'Ministry of Development and Social Assistance',
    'https://www.gov.br/mdic/pt-br': 'Ministry of Development, Industry, Trade and Services',
    'https://www.gov.br/mdh/pt-br': 'Ministry of Human Rights and Citizenship',
    'https://www.gov.br/mec/pt-br': 'Ministry of Education',
    'https://www.gov.br/fazenda/pt-br': 'Ministry of Finance',
    'https://www.gov.br/gestao/pt-br': 'Ministry of Management and Innovation',
    'https://www.gov.br/igualdaderacial/pt-br': 'Ministry of Racial Equality',
    'https://www.gov.br/mdr/pt-br': 'Ministry of Regional Development',
    'https://www.gov.br/mj/pt-br': 'Ministry of Justice and Public Security',
    'https://www.gov.br/mma/pt-br': 'Ministry of Environment and Climate Change',
    'https://www.gov.br/mme/pt-br': 'Ministry of Mines and Energy',
    'https://www.gov.br/mulheres/pt-br': 'Ministry of Women',
    'https://www.gov.br/planejamento/pt-br': 'Ministry of Planning and Budget',
    'https://www.gov.br/previdencia/pt-br': 'Ministry of Social Security',
    'https://www.gov.br/portos-e-aeroportos/pt-br': 'Ministry of Ports and Airports',
    'https://www.gov.br/povosindigenas/pt-br': 'Ministry of Indigenous Peoples',
    'https://www.gov.br/mre/pt-br': 'Ministry of Foreign Affairs',
    'https://www.gov.br/mre': 'Ministry of Foreign Affairs',
    'https://www.gov.br/saude/pt-br': 'Ministry of Health',
    'https://www.gov.br/trabalho-e-emprego/pt-br': 'Ministry of Labour and Employment',
    'https://www.gov.br/trabalho': 'Ministry of Labour and Employment',
    'https://www.gov.br/transportes/pt-br': 'Ministry of Transport',
    'https://www.gov.br/turismo/pt-br': 'Ministry of Tourism',
    'https://www.gov.br/planalto/pt-br': 'Presidency of the Republic / Planalto',
    'https://www.gov.br/secom/pt-br': 'Secretariat of Social Communication (Secom)',
    'https://www.gov.br/sri/pt-br': 'Secretariat of Institutional Relations (SRI)',
    'https://www.gov.br/secretariageral/pt-br': 'General Secretariat of the Presidency',
    'https://www.gov.br/pf/pt-br': 'Federal Police',
    'https://www.gov.br/pf/pt-br/assuntos/imigracao': 'Federal Police Immigration Services',
    'https://www.gov.br/receitafederal/pt-br': 'Federal Revenue Service (Receita Federal)',
    'https://www.cnj.jus.br': 'National Council of Justice (CNJ)',
    'https://www.in.gov.br': 'Official Gazette of the Union',
    'https://www.gov.br/pt-br': 'Gov.br Federal Services Portal',
    'https://www.stj.jus.br': 'Superior Court of Justice (STJ)',
    'https://portal.stf.jus.br': 'Supreme Federal Court (STF)',
    'https://www.un.org': 'United Nations',
    'https://brasil.un.org/pt-br': 'United Nations in Brazil',
    'https://www.unhcr.org': 'UNHCR',
    'https://www.unhcr.org/where-we-work/countries/brazil': 'UNHCR in Brazil',
    'https://www.acnur.org/br': 'ACNUR Brazil',
    'https://www.iom.int': 'International Organization for Migration (IOM)',
    'https://brazil.iom.int': 'IOM Brazil',
    'https://lac.iom.int': 'IOM Latin America and the Caribbean',
    'https://www.globalcompactrefugees.org': 'Global Compact on Refugees',
    'https://www.globalcompactmigration.org': 'Global Compact for Safe, Orderly and Regular Migration',
    'https://www.ohchr.org': 'UN Human Rights Office (OHCHR)',
    'https://www.ohchr.org/en/treaty-bodies': 'OHCHR Treaty Bodies',
    'https://www.ohchr.org/en/treaty-bodies/ccpr': 'Human Rights Committee (CCPR)',
    'https://www.ohchr.org/en/treaty-bodies/cescr': 'Committee on Economic, Social and Cultural Rights (CESCR)',
    'https://www.ohchr.org/en/treaty-bodies/cedaw': 'Committee on the Elimination of Discrimination against Women (CEDAW)',
    'https://www.ohchr.org/en/treaty-bodies/cat': 'Committee Against Torture (CAT)',
    'https://www.ohchr.org/en/treaty-bodies/crc': 'Committee on the Rights of the Child (CRC)',
    'https://www.ohchr.org/en/treaty-bodies/crpd': 'Committee on the Rights of Persons with Disabilities (CRPD)',
    'https://www.ohchr.org/en/treaty-bodies/cerd': 'Committee on the Elimination of Racial Discrimination (CERD)',
    'https://www.ohchr.org/en/special-procedures': 'OHCHR Special Procedures',
    'https://www.ohchr.org/en/special-procedures/sr-migrants': 'Special Rapporteur on the Human Rights of Migrants',
    'https://www.undp.org': 'United Nations Development Programme (UNDP)',
    'https://www.undp.org/brazil': 'UNDP Brazil',
    'https://www.unep.org': 'United Nations Environment Programme (UNEP)',
    'https://www.unhabitat.org': 'UN-Habitat',
    'https://data.un.org': 'UN Data',
    'https://www.unwomen.org': 'UN Women',
    'https://www.onumulheres.org.br': 'UN Women Brazil',
    'https://www.unicef.org': 'UNICEF',
    'https://www.unicef.org/brazil': 'UNICEF Brazil',
    'https://www.unfpa.org': 'UNFPA',
    'https://www.who.int': 'World Health Organization (WHO)',
    'https://www.icj-cij.org': 'International Court of Justice (ICJ)',
    'https://www.icc-cpi.int': 'International Criminal Court (ICC)',
    'https://www.hcch.net': 'Hague Conference on Private International Law (HCCH)',
    'https://www.unidroit.org': 'UNIDROIT',
    'https://uncitral.un.org': 'UNCITRAL',
    'https://icsid.worldbank.org': 'ICSID',
    'https://www.oas.org': 'Organization of American States (OAS)',
    'https://www.oas.org/en/iachr': 'Inter-American Commission on Human Rights (IACHR)',
    'https://www.corteidh.or.cr': 'Inter-American Court of Human Rights',
    'https://www.mercosur.int': 'MERCOSUR',
    'https://www.parlamentomercosur.org': 'MERCOSUR Parliament (Parlasur)',
    'https://www.aladi.org': 'Latin American Integration Association (ALADI)',
    'https://www.cepal.org/en': 'ECLAC / CEPAL',
    'https://www.caf.com': 'Development Bank of Latin America and the Caribbean (CAF)',
    'https://www.coe.int': 'Council of Europe',
    'https://www.echr.coe.int': 'European Court of Human Rights (ECtHR)',
    'https://home-affairs.ec.europa.eu': 'European Commission Home Affairs',
    'https://www.euaa.europa.eu': 'European Union Agency for Asylum (EUAA)',
    'https://frontex.europa.eu': 'Frontex',
    'https://www.worldbank.org': 'World Bank',
    'https://www.imf.org': 'International Monetary Fund (IMF)',
    'https://www.wto.org': 'World Trade Organization (WTO)',
    'https://www.oecd.org': 'OECD',
    'https://www.oecd.org/migration': 'OECD Migration',
    'https://www.migrationdataportal.org': 'Migration Data Portal',
    'https://www.knomad.org': 'KNOMAD',
    'https://publications.iom.int': 'IOM Publications',
    'https://www.internal-displacement.org': 'Internal Displacement Monitoring Centre (IDMC)',
    'https://www.unodc.org': 'UN Office on Drugs and Crime (UNODC)',
    'https://www.ungift.org': 'UN.GIFT',
    'https://www.icmpd.org': 'International Centre for Migration Policy Development (ICMPD)',
    'https://www.ibanet.org': 'International Bar Association (IBA)',
    'https://www.asil.org': 'American Society of International Law (ASIL)',
    'https://www.ccbe.eu': 'Council of Bars and Law Societies of Europe (CCBE)',
    'https://www.institutesi.org': 'Institute on Statelessness and Inclusion (ISI)',
    'https://www.statelessness.eu': 'European Network on Statelessness (ENS)',
    'https://www.ecre.org': 'European Council on Refugees and Exiles (ECRE)',
    'https://www.unescwa.org': 'UN ESCWA',
    'https://www.unocha.org': 'UN OCHA',
    'https://www.globaldetentionproject.org': 'Global Detention Project',
    'https://www.refugeelawinitiative.org': 'Refugee Law Initiative',
    'https://www.gov.br/mj/pt-br/assuntos/seus-direitos/migracoes': 'Migration Rights Guidance (MJSP)',
    'https://www.prefeitura.sp.gov.br/cidade/secretarias/direitos_humanos': 'Sao Paulo Municipal Secretariat of Human Rights and Citizenship',
    'https://prefeitura.rio/cidadania': 'Rio de Janeiro Municipal Citizenship Secretariat',
    'https://prefeitura.pbh.gov.br/cidadania': 'Belo Horizonte Citizenship Secretariat',
    'https://www.curitiba.pr.gov.br/secretarias/direitos-humanos': 'Curitiba Human Rights Secretariat',
    'https://prefeitura.poa.br/smds': 'Porto Alegre Municipal Social Development Secretariat',
    'https://www.sejus.df.gov.br': 'Federal District Secretariat of Justice and Citizenship',
    'https://www.salvador.ba.gov.br/secretarias': 'Salvador Municipal Secretariats',
    'https://www.fortaleza.ce.gov.br': 'Fortaleza City Hall',
    'https://www.recife.pe.gov.br': 'Recife City Hall'
  };

  const STATE_NAMES = {
    ac: 'Acre',
    al: 'Alagoas',
    am: 'Amazonas',
    ap: 'Amapa',
    ba: 'Bahia',
    ce: 'Ceara',
    df: 'Federal District',
    es: 'Espirito Santo',
    go: 'Goias',
    ma: 'Maranhao',
    mg: 'Minas Gerais',
    ms: 'Mato Grosso do Sul',
    mt: 'Mato Grosso',
    pa: 'Para',
    pb: 'Paraiba',
    pe: 'Pernambuco',
    pi: 'Piaui',
    pr: 'Parana',
    rj: 'Rio de Janeiro',
    rn: 'Rio Grande do Norte',
    ro: 'Rondonia',
    rr: 'Roraima',
    rs: 'Rio Grande do Sul',
    sc: 'Santa Catarina',
    se: 'Sergipe',
    sp: 'Sao Paulo',
    to: 'Tocantins'
  };

  const PLACE_OVERRIDES = {
    'abu-dhabi': 'Abu Dhabi',
    amsterdam: 'Amsterdam',
    ankara: 'Ankara',
    atenas: 'Athens',
    atlanta: 'Atlanta',
    bangkok: 'Bangkok',
    barcelona: 'Barcelona',
    beijing: 'Beijing',
    berlim: 'Berlin',
    bogota: 'Bogota',
    boston: 'Boston',
    bruxelas: 'Brussels',
    bucareste: 'Bucharest',
    budapeste: 'Budapest',
    'buenos-aires': 'Buenos Aires',
    cairo: 'Cairo',
    canberra: 'Canberra',
    caracas: 'Caracas',
    copenhague: 'Copenhagen',
    chicago: 'Chicago',
    dublin: 'Dublin',
    dubai: 'Dubai',
    edimburgo: 'Edinburgh',
    estocolmo: 'Stockholm',
    helsinque: 'Helsinki',
    hartford: 'Hartford',
    havana: 'Havana',
    hongkong: 'Hong Kong',
    houston: 'Houston',
    istambul: 'Istanbul',
    jakarta: 'Jakarta',
    lima: 'Lima',
    lisboa: 'Lisbon',
    londres: 'London',
    'los-angeles': 'Los Angeles',
    luanda: 'Luanda',
    madrid: 'Madrid',
    manchester: 'Manchester',
    manila: 'Manila',
    maputo: 'Maputo',
    mexico: 'Mexico City',
    miami: 'Miami',
    milao: 'Milan',
    montreal: 'Montreal',
    moscou: 'Moscow',
    nairobi: 'Nairobi',
    'nova-delhi': 'New Delhi',
    'nova-york': 'New York',
    orlando: 'Orlando',
    oslo: 'Oslo',
    ottawa: 'Ottawa',
    panama: 'Panama City',
    paris: 'Paris',
    porto: 'Porto',
    praga: 'Prague',
    pretoria: 'Pretoria',
    roma: 'Rome',
    'san-francisco': 'San Francisco',
    santiago: 'Santiago',
    seul: 'Seoul',
    shanghai: 'Shanghai',
    sofia: 'Sofia',
    sydney: 'Sydney',
    teera: 'Tehran',
    'tel-aviv': 'Tel Aviv',
    tokyo: 'Tokyo',
    toronto: 'Toronto',
    valencia: 'Valencia',
    vancouver: 'Vancouver',
    varsovia: 'Warsaw',
    viena: 'Vienna',
    washington: 'Washington, DC',
    wellington: 'Wellington',
    zurique: 'Zurich',
    ucrania: 'Ukraine'
  };

  const catalog = buildCatalog();

  injectStyles();
  renderAllSections();

  function linesToUrls(input) {
    return input
      .trim()
      .split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean);
  }

  function normalizeUrl(value) {
    return String(value || '').replace(/\/+$/, '');
  }

  function buildCatalog() {
    const map = new Map();

    RESOURCE_GROUPS.forEach(group => {
      group.clusters.forEach(cluster => {
        cluster.urls.forEach((rawUrl, index) => {
          const url = normalizeUrl(rawUrl);
          if (!url) return;

          if (map.has(url)) {
            const existing = map.get(url);
            existing.hubIds.add(group.hubId);
            existing.clusterLabels.add(cluster.label);
            return;
          }

          const title = resolveTitle(url, group, cluster);
          map.set(url, {
            id: slugify(`${group.hubId}-${index}-${url}`),
            url,
            title,
            description: resolveDescription(url, title, group, cluster),
            hubId: group.hubId,
            hubLabel: group.hubLabel,
            hubSummary: group.hubSummary,
            hubIcon: group.icon,
            clusterLabel: cluster.label,
            clusterKind: cluster.kind,
            logo: resolveLogoUrl(url),
            initials: initialsFromTitle(title),
            host: safeHostname(url),
            hubIds: new Set([group.hubId]),
            clusterLabels: new Set([cluster.label])
          });
        });
      });
    });

    return Array.from(map.values()).sort((left, right) => left.title.localeCompare(right.title));
  }

  function resolveTitle(url, group, cluster) {
    const normalized = normalizeUrl(url);
    if (TITLE_OVERRIDES[normalized]) return TITLE_OVERRIDES[normalized];

    if (cluster.kind === 'brazil-diplomatic') {
      return buildMissionTitle(normalized);
    }

    if (cluster.kind === 'state-legal-aid') {
      return buildDefensoriaTitle(normalized);
    }

    if (cluster.kind === 'municipal-rights') {
      return TITLE_OVERRIDES[normalized] || `Municipal public resource - ${humanizeHostname(normalized)}`;
    }

    return humanizeTail(normalized, group.hubLabel);
  }

  function resolveDescription(url, title, group, cluster) {
    switch (cluster.kind) {
      case 'brazil-federal':
        return `Official Brazilian public portal for ${title}, with institutional information, public services, notices, and government guidance.`;
      case 'un-core':
      case 'un-migration':
      case 'un-rights':
      case 'un-development':
      case 'un-social':
        return `Official United Nations resource covering ${cluster.label.toLowerCase()}, with mandates, country materials, publications, and reference information.`;
      case 'intl-courts':
      case 'intl-harmonization':
      case 'intl-arbitration':
        return `Official international law institution with case materials, instruments, mandates, and cross-border legal reference content.`;
      case 'americas-rights':
      case 'americas-mobility':
      case 'americas-development':
        return `Official regional institution for the Americas covering ${cluster.label.toLowerCase()}, policy materials, and institutional resources.`;
      case 'europe-system':
        return 'Official European institution or agency covering migration, asylum, borders, courts, or regional governance.';
      case 'global-governance':
        return 'Official global economic or migration-governance portal with policy papers, statistics, and institutional reference materials.';
      case 'migration-data':
        return 'Research and data portal focused on migration, mobility, remittances, or displacement trends and publications.';
      case 'protection':
        return 'Protection-focused organization or programme covering trafficking, smuggling, migration safety, and related guidance materials.';
      case 'legal-orgs':
        return 'Professional legal organization with standards, publications, events, advocacy resources, and sector reference material.';
      case 'specialized-statelessness':
      case 'specialized-asylum':
      case 'specialized-other':
        return 'Specialized reference body with focused materials on statelessness, refugee law, detention, protection, or regional humanitarian issues.';
      case 'brazil-diplomatic':
        return 'Official Brazilian diplomatic mission page with consular services, jurisdiction details, contact information, public notices, and service guidance.';
      case 'municipal-rights':
        return 'Official municipal portal for citizenship, human rights, local assistance, or public service information.';
      case 'state-legal-aid':
        return 'Official state public defender portal with legal aid access, rights guidance, service information, and institutional contact channels.';
      default:
        return `${group.hubLabel} resource with official institutional information and supporting reference materials.`;
    }
  }

  function buildMissionTitle(url) {
    const tail = normalizeUrl(url).split('/').pop() || '';
    const [type, ...rest] = tail.split('-');
    const placeSlug = normalizedLookupKey(decodeSegment(rest.join('-')));
    const place = PLACE_OVERRIDES[placeSlug] || titleCase(placeSlug.replace(/-/g, ' '));
    if (type === 'consulado') return `Brazilian Consulate in ${place}`;
    if (type === 'embaixada') return `Brazilian Embassy in ${place}`;
    return `Brazilian Mission in ${place}`;
  }

  function buildDefensoriaTitle(url) {
    const hostname = safeHostname(url);
    const match = hostname.match(/defensoria\.([a-z]{2})\.def\.br$/i);
    if (!match) return 'State Public Defender Portal';
    const stateCode = match[1].toLowerCase();
    const stateName = STATE_NAMES[stateCode] || stateCode.toUpperCase();
    return `Public Defender's Office of ${stateName}`;
  }

  function humanizeTail(url, fallback) {
    const pathname = safePathname(url);
    const tail = pathname.split('/').filter(Boolean).pop();
    if (!tail) return fallback;
    return titleCase(tail.replace(/-/g, ' '));
  }

  function humanizeHostname(url) {
    const hostname = safeHostname(url);
    return titleCase(hostname.replace(/^www\./, '').split('.')[0].replace(/-/g, ' '));
  }

  function resolveLogoUrl(url) {
    const hostname = safeHostname(url);
    if (!hostname) return '';

    if (hostname.endsWith('gov.br')) return 'https://www.gov.br/favicon.ico';
    if (hostname === 'portal.stf.jus.br') return 'https://portal.stf.jus.br/favicon.ico';
    return `https://${hostname}/favicon.ico`;
  }

  function renderAllSections() {
    injectAutomaticSections();

    const nodes = Array.from(document.querySelectorAll('[data-external-resources]'));
    if (!nodes.length) return;

    updateStatCounts();

    nodes.forEach(node => {
      const variant = node.getAttribute('data-external-resources');
      if (variant === 'master') {
        renderMasterDirectory(node);
        return;
      }
      renderCompactDirectory(node);
    });
  }

  function injectAutomaticSections() {
    const sections = Array.from(document.querySelectorAll('[data-official-resources]'));
    if (!sections.length) return;

    const config = resolveAutomaticSectionConfig(window.location.pathname || '/');

    sections.forEach(section => {
      if (section.querySelector('[data-external-resources]')) return;

      const panel =
        section.querySelector('.enhancement-shell, .surface-spotlight, .resources-panel') ||
        section.querySelector('.container-xxl') ||
        section.querySelector('.container') ||
        section;

      panel.innerHTML = `
        <h2 class="h4 text-gold mb-3">Useful resources</h2>
        <p class="small mb-4">${escapeHtml(config.copy)}</p>
        <div data-external-resources="compact" data-resource-limit="6" data-resource-kicker="${escapeHtml(config.kicker)}" data-resource-preset="${escapeHtml(config.preset)}" data-resource-title="${escapeHtml(config.title)}"></div>
      `;
    });
  }

  function resolveAutomaticSectionConfig(pathname) {
    const path = String(pathname || '/').toLowerCase();

    if (/(human-rights|asylum|refugee|trafficking|indigenous|discrimination|workers|children|gender|lgbt|disability)/.test(path)) {
      return {
        preset: 'human-rights-core',
        kicker: 'Useful Links',
        title: 'Useful human-rights and protection sources',
        copy: 'Official Brazilian and international bodies related to protection, migration, discrimination, refugee issues, and public-interest rights guidance.'
      };
    }

    if (/family/.test(path)) {
      return {
        preset: 'family-core',
        kicker: 'Useful Links',
        title: 'Useful family-law and protection sources',
        copy: 'Official institutions and public-interest bodies that can be relevant in family-law, protection, child-rights, and cross-border status questions.'
      };
    }

    if (/(civil|cpf|cnpj|contracts|property|damages|debt|notar|apostille|name-change|power-of-attorney|leasing|licenses|professional-registration|indemnification)/.test(path)) {
      return {
        preset: 'civil-core',
        kicker: 'Useful Links',
        title: 'Useful civil-law and document sources',
        copy: 'Official Brazilian institutions commonly referenced in civil matters, public records, governance, tax registration, and procedural research.'
      };
    }

    if (/(immigration-abroad|consular|abroad)/.test(path)) {
      return {
        preset: 'international-core',
        kicker: 'Useful Links',
        title: 'Useful consular and international sources',
        copy: 'Official Brazilian, regional, and international sources related to mobility, consular matters, migration abroad, and comparative research.'
      };
    }

    if (/(natural|citizen)/.test(path)) {
      return {
        preset: 'citizenship-core',
        kicker: 'Useful Links',
        title: 'Useful citizenship and nationality sources',
        copy: 'Official Brazilian institutions and public sources that often matter in nationality, naturalisation, registration, and status research.'
      };
    }

    if (/(visa|resid|immigration|search|contact|about|book-consultation|services|practice-areas|legal-knowledge-center|faq|glossary|fyi)/.test(path)) {
      return {
        preset: 'immigration-core',
        kicker: 'Useful Links',
        title: 'Useful immigration and official sources',
        copy: 'Official Brazilian and international sources often consulted for immigration, residency, citizenship, migration rights, and document-planning research.'
      };
    }

    return {
      preset: 'general-core',
      kicker: 'Useful Links',
      title: 'Useful official sources',
      copy: 'Official Brazilian and international public sources for legal, institutional, and policy reference.'
    };
  }

  function updateStatCounts() {
    document.querySelectorAll('[data-external-resource-total]').forEach(node => {
      node.textContent = String(catalog.length);
    });
  }

  function renderMasterDirectory(container) {
    const hubOrder = RESOURCE_GROUPS.map(group => group.hubId);
    const tabMarkup = hubOrder
      .map(hubId => {
        const group = RESOURCE_GROUPS.find(item => item.hubId === hubId);
        const count = catalog.filter(item => item.hubId === hubId).length;
        return `
          <button
            class="external-resources-tab"
            type="button"
            role="tab"
            aria-selected="false"
            data-resource-tab="${escapeHtml(hubId)}"
          >
            <span class="external-resources-tab-label">${escapeHtml(shortHubLabel(group))}</span>
            <span class="external-resources-tab-count">${count}</span>
          </button>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="external-resources-shell" data-variant="master">
        <div class="external-resources-toolbar">
          <label class="external-resources-search-wrap">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input class="external-resources-search" type="search" placeholder="Search institutions, courts, embassies, agencies, and data portals..." aria-label="Search external resources">
          </label>
          <div class="external-resources-tablist" role="tablist" aria-label="Resource hub categories">
            ${tabMarkup}
          </div>
        </div>
        <div class="external-resources-meta-bar">
          <p class="external-resources-meta-copy">Pick the source family you need, then search within that tab. Every card opens the official public source. Logos use the institution's own site icon when available, with a branded fallback if the source does not expose one cleanly.</p>
          <p class="external-resources-result-count" data-resource-result-count></p>
        </div>
        <div class="external-resources-panel-wrap" data-resource-panel></div>
      </div>
    `;

    const state = {
      hub: hubOrder[0],
      query: ''
    };

    const search = container.querySelector('.external-resources-search');
    const tabs = Array.from(container.querySelectorAll('[data-resource-tab]'));
    const panelNode = container.querySelector('[data-resource-panel]');
    const countNode = container.querySelector('[data-resource-result-count]');

    const render = () => {
      const group = RESOURCE_GROUPS.find(item => item.hubId === state.hub);
      const query = state.query.toLowerCase().trim();
      const filtered = catalog.filter(item => {
        if (item.hubId !== state.hub) return false;
        if (!query) return true;

        const haystack = [item.title, item.description, item.hubLabel, item.clusterLabel, item.url].join(' ').toLowerCase();
        return haystack.includes(query);
      });

      tabs.forEach(tab => {
        const isActive = tab.getAttribute('data-resource-tab') === state.hub;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      countNode.textContent = group ? `${group.hubLabel} · ${filtered.length} links` : `${filtered.length} links`;

      if (!group) {
        panelNode.innerHTML = '<div class="external-resources-empty">This resource category is unavailable right now.</div>';
        return;
      }

      panelNode.innerHTML = renderHubPanel(group, filtered, query);
      wireLogoFallbacks(container);
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.hub = tab.getAttribute('data-resource-tab') || hubOrder[0];
        render();
      });
    });

    search.addEventListener('input', event => {
      state.query = event.target.value || '';
      render();
    });

    render();
  }

  function renderCompactDirectory(container) {
    const presetKey = container.getAttribute('data-resource-preset') || '';
    const limit = Number(container.getAttribute('data-resource-limit') || '8');
    const title = container.getAttribute('data-resource-title') || 'Useful reference links';
    const kicker = container.getAttribute('data-resource-kicker') || 'Useful Links';
    const copy =
      container.getAttribute('data-resource-copy') ||
      'Quick access to the official portals most relevant to the topic on this page.';
    const resources = selectPresetResources(presetKey).slice(0, limit);

    if (!resources.length) {
      container.innerHTML = `
        <div class="external-resources-shell" data-variant="compact">
          <div class="external-resources-empty">This resource collection is temporarily unavailable.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="external-resources-shell" data-variant="compact">
        <div class="external-resources-intro">
          <p class="external-resources-kicker">${escapeHtml(kicker)}</p>
          <h2 class="external-resources-title">${escapeHtml(title)}</h2>
          <p class="external-resources-copy">${escapeHtml(copy)}</p>
        </div>
        <div class="external-resource-grid is-compact">
          ${resources.map(item => renderCard(item)).join('')}
        </div>
        <div class="external-resources-footer">
          <a class="external-resources-view-all" href="/resources#official-resources">Open the full resources directory</a>
        </div>
      </div>
    `;

    wireLogoFallbacks(container);
  }

  function renderHubPanel(group, resources, query) {
    if (!resources.length) {
      return `
        <section class="external-resource-group external-resource-group--active" data-hub-group="${escapeHtml(group.hubId)}">
          <div class="external-resource-group-head">
            <div>
              <p class="external-resource-group-kicker"><i class="fa-solid ${escapeHtml(group.icon)}" aria-hidden="true"></i>${escapeHtml(group.hubLabel)}</p>
              <h3>${escapeHtml(group.hubLabel)}</h3>
              <p>${escapeHtml(group.hubSummary)}</p>
            </div>
            <span class="external-resource-group-count">0 links</span>
          </div>
          <div class="external-resources-empty">No links matched "${escapeHtml(query)}" inside this tab. Try a broader keyword or switch to another source category.</div>
        </section>
      `;
    }

    const clusterMarkup = group.clusters
      .map(cluster => {
        const items = resources.filter(item => item.clusterLabel === cluster.label);
        if (!items.length) return '';

        return `
          <section class="external-resource-cluster">
            <div class="external-resource-cluster-head">
              <h4>${escapeHtml(cluster.label)}</h4>
              <span>${items.length} links</span>
            </div>
            <div class="external-resource-grid">
              ${items.map(item => renderCard(item)).join('')}
            </div>
          </section>
        `;
      })
      .join('');

    return `
      <section class="external-resource-group external-resource-group--active" data-hub-group="${escapeHtml(group.hubId)}">
        <div class="external-resource-group-head">
          <div>
            <p class="external-resource-group-kicker"><i class="fa-solid ${escapeHtml(group.icon)}" aria-hidden="true"></i>${escapeHtml(group.hubLabel)}</p>
            <h3>${escapeHtml(group.hubLabel)}</h3>
            <p>${escapeHtml(group.hubSummary)}</p>
          </div>
          <span class="external-resource-group-count">${resources.length} links</span>
        </div>
        <div class="external-resource-clusters">
          ${clusterMarkup}
        </div>
      </section>
    `;
  }

  function renderCard(item) {
    return `
      <article class="external-resource-card">
        <div class="external-resource-card-top">
          <div class="external-resource-logo-wrap">
            <span class="external-resource-logo-fallback" aria-hidden="true">${escapeHtml(item.initials)}</span>
            <img class="external-resource-logo" src="${escapeHtml(item.logo)}" alt="${escapeHtml(item.title)} logo" loading="lazy">
          </div>
          <div class="external-resource-kickers">
            <span class="external-resource-pill">${escapeHtml(item.clusterLabel)}</span>
            <span class="external-resource-host">${escapeHtml(item.host.replace(/^www\./, ''))}</span>
          </div>
        </div>
        <h4 class="external-resource-name">${escapeHtml(item.title)}</h4>
        <p class="external-resource-summary">${escapeHtml(item.description)}</p>
        <div class="external-resource-actions">
          <a class="external-resource-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Open official site</a>
        </div>
      </article>
    `;
  }

  function selectPresetResources(presetKey) {
    const urls = SECTION_PRESETS[presetKey] || [];
    return urls
      .map(url => catalog.find(item => normalizeUrl(item.url) === normalizeUrl(url)))
      .filter(Boolean);
  }

  function groupByHub(resources) {
    return resources.reduce((accumulator, item) => {
      if (!accumulator[item.hubId]) accumulator[item.hubId] = [];
      accumulator[item.hubId].push(item);
      return accumulator;
    }, {});
  }

  function shortHubLabel(group) {
    const labels = {
      'brazil-federal': 'Federal',
      'un-system': 'UN',
      'international-law': 'International Law',
      americas: 'Americas',
      europe: 'Europe',
      'global-governance': 'Governance',
      'migration-data': 'Data',
      protection: 'Protection',
      'legal-orgs': 'Legal Orgs',
      specialized: 'Specialized',
      'brazil-consular': 'Consulates',
      'municipal-rights': 'Municipal',
      'state-legal-aid': 'Legal Aid'
    };

    return labels[group.hubId] || group.hubLabel;
  }

  function wireLogoFallbacks(scope) {
    const logos = Array.from(scope.querySelectorAll('.external-resource-logo'));
    logos.forEach(image => {
      if (image.dataset.logoBound === 'true') return;
      image.dataset.logoBound = 'true';

      const fallback = image.parentElement?.querySelector('.external-resource-logo-fallback');
      const showFallback = () => {
        image.style.display = 'none';
        if (fallback) fallback.style.display = 'inline-flex';
      };

      image.addEventListener('error', showFallback);
      image.addEventListener('load', () => {
        image.style.display = 'block';
        if (fallback) fallback.style.display = 'none';
      });

      if (image.complete && image.naturalWidth === 0) showFallback();
    });
  }

  function initialsFromTitle(title) {
    const words = String(title || '')
      .replace(/[()]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter(word => !/^(of|and|the|in|on|for|to)$/i.test(word));
    return words
      .slice(0, 3)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function titleCase(value) {
    return String(value || '')
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function decodeSegment(value) {
    try {
      return decodeURIComponent(String(value || ''));
    } catch {
      return String(value || '');
    }
  }

  function normalizedLookupKey(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function safeHostname(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  function safePathname(url) {
    try {
      return new URL(url).pathname;
    } catch {
      return '';
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .external-resources-shell {
        border: 1px solid rgba(217, 179, 108, 0.18);
        border-radius: 1.6rem;
        background:
          radial-gradient(circle at top left, rgba(217, 179, 108, 0.08), transparent 24%),
          linear-gradient(180deg, rgba(26, 8, 13, 0.94), rgba(14, 5, 8, 0.94));
        box-shadow: 0 24px 60px rgba(10, 5, 7, 0.18);
        padding: clamp(1.25rem, 2vw, 2rem);
      }

      .external-resources-intro,
      .external-resource-group-head,
      .external-resources-meta-bar {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
      }

      .external-resources-kicker,
      .external-resource-group-kicker {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.55rem;
        color: #e8cb8b;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .external-resources-title {
        margin: 0 0 0.75rem;
        color: #f5d38d;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
      }

      .external-resources-copy,
      .external-resource-group-head p,
      .external-resources-meta-copy {
        margin: 0;
        color: rgba(255, 247, 234, 0.84);
        max-width: 62rem;
      }

      .external-resources-toolbar {
        display: grid;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .external-resources-search-wrap {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.95rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(217, 179, 108, 0.3);
        background: rgba(255, 248, 232, 0.05);
        color: #f4dcad;
      }

      .external-resources-search {
        width: 100%;
        border: 0;
        outline: 0;
        background: transparent;
        color: #fff7ea;
      }

      .external-resources-search::placeholder {
        color: rgba(255, 247, 234, 0.6);
      }

      .external-resources-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .external-resources-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.6rem 0.95rem;
        border-radius: 999px;
        border: 1px solid rgba(217, 179, 108, 0.24);
        background: rgba(255, 248, 232, 0.04);
        color: #fff3db;
        cursor: pointer;
        transition: transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
      }

      .external-resources-chip span {
        color: #e8cb8b;
      }

      .external-resources-chip:hover,
      .external-resources-chip.is-active {
        transform: translateY(-2px);
        border-color: rgba(242, 211, 154, 0.58);
        background: rgba(255, 248, 232, 0.08);
      }

      .external-resources-tablist {
        display: flex;
        gap: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.35rem;
        scrollbar-width: thin;
        scrollbar-color: rgba(217, 179, 108, 0.55) transparent;
      }

      .external-resources-tablist::-webkit-scrollbar {
        height: 8px;
      }

      .external-resources-tablist::-webkit-scrollbar-thumb {
        background: rgba(217, 179, 108, 0.4);
        border-radius: 999px;
      }

      .external-resources-tab {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        padding: 0.85rem 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(217, 179, 108, 0.22);
        background: rgba(255, 248, 232, 0.04);
        color: #fff3db;
        cursor: pointer;
        transition: transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
      }

      .external-resources-tab:hover,
      .external-resources-tab.is-active {
        transform: translateY(-2px);
        border-color: rgba(242, 211, 154, 0.58);
        background:
          linear-gradient(180deg, rgba(255, 249, 238, 0.1), rgba(255, 249, 238, 0.03)),
          rgba(54, 14, 23, 0.88);
      }

      .external-resources-tab-label {
        font-weight: 700;
        white-space: nowrap;
      }

      .external-resources-tab-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        padding: 0.2rem 0.5rem;
        border-radius: 999px;
        background: rgba(242, 211, 154, 0.12);
        color: #f4dcad;
        font-size: 0.78rem;
      }

      .external-resources-meta-bar {
        margin-bottom: 1.25rem;
      }

      .external-resources-result-count,
      .external-resource-group-count {
        margin: 0;
        white-space: nowrap;
        color: #f5d38d;
        font-weight: 700;
      }

      .external-resources-groups {
        display: grid;
        gap: 1.5rem;
      }

      .external-resources-panel-wrap {
        display: grid;
      }

      .external-resource-group {
        border: 1px solid rgba(217, 179, 108, 0.16);
        border-radius: 1.35rem;
        padding: 1.15rem;
        background: rgba(255, 248, 232, 0.03);
      }

      .external-resource-group--active {
        background:
          radial-gradient(circle at top right, rgba(217, 179, 108, 0.12), transparent 24%),
          rgba(255, 248, 232, 0.03);
      }

      .external-resource-group-head h3 {
        margin: 0 0 0.45rem;
        color: #fff7ea;
        font-size: 1.3rem;
      }

      .external-resource-clusters {
        display: grid;
        gap: 1.15rem;
        margin-top: 1rem;
      }

      .external-resource-cluster {
        padding-top: 0.35rem;
      }

      .external-resource-cluster + .external-resource-cluster {
        border-top: 1px solid rgba(217, 179, 108, 0.12);
        padding-top: 1.15rem;
      }

      .external-resource-cluster-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.9rem;
      }

      .external-resource-cluster-head h4 {
        margin: 0;
        color: #f5d38d;
        font-size: 1rem;
      }

      .external-resource-cluster-head span {
        color: rgba(255, 247, 234, 0.72);
        font-size: 0.9rem;
        white-space: nowrap;
      }

      .external-resource-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(255px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .external-resource-grid.is-compact {
        margin-top: 1.15rem;
      }

      .external-resource-card {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 1rem;
        border-radius: 1.2rem;
        border: 1px solid rgba(217, 179, 108, 0.16);
        background:
          linear-gradient(180deg, rgba(255, 249, 238, 0.06), rgba(255, 249, 238, 0.02)),
          rgba(34, 8, 14, 0.74);
        transition: transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
        min-height: 100%;
      }

      .external-resource-card:hover {
        transform: translateY(-4px);
        border-color: rgba(242, 211, 154, 0.44);
        background:
          linear-gradient(180deg, rgba(255, 249, 238, 0.08), rgba(255, 249, 238, 0.03)),
          rgba(39, 11, 17, 0.82);
      }

      .external-resource-card-top {
        display: flex;
        gap: 0.9rem;
        align-items: flex-start;
      }

      .external-resource-logo-wrap {
        flex: 0 0 auto;
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
        background: rgba(255, 248, 232, 0.08);
        border: 1px solid rgba(217, 179, 108, 0.18);
        display: grid;
        place-items: center;
        overflow: hidden;
      }

      .external-resource-logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        background: #ffffff;
      }

      .external-resource-logo-fallback {
        display: none;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #f5d38d;
        background: linear-gradient(135deg, rgba(107, 29, 45, 0.92), rgba(34, 8, 14, 0.98));
      }

      .external-resource-kickers {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .external-resource-pill,
      .external-resource-host {
        display: inline-flex;
        width: fit-content;
        padding: 0.32rem 0.68rem;
        border-radius: 999px;
        background: rgba(242, 211, 154, 0.11);
        color: #f4dcad;
        font-size: 0.75rem;
      }

      .external-resource-host {
        color: rgba(255, 247, 234, 0.74);
        background: rgba(255, 248, 232, 0.05);
      }

      .external-resource-name {
        margin: 0;
        color: #fff7ea;
        font-size: 1.04rem;
        line-height: 1.35;
      }

      .external-resource-summary {
        margin: 0;
        color: rgba(255, 247, 234, 0.86);
        line-height: 1.55;
        font-size: 0.94rem;
      }

      .external-resource-actions {
        margin-top: auto;
      }

      .external-resource-link,
      .external-resources-view-all {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.72rem 0.95rem;
        border-radius: 999px;
        border: 1px solid rgba(217, 179, 108, 0.26);
        background: rgba(255, 248, 232, 0.04);
        color: #fff3db;
        font-weight: 600;
        text-decoration: none;
        transition: transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
      }

      .external-resource-link:hover,
      .external-resources-view-all:hover {
        transform: translateY(-2px);
        border-color: rgba(242, 211, 154, 0.58);
        background: rgba(255, 248, 232, 0.08);
        color: #fff7ea;
      }

      .external-resources-footer {
        margin-top: 1rem;
      }

      .external-resources-empty {
        padding: 1.4rem;
        border-radius: 1rem;
        border: 1px dashed rgba(217, 179, 108, 0.38);
        color: rgba(255, 247, 234, 0.86);
        text-align: center;
      }

      @media (max-width: 767.98px) {
        .external-resources-intro,
        .external-resource-group-head,
        .external-resources-meta-bar {
          flex-direction: column;
        }

        .external-resource-cluster-head {
          flex-direction: column;
          align-items: flex-start;
        }

        .external-resource-group-count,
        .external-resources-result-count {
          white-space: normal;
        }
      }
    `;

    document.head.appendChild(style);
  }
})();
