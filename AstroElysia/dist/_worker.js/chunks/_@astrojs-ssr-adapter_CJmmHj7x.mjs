globalThis.process ??= {}; globalThis.process.env ??= {};
const onRequest = async (context) => {
  const response = await context.next();
  return response;
};

const serverEntrypointModule = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  onRequest
}, Symbol.toStringTag, { value: 'Module' }));

export { onRequest as o, serverEntrypointModule as s };
