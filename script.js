// Configuração da API
const URL_BASE_DA_API = window.location.origin;

// Sistema de Modal de Confirmação Customizado
function criar_modal_confirmacao() {
  const modal = document.createElement("div");
  modal.id = "modal-confirmacao";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-titulo">⚠️ Confirmação</h3>
      </div>
      <div class="modal-body">
        <p id="modal-mensagem"></p>
      </div>
      <div class="modal-footer">
        <button id="modal-cancelar" class="btn btn-secondary">❌ Cancelar</button>
        <button id="modal-confirmar" class="btn btn-danger">✅ Confirmar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// Função para mostrar confirmação customizada
function mostrar_confirmacao(titulo, mensagem, callback) {
  let modal = document.getElementById("modal-confirmacao");
  if (!modal) {
    modal = criar_modal_confirmacao();
  }

  document.getElementById("modal-titulo").textContent = titulo;
  document.getElementById("modal-mensagem").textContent = mensagem;

  modal.style.display = "flex";
  modal.classList.add("show");

  const btnConfirmar = document.getElementById("modal-confirmar");
  const btnCancelar = document.getElementById("modal-cancelar");

  // Remove listeners anteriores
  btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
  btnCancelar.replaceWith(btnCancelar.cloneNode(true));

  // Adiciona novos listeners
  document.getElementById("modal-confirmar").addEventListener("click", () => {
    fechar_modal_confirmacao();
    callback(true);
  });

  document.getElementById("modal-cancelar").addEventListener("click", () => {
    fechar_modal_confirmacao();
    callback(false);
  });

  // Fechar ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fechar_modal_confirmacao();
      callback(false);
    }
  });
}

// Função para fechar modal de confirmação
function fechar_modal_confirmacao() {
  const modal = document.getElementById("modal-confirmacao");
  if (modal) {
    modal.classList.remove("show");
    modal.style.display = "none";
  }
}

// Função para limpar dados sensíveis da memória
function limpar_dados_sensíveis(obj) {
  if (typeof obj === "string") {
    return obj.replace(/./g, "");
  }
  if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach((key) => {
      if (obj[key]) {
        obj[key] = "";
        delete obj[key];
      }
    });
  }
  return null;
}

// Função para fazer requisições autenticadas
async function requisicao_autenticada(url, opcoes = {}) {
  const token = obter_token_valido();

  if (!token) {
    mostrar_mensagem("Sessão expirada. Faça login novamente.", "error");
    setTimeout(() => {
      fazer_logout();
    }, 2000);
    return null;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...opcoes.headers,
  };

  return fetch(url, {
    ...opcoes,
    headers,
  });
}

// Configurações de sessão
const TEMPO_SESSAO = 2 * 60 * 60 * 1000; // 2 horas em milissegundos (reduzido)
const CHAVE_TOKEN_USUARIO = "barbearia_token_usuario";
const CHAVE_SESSAO_ADMIN = "barbearia_sessao_admin";

// === GERENCIAMENTO DE SESSÃO ===

// Salvar token do usuário (sessionStorage - expira ao fechar navegador)
function salvar_token_sessao(token) {
  const sessao = {
    token: token,
    timestamp: Date.now(),
    tipo: "usuario",
  };
  // Usa sessionStorage para que a sessão expire ao fechar o navegador
  sessionStorage.setItem(CHAVE_TOKEN_USUARIO, JSON.stringify(sessao));

  // Limpa o token da variável local imediatamente após salvar
  token = null;

  // Remove qualquer referência ao token da memória
  if (typeof window.gc === "function") {
    setTimeout(() => window.gc(), 100);
  }
}

// Obter token válido
function obter_token_valido() {
  const sessao_usuario = sessionStorage.getItem(CHAVE_TOKEN_USUARIO);
  if (sessao_usuario) {
    try {
      const dados_sessao = JSON.parse(sessao_usuario);
      const tempo_decorrido = Date.now() - dados_sessao.timestamp;

      if (tempo_decorrido < TEMPO_SESSAO) {
        return dados_sessao.token;
      } else {
        // Token expirado
        sessionStorage.removeItem(CHAVE_TOKEN_USUARIO);
        // console.log("⏰ Token de usuário expirado"); // Removido por segurança
      }
    } catch (erro) {
      sessionStorage.removeItem(CHAVE_TOKEN_USUARIO);
      // console.log("❌ Erro ao validar token de usuário"); // Removido por segurança
    }
  }
  return null;
}

// Função para decodificar dados do token (sem validação de assinatura no frontend)
function obter_dados_token(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (erro) {
    console.error("Erro ao decodificar token:", erro);
    return null;
  }
}

// Salvar sessão do admin (sessionStorage - expira ao fechar navegador)
function salvar_sessao_admin(dados_admin) {
  const sessao = {
    admin: dados_admin,
    timestamp: Date.now(),
    tipo: "admin",
  };
  // Usa sessionStorage para que a sessão expire ao fechar o navegador
  sessionStorage.setItem(CHAVE_SESSAO_ADMIN, JSON.stringify(sessao));
  console.log("👑 Sessão de admin salva");
}

// Verificar se há sessão ativa
function verificar_sessao_ativa() {
  // Verifica token de usuário
  const token = obter_token_valido();
  if (token) {
    const dados_usuario = obter_dados_token(token);
    if (dados_usuario && dados_usuario.nome) {
      console.log("🔄 Restaurando sessão de usuário...");
      mostrar_painel_usuario(dados_usuario);
      mostrar_mensagem(
        `👋 Bem-vindo de volta, ${dados_usuario.nome}!`,
        "success"
      );
      return;
    }
  }

  // Verifica sessão de admin
  const sessao_admin = sessionStorage.getItem(CHAVE_SESSAO_ADMIN);
  if (sessao_admin) {
    try {
      const dados_sessao = JSON.parse(sessao_admin);
      const tempo_decorrido = Date.now() - dados_sessao.timestamp;

      if (tempo_decorrido < TEMPO_SESSAO) {
        console.log("🔄 Restaurando sessão de admin...");
        mostrar_painel_admin(dados_sessao.admin);
        mostrar_mensagem(
          `👑 Bem-vindo de volta, Admin ${dados_sessao.admin.nome}!`,
          "success"
        );
        return;
      } else {
        // Sessão expirada
        sessionStorage.removeItem(CHAVE_SESSAO_ADMIN);
        console.log("⏰ Sessão de admin expirada");
      }
    } catch (erro) {
      sessionStorage.removeItem(CHAVE_SESSAO_ADMIN);
      console.log("❌ Erro ao restaurar sessão de admin");
    }
  }
}

// Limpar todas as sessões
function limpar_sessoes() {
  sessionStorage.removeItem(CHAVE_TOKEN_USUARIO);
  sessionStorage.removeItem(CHAVE_SESSAO_ADMIN);
  console.log("🧹 Todas as sessões foram limpas");
}

// Verificar tempo restante da sessão
function obter_tempo_restante_sessao() {
  const sessao_usuario = sessionStorage.getItem(CHAVE_TOKEN_USUARIO);
  const sessao_admin = sessionStorage.getItem(CHAVE_SESSAO_ADMIN);

  let sessao_ativa = null;

  if (sessao_usuario) {
    try {
      sessao_ativa = JSON.parse(sessao_usuario);
    } catch (e) {}
  } else if (sessao_admin) {
    try {
      sessao_ativa = JSON.parse(sessao_admin);
    } catch (e) {}
  }

  if (sessao_ativa) {
    const tempo_decorrido = Date.now() - sessao_ativa.timestamp;
    const tempo_restante = TEMPO_SESSAO - tempo_decorrido;
    return Math.max(0, tempo_restante);
  }

  return 0;
}

// Iniciar contador de sessão
function iniciar_contador_sessao() {
  // Atualiza a cada minuto
  setInterval(() => {
    const tempo_restante = obter_tempo_restante_sessao();

    if (tempo_restante > 0) {
      atualizar_indicador_sessao(tempo_restante);
    } else {
      // Sessão expirou, fazer logout automático
      if (
        !painel_do_usuario.classList.contains("hidden") ||
        !painel_admin.classList.contains("hidden")
      ) {
        mostrar_mensagem("⏰ Sessão expirada. Faça login novamente.", "error");
        setTimeout(() => {
          fazer_logout();
        }, 2000);
      }
    }
  }, 60000); // A cada 1 minuto
}

// Atualizar indicador visual de sessão
function atualizar_indicador_sessao(tempo_restante) {
  const horas = Math.floor(tempo_restante / (1000 * 60 * 60));
  const minutos = Math.floor((tempo_restante % (1000 * 60 * 60)) / (1000 * 60));

  let texto_sessao;
  if (horas > 0) {
    texto_sessao = `🕐 Sessão expira em ${horas}h ${minutos}m`;
  } else if (minutos > 5) {
    texto_sessao = `🕐 Sessão expira em ${minutos}m`;
  } else {
    texto_sessao = `⏰ Sessão expira em ${minutos}m`;
  }

  // Atualiza indicadores
  const indicador_usuario = document.getElementById("sessao-info-usuario");
  const indicador_admin = document.getElementById("sessao-info-admin");

  if (indicador_usuario) {
    indicador_usuario.textContent = texto_sessao;
  }

  if (indicador_admin) {
    indicador_admin.textContent = texto_sessao;
  }
}

// Estender sessão
function estender_sessao() {
  const sessao_usuario = sessionStorage.getItem(CHAVE_TOKEN_USUARIO);
  const sessao_admin = sessionStorage.getItem(CHAVE_SESSAO_ADMIN);

  let sessao_ativa = null;
  let chave_sessao = null;

  if (sessao_usuario) {
    try {
      sessao_ativa = JSON.parse(sessao_usuario);
      chave_sessao = CHAVE_TOKEN_USUARIO;
    } catch (e) {}
  } else if (sessao_admin) {
    try {
      sessao_ativa = JSON.parse(sessao_admin);
      chave_sessao = CHAVE_SESSAO_ADMIN;
    } catch (e) {}
  }

  if (sessao_ativa && chave_sessao) {
    // Atualiza o timestamp para agora
    sessao_ativa.timestamp = Date.now();
    sessionStorage.setItem(chave_sessao, JSON.stringify(sessao_ativa));

    // Atualiza o indicador visual
    const tempo_restante = obter_tempo_restante_sessao();
    if (tempo_restante > 0) {
      atualizar_indicador_sessao(tempo_restante);
    }

    // Mostra mensagem de confirmação
    const mensagem =
      sessao_ativa.tipo === "admin"
        ? "👑 Sessão de admin estendida por mais 2 horas!"
        : "🔄 Sessão estendida por mais 2 horas!";

    if (sessao_ativa.tipo === "admin") {
      mostrar_mensagem_admin(mensagem, "success");
    } else {
      mostrar_mensagem_dashboard(mensagem, "success");
    }
  }
}

// Elementos do DOM
const botoes_das_abas = document.querySelectorAll(".tab-btn");
const conteudos_dos_formularios = document.querySelectorAll(".form-content");
const formulario_de_login = document.getElementById("loginForm");
const formulario_de_cadastro = document.getElementById("cadastroForm");
const formulario_admin = document.getElementById("adminForm");
const div_da_mensagem = document.getElementById("message");
const container_principal = document.querySelector(".container");
const painel_do_usuario = document.getElementById("dashboard");
const painel_admin = document.getElementById("admin-dashboard");
const botao_de_sair = document.getElementById("logout-btn");
const botao_admin_sair = document.getElementById("admin-logout-btn");

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  configurar_abas();
  configurar_formularios();
  configurar_logout();
  configurar_validacao_customizada();
  verificar_sessao_ativa(); // Verifica se já está logado
});

// Configurar validação customizada para todos os formulários
function configurar_validacao_customizada() {
  // Remove mensagens padrão do HTML5 e adiciona customizadas
  // Exclui formulários de login para evitar conflitos
  document
    .querySelectorAll("input[required], select[required], textarea[required]")
    .forEach((input) => {
      // Pula validação customizada para formulários de login
      const isLoginForm =
        input.closest("#loginForm") || input.closest("#adminForm");
      if (isLoginForm) return;

      // Remove validação padrão apenas para formulários não-login
      input.addEventListener("invalid", (evento) => {
        evento.preventDefault();

        const campo = evento.target;
        const nomeCampo =
          campo.previousElementSibling?.textContent || campo.name || "Campo";
        let mensagem = "";

        if (campo.validity.valueMissing) {
          mensagem = `${nomeCampo
            .replace(/[📧🔒👤📞🔑]/g, "")
            .trim()} é obrigatório.`;
        } else if (campo.validity.typeMismatch) {
          if (campo.type === "email") {
            mensagem = `Por favor, insira um email válido.`;
          }
        } else if (campo.validity.tooShort) {
          mensagem = `${nomeCampo
            .replace(/[📧🔒👤📞🔑]/g, "")
            .trim()} deve ter pelo menos ${campo.minLength} caracteres.`;
        } else if (campo.validity.patternMismatch) {
          mensagem = `${nomeCampo
            .replace(/[📧🔒👤📞🔑]/g, "")
            .trim()} tem formato inválido.`;
        }

        if (mensagem) {
          // Determina qual tipo de mensagem usar baseado no contexto
          if (campo.closest("#dashboard")) {
            mostrar_mensagem_dashboard(mensagem, "error");
          } else if (campo.closest("#admin-dashboard")) {
            mostrar_mensagem_admin(mensagem, "error");
          } else {
            mostrar_mensagem(mensagem, "error");
          }

          // Foca no campo com erro
          campo.focus();
        }
      });

      // Limpa mensagens quando campo fica válido
      input.addEventListener("input", () => {
        if (input.validity.valid) {
          input.setCustomValidity("");
        }
      });

      // Adiciona placeholder melhorado (exceto para login)
      if (!isLoginForm) {
        if (input.type === "email" && !input.placeholder) {
          input.placeholder = "seu.email@exemplo.com";
        } else if (input.type === "password" && !input.placeholder) {
          input.placeholder = "Digite sua senha";
        } else if (
          input.type === "text" &&
          input.name === "nome" &&
          !input.placeholder
        ) {
          input.placeholder = "Digite seu nome completo";
        } else if (input.type === "tel" && !input.placeholder) {
          input.placeholder = "(11) 99999-9999";
        }
      }
    });

  // Intercepta submit de formulários para validação customizada (exceto login e admin)
  document.querySelectorAll("form").forEach((form) => {
    // Pula validação customizada para formulários de login e cadastro de admin
    if (
      form.id === "loginForm" ||
      form.id === "adminForm" ||
      form.id === "criar-admin-form"
    )
      return;

    form.addEventListener("submit", (evento) => {
      const camposInvalidos = form.querySelectorAll(":invalid");

      if (camposInvalidos.length > 0) {
        evento.preventDefault();

        // Foca no primeiro campo inválido
        const primeiroCampo = camposInvalidos[0];
        primeiroCampo.focus();

        // Dispara evento de validação customizada
        primeiroCampo.dispatchEvent(new Event("invalid"));
      }
    });
  });
}

// Configuração das abas
function configurar_abas() {
  botoes_das_abas.forEach((botao) => {
    botao.addEventListener("click", () => {
      const aba_alvo = botao.getAttribute("data-tab");
      trocar_aba(aba_alvo);
    });
  });
}

function trocar_aba(nome_da_aba) {
  // Remove active das abas
  botoes_das_abas.forEach((botao) => botao.classList.remove("active"));
  conteudos_dos_formularios.forEach((conteudo) =>
    conteudo.classList.remove("active")
  );

  // Adiciona active na aba selecionada
  document.querySelector(`[data-tab="${nome_da_aba}"]`).classList.add("active");
  document.getElementById(`${nome_da_aba}-form`).classList.add("active");

  // Limpa mensagens
  esconder_mensagem();
}

// Configuração dos formulários
function configurar_formularios() {
  formulario_de_login.addEventListener("submit", processar_login);
  formulario_de_cadastro.addEventListener("submit", processar_cadastro);
  formulario_admin.addEventListener("submit", processar_login_admin);

  // Adiciona limpeza automática dos campos sensíveis quando perdem o foco
  document.addEventListener("focusout", (evento) => {
    if (evento.target.type === "password") {
      // Aguarda um pouco e limpa o campo de senha se não estiver em foco
      setTimeout(() => {
        if (document.activeElement !== evento.target) {
          evento.target.setAttribute("autocomplete", "off");
        }
      }, 100);
    }
  });

  // Previne autocomplete em campos sensíveis
  document
    .querySelectorAll('input[type="password"], input[type="email"]')
    .forEach((input) => {
      input.setAttribute("autocomplete", "off");
      input.setAttribute("data-lpignore", "true"); // Ignora LastPass
      input.setAttribute("data-form-type", "other"); // Previne preenchimento automático
    });

  // Formulário criar admin - agora usa a função validada criar_novo_admin
  const criarAdminForm = document.getElementById("criar-admin-form");
  if (criarAdminForm) {
    // Remove listener anterior se existir
    criarAdminForm.removeEventListener("submit", criar_novo_admin);
    // Adiciona o listener da função validada
    criarAdminForm.addEventListener("submit", criar_novo_admin);

    // Melhora a experiência do usuário no formulário de admin
    configurar_formulario_admin();
  }
}

// Configurar melhorias no formulário de cadastro de admin
function configurar_formulario_admin() {
  const nomeInput = document.getElementById("novo-admin-nome");
  const emailInput = document.getElementById("novo-admin-email");
  const senhaInput = document.getElementById("novo-admin-senha");

  // Adiciona placeholders informativos
  if (nomeInput) {
    nomeInput.placeholder = "Nome completo do administrador";
    nomeInput.setAttribute("maxlength", "50");
  }

  if (emailInput) {
    emailInput.placeholder = "admin@suabarbearia.com";
    emailInput.setAttribute("maxlength", "100");
  }

  if (senhaInput) {
    senhaInput.placeholder = "Mínimo 8 caracteres (recomenda-se senha forte)";
    senhaInput.setAttribute("maxlength", "128");
    senhaInput.setAttribute("minlength", "8");
  }

  // Indicador de força da senha em tempo real
  if (senhaInput) {
    senhaInput.addEventListener("input", (evento) => {
      const senha = evento.target.value;
      const indicador =
        document.getElementById("senha-strength") || criarIndicadorSenha();

      const forca = calcularForcaSenha(senha);
      atualizarIndicadorSenha(indicador, forca);
    });
  }

  // Validação de email em tempo real
  if (emailInput) {
    emailInput.addEventListener("blur", (evento) => {
      const email = evento.target.value.trim();
      if (email) {
        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
          evento.target.style.borderColor = "#dc3545";
          evento.target.style.boxShadow =
            "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
        } else {
          evento.target.style.borderColor = "#28a745";
          evento.target.style.boxShadow =
            "0 0 0 0.2rem rgba(40, 167, 69, 0.25)";
        }
      }
    });
  }
}

// Criar indicador visual de força da senha
function criarIndicadorSenha() {
  const senhaInput = document.getElementById("novo-admin-senha");
  const indicador = document.createElement("div");
  indicador.id = "senha-strength";
  indicador.className = "senha-strength";
  indicador.innerHTML = `
    <div class="strength-bar">
      <div class="strength-fill"></div>
    </div>
    <div class="strength-text">Digite uma senha</div>
  `;

  senhaInput.parentNode.appendChild(indicador);
  return indicador;
}

// Calcular força da senha
function calcularForcaSenha(senha) {
  let pontos = 0;
  let nivel = "fraca";
  let cor = "#dc3545";
  let texto = "Senha fraca";

  if (senha.length >= 8) pontos += 1;
  if (senha.length >= 12) pontos += 1;
  if (/[a-z]/.test(senha)) pontos += 1;
  if (/[A-Z]/.test(senha)) pontos += 1;
  if (/[0-9]/.test(senha)) pontos += 1;
  if (/[^A-Za-z0-9]/.test(senha)) pontos += 1;

  if (pontos >= 5) {
    nivel = "forte";
    cor = "#28a745";
    texto = "Senha forte ✅";
  } else if (pontos >= 3) {
    nivel = "media";
    cor = "#ffc107";
    texto = "Senha média ⚠️";
  }

  return { pontos, nivel, cor, texto, porcentagem: (pontos / 6) * 100 };
}

// Atualizar indicador visual de força da senha
function atualizarIndicadorSenha(indicador, forca) {
  const fill = indicador.querySelector(".strength-fill");
  const text = indicador.querySelector(".strength-text");

  fill.style.width = `${forca.porcentagem}%`;
  fill.style.backgroundColor = forca.cor;
  text.textContent = forca.texto;
  text.style.color = forca.cor;
}

// Configuração do logout
function configurar_logout() {
  botao_de_sair.addEventListener("click", () => {
    fazer_logout();
  });

  botao_admin_sair.addEventListener("click", () => {
    fazer_logout();
  });
}

// Função unificada de logout
function fazer_logout() {
  // Limpa as sessões
  limpar_sessoes();

  // Força limpeza adicional do sessionStorage
  try {
    sessionStorage.clear();
  } catch (e) {
    // Fallback se clear() falhar
    sessionStorage.removeItem(CHAVE_TOKEN_USUARIO);
    sessionStorage.removeItem(CHAVE_SESSAO_ADMIN);
  }

  // Esconde painéis
  painel_do_usuario.classList.add("hidden");
  painel_admin.classList.add("hidden");

  // Mostra tela inicial
  container_principal.style.display = "block";

  // Limpa interface
  esconder_mensagem();
  limpar_formularios();

  // Força limpeza de todos os campos de entrada
  document
    .querySelectorAll('input[type="email"], input[type="password"]')
    .forEach((input) => {
      input.value = "";
      input.setAttribute("autocomplete", "off");
    });

  // Volta para aba de login
  trocar_aba("login");

  // Força garbage collection se disponível
  if (typeof window.gc === "function") {
    setTimeout(() => window.gc(), 500);
  }

  mostrar_mensagem("👋 Logout realizado com sucesso!", "success");
}

// Processador do login
async function processar_login(evento) {
  evento.preventDefault();

  // Captura os dados diretamente dos campos usando closure para isolamento
  const obter_credenciais = () => {
    const e = document.getElementById("login-email")?.value?.trim() || "";
    const s = document.getElementById("login-senha")?.value || "";
    return { e, s };
  };

  const { e: email, s: senha } = obter_credenciais();

  // Validação básica - apenas verifica se estão preenchidos
  if (!email || !senha) {
    mostrar_mensagem(
      "📧 Por favor, preencha email e senha para continuar.",
      "error"
    );

    // Foca no primeiro campo vazio
    if (!email) {
      document.getElementById("login-email").focus();
    } else if (!senha) {
      document.getElementById("login-senha").focus();
    }
    return;
  }

  // Validação adicional de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrar_mensagem("📧 Por favor, insira um email válido.", "error");
    document.getElementById("login-email").focus();
    return;
  }

  const botao_de_envio = formulario_de_login.querySelector(".btn");
  definir_estado_carregando(botao_de_envio, true);

  // Limpa o formulário imediatamente para segurança (após capturar os dados)
  formulario_de_login.reset();

  // Limpa os campos do DOM também
  document.getElementById("login-email").value = "";
  document.getElementById("login-senha").value = "";

  try {
    // Cria payload temporário e envia imediatamente
    const payload_temporario = { email, senha };

    const resposta = await fetch(`${URL_BASE_DA_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload_temporario),
    });

    // Força limpeza imediata do payload e variáveis
    limpar_dados_sensíveis(payload_temporario);

    const resultado = await resposta.json();

    if (resposta.ok && resultado.access_token) {
      // Salva apenas o token na sessão
      salvar_token_sessao(resultado.access_token);

      mostrar_mensagem("✅ Login realizado com sucesso!", "success");
      setTimeout(() => {
        mostrar_painel_usuario();
      }, 1000);
    } else {
      mostrar_mensagem(
        resultado.message || "❌ Credenciais inválidas. Tente novamente.",
        "error"
      );
    }
  } catch (erro) {
    console.error("Erro na requisição de login");
    mostrar_mensagem(
      "🌐 Erro de conexão. Verifique sua internet e tente novamente.",
      "error"
    );
  } finally {
    // Força limpeza adicional usando garbage collection
    if (typeof window.gc === "function") {
      window.gc(); // Força garbage collection se disponível
    }
    definir_estado_carregando(botao_de_envio, false);
  }
}

// Processador do cadastro
async function processar_cadastro(evento) {
  evento.preventDefault();

  const dados_do_formulario = new FormData(formulario_de_cadastro);
  const dados_de_cadastro = {
    nome: dados_do_formulario.get("nome")?.trim(),
    email: dados_do_formulario.get("email")?.trim().toLowerCase(),
    telefone: dados_do_formulario.get("telefone")?.trim(),
    senha: dados_do_formulario.get("senha"),
    senha_confirmacao: dados_do_formulario.get("confirmSenha"),
  };

  // Validações detalhadas com mensagens amigáveis
  if (!dados_de_cadastro.nome) {
    mostrar_mensagem("👤 Por favor, insira seu nome completo.", "error");
    document.getElementById("cadastro-nome").focus();
    return;
  }

  if (dados_de_cadastro.nome.length < 2) {
    mostrar_mensagem("👤 Nome deve ter pelo menos 2 caracteres.", "error");
    document.getElementById("cadastro-nome").focus();
    return;
  }

  if (!dados_de_cadastro.email) {
    mostrar_mensagem("📧 Por favor, insira seu email.", "error");
    document.getElementById("cadastro-email").focus();
    return;
  }

  // Validação de email mais robusta
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dados_de_cadastro.email)) {
    mostrar_mensagem(
      "📧 Por favor, insira um email válido (exemplo: seu.email@gmail.com).",
      "error"
    );
    document.getElementById("cadastro-email").focus();
    return;
  }

  if (!dados_de_cadastro.telefone) {
    mostrar_mensagem("📞 Por favor, insira seu telefone.", "error");
    document.getElementById("cadastro-telefone").focus();
    return;
  }

  // Validação de telefone mais flexível
  const telefone_limpo = dados_de_cadastro.telefone.replace(
    /[\s\-\(\)\+]/g,
    ""
  );
  if (!/^\d{10,15}$/.test(telefone_limpo)) {
    mostrar_mensagem(
      "📞 Telefone inválido. Use formato: (11) 99999-9999 ou 11999999999",
      "error"
    );
    document.getElementById("cadastro-telefone").focus();
    return;
  }

  if (!dados_de_cadastro.senha) {
    mostrar_mensagem("🔒 Por favor, insira sua senha.", "error");
    document.getElementById("cadastro-senha").focus();
    return;
  }

  if (dados_de_cadastro.senha.length < 6) {
    mostrar_mensagem("🔒 A senha deve ter pelo menos 6 caracteres.", "error");
    document.getElementById("cadastro-senha").focus();
    return;
  }

  if (!dados_de_cadastro.senha_confirmacao) {
    mostrar_mensagem("🔑 Por favor, confirme sua senha.", "error");
    document.getElementById("confirm-senha").focus();
    return;
  }

  if (dados_de_cadastro.senha !== dados_de_cadastro.senha_confirmacao) {
    mostrar_mensagem(
      "🔑 As senhas não coincidem. Verifique novamente.",
      "error"
    );
    document.getElementById("confirm-senha").focus();
    return;
  }

  const botao_de_envio = formulario_de_cadastro.querySelector(".btn");
  definir_estado_carregando(botao_de_envio, true);

  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/cadastro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: dados_de_cadastro.nome,
        email: dados_de_cadastro.email,
        telefone: dados_de_cadastro.telefone,
        senha: dados_de_cadastro.senha,
      }),
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mostrar_mensagem(
        "🎉 Cadastro realizado com sucesso! Redirecionando para o login...",
        "success"
      );
      setTimeout(() => {
        trocar_aba("login");
        limpar_formularios();
        mostrar_mensagem(
          "👋 Agora você pode fazer login com suas credenciais!",
          "info"
        );
      }, 2000);
    } else {
      // Mensagens de erro específicas do servidor
      let mensagem_erro = "❌ Erro no cadastro. Tente novamente.";

      if (resultado.mensagem) {
        if (resultado.mensagem.includes("email")) {
          mensagem_erro =
            "📧 Este email já está cadastrado. Tente fazer login ou use outro email.";
        } else if (resultado.mensagem.includes("telefone")) {
          mensagem_erro = "📞 Este telefone já está cadastrado.";
        } else {
          mensagem_erro = `❌ ${resultado.mensagem}`;
        }
      }

      mostrar_mensagem(mensagem_erro, "error");
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    mostrar_mensagem(
      "🌐 Erro de conexão. Verifique sua internet e tente novamente.",
      "error"
    );
  } finally {
    definir_estado_carregando(botao_de_envio, false);
  }
}

// Mostrar dashboard após login bem-sucedido
function mostrar_painel_usuario(dados_usuario = null) {
  container_principal.style.display = "none";
  painel_do_usuario.classList.remove("hidden");

  // Se não tem dados do usuário, tenta obter do token
  if (!dados_usuario) {
    const token = obter_token_valido();
    if (token) {
      dados_usuario = obter_dados_token(token);
    }
  }

  // Preenche o nome do usuário no header
  const nome_usuario = dados_usuario?.nome || "Usuário";
  document.getElementById("user-name").textContent = nome_usuario;

  // Preenche o nome no formulário de agendamento
  document.getElementById("cliente-nome").value = nome_usuario;

  // Configura as abas do dashboard
  configurar_abas_dashboard();

  // Configura o formulário de agendamento
  configurar_formulario_agendamento();

  // Configura a listagem de agendamentos
  configurar_listagem_agendamentos();

  // Configura botão de extensão de sessão usuário
  document
    .getElementById("estender-sessao-usuario")
    .addEventListener("click", estender_sessao);

  // Define data mínima para hoje
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("data-agendamento").setAttribute("min", hoje);

  // Carrega agendamentos iniciais
  carregar_agendamentos();

  // Carrega serviços disponíveis no select
  carregar_servicos_publicos();

  // Inicia contador de sessão
  iniciar_contador_sessao();

  // Atualiza indicador inicial
  const tempo_restante = obter_tempo_restante_sessao();
  if (tempo_restante > 0) {
    atualizar_indicador_sessao(tempo_restante);
  }
}

// Gerenciamento de mensagens
function mostrar_mensagem(texto, tipo = "info", duracao = 5000) {
  // Adiciona ícones baseados no tipo
  const icones = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const icone = icones[tipo] || icones.info;
  const textoComIcone = `${icone} ${texto}`;

  div_da_mensagem.textContent = textoComIcone;
  div_da_mensagem.className = `message ${tipo} show`;

  // Adiciona atributos de acessibilidade
  div_da_mensagem.setAttribute("role", "alert");
  div_da_mensagem.setAttribute(
    "aria-live",
    tipo === "error" ? "assertive" : "polite"
  );

  // Auto-hide baseado na duração especificada
  setTimeout(() => {
    esconder_mensagem();
  }, duracao);
}

function esconder_mensagem() {
  div_da_mensagem.classList.remove("show");
  setTimeout(() => {
    div_da_mensagem.className = "message";
  }, 300);
}

// Estado de loading dos botões
function definir_estado_carregando(botao, esta_carregando) {
  if (esta_carregando) {
    botao.disabled = true;
    botao.classList.add("loading");
    botao.setAttribute("data-texto-original", botao.textContent);
    botao.textContent = "";
  } else {
    botao.disabled = false;
    botao.classList.remove("loading");
    botao.textContent =
      botao.getAttribute("data-texto-original") || botao.textContent;
  }
}

// Limpar formulários
function limpar_formularios() {
  formulario_de_login.reset();
  formulario_de_cadastro.reset();
  formulario_admin.reset();
}

// Processador do login do admin
async function processar_login_admin(evento) {
  evento.preventDefault();

  // Captura dados usando closure para isolamento
  const obter_credenciais_admin = () => {
    const form = new FormData(formulario_admin);
    return {
      e: form.get("email")?.trim() || "",
      s: form.get("senha") || "",
    };
  };

  const { e: email, s: senha } = obter_credenciais_admin();

  // Validação básica - apenas verifica se estão preenchidos
  if (!email || !senha) {
    mostrar_mensagem(
      "👑 Por favor, preencha email e senha de administrador.",
      "error"
    );

    // Foca no primeiro campo vazio
    if (!email) {
      document.getElementById("admin-email").focus();
    } else if (!senha) {
      document.getElementById("admin-senha").focus();
    }
    return;
  }

  // Validação adicional de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrar_mensagem("📧 Por favor, insira um email válido.", "error");
    document.getElementById("admin-email").focus();
    return;
  }

  const botao_de_envio = formulario_admin.querySelector(".btn");
  definir_estado_carregando(botao_de_envio, true);

  // Limpa o formulário imediatamente
  formulario_admin.reset();

  try {
    // Cria payload temporário
    const payload_admin = { email, senha };

    const resposta = await fetch(`${URL_BASE_DA_API}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload_admin),
    });

    // Limpa payload imediatamente
    limpar_dados_sensíveis(payload_admin);

    const resultado = await resposta.json();

    if (resposta.ok) {
      // Salva a sessão do admin
      salvar_sessao_admin(resultado.admin);

      mostrar_mensagem(
        "✅ Login de admin realizado com sucesso! 👑",
        "success"
      );
      setTimeout(() => {
        mostrar_painel_admin(resultado.admin);
      }, 1000);
    } else {
      mostrar_mensagem(
        resultado.mensagem ||
          "❌ Credenciais de admin inválidas. Tente novamente.",
        "error"
      );
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    mostrar_mensagem(
      "🌐 Erro de conexão. Verifique sua internet e tente novamente.",
      "error"
    );
  } finally {
    // Força limpeza adicional
    if (typeof window.gc === "function") {
      window.gc();
    }
    definir_estado_carregando(botao_de_envio, false);
  }
}

// Validação em tempo real
document.addEventListener("DOMContentLoaded", function () {
  // Validação de confirmação de senha
  const input_senha = document.getElementById("cadastro-senha");
  const input_confirmar_senha = document.getElementById("confirm-senha");

  function validar_senhas() {
    if (
      input_confirmar_senha.value &&
      input_senha.value !== input_confirmar_senha.value
    ) {
      input_confirmar_senha.setCustomValidity("As senhas não coincidem");
    } else {
      input_confirmar_senha.setCustomValidity("");
    }
  }

  input_senha.addEventListener("input", validar_senhas);
  input_confirmar_senha.addEventListener("input", validar_senhas);
});

// Verificar se a API está disponível
async function verificar_status_da_api() {
  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/`, {
      method: "GET",
    });

    if (!resposta.ok) {
      throw new Error("API não está respondendo");
    }
  } catch (erro) {
    console.warn("API não está disponível:", erro.message);
    mostrar_mensagem(
      '⚠️ API não está rodando. Execute "py app.py" no terminal.',
      "error"
    );
  }
}

// Verificar status da API ao carregar a página
window.addEventListener("load", () => {
  setTimeout(verificar_status_da_api, 1000);
});

// === SISTEMA DE AGENDAMENTOS ===

// Configurar abas do dashboard
function configurar_abas_dashboard() {
  const botoes_dashboard = document.querySelectorAll(".dashboard-tab-btn");
  const conteudos_dashboard = document.querySelectorAll(
    ".dashboard-tab-content"
  );

  botoes_dashboard.forEach((botao) => {
    botao.addEventListener("click", () => {
      const aba_alvo = botao.getAttribute("data-dashboard-tab");

      // Remove active de todas as abas
      botoes_dashboard.forEach((btn) => btn.classList.remove("active"));
      conteudos_dashboard.forEach((content) =>
        content.classList.remove("active")
      );

      // Adiciona active na aba selecionada
      botao.classList.add("active");
      document.getElementById(aba_alvo).classList.add("active");

      // Se for a aba de agendamentos, recarrega a lista
      if (aba_alvo === "meus-agendamentos") {
        carregar_agendamentos();
      }
    });
  });
}

// Configurar formulário de agendamento
function configurar_formulario_agendamento() {
  const formulario_agendamento = document.getElementById("agendamentoForm");
  const input_data = document.getElementById("data-agendamento");

  formulario_agendamento.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await processar_agendamento();
  });

  // Quando a data mudar, carregar horários disponíveis
  input_data.addEventListener("change", async () => {
    const data_selecionada = input_data.value;
    if (data_selecionada) {
      await carregar_horarios_disponiveis(data_selecionada);
    }
  });
}

// Configurar botões da listagem
function configurar_listagem_agendamentos() {
  const botao_refresh = document.getElementById("refresh-agendamentos");

  botao_refresh.addEventListener("click", () => {
    carregar_agendamentos();
  });
}

// Processar novo agendamento
async function processar_agendamento() {
  const formulario = document.getElementById("agendamentoForm");
  const dados_formulario = new FormData(formulario);

  // Obter dados do usuário do token
  const token = obter_token_valido();
  if (!token) {
    mostrar_mensagem_dashboard(
      "Sessão expirada. Faça login novamente.",
      "error"
    );
    return;
  }

  const dados_usuario = obter_dados_token(token);
  const dados_agendamento = {
    nome_do_cliente:
      dados_usuario?.nome || dados_formulario.get("nome_do_cliente"),
    tipo_de_servico: dados_formulario.get("tipo_de_servico"),
    data_e_hora: `${dados_formulario.get("data")} ${dados_formulario.get(
      "hora"
    )}`,
  };

  // Validações
  if (!dados_agendamento.tipo_de_servico) {
    mostrar_mensagem_dashboard("Por favor, escolha um serviço.", "error");
    return;
  }

  if (!dados_formulario.get("data")) {
    mostrar_mensagem_dashboard("Por favor, escolha uma data.", "error");
    return;
  }

  if (!dados_formulario.get("hora")) {
    mostrar_mensagem_dashboard("Por favor, escolha um horário.", "error");
    return;
  }

  const botao_envio = formulario.querySelector(".btn");
  definir_estado_carregando(botao_envio, true);

  try {
    const resposta = await requisicao_autenticada(
      `${URL_BASE_DA_API}/agendamento`,
      {
        method: "POST",
        body: JSON.stringify(dados_agendamento),
      }
    );

    if (!resposta) return; // Erro de autenticação já tratado

    const resultado = await resposta.json();

    if (resposta.ok) {
      mostrar_mensagem_dashboard(
        "✅ Agendamento realizado com sucesso!",
        "success"
      );
      formulario.reset();

      // Preenche novamente o nome do cliente
      document.getElementById("cliente-nome").value =
        dados_agendamento.nome_do_cliente;

      // Limpa o select de horários para forçar nova seleção de data
      document.getElementById("hora-agendamento").innerHTML =
        '<option value="">Primeiro escolha uma data</option>';

      // Atualiza a lista de agendamentos
      setTimeout(() => {
        carregar_agendamentos();
      }, 1000);
    } else {
      // Se for erro 409 (conflito), recarrega os horários disponíveis
      if (resposta.status === 409) {
        const data_selecionada = dados_formulario.get("data");
        if (data_selecionada) {
          carregar_horarios_disponiveis(data_selecionada);
        }
      }

      mostrar_mensagem_dashboard(
        resultado.message ||
          resultado.mensagem ||
          "Erro ao criar agendamento. Tente novamente.",
        "error"
      );
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    mostrar_mensagem_dashboard(
      "Erro de conexão. Verifique se a API está rodando.",
      "error"
    );
  } finally {
    definir_estado_carregando(botao_envio, false);
  }
}

// Carregar lista de agendamentos
async function carregar_agendamentos() {
  const lista_container = document.getElementById("agendamentos-lista");

  // Mostra loading
  lista_container.innerHTML =
    '<div class="loading">Carregando agendamentos...</div>';

  try {
    const resposta = await requisicao_autenticada(
      `${URL_BASE_DA_API}/agendamento`,
      {
        method: "GET",
      }
    );

    if (!resposta) return; // Erro de autenticação já tratado

    const agendamentos = await resposta.json();

    if (resposta.ok) {
      exibir_agendamentos(agendamentos);
    } else {
      lista_container.innerHTML = `
        <div class="agendamentos-vazio">
          <div class="emoji">⚠️</div>
          <p>Erro ao carregar agendamentos.</p>
        </div>
      `;
    }
  } catch (erro) {
    console.error("Erro ao carregar agendamentos:", erro);
    lista_container.innerHTML = `
      <div class="agendamentos-vazio">
        <div class="emoji">📵</div>
        <p>Erro de conexão.</p>
      </div>
    `;
  }
}

// Exibir agendamentos na lista
function exibir_agendamentos(agendamentos) {
  const lista_container = document.getElementById("agendamentos-lista");

  if (!agendamentos || agendamentos.length === 0) {
    lista_container.innerHTML = `
      <div class="agendamentos-vazio">
        <div class="emoji">📅</div>
        <p>Nenhum agendamento encontrado.</p>
        <p>Que tal criar seu primeiro agendamento?</p>
      </div>
    `;
    return;
  }

  const html_agendamentos = agendamentos
    .map((agendamento) => {
      const data_formatada = formatarDataHora(agendamento.data_hora);

      return `
      <div class="agendamento-item">
        <div class="agendamento-info">
          <div class="agendamento-servico">${agendamento.servico}</div>
          <div class="agendamento-data">📅 ${data_formatada}</div>
          <div class="agendamento-id">ID: #${agendamento.id}</div>
          <span class="agendamento-status status-confirmado">✅ Confirmado</span>
          <button class="btn btn-small btn-cancelar" data-id="${agendamento.id}">❌ Cancelar</button>
        </div>
      </div>
    `;
    })
    .join("");

  lista_container.innerHTML = html_agendamentos;

  // Adiciona event listeners para os botões de cancelar
  const botoes_cancelar = lista_container.querySelectorAll(".btn-cancelar");
  botoes_cancelar.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id_agendamento = botao.getAttribute("data-id");
      await cancelar_agendamento(id_agendamento);
    });
  });
}

// Formatar data e hora para exibição
function formatarDataHora(dataHora) {
  try {
    const data = new Date(dataHora);
    const opcoes = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return data.toLocaleDateString("pt-BR", opcoes);
  } catch (erro) {
    return dataHora; // Retorna o valor original se não conseguir formatar
  }
}

// Mostrar mensagens específicas do dashboard
function mostrar_mensagem_dashboard(texto, tipo = "info", duracao = 4000) {
  const div_mensagem = document.getElementById("dashboard-message");

  const icones = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const icone = icones[tipo] || icones.info;
  const textoComIcone = `${icone} ${texto}`;

  div_mensagem.textContent = textoComIcone;
  div_mensagem.className = `message ${tipo} show`;

  // Adiciona atributos de acessibilidade
  div_mensagem.setAttribute("role", "alert");
  div_mensagem.setAttribute(
    "aria-live",
    tipo === "error" ? "assertive" : "polite"
  );

  // Auto-hide após duração especificada
  setTimeout(() => {
    div_mensagem.classList.remove("show");
    setTimeout(() => {
      div_mensagem.className = "message";
    }, 300);
  }, duracao);
}

// Cancelar agendamento
async function cancelar_agendamento(id_agendamento) {
  mostrar_confirmacao(
    "🗑️ Cancelar Agendamento",
    "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.",
    async (confirmado) => {
      if (!confirmado) return;

      try {
        const resposta = await requisicao_autenticada(
          `${URL_BASE_DA_API}/agendamento/${id_agendamento}`,
          {
            method: "DELETE",
          }
        );

        if (!resposta) return; // Erro de autenticação já tratado

        const resultado = await resposta.json();

        if (resposta.ok) {
          mostrar_mensagem_dashboard(
            "✅ Agendamento cancelado com sucesso!",
            "success"
          );

          // Recarrega a lista de agendamentos
          setTimeout(() => {
            carregar_agendamentos();

            // Se há uma data selecionada, recarrega os horários disponíveis
            const data_selecionada =
              document.getElementById("data-agendamento").value;
            if (data_selecionada) {
              carregar_horarios_disponiveis(data_selecionada);
            }
          }, 1000);
        } else {
          mostrar_mensagem_dashboard(
            resultado.message ||
              resultado.mensagem ||
              "Erro ao cancelar agendamento.",
            "error"
          );
        }
      } catch (erro) {
        console.error("Erro ao cancelar agendamento:", erro);
        mostrar_mensagem_dashboard(
          "Erro de conexão. Verifique se a API está rodando.",
          "error"
        );
      }
    }
  );
}

// Carregar horários disponíveis para uma data específica
async function carregar_horarios_disponiveis(data_selecionada) {
  const select_horario = document.getElementById("hora-agendamento");

  // Mostra loading no select
  select_horario.innerHTML = '<option value="">Carregando horários...</option>';
  select_horario.disabled = true;

  try {
    const resposta = await fetch(
      `${URL_BASE_DA_API}/horarios-disponiveis?data=${data_selecionada}`,
      {
        method: "GET",
      }
    );

    const resultado = await resposta.json();

    if (resposta.ok) {
      atualizar_select_horarios(
        resultado.horarios_disponiveis,
        resultado.horarios_ocupados
      );
    } else {
      select_horario.innerHTML =
        '<option value="">Erro ao carregar horários</option>';
      mostrar_mensagem_dashboard(
        "Erro ao carregar horários disponíveis.",
        "error"
      );
    }
  } catch (erro) {
    console.error("Erro ao carregar horários:", erro);
    select_horario.innerHTML = '<option value="">Erro de conexão</option>';
    mostrar_mensagem_dashboard(
      "Erro de conexão ao carregar horários.",
      "error"
    );
  } finally {
    select_horario.disabled = false;
  }
}

// Atualizar o select de horários com os disponíveis
function atualizar_select_horarios(horarios_disponiveis, horarios_ocupados) {
  const select_horario = document.getElementById("hora-agendamento");

  if (horarios_disponiveis.length === 0) {
    select_horario.innerHTML = `
      <option value="">Nenhum horário disponível</option>
      <option value="" disabled>Todos os horários estão ocupados 😔</option>
    `;
    return;
  }

  // Limpa o select e adiciona opção padrão
  select_horario.innerHTML = '<option value="">Escolha um horário...</option>';

  // Adiciona horários disponíveis
  horarios_disponiveis.forEach((horario) => {
    const option = document.createElement("option");
    option.value = horario;
    option.textContent = `${horario} ✅ Disponível`;
    select_horario.appendChild(option);
  });

  // Se houver horários ocupados, mostrar informação
  if (horarios_ocupados.length > 0) {
    const option_info = document.createElement("option");
    option_info.value = "";
    option_info.disabled = true;
    option_info.textContent = `⚠️ ${horarios_ocupados.length} horário(s) já ocupado(s)`;
    select_horario.appendChild(option_info);
  }

  mostrar_mensagem_dashboard(
    `✅ ${horarios_disponiveis.length} horário(s) disponível(is) para esta data!`,
    "success"
  );
}

// === FUNCIONALIDADES DO ADMIN ===

// Mostrar painel do admin
function mostrar_painel_admin(dados_admin) {
  container_principal.style.display = "none";
  painel_admin.classList.remove("hidden");

  // Preenche o nome do admin
  document.getElementById("admin-name").textContent = dados_admin.nome;

  // Configura as abas do dashboard admin
  configurar_abas_admin();

  // Configura funcionalidades do admin
  configurar_admin_funcionalidades();

  // Carrega dados iniciais
  carregar_estatisticas_admin();

  // Configura botão de extensão de sessão admin
  document
    .getElementById("estender-sessao-admin")
    .addEventListener("click", estender_sessao);

  // Inicia contador de sessão
  iniciar_contador_sessao();

  // Atualiza indicador inicial
  const tempo_restante = obter_tempo_restante_sessao();
  if (tempo_restante > 0) {
    atualizar_indicador_sessao(tempo_restante);
  }
}

// Configurar abas do dashboard admin
function configurar_abas_admin() {
  const botoes_admin = document.querySelectorAll(
    ".admin-dashboard .dashboard-tab-btn"
  );
  const conteudos_admin = document.querySelectorAll(
    ".admin-dashboard .dashboard-tab-content"
  );

  botoes_admin.forEach((botao) => {
    botao.addEventListener("click", () => {
      const aba_alvo = botao.getAttribute("data-dashboard-tab");

      // Remove active de todas as abas
      botoes_admin.forEach((btn) => btn.classList.remove("active"));
      conteudos_admin.forEach((content) => content.classList.remove("active"));

      // Adiciona active na aba selecionada
      botao.classList.add("active");
      document.getElementById(aba_alvo).classList.add("active");

      // Carrega dados conforme a aba
      switch (aba_alvo) {
        case "admin-estatisticas":
          carregar_estatisticas_admin();
          break;
        case "admin-agendamentos":
          carregar_agendamentos_admin();
          break;
        case "admin-usuarios":
          carregar_usuarios_admin();
          break;
        case "admin-precos":
          carregar_servicos_admin();
          break;
      }
    });
  });
}

// Configurar funcionalidades específicas do admin
function configurar_admin_funcionalidades() {
  // Botão de refresh agendamentos
  document
    .getElementById("refresh-admin-agendamentos")
    .addEventListener("click", carregar_agendamentos_admin);

  // Botão de refresh usuários
  document
    .getElementById("refresh-usuarios")
    .addEventListener("click", carregar_usuarios_admin);

  // Formulário de criar admin
  document
    .getElementById("criar-admin-form")
    .addEventListener("submit", criar_novo_admin);

  // Funcionalidades de preços
  document
    .getElementById("refresh-precos")
    .addEventListener("click", carregar_servicos_admin);
  document
    .getElementById("novo-servico-form")
    .addEventListener("submit", criar_novo_servico);

  // Modal de edição
  configurar_modal_edicao();
}

// Carregar estatísticas do admin
async function carregar_estatisticas_admin() {
  try {
    // Carrega usuários e agendamentos
    const [resposta_usuarios, resposta_agendamentos] = await Promise.all([
      fetch(`${URL_BASE_DA_API}/admin/usuarios`),
      fetch(`${URL_BASE_DA_API}/agendamento`),
    ]);

    const usuarios = await resposta_usuarios.json();
    const agendamentos = await resposta_agendamentos.json();

    if (resposta_usuarios.ok && resposta_agendamentos.ok) {
      // Atualiza cards de estatísticas
      document.getElementById("total-usuarios").textContent =
        usuarios.total || usuarios.length || 0;
      document.getElementById("total-agendamentos").textContent =
        agendamentos.length || 0;

      // Calcula agendamentos de hoje
      const hoje = new Date().toISOString().split("T")[0];
      const agendamentos_hoje = agendamentos.filter(
        (ag) => ag.data_hora && ag.data_hora.startsWith(hoje)
      ).length;
      document.getElementById("agendamentos-hoje").textContent =
        agendamentos_hoje;

      // Calcula receita estimada
      const precos = {
        "Corte Masculino": 25,
        "Corte Feminino": 35,
        Barba: 20,
        "Corte + Barba": 40,
        Bigode: 15,
        Escova: 30,
        Hidratação: 45,
        "Corte + Barba + Bigode": 50,
      };

      const receita = agendamentos.reduce((total, ag) => {
        return total + (precos[ag.servico] || 0);
      }, 0);

      document.getElementById(
        "receita-estimada"
      ).textContent = `R$ ${receita.toFixed(2)}`;

      // Conta serviços populares
      const servicosCount = {};
      agendamentos.forEach((ag) => {
        if (ag.servico) {
          servicosCount[ag.servico] = (servicosCount[ag.servico] || 0) + 1;
        }
      });

      const servicos_populares = Object.entries(servicosCount)
        .map(([servico, quantidade]) => ({ servico, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      exibir_servicos_populares(servicos_populares);
    } else {
      mostrar_mensagem_admin("Erro ao carregar estatísticas.", "error");
    }
  } catch (erro) {
    console.error("Erro ao carregar estatísticas:", erro);
    mostrar_mensagem_admin(
      "Erro de conexão ao carregar estatísticas.",
      "error"
    );
  }
}

// Exibir gráfico de serviços populares
function exibir_servicos_populares(servicos) {
  const container = document.getElementById("servicos-chart");

  if (!servicos || servicos.length === 0) {
    container.innerHTML =
      '<div class="chart-empty">📊 Nenhum dado disponível</div>';
    return;
  }

  const html = servicos
    .map(
      (servico) => `
    <div class="service-bar">
      <span class="service-name">${servico.servico}</span>
      <span class="service-count">${servico.quantidade}</span>
    </div>
  `
    )
    .join("");

  container.innerHTML = html;
}

// Carregar agendamentos para admin
async function carregar_agendamentos_admin() {
  const container = document.getElementById("admin-agendamentos-lista");
  container.innerHTML = '<div class="loading">Carregando agendamentos...</div>';

  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/agendamento`);
    const agendamentos = await resposta.json();

    if (resposta.ok) {
      exibir_agendamentos_admin(agendamentos);
    } else {
      container.innerHTML =
        '<div class="admin-error">❌ Erro ao carregar agendamentos</div>';
    }
  } catch (erro) {
    console.error("Erro ao carregar agendamentos admin:", erro);
    container.innerHTML = '<div class="admin-error">📵 Erro de conexão</div>';
  }
}

// Exibir agendamentos para admin
function exibir_agendamentos_admin(agendamentos) {
  const container = document.getElementById("admin-agendamentos-lista");

  if (!agendamentos || agendamentos.length === 0) {
    container.innerHTML =
      '<div class="admin-empty">📅 Nenhum agendamento encontrado</div>';
    return;
  }

  const html = agendamentos
    .map((agendamento) => {
      const data_formatada = formatarDataHora(agendamento.data_hora);
      return `
      <div class="admin-item">
        <div class="admin-item-header">
          <span class="admin-item-title">${agendamento.servico}</span>
          <span class="admin-item-id">#${agendamento.id}</span>
        </div>
        <div class="admin-item-info">👤 Cliente: ${agendamento.cliente}</div>
        <div class="admin-item-info">📅 Data/Hora: ${data_formatada}</div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = html;
}

// Carregar usuários para admin
async function carregar_usuarios_admin() {
  const container = document.getElementById("admin-usuarios-lista");
  container.innerHTML = '<div class="loading">Carregando usuários...</div>';

  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/admin/usuarios`);
    const resultado = await resposta.json();

    if (resposta.ok) {
      const usuarios_lista = resultado.usuarios || resultado;
      exibir_usuarios_admin(usuarios_lista);
    } else {
      container.innerHTML =
        '<div class="admin-error">❌ Erro ao carregar usuários</div>';
    }
  } catch (erro) {
    console.error("Erro ao carregar usuários admin:", erro);
    container.innerHTML = '<div class="admin-error">📵 Erro de conexão</div>';
  }
}

// Exibir usuários para admin
function exibir_usuarios_admin(usuarios) {
  const container = document.getElementById("admin-usuarios-lista");

  if (!usuarios || usuarios.length === 0) {
    container.innerHTML =
      '<div class="admin-empty">👥 Nenhum usuário encontrado</div>';
    return;
  }

  const html = usuarios
    .map(
      (usuario) => `
    <div class="admin-item">
      <div class="admin-item-header">
        <span class="admin-item-title">${usuario.nome}</span>
        <span class="admin-item-id">#${usuario.id}</span>
      </div>
      <div class="admin-item-info">📧 Email: ${usuario.email}</div>
      <div class="admin-item-info">📞 Telefone: ${usuario.telefone}</div>
    </div>
  `
    )
    .join("");

  container.innerHTML = html;
}

// Criar novo admin
async function criar_novo_admin(evento) {
  evento.preventDefault();

  const formulario = document.getElementById("criar-admin-form");
  const dados_formulario = new FormData(formulario);

  const dados_admin = {
    nome: dados_formulario.get("nome")?.trim(),
    email: dados_formulario.get("email")?.trim().toLowerCase(),
    senha: dados_formulario.get("senha"),
  };

  // === VALIDAÇÕES DETALHADAS ===

  // Validação do nome
  if (!dados_admin.nome) {
    mostrar_mensagem_admin("👤 Nome do administrador é obrigatório.", "error");
    document.getElementById("novo-admin-nome").focus();
    return;
  }

  if (dados_admin.nome.length < 2) {
    mostrar_mensagem_admin(
      "👤 Nome deve ter pelo menos 2 caracteres.",
      "error"
    );
    document.getElementById("novo-admin-nome").focus();
    return;
  }

  if (dados_admin.nome.length > 50) {
    mostrar_mensagem_admin(
      "👤 Nome deve ter no máximo 50 caracteres.",
      "error"
    );
    document.getElementById("novo-admin-nome").focus();
    return;
  }

  // Validação se nome contém apenas letras e espaços
  const nomeRegex = /^[a-zA-ZàáâãäéêëíìîïóôõöúùûüçñÀÁÂÃÄÉÊËÍÌÎÏÓÔÕÖÚÙÛÜÇÑ\s]+$/;
  if (!nomeRegex.test(dados_admin.nome)) {
    mostrar_mensagem_admin(
      "👤 Nome deve conter apenas letras e espaços.",
      "error"
    );
    document.getElementById("novo-admin-nome").focus();
    return;
  }

  // Validação do email
  if (!dados_admin.email) {
    mostrar_mensagem_admin("📧 Email do administrador é obrigatório.", "error");
    document.getElementById("novo-admin-email").focus();
    return;
  }

  // Validação de formato de email mais robusta
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(dados_admin.email)) {
    mostrar_mensagem_admin(
      "📧 Por favor, insira um email válido (exemplo: admin@barbearia.com).",
      "error"
    );
    document.getElementById("novo-admin-email").focus();
    return;
  }

  // Validação se é um email empresarial (opcional, mas recomendado para admin)
  const dominiosPublicos = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
  ];
  const dominio = dados_admin.email.split("@")[1];
  if (dominiosPublicos.includes(dominio)) {
    mostrar_confirmacao(
      "⚠️ Email Público Detectado",
      `Você está usando um email público (${dominio}). Para segurança, recomenda-se usar um email empresarial. Deseja continuar mesmo assim?`,
      async (confirmado) => {
        if (confirmado) {
          await processar_cadastro_admin(formulario, dados_admin);
        }
      }
    );
    return;
  }

  // Validação da senha
  if (!dados_admin.senha) {
    mostrar_mensagem_admin("🔒 Senha do administrador é obrigatória.", "error");
    document.getElementById("novo-admin-senha").focus();
    return;
  }

  if (dados_admin.senha.length < 8) {
    mostrar_mensagem_admin(
      "🔒 Senha deve ter pelo menos 8 caracteres para maior segurança.",
      "error"
    );
    document.getElementById("novo-admin-senha").focus();
    return;
  }

  if (dados_admin.senha.length > 128) {
    mostrar_mensagem_admin(
      "🔒 Senha deve ter no máximo 128 caracteres.",
      "error"
    );
    document.getElementById("novo-admin-senha").focus();
    return;
  }

  // Validação de força da senha
  const senhaForte =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!senhaForte.test(dados_admin.senha)) {
    mostrar_confirmacao(
      "🔐 Senha Fraca Detectada",
      "Para maior segurança, recomenda-se uma senha com: letra minúscula, maiúscula, número e símbolo. Deseja continuar com esta senha?",
      async (confirmado) => {
        if (confirmado) {
          await processar_cadastro_admin(formulario, dados_admin);
        } else {
          document.getElementById("novo-admin-senha").focus();
        }
      }
    );
    return;
  }

  // Se passou em todas as validações, processa o cadastro
  await processar_cadastro_admin(formulario, dados_admin);
}

// Função separada para processar o cadastro de admin
async function processar_cadastro_admin(formulario, dados_admin) {
  const botao_envio = formulario.querySelector(".btn");
  definir_estado_carregando(botao_envio, true);

  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados_admin),
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mostrar_mensagem_admin(
        "✅ Novo administrador criado com sucesso!",
        "success",
        6000
      );
      formulario.reset();

      // Feedback adicional
      setTimeout(() => {
        mostrar_mensagem_admin(
          "👑 O novo admin já pode fazer login no sistema.",
          "info",
          4000
        );
      }, 2000);
    } else {
      // Mensagens de erro específicas do servidor
      let mensagem_erro = "❌ Erro ao criar administrador.";

      if (resultado.mensagem) {
        if (resultado.mensagem.includes("email")) {
          mensagem_erro =
            "📧 Este email já está cadastrado como administrador.";
        } else if (resultado.mensagem.includes("Nome")) {
          mensagem_erro = "👤 Erro no nome fornecido.";
        } else if (resultado.mensagem.includes("Senha")) {
          mensagem_erro = "🔒 Erro na senha fornecida.";
        } else {
          mensagem_erro = `❌ ${resultado.mensagem}`;
        }
      }

      mostrar_mensagem_admin(mensagem_erro, "error");
    }
  } catch (erro) {
    console.error("Erro ao criar admin:", erro);
    mostrar_mensagem_admin(
      "🌐 Erro de conexão. Verifique sua internet e tente novamente.",
      "error"
    );
  } finally {
    definir_estado_carregando(botao_envio, false);
  }
}

// Mostrar mensagens para admin
function mostrar_mensagem_admin(texto, tipo = "info", duracao = 4000) {
  const div_mensagem = document.getElementById("admin-dashboard-message");

  const icones = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const icone = icones[tipo] || icones.info;
  const textoComIcone = `${icone} ${texto}`;

  div_mensagem.textContent = textoComIcone;
  div_mensagem.className = `message ${tipo} show`;

  // Adiciona atributos de acessibilidade
  div_mensagem.setAttribute("role", "alert");
  div_mensagem.setAttribute(
    "aria-live",
    tipo === "error" ? "assertive" : "polite"
  );

  setTimeout(() => {
    div_mensagem.classList.remove("show");
    setTimeout(() => {
      div_mensagem.className = "message";
    }, 300);
  }, duracao);
}

// === FUNCIONALIDADES DE GERENCIAMENTO DE PREÇOS ===

// Carregar serviços para admin
async function carregar_servicos_admin() {
  const container = document.getElementById("servicos-lista");
  container.innerHTML = '<div class="loading">Carregando serviços...</div>';

  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/admin/servicos`);
    const resultado = await resposta.json();

    if (resposta.ok) {
      exibir_servicos_admin(resultado.servicos);
    } else {
      container.innerHTML =
        '<div class="admin-error">❌ Erro ao carregar serviços</div>';
    }
  } catch (erro) {
    console.error("Erro ao carregar serviços admin:", erro);
    container.innerHTML = '<div class="admin-error">📵 Erro de conexão</div>';
  }
}

// Exibir serviços para admin
function exibir_servicos_admin(servicos) {
  const container = document.getElementById("servicos-lista");

  if (!servicos || servicos.length === 0) {
    container.innerHTML =
      '<div class="admin-empty">💰 Nenhum serviço encontrado</div>';
    return;
  }

  const html = servicos
    .map((servico) => {
      const statusClass = servico.ativo ? "ativo" : "inativo";
      const statusText = servico.ativo ? "✅ Ativo" : "❌ Inativo";
      const toggleText = servico.ativo ? "❌ Desativar" : "✅ Ativar";

      return `
      <div class="servico-item ${statusClass}" data-id="${servico.id}">
        <div class="servico-header">
          <span class="servico-nome">${servico.emoji} ${servico.nome}</span>
          <span class="servico-preco">R$ ${servico.preco.toFixed(2)}</span>
        </div>
        <div class="servico-info">
          <span class="servico-status status-${statusClass}">${statusText}</span>
        </div>
        <div class="servico-actions">
          <button class="btn-edit" data-id="${servico.id}">✏️ Editar</button>
          <button class="btn-toggle ${statusClass}" data-id="${
        servico.id
      }" data-ativo="${servico.ativo}">
            ${toggleText}
          </button>
          <button class="btn-delete" data-id="${servico.id}">🗑️ Excluir</button>
        </div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = html;

  // Adiciona event listeners
  adicionar_listeners_servicos();
}

// Adicionar event listeners para ações dos serviços
function adicionar_listeners_servicos() {
  // Botões de editar
  document.querySelectorAll(".btn-edit").forEach((botao) => {
    botao.addEventListener("click", () => {
      const servicoId = botao.getAttribute("data-id");
      abrir_modal_edicao(servicoId);
    });
  });

  // Botões de toggle (ativar/desativar)
  document.querySelectorAll(".btn-toggle").forEach((botao) => {
    botao.addEventListener("click", () => {
      const servicoId = botao.getAttribute("data-id");
      const ativo = botao.getAttribute("data-ativo") === "true";
      toggle_servico(servicoId, !ativo);
    });
  });

  // Botões de excluir
  document.querySelectorAll(".btn-delete").forEach((botao) => {
    botao.addEventListener("click", () => {
      const servicoId = botao.getAttribute("data-id");
      excluir_servico(servicoId);
    });
  });
}

// Criar novo serviço
async function criar_novo_servico(evento) {
  evento.preventDefault();

  const formulario = document.getElementById("novo-servico-form");
  const dados_formulario = new FormData(formulario);

  const dados_servico = {
    nome: dados_formulario.get("nome"),
    preco: parseFloat(dados_formulario.get("preco")),
    emoji: dados_formulario.get("emoji") || "🔧",
  };

  const botao_envio = formulario.querySelector(".btn");
  definir_estado_carregando(botao_envio, true);

  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/admin/servicos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados_servico),
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mostrar_mensagem_admin("✅ Serviço criado com sucesso!", "success");
      formulario.reset();
      carregar_servicos_admin();

      // Atualiza também o select de serviços no formulário de agendamento
      carregar_servicos_publicos();
    } else {
      mostrar_mensagem_admin(
        resultado.mensagem || "Erro ao criar serviço.",
        "error"
      );
    }
  } catch (erro) {
    console.error("Erro ao criar serviço:", erro);
    mostrar_mensagem_admin("Erro de conexão.", "error");
  } finally {
    definir_estado_carregando(botao_envio, false);
  }
}

// Configurar modal de edição
function configurar_modal_edicao() {
  const modal = document.getElementById("edit-servico-modal");
  const closeBtn = modal.querySelector(".close-modal");
  const cancelBtn = modal.querySelector(".close-modal-btn");
  const form = document.getElementById("edit-servico-form");

  // Fechar modal
  closeBtn.addEventListener("click", fechar_modal_edicao);
  cancelBtn.addEventListener("click", fechar_modal_edicao);

  // Fechar ao clicar fora
  window.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      fechar_modal_edicao();
    }
  });

  // Submeter formulário de edição
  form.addEventListener("submit", salvar_edicao_servico);
}

// Abrir modal de edição
async function abrir_modal_edicao(servicoId) {
  try {
    // Busca dados do serviço
    const resposta = await fetch(`${URL_BASE_DA_API}/admin/servicos`);
    const resultado = await resposta.json();

    if (resposta.ok) {
      const servico = resultado.servicos.find((s) => s.id == servicoId);

      if (servico) {
        document.getElementById("edit-servico-id").value = servico.id;
        document.getElementById("edit-servico-nome").value = servico.nome;
        document.getElementById("edit-servico-preco").value = servico.preco;
        document.getElementById("edit-servico-emoji").value = servico.emoji;

        document.getElementById("edit-servico-modal").style.display = "block";
      }
    }
  } catch (erro) {
    console.error("Erro ao carregar serviço:", erro);
    mostrar_mensagem_admin("Erro ao carregar dados do serviço.", "error");
  }
}

// Fechar modal de edição
function fechar_modal_edicao() {
  document.getElementById("edit-servico-modal").style.display = "none";
  document.getElementById("edit-servico-form").reset();
}

// Salvar edição do serviço
async function salvar_edicao_servico(evento) {
  evento.preventDefault();

  const formulario = document.getElementById("edit-servico-form");
  const dados_formulario = new FormData(formulario);

  const servicoId =
    dados_formulario.get("edit-servico-id") ||
    document.getElementById("edit-servico-id").value;
  const dados_servico = {
    nome: dados_formulario.get("nome"),
    preco: parseFloat(dados_formulario.get("preco")),
    emoji: dados_formulario.get("emoji"),
  };

  const botao_envio = formulario.querySelector(".btn");
  definir_estado_carregando(botao_envio, true);

  try {
    const resposta = await fetch(
      `${URL_BASE_DA_API}/admin/servicos/${servicoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados_servico),
      }
    );

    const resultado = await resposta.json();

    if (resposta.ok) {
      mostrar_mensagem_admin("✅ Serviço atualizado com sucesso!", "success");
      fechar_modal_edicao();
      carregar_servicos_admin();

      // Atualiza também o select de serviços no formulário de agendamento
      carregar_servicos_publicos();
    } else {
      mostrar_mensagem_admin(
        resultado.mensagem || "Erro ao atualizar serviço.",
        "error"
      );
    }
  } catch (erro) {
    console.error("Erro ao atualizar serviço:", erro);
    mostrar_mensagem_admin("Erro de conexão.", "error");
  } finally {
    definir_estado_carregando(botao_envio, false);
  }
}

// Toggle ativo/inativo do serviço
async function toggle_servico(servicoId, novoStatus) {
  try {
    const resposta = await fetch(
      `${URL_BASE_DA_API}/admin/servicos/${servicoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ativo: novoStatus }),
      }
    );

    const resultado = await resposta.json();

    if (resposta.ok) {
      const statusText = novoStatus ? "ativado" : "desativado";
      mostrar_mensagem_admin(
        `✅ Serviço ${statusText} com sucesso!`,
        "success"
      );
      carregar_servicos_admin();

      // Atualiza também o select de serviços no formulário de agendamento
      carregar_servicos_publicos();
    } else {
      mostrar_mensagem_admin(
        resultado.mensagem || "Erro ao alterar status do serviço.",
        "error"
      );
    }
  } catch (erro) {
    console.error("Erro ao alterar status:", erro);
    mostrar_mensagem_admin("Erro de conexão.", "error");
  }
}

// Excluir serviço
async function excluir_servico(servicoId) {
  mostrar_confirmacao(
    "🗑️ Excluir Serviço",
    "Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita e afetará todos os agendamentos relacionados.",
    async (confirmado) => {
      if (!confirmado) return;

      try {
        const resposta = await fetch(
          `${URL_BASE_DA_API}/admin/servicos/${servicoId}`,
          {
            method: "DELETE",
          }
        );

        const resultado = await resposta.json();

        if (resposta.ok) {
          mostrar_mensagem_admin("✅ Serviço excluído com sucesso!", "success");
          carregar_servicos_admin();

          // Atualiza também o select de serviços no formulário de agendamento
          carregar_servicos_publicos();
        } else {
          mostrar_mensagem_admin(
            resultado.mensagem || "Erro ao excluir serviço.",
            "error"
          );
        }
      } catch (erro) {
        console.error("Erro ao excluir serviço:", erro);
        mostrar_mensagem_admin("Erro de conexão.", "error");
      }
    }
  );
}

// Carregar serviços públicos (para o formulário de agendamento)
async function carregar_servicos_publicos() {
  try {
    const resposta = await fetch(`${URL_BASE_DA_API}/servicos`);
    const servicos = await resposta.json();

    if (resposta.ok) {
      atualizar_select_servicos(servicos);
    }
  } catch (erro) {
    console.error("Erro ao carregar serviços públicos:", erro);
  }
}

// Atualizar o select de serviços no formulário de agendamento
function atualizar_select_servicos(servicos) {
  const select = document.getElementById("tipo-servico");

  if (!select) return;

  // Salva a opção atualmente selecionada
  const opcao_atual = select.value;

  // Limpa o select
  select.innerHTML = '<option value="">Escolha um serviço...</option>';

  // Adiciona os serviços ativos
  servicos.forEach((servico) => {
    const option = document.createElement("option");
    option.value = servico.nome;
    option.textContent = servico.nome_completo;
    select.appendChild(option);
  });

  // Restaura a seleção se ainda existir
  if (
    opcao_atual &&
    Array.from(select.options).some((opt) => opt.value === opcao_atual)
  ) {
    select.value = opcao_atual;
  }
}
