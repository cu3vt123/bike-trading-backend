export function ok(res, data) {
  return res.status(200).json({ data });
}

export function created(res, data) {
  return res.status(201).json({ data });
}

export function badRequest(res, message = "Bad request", code) {
  const body = { message };
  if (code) body.code = code;
  return res.status(400).json(body);
}

export function unauthorized(res, message = "Unauthorized", code) {
  const body = { message };
  if (code) body.code = code;
  return res.status(401).json(body);
}

export function forbidden(res, message = "Forbidden") {
  return res.status(403).json({ message });
}

export function notFound(res, message = "Not found") {
  return res.status(404).json({ message });
}

export function serviceUnavailable(res, message = "Service unavailable") {
  return res.status(503).json({ message });
}

