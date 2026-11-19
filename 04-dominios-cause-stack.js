// Exercício 4 - Domínios de erros nativos, cause e stack
// Execute: node 04-dominios-cause-stack.js

class CustomWrappedError extends Error {
  constructor(message, original) {
    super(message, { cause: original });
    this.name = "CustomWrappedError";
    // Mantém a stack do erro original para facilitar a localização da origem.
    if (original && original.stack) this.stack = `${this.name}: ${message}\nCaused by:\n${original.stack}`;
  }
}

function demonstrar(nome, operacao) {
  try {
    operacao();
  } catch (original) {
    const wrapped = new CustomWrappedError(`Falha ao executar ${nome}`, original);
    console.log(`\n--- ${nome} ---`);
    console.log("Erro relançado:", wrapped.name, wrapped.message);
    console.log("Cause:", wrapped.cause?.name, wrapped.cause?.message);
    console.log("Stack preservada:\n", wrapped.stack);
  }
}

async function demonstrarAggregateError() {
  try {
    await Promise.any([
      Promise.reject(new Error("Servidor A indisponível")),
      Promise.reject(new Error("Servidor B indisponível"))
    ]);
  } catch (original) {
    const wrapped = new CustomWrappedError("Nenhuma promessa foi concluída", original);
    console.log("\n--- AggregateError ---");
    console.log("Cause:", wrapped.cause.name, wrapped.cause.message);
    console.log("Erros internos:", wrapped.cause.errors.map((e) => e.message));
    console.log("Stack:\n", wrapped.stack);
  }
}

async function main() {
  demonstrar("ReferenceError", () => {
    console.log(variavelQueNaoExiste);
  });

  demonstrar("TypeError", () => {
    const valor = undefined;
    valor.toString();
  });

  demonstrar("SyntaxError", () => {
    eval("foo = )");
  });

  demonstrar("RangeError", () => {
    new Array(-1);
  });

  await demonstrarAggregateError();
}

main().catch((erro) => {
  console.error("Erro inesperado:", erro.stack);
  process.exitCode = 1;
});

/*
Explicações:
ReferenceError: ocorre ao acessar um identificador que não foi declarado.
TypeError: ocorre quando uma operação não é válida para aquele valor, como
acessar método de undefined.
SyntaxError: indica código com sintaxe inválida; eval tenta interpretar a string.
RangeError: indica um valor fora do intervalo permitido, como tamanho negativo.
AggregateError: agrupa vários erros, como quando Promise.any rejeita todas as
Promises. Em todos os casos, CustomWrappedError mantém o erro original em cause.
*/
