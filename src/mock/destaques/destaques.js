import mockDestaques from "./MockDestaques.json";

export function getDestaqueById(id) {
  if (id == null) return undefined;

  return mockDestaques.destaques.find(
    (destaque) => String(destaque.id) === String(id)
  );
}

export function getAllDestaques() {
  return [...mockDestaques.destaques].sort(
    (a, b) => a.prioridade - b.prioridade
  );
}