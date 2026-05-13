/*
 * plus-ms-auth/src/sanity.spec.ts
 *
 * Teste de sanidade — verifica que o ambiente de testes está funcional.
 *
 * Papel na arquitetura:
 *   Um teste que sempre passa, usado para confirmar que Jest está configurado,
 *   o TypeScript compila e o runner de testes executa sem erros de setup.
 *   Se este teste falhar, o problema é no ambiente, não na aplicação.
 */

describe('Sanity Check', () => {
  it('O sistema deve compilar e os testes unitários devem passar', () => {
    expect(true).toBe(true);
  });
});