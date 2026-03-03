export type BrazilianState = {
  slug: string;
  code: string;
  en: string;
  fr: string;
  es: string;
  pt: string;
  capital: string;
  region: 'north' | 'northeast' | 'central-west' | 'southeast' | 'south';
};

export const brazilianStates: BrazilianState[] = [
  { slug: 'acre', code: 'AC', en: 'Acre', fr: 'Acre', es: 'Acre', pt: 'Acre', capital: 'Rio Branco', region: 'north' },
  { slug: 'alagoas', code: 'AL', en: 'Alagoas', fr: 'Alagoas', es: 'Alagoas', pt: 'Alagoas', capital: 'Maceio', region: 'northeast' },
  { slug: 'amapa', code: 'AP', en: 'Amapa', fr: 'Amapa', es: 'Amapa', pt: 'Amapa', capital: 'Macapa', region: 'north' },
  { slug: 'amazonas', code: 'AM', en: 'Amazonas', fr: 'Amazonas', es: 'Amazonas', pt: 'Amazonas', capital: 'Manaus', region: 'north' },
  { slug: 'bahia', code: 'BA', en: 'Bahia', fr: 'Bahia', es: 'Bahia', pt: 'Bahia', capital: 'Salvador', region: 'northeast' },
  { slug: 'ceara', code: 'CE', en: 'Ceara', fr: 'Ceara', es: 'Ceara', pt: 'Ceara', capital: 'Fortaleza', region: 'northeast' },
  { slug: 'distrito-federal', code: 'DF', en: 'Distrito Federal', fr: 'Distrito Federal', es: 'Distrito Federal', pt: 'Distrito Federal', capital: 'Brasilia', region: 'central-west' },
  { slug: 'espirito-santo', code: 'ES', en: 'Espirito Santo', fr: 'Espirito Santo', es: 'Espirito Santo', pt: 'Espirito Santo', capital: 'Vitoria', region: 'southeast' },
  { slug: 'goias', code: 'GO', en: 'Goias', fr: 'Goias', es: 'Goias', pt: 'Goias', capital: 'Goiania', region: 'central-west' },
  { slug: 'maranhao', code: 'MA', en: 'Maranhao', fr: 'Maranhao', es: 'Maranhao', pt: 'Maranhao', capital: 'Sao Luis', region: 'northeast' },
  { slug: 'mato-grosso', code: 'MT', en: 'Mato Grosso', fr: 'Mato Grosso', es: 'Mato Grosso', pt: 'Mato Grosso', capital: 'Cuiaba', region: 'central-west' },
  { slug: 'mato-grosso-do-sul', code: 'MS', en: 'Mato Grosso do Sul', fr: 'Mato Grosso do Sul', es: 'Mato Grosso do Sul', pt: 'Mato Grosso do Sul', capital: 'Campo Grande', region: 'central-west' },
  { slug: 'minas-gerais', code: 'MG', en: 'Minas Gerais', fr: 'Minas Gerais', es: 'Minas Gerais', pt: 'Minas Gerais', capital: 'Belo Horizonte', region: 'southeast' },
  { slug: 'para', code: 'PA', en: 'Para', fr: 'Para', es: 'Para', pt: 'Para', capital: 'Belem', region: 'north' },
  { slug: 'paraiba', code: 'PB', en: 'Paraiba', fr: 'Paraiba', es: 'Paraiba', pt: 'Paraiba', capital: 'Joao Pessoa', region: 'northeast' },
  { slug: 'parana', code: 'PR', en: 'Parana', fr: 'Parana', es: 'Parana', pt: 'Parana', capital: 'Curitiba', region: 'south' },
  { slug: 'pernambuco', code: 'PE', en: 'Pernambuco', fr: 'Pernambuco', es: 'Pernambuco', pt: 'Pernambuco', capital: 'Recife', region: 'northeast' },
  { slug: 'piaui', code: 'PI', en: 'Piaui', fr: 'Piaui', es: 'Piaui', pt: 'Piaui', capital: 'Teresina', region: 'northeast' },
  { slug: 'rio-de-janeiro', code: 'RJ', en: 'Rio de Janeiro', fr: 'Rio de Janeiro', es: 'Rio de Janeiro', pt: 'Rio de Janeiro', capital: 'Rio de Janeiro', region: 'southeast' },
  { slug: 'rio-grande-do-norte', code: 'RN', en: 'Rio Grande do Norte', fr: 'Rio Grande do Norte', es: 'Rio Grande do Norte', pt: 'Rio Grande do Norte', capital: 'Natal', region: 'northeast' },
  { slug: 'rio-grande-do-sul', code: 'RS', en: 'Rio Grande do Sul', fr: 'Rio Grande do Sul', es: 'Rio Grande do Sul', pt: 'Rio Grande do Sul', capital: 'Porto Alegre', region: 'south' },
  { slug: 'rondonia', code: 'RO', en: 'Rondonia', fr: 'Rondonia', es: 'Rondonia', pt: 'Rondonia', capital: 'Porto Velho', region: 'north' },
  { slug: 'roraima', code: 'RR', en: 'Roraima', fr: 'Roraima', es: 'Roraima', pt: 'Roraima', capital: 'Boa Vista', region: 'north' },
  { slug: 'santa-catarina', code: 'SC', en: 'Santa Catarina', fr: 'Santa Catarina', es: 'Santa Catarina', pt: 'Santa Catarina', capital: 'Florianopolis', region: 'south' },
  { slug: 'sao-paulo', code: 'SP', en: 'Sao Paulo', fr: 'Sao Paulo', es: 'Sao Paulo', pt: 'Sao Paulo', capital: 'Sao Paulo', region: 'southeast' },
  { slug: 'sergipe', code: 'SE', en: 'Sergipe', fr: 'Sergipe', es: 'Sergipe', pt: 'Sergipe', capital: 'Aracaju', region: 'northeast' },
  { slug: 'tocantins', code: 'TO', en: 'Tocantins', fr: 'Tocantins', es: 'Tocantins', pt: 'Tocantins', capital: 'Palmas', region: 'north' },
];

export const stateBySlug = new Map(brazilianStates.map((state) => [state.slug, state]));

export function getStateName(slug: string, locale: 'en' | 'es' | 'pt' | 'fr') {
  const state = stateBySlug.get(slug);
  if (!state) return null;
  return state[locale];
}
