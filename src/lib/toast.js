const bus = new EventTarget();

export function onToast(handler) {
  const fn = (e) => handler(e.detail);
  bus.addEventListener("toast", fn);
  return () => bus.removeEventListener("toast", fn);
}

export function toastInfo(message) {
  bus.dispatchEvent(
    new CustomEvent("toast", { detail: { type: "info", message } }),
  );
}

export function toastError(message) {
  bus.dispatchEvent(
    new CustomEvent("toast", { detail: { type: "error", message } }),
  );
}
