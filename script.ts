/**
 * @fileoverview Motor interativo do simulador de orçamento da Kora | Sistemas Personalizados.
 * Gerencia pacotes prontos, seleção avulsa de serviços, desconto de combo (10%),
 * adicional de entrega prioritária (20%), prévia em tempo real para WhatsApp,
 * cópia para a área de transferência e reset completo.
 */

// ============================================================================
// 1. INTERFACES E TIPOS
// ============================================================================

interface ServicoSelecionado {
  nome: string;
  preco: number;
}

type TipoPrazo = 'padrao' | 'prioritario';

interface ResumoOrcamento {
  itens: ServicoSelecionado[];
  pacoteAtivo: string | null;
  subtotal: number;
  descontoCombo: number;
  adicionalPrioridade: number;
  totalFinal: number;
}

// ============================================================================
// 2. CONSTANTES DE CONFIGURAÇÃO
// ============================================================================

const NOME_EMPRESA = 'Kora | Sistemas Personalizados';
const TELEFONE_CONTATO = '5511999999999';
const MINIMO_ITENS_COMBO = 2;
const PERCENTUAL_DESCONTO_COMBO = 0.10;
const PERCENTUAL_PRIORIDADE = 0.20;

// ============================================================================
// 3. ELEMENTOS DO DOM
// ============================================================================

const botoesPacote = document.querySelectorAll<HTMLButtonElement>('.card-pacote');
const checkboxes = document.querySelectorAll<HTMLInputElement>('.servico-check');
const prazoSelect = document.getElementById('prazo-entrega') as HTMLSelectElement;
const btnLimpar = document.getElementById('btn-limpar') as HTMLButtonElement;

const avisoDescontoEl = document.getElementById('aviso-desconto') as HTMLElement;
const valorSubtotalEl = document.getElementById('valor-subtotal') as HTMLElement;
const valorDescontoEl = document.getElementById('valor-desconto') as HTMLElement;
const valorPrioridadeEl = document.getElementById('valor-prioridade') as HTMLElement;
const valorTotalEl = document.getElementById('valor-total') as HTMLElement;

const formAgendamento = document.getElementById('form-agendamento') as HTMLFormElement;
const nomeInput = document.getElementById('nome-cliente') as HTMLInputElement;
const turnoSelect = document.getElementById('turno-preferencia') as HTMLSelectElement;
const previaMensagemEl = document.getElementById('previa-mensagem') as HTMLElement;
const btnCopiar = document.getElementById('btn-copiar') as HTMLButtonElement;
const mensagemFeedbackEl = document.getElementById('mensagem-feedback') as HTMLElement;

let pacoteSelecionadoNome: string | null = null;
let precoFechadoPacote: number | null = null;

// ============================================================================
// 4. FUNÇÕES DE CÁLCULO E FORMATAÇÃO
// ============================================================================

/**
 * Formata valores numéricos para o padrão monetário brasileiro (BRL).
 */
function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Coleta os serviços marcados nos checkboxes.
 */
function obterServicosSelecionados(): ServicoSelecionado[] {
  const selecionados: ServicoSelecionado[] = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const nome = checkbox.dataset.nome ?? 'Serviço personalizado';
      const preco = Number(checkbox.dataset.preco ?? 0);
      selecionados.push({ nome, preco });
    }
  });

  return selecionados;
}

/**
 * Remove o destaque visual de todos os cartões de pacote e limpa o estado do pacote.
 */
function limparDestaquePacotes(): void {
  botoesPacote.forEach((botao) => botao.classList.remove('ativo'));
  pacoteSelecionadoNome = null;
  precoFechadoPacote = null;
}

/**
 * Seleciona um pacote pronto, marca os serviços incluídos e aplica o preço do pacote.
 * Clicar novamente no mesmo pacote ativo desmarca e limpa a seleção.
 */
function selecionarPacote(botao: HTMLButtonElement): void {
  const nomePacote = botao.dataset.pacote ?? 'Pacote selecionado';
  const jaEstavaAtivo = pacoteSelecionadoNome === nomePacote;

  limparDestaquePacotes();

  if (jaEstavaAtivo) {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    atualizarSimulador();
    return;
  }

  const nomesServicos = (botao.dataset.servicos ?? '').split('|').filter(Boolean);
  const precoPacote = Number(botao.dataset.precoPacote ?? 0);

  checkboxes.forEach((checkbox) => {
    const nomeItem = checkbox.dataset.nome ?? '';
    checkbox.checked = nomesServicos.includes(nomeItem);
  });

  botao.classList.add('ativo');
  pacoteSelecionadoNome = nomePacote;
  precoFechadoPacote = precoPacote > 0 ? precoPacote : null;

  atualizarSimulador();
}

/**
 * Calcula subtotal, desconto de combo (10%) e adicional de urgência (20%).
 */
function calcularResumoOrcamento(): ResumoOrcamento {
  const itens = obterServicosSelecionados();
  const somaAvulsa = itens.reduce((soma, item) => soma + item.preco, 0);

  const usandoPrecoPacote = pacoteSelecionadoNome !== null && precoFechadoPacote !== null;
const subtotal: number = usandoPrecoPacote ? (precoFechadoPacote ?? 0) : somaAvulsa;

  const elegivelCombo = !usandoPrecoPacote && itens.length >= MINIMO_ITENS_COMBO;
  const descontoCombo = elegivelCombo ? subtotal * PERCENTUAL_DESCONTO_COMBO : 0;

  const baseComDesconto = subtotal - descontoCombo;
  const tipoPrazo = prazoSelect.value as TipoPrazo;
  const adicionalPrioridade =
    tipoPrazo === 'prioritario' ? baseComDesconto * PERCENTUAL_PRIORIDADE : 0;

  const totalFinal = baseComDesconto + adicionalPrioridade;

  return {
    itens,
    pacoteAtivo: pacoteSelecionadoNome,
    subtotal,
    descontoCombo,
    adicionalPrioridade,
    totalFinal,
  };
}

/**
 * Monta o texto estruturado da mensagem para prévia e envio ao WhatsApp.
 */
function gerarTextoWhatsApp(resumo: ResumoOrcamento): string {
  const nomeCliente = nomeInput.value.trim() || '[Seu Nome / Negócio]';
  const turno = turnoSelect.value;
  const prazoTexto =
    prazoSelect.value === 'prioritario'
      ? 'Entrega Prioritária (até 48h úteis)'
      : 'Prazo Padrão (5 a 7 dias úteis)';

  const linhaPacote = resumo.pacoteAtivo
    ? `*Pacote escolhido:* ${resumo.pacoteAtivo}\n`
    : '';

  const listaItens = resumo.itens
    .map((item) => `• ${item.nome} (${formatarMoeda(item.preco)})`)
    .join('\n');

  const linhaDesconto =
    resumo.descontoCombo > 0
      ? `\n*Desconto combo (10%):* -${formatarMoeda(resumo.descontoCombo)}`
      : '';

  const linhaPrioridade =
    resumo.adicionalPrioridade > 0
      ? `\n*Taxa de prioridade:* +${formatarMoeda(resumo.adicionalPrioridade)}`
      : '';

  return (
    `Olá, *${NOME_EMPRESA}*! Me chamo *${nomeCliente}* e montei uma simulação no site:\n\n` +
    linhaPacote +
    `*Serviços incluídos/escolhidos:*\n${listaItens}\n\n` +
    `*Prazo:* ${prazoTexto}` +
    `${linhaDesconto}${linhaPrioridade}\n` +
    `*Total estimado:* ${formatarMoeda(resumo.totalFinal)}\n` +
    `*Melhor horário para contato:* ${turno}`
  );
}

// ============================================================================
// 5. ATUALIZAÇÃO DA INTERFACE E EVENTOS
// ============================================================================

/**
 * Exibe feedback visual acessível (erro ou sucesso) sem bloquear a tela.
 */
function exibirFeedback(mensagem: string, tipo: 'erro' | 'sucesso' = 'erro'): void {
  mensagemFeedbackEl.textContent = mensagem;
  mensagemFeedbackEl.classList.toggle('sucesso', tipo === 'sucesso');
}

/**
 * Atualiza valores financeiros e a prévia da mensagem em tempo real.
 */
function atualizarSimulador(): void {
  const resumo = calcularResumoOrcamento();
  exibirFeedback('');

  if (resumo.pacoteAtivo) {
    avisoDescontoEl.textContent =
      `${resumo.pacoteAtivo} selecionado com condição especial da Kora!`;
  } else if (resumo.descontoCombo > 0) {
    avisoDescontoEl.textContent =
      `Combo ativado! Você economizou ${formatarMoeda(resumo.descontoCombo)} (10% OFF).`;
  } else {
    avisoDescontoEl.textContent =
      'Escolha um pacote pronto ou marque 2+ serviços avulsos para 10% OFF!';
  }

  valorSubtotalEl.textContent = formatarMoeda(resumo.subtotal);
  valorDescontoEl.textContent = `- ${formatarMoeda(resumo.descontoCombo)}`;
  valorPrioridadeEl.textContent = formatarMoeda(resumo.adicionalPrioridade);
  valorTotalEl.textContent = formatarMoeda(resumo.totalFinal);

  if (resumo.itens.length === 0) {
    previaMensagemEl.textContent =
      'Escolha um pacote ou selecione pelo menos um serviço para visualizar a mensagem...';
  } else {
    previaMensagemEl.textContent = gerarTextoWhatsApp(resumo);
  }
}

/**
 * Limpa todas as seleções e restaura o estado inicial do simulador.
 */
function limparSimulacao(): void {
  limparDestaquePacotes();
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  prazoSelect.value = 'padrao';
  nomeInput.value = '';
  turnoSelect.selectedIndex = 0;
  atualizarSimulador();
}

/**
 * Copia o texto da prévia para a área de transferência do usuário.
 */
async function copiarPreviaMensagem(): Promise<void> {
  const resumo = calcularResumoOrcamento();

  if (resumo.itens.length === 0) {
    exibirFeedback('Selecione um pacote ou serviço antes de copiar a mensagem.');
    return;
  }

  try {
    await navigator.clipboard.writeText(gerarTextoWhatsApp(resumo));
    exibirFeedback('Mensagem copiada para a área de transferência!', 'sucesso');
  } catch {
    exibirFeedback('Não foi possível copiar automaticamente. Selecione o texto manualmente.');
  }
}

/**
 * Valida o formulário e abre a conversa no WhatsApp com a mensagem codificada.
 */
function enviarPedidoWhatsApp(evento: SubmitEvent): void {
  evento.preventDefault();

  const resumo = calcularResumoOrcamento();
  const nomeCliente = nomeInput.value.trim();

  if (resumo.itens.length === 0) {
    exibirFeedback('Selecione um pacote ou pelo menos um serviço antes de enviar.');
    return;
  }

  if (nomeCliente === '') {
    exibirFeedback('Por favor, informe seu nome ou o nome do seu negócio.');
    nomeInput.focus();
    return;
  }

  exibirFeedback('');
  const textoFinal = gerarTextoWhatsApp(resumo);
  const urlWhatsApp = `https://wa.me/${TELEFONE_CONTATO}?text=${encodeURIComponent(textoFinal)}`;
  window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
}

// ============================================================================
// 6. REGISTRO DE LISTENERS
// ============================================================================

botoesPacote.forEach((botao) => {
  botao.addEventListener('click', () => selecionarPacote(botao));
});

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    if (pacoteSelecionadoNome !== null) {
      limparDestaquePacotes();
    }
    atualizarSimulador();
  });
});

prazoSelect.addEventListener('change', atualizarSimulador);
nomeInput.addEventListener('input', atualizarSimulador);
turnoSelect.addEventListener('change', atualizarSimulador);
btnLimpar.addEventListener('click', limparSimulacao);
btnCopiar.addEventListener('click', copiarPreviaMensagem);
formAgendamento.addEventListener('submit', enviarPedidoWhatsApp);