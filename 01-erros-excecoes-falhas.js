// Exercício 1 - Erros, exceções, rejeições e falhas fatais
// Execute: node 01-erros-excecoes-falhas.js

// 1) Lançamento síncrono: a exceção sobe pela call stack até encontrar catch.
function lancamentoSincrono() {
  try {
    throw new TypeError("Tipo de dado inválido no processamento.");
  } catch (erro) {
    console.error("[SÍNCRONO] Erro capturado:", erro.name, erro.message);
    console.error(erro.stack); // mantém o contexto e a origem
  }
}

// 2) Rejeição assíncrona: a Promise fica rejeitada e o catch trata a rejeição.
async function rejeicaoAssincrona() {
  try {
    await Promise.reject(new Error("A operação assíncrona não foi concluída."));
  } catch (erro) {
    console.error("[PROMISE REJECTION]", erro.message);
    console.error(erro.stack);
  }
}

// 3) Falha fatal simulada: não encerramos o processo real durante o teste.
// process.exitCode sinaliza uma saída malsucedida sem interromper este exemplo.
function falhaFatalSimulada() {
  const erro = new Error("Falha fatal simulada: recurso essencial indisponível.");
  console.error("[FALHA FATAL SIMULADA]", erro.message);
  console.error(erro.stack);
  process.exitCode = 1;
}

async function main() {
  lancamentoSincrono();
  await rejeicaoAssincrona();
  falhaFatalSimulada();
}

main().catch((erro) => {
  console.error("[ERRO NÃO TRATADO EM main]", erro.stack);
  process.exitCode = 1;
});

/*
Texto explicativo (até 200 palavras):
Erro é um objeto, geralmente derivado de Error, que guarda nome, mensagem e stack.
Exceção é o fluxo de controle iniciado por throw; ela se propaga pela pilha até
um catch compatível ou termina como erro não tratado. Promise rejection é a
rejeição de uma operação assíncrona: ela se propaga pela cadeia de Promises e
deve ser tratada com catch ou try/await/catch. Falha fatal é uma condição que
impede a continuidade confiável do processo, como OOM ou encerramento explícito;
pode terminar o Node sem permitir tratamento normal. No exemplo, a falha fatal
é simulada para não matar o terminal. Em aplicações reais, registre stack e
contexto, mas não esconda a falha: depois do log, propague-a ou defina uma
saída malsucedida quando apropriado.
*/
