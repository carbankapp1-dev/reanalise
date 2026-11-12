// Ordem oficial do Script Mínimo
const FIELD_ORDER = [
  { name: "contrato",     question: "Possui contrato no mercado?" },
  { name: "quitado",      question: "Será quitado?" },
  { name: "entrada",      question: "Composição da entrada?" },
  { name: "renda",        question: "Composição da renda?" },
  { name: "estadoCivil",  question: "Estado Civil?" }
  // Campos inativos (ocultos no HTML e fora do texto gerado):
  // { name: "declaraIR",    question: "Declara IR?" },
  // { name: "experienciaCredito", question: "Possui experiência de crédito?" }
];

// Configuração dos campos condicionais (abrem um input extra quando alguma das respostas-gatilho é escolhida)
const CONDITIONALS = {
  contrato: {
    triggerValues: ["Sim"],
    containerId: "contratoExtra",
    inputId: "contratoBanco",
    extraLabel: "Banco"
  },
  entrada: {
    triggerValues: ["Carro", "Carro + Dinheiro"],
    containerId: "entradaExtra",
    inputId: "entradaCarroInfo",
    extraLabel: "Carro"
  },
  renda: {
    triggerValues: ["Holerite + Outros"],
    containerId: "rendaExtra",
    inputId: "rendaOutrosDesc",
    extraLabel: "Descrição"
  },
  estadoCivil: {
    triggerValues: ["Casado(a)"],
    containerId: "estadoCivilExtra",
    inputId: "estadoCivilEsposa",
    extraLabel: "Dados da esposa"
  },
  experienciaCredito: {
    triggerValues: ["Sim"],
    containerId: "experienciaCreditoExtra",
    inputId: "experienciaCreditoInfo",
    extraLabel: "Informação"
  },
  chavePix: {
    triggerValues: ["Sim"],
    containerId: "chavePixExtra",
    inputId: "chavePixBanco",
    extraLabel: "Banco"
  }
};

const state = {
  contrato: null,
  quitado: null,
  entrada: null,
  renda: null,
  estadoCivil: null,
  declaraIR: null,
  experienciaCredito: null,
  chavePix: null
};

const outputBox = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const copyLabel = document.getElementById("copyLabel");
const clearBtn = document.getElementById("clearBtn");
const gcmNomeInput = document.getElementById("gcmNome");
const gcmFilialInput = document.getElementById("gcmFilial");

// Nome do GCM e filial ficam salvos no navegador (localStorage)
const GCM_STORAGE_KEY = "reanalise_gcm";

function loadGcm() {
  try {
    const saved = JSON.parse(localStorage.getItem(GCM_STORAGE_KEY) || "{}");
    gcmNomeInput.value = saved.nome || "";
    gcmFilialInput.value = saved.filial || "";
  } catch (err) {
    // sem acesso ao armazenamento: segue sem preencher
  }
}

function saveGcm() {
  try {
    localStorage.setItem(GCM_STORAGE_KEY, JSON.stringify({
      nome: gcmNomeInput.value.trim(),
      filial: gcmFilialInput.value.trim()
    }));
  } catch (err) {
    // sem acesso ao armazenamento: o texto continua funcionando, só não salva
  }
}

[gcmNomeInput, gcmFilialInput].forEach(input => {
  input.addEventListener("input", () => {
    saveGcm();
    render();
  });
});

loadGcm();

// Seleção das opções (toggle único por grupo)
document.querySelectorAll(".options").forEach(group => {
  const name = group.dataset.name;
  group.querySelectorAll(".opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const alreadySelected = btn.classList.contains("selected");
      group.querySelectorAll(".opt").forEach(b => b.classList.remove("selected"));

      if (!alreadySelected) {
        btn.classList.add("selected");
        state[name] = btn.dataset.value;
      } else {
        state[name] = null;
      }

      updateConditional(name);
      updateDependencies();
      render();
    });
  });
});

// Regras de dependência entre perguntas:
// sem contrato no mercado ("Não"), a pergunta "Será quitado?" fica inativa e sem resposta
function updateDependencies() {
  const quitadoGroup = document.querySelector('.options[data-name="quitado"]');
  const quitadoField = quitadoGroup.closest(".field");
  const disable = state.contrato === "Não";

  if (disable) {
    state.quitado = null;
    quitadoGroup.querySelectorAll(".opt").forEach(b => b.classList.remove("selected"));
  }

  quitadoGroup.querySelectorAll(".opt").forEach(b => { b.disabled = disable; });
  quitadoField.classList.toggle("is-disabled", disable);
}

// Mostra/oculta o campo condicional de um grupo, de acordo com a resposta selecionada
function updateConditional(name) {
  const config = CONDITIONALS[name];
  if (!config) return;

  const container = document.getElementById(config.containerId);
  const input = document.getElementById(config.inputId);
  const shouldShow = config.triggerValues.includes(state[name]);

  container.classList.toggle("open", shouldShow);

  if (!shouldShow) {
    input.value = "";
  }
}

// Liga os inputs condicionais à renderização do texto
Object.values(CONDITIONALS).forEach(config => {
  document.getElementById(config.inputId).addEventListener("input", render);
});

clearBtn.addEventListener("click", () => {
  Object.keys(state).forEach(k => state[k] = null);
  document.querySelectorAll(".opt.selected").forEach(b => b.classList.remove("selected"));
  document.querySelectorAll(".conditional").forEach(c => c.classList.remove("open"));
  document.querySelectorAll(".conditional .text-input").forEach(i => i.value = "");
  updateDependencies();
  render();
});

const INTRO_TEXT = "Olá, tudo bem? Solicito reanálise conforme as informações a seguir:";

function buildParts() {
  const parts = [];

  FIELD_ORDER.forEach(f => {
    if (!state[f.name]) return;

    let line = `${f.question} ${state[f.name]}`;

    const config = CONDITIONALS[f.name];
    if (config && config.triggerValues.includes(state[f.name])) {
      const extraValue = document.getElementById(config.inputId).value.trim();
      if (extraValue) {
        line += ` (${config.extraLabel}: ${extraValue})`;
      }
    }

    parts.push(line);
  });

  // Chave Pix: campo inativo (oculto no HTML e fora do texto gerado)

  return parts;
}

// Data e hora atuais (fuso de Brasília), no momento em que o texto é gerado
function getNowBR() {
  const now = new Date();
  const data = now.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const hora = now.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return { data, hora };
}

function buildText() {
  const parts = buildParts();
  if (parts.length === 0) return "";

  let text = `${INTRO_TEXT}\n\n${parts.join("   ------   ")}`;

  const { data, hora } = getNowBR();
  text += `\n\n------Checagem realizada com a cliente pelo número celular do cadastro, em ${data} as ${hora} hs.`;

  // Despedida: "Checagem feita por GCM - Nome - Filial" (só aparece se houver nome ou filial)
  const nome = gcmNomeInput.value.trim();
  const filial = gcmFilialInput.value.trim();
  if (nome || filial) {
    const assinatura = ["GCM", nome, filial].filter(Boolean).join(" - ");
    text += `\n\nChecagem feita por ${assinatura}`;
  }

  return text;
}

function render() {
  const text = buildText();

  if (!text) {
    outputBox.innerHTML = `<span class="placeholder">Preencha os campos ao lado para gerar o texto da checagem.</span>`;
    return;
  }

  outputBox.textContent = text;
  resetCopyState();
}

function resetCopyState() {
  copyBtn.classList.remove("copied");
  copyLabel.textContent = "Copiar texto";
}

copyBtn.addEventListener("click", async () => {
  // Gera o texto de novo para a data/hora refletir o momento da cópia
  const text = buildText();
  if (!text) return;
  outputBox.textContent = text;

  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // fallback para navegadores/contextos sem permissão de clipboard
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }

  copyBtn.classList.add("copied");
  copyLabel.textContent = "Copiado!";
  setTimeout(resetCopyState, 1800);
});

render();
