import { useCallback } from "react";

/*
  Minimal toast implementation (no external deps).
  - cria um container #simple-toast-container no body (se não existir)
  - adiciona toasts simples que saem automaticamente
  - API: useToast().toast({ title, description, variant })
*/

function ensureContainer() {
  let container = document.getElementById("simple-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "simple-toast-container";
    container.style.position = "fixed";
    container.style.right = "20px";
    container.style.bottom = "20px";
    container.style.zIndex = 99999;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    document.body.appendChild(container);
  }
  return container;
}

function createToastElement({ title = "", description = "", variant = "default" }) {
  const el = document.createElement("div");
  el.style.minWidth = "220px";
  el.style.maxWidth = "320px";
  el.style.padding = "10px 12px";
  el.style.borderRadius = "8px";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
  el.style.color = "#111";
  el.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
  el.style.fontSize = "14px";
  el.style.background = variant === "destructive" || variant === "error" ? "#ffe6e6"
                    : variant === "success" ? "#e6ffef"
                    : "#ffffff";
  // title
  if (title) {
    const t = document.createElement("div");
    t.style.fontWeight = "600";
    t.style.marginBottom = description ? "4px" : "0";
    t.textContent = title;
    el.appendChild(t);
  }
  if (description) {
    const d = document.createElement("div");
    d.style.opacity = "0.9";
    d.textContent = description;
    el.appendChild(d);
  }
  return el;
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = "default", duration = 4500 }) => {
    try {
      const container = ensureContainer();
      const el = createToastElement({ title, description, variant });
      container.appendChild(el);

      // animação simples (fade + slide)
      el.style.transform = "translateY(8px)";
      el.style.opacity = "0";
      el.style.transition = "transform 220ms ease, opacity 220ms ease";
      requestAnimationFrame(() => {
        el.style.transform = "translateY(0)";
        el.style.opacity = "1";
      });

      const remove = () => {
        el.style.transform = "translateY(8px)";
        el.style.opacity = "0";
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
          // if container empty, remove it
          const cont = document.getElementById("simple-toast-container");
          if (cont && cont.childNodes.length === 0) cont.parentNode.removeChild(cont);
        }, 220);
      };

      const timeoutId = setTimeout(remove, duration);

      // remove on click
      el.addEventListener("click", () => {
        clearTimeout(timeoutId);
        remove();
      });
    } catch (err) {
      // fallback mínimo
      console.log("Toast:", title, description);
      try { alert(title + (description ? "\\n" + description : "")); } catch (e) {}
    }
  }, []);

  return { toast };
}

export default useToast;
