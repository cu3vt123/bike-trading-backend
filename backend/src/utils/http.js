export function ok(res, data) {
  return res.status(200).json({ data });
}

export function created(res, data) {
  return res.status(201).json({ data });
}

export function badRequest(res, message = "Bad request") {
  return res.status(400).json({ message });
}

export function unauthorized(res, message = "Unauthorized") {
  return res.status(401).json({ message });
}

export function forbidden(res, message = "Forbidden") {
  return res.status(403).json({ message });
}

export function notFound(res, message = "Not found") {
  return res.status(404).json({ message });
}

