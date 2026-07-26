// Ordem oficial do Script Mínimo
const FIELD_ORDER = [
  { name: "contrato",     question: "Possui contrato no mercado?" },
  { name: "quitado",      question: "Será quitado?" },
  { name: "entrada",      question: "Composição da entrada?" },
  { name: "renda",        question: "Composição da renda?" },
  { name: "estadoCivil",  question: "Estado Civil?" },
  { name: "declaraIR",    question: "Declara IR?" },
  { name: "experienciaCredito", question: "Possui experiência de crédito?" }
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
const checagemDataInput = document.getElementById("checagemData");
const checagemHoraInput = document.getElementById("checagemHora");
const clearBtn = document.getElementById("clearBtn");

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
      render();
    });
  });
});

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

checagemDataInput.addEventListener("input", render);
checagemHoraInput.addEventListener("input", render);

clearBtn.addEventListener("click", () => {
  Object.keys(state).forEach(k => state[k] = null);
  document.querySelectorAll(".opt.selected").forEach(b => b.classList.remove("selected"));
  document.querySelectorAll(".conditional").forEach(c => c.classList.remove("open"));
  document.querySelectorAll(".conditional .text-input").forEach(i => i.value = "");
  checagemDataInput.value = "";
  checagemHoraInput.value = "";
  render();
});

const INTRO_TEXT = "Olá, tudo bem? Seguindo o formato de script mínimo, solicito reanálise conforme as informações a seguir:";

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

  // Chave Pix tem formato de frase próprio (não segue o padrão "pergunta resposta")
  if (state.chavePix === "Sim") {
    const banco = document.getElementById("chavePixBanco").value.trim();
    let pixLine = "Possui chave pix vinculado no fone do cadastro";
    pixLine += banco ? ` - Banco: ${banco}` : " - Banco";
    parts.push(pixLine);
  }
  // Quando "Não", nada é adicionado (fica em branco, conforme solicitado)

  return parts;
}

function formatDateBR(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function buildText() {
  const parts = buildParts();
  if (parts.length === 0) return "";

  let text = `${INTRO_TEXT}\n\n${parts.join("   ------   ")}`;

  const data = checagemDataInput.value;
  const hora = checagemHoraInput.value;
  if (data && hora) {
    text += `\n\n------Checagem realizada com a cliente pelo número celular do cadastro, em ${formatDateBR(data)} as ${hora} hs.`;
  }

  return text;
}

function render() {
  const text = buildText();

  if (!text) {
    outputBox.innerHTML = `<span class="placeholder">Preencha os campos ao lado para gerar o texto do script mínimo.</span>`;
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
  const text = buildText();
  if (!text) return;

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
