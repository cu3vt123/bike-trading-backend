/**
 * wrapAsync – bọc async handler để tự động catch và gọi next(err)
 * Theo shoppingCartBE utils/handeler
 */
export function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
