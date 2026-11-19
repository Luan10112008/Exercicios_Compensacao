// Exercício 7 - Erros personalizados, cause, serialização e testes
// Execute: node 07-erros-personalizados-serializacao.js

const assert = require("node:assert/strict");

class InvalidAgeError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "InvalidAgeError";
    this.code = "INVALID_AGE";
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause
        ? { name: this.cause.name, message: this.cause.message }
        : null
    };
  }
}

class ValidationError extends Error {
  constructor(message, errors = [], options = {}) {
    super(message, options);
    this.name = "ValidationError";
    this.code = "VALIDATION_ERROR";
    this.errors = errors;
  }

  flatten() {
    return this.errors.map((erro) =>
      typeof erro === "string" ? erro : erro.message
    );
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      errors: this.flatten(),
      cause: this.cause
        ? { name: this.cause.name, message: this.cause.message }
        : null
    };
  }
}

function checkAge(age) {
  if (typeof age !== "number" || Number.isNaN(age)) {
    const cause = new TypeError("A idade precisa ser um número válido.");
    throw new InvalidAgeError("Não foi possível validar a idade.", { cause });
  }

  if (age < 0 || age > 120) {
    throw new RangeError("A idade deve estar entre 0 e 120.");
  }

  return true;
}

function testar() {
  // NaN: InvalidAgeError com TypeError em cause.
  try {
    checkAge(Number.NaN);
    assert.fail("Era esperado InvalidAgeError.");
  } catch (erro) {
    assert.ok(erro instanceof InvalidAgeError);
    assert.ok(erro.cause instanceof TypeError);
    const json = JSON.stringify(erro);
    const objeto = JSON.parse(json);
    assert.deepEqual(objeto, {
      name: "InvalidAgeError",
      code: "INVALID_AGE",
      message: "Não foi possível validar a idade.",
      cause: {
        name: "TypeError",
        message: "A idade precisa ser um número válido."
      }
    });
    assert.equal(json.includes("stack"), false);
    console.log("PASSOU: InvalidAgeError, cause e JSON seguro.");
    console.log(json);
  }

  // Fora do intervalo: RangeError.
  assert.throws(() => checkAge(150), RangeError);
  assert.throws(() => checkAge(-1), RangeError);
  console.log("PASSOU: limites de idade.");

  // Exemplo de ValidationError e flatten().
  const validacao = new ValidationError("Dados inválidos", [
    { path: "nome", message: "O nome é obrigatório." },
    { path: "idade", message: "A idade precisa ser válida." }
  ]);
  assert.deepEqual(validacao.flatten(), [
    "O nome é obrigatório.",
    "A idade precisa ser válida."
  ]);
  assert.equal(JSON.parse(JSON.stringify(validacao)).errors.length, 2);
  console.log("PASSOU: ValidationError.flatten() e serialização.");
}

testar();
