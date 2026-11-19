// Exercício 6 - finally com preservação do erro original
// Execute: node 06-finally-preservar-erros.js

const assert = require("node:assert/strict");

async function withResource(fn, options = {}) {
  const handle = { closed: false };

  let resultado;
  let erroPrincipal;

  try {
    resultado = await fn(handle);
  } catch (erro) {
    erroPrincipal = erro;
  } finally {
    try {
      if (options.failCleanup) {
        throw new Error("Falha simulada durante o cleanup.");
      }
      handle.closed = true;
    } catch (erroCleanup) {
      // Se já existe erro principal, anexamos o erro secundário.
      if (erroPrincipal) {
        erroPrincipal.suppressed = [
          ...(erroPrincipal.suppressed || []),
          erroCleanup
        ];
      } else {
        erroPrincipal = erroCleanup;
      }
    }
  }

  if (erroPrincipal) throw erroPrincipal;
  return resultado;
}

async function testar() {
  // Cenário 1: sucesso.
  const valor = await withResource(async (handle) => {
    assert.equal(handle.closed, false);
    return "operação concluída";
  });
  assert.equal(valor, "operação concluída");
  console.log("PASSOU: sucesso e liberação do recurso.");

  // Cenário 2: fn falha, cleanup funciona.
  let erroOriginal;
  try {
    await withResource(async () => {
      throw new Error("Erro principal da operação.");
    });
  } catch (erro) {
    erroOriginal = erro;
  }
  assert.equal(erroOriginal.message, "Erro principal da operação.");
  console.log("PASSOU: erro original preservado quando cleanup funciona.");

  // Cenário 3: fn e cleanup falham.
  try {
    await withResource(async () => {
      throw new Error("Falha principal.");
    }, { failCleanup: true });
    assert.fail("Era esperado um erro.");
  } catch (erro) {
    assert.equal(erro.message, "Falha principal.");
    assert.equal(erro.suppressed.length, 1);
    assert.equal(erro.suppressed[0].message, "Falha simulada durante o cleanup.");
    console.log("PASSOU: erro principal e erro suppressed identificáveis.");
    console.log("Stack principal:\n", erro.stack);
    console.log("Stack cleanup:\n", erro.suppressed[0].stack);
  }
}

testar().catch((erro) => {
  console.error("Falha nos testes:", erro.stack);
  process.exitCode = 1;
});

/*
Explicação:
Um finally sempre executa, mas um throw dentro dele pode substituir o erro
original. Por isso, o exemplo captura separadamente o erro da operação e o
erro de limpeza. Se ambos ocorrerem, o erro principal continua sendo lançado
e o erro do cleanup fica anexado em suppressed, com sua própria stack.
*/
