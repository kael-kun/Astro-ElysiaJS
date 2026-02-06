export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  return response;
};
