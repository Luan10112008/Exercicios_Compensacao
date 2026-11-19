// Exercício 2 - Silent failures assíncronas
// Execute: node 02-silent-failures.js

const assert = require("node:assert/strict");

const banco = {
  async buscarUsuario(id) {
    if (id !== 7) throw new Error("Usuário não encontrado");
    return { id, nome: "Luan", saldo: 100 };
  },
  async buscarBonus(usuario) {
    return { ...usuario, bonus: 50 };
  },
  async calcularTotal(usuario) {
    return { ...usuario, total: usuario.saldo + usuario.bonus };
  }
};

// VERSÃO VULNERÁVEL:
// Causa 1: o then não retorna a Promise seguinte.
// Causa 2: o catch registra o erro, mas devolve undefined e o engole.
function carregarResumoVulneravel(id) {
  return banco.buscarUsuario(id)
    .then((usuario) => {
      banco.buscarBonus(usuario).then((comBonus) => {
        banco.calcularTotal(comBonus);
      }); // faltou return: a cadeia externa perde o resultado
    })
    .catch((erro) => {
      console.error("[VULNERÁVEL] Erro engolido:", erro.message);
      // faltou throw erro
    });
}

// VERSÃO CORRIGIDA: cada etapa retorna seu resultado e erros são propagados.
async function carregarResumo(id) {
  try {
    const usuario = await banco.buscarUsuario(id);
    const comBonus = await banco.buscarBonus(usuario);
    return await banco.calcularTotal(comBonus);
  } catch (erro) {
    console.error("[CORRIGIDO] Falha ao carregar resumo:", erro.stack);
    throw erro;
  }
}

async function testar() {
  // Estes dois testes demonstram que a versão vulnerável falha nos requisitos.
  const resultadoVulneravel = await carregarResumoVulneravel(7);
  try {
    assert.equal(resultadoVulneravel.total, 150);
    console.log("ATENÇÃO: teste vulnerável inesperadamente passou.");
  } catch {
    console.log("OK: teste detectou o silent failure (resultado undefined).");
  }

  const erroEngolido = await carregarResumoVulneravel(999);
  try {
    assert.equal(erroEngolido, undefined);
    console.log("OK: teste detectou que o catch engoliu o erro.");
  } catch {
    console.log("O comportamento vulnerável mudou.");
  }

  // Os mesmos requisitos passam com a implementação corrigida.
  const resultado = await carregarResumo(7);
  assert.equal(resultado.total, 150);
  assert.equal(resultado.nome, "Luan");
  console.log("PASSOU: resultado correto na versão corrigida.");

  await assert.rejects(() => carregarResumo(999), /Usuário não encontrado/);
  console.log("PASSOU: erro propagado na versão corrigida.");
}

testar().catch((erro) => {
  console.error("Falha nos testes:", erro.stack);
  process.exitCode = 1;
});
