const config = window.TONS_E_CORES_CONFIG || {};

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
if (menuToggle && navigation) {
  const setMenuState = (isOpen, returnFocus = false) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    navigation.classList.toggle("is-open", isOpen);

    const menuToggleLabel = menuToggle.querySelector(".menu-toggle-label");
    if (menuToggleLabel) menuToggleLabel.textContent = isOpen ? "Fechar" : "Menu";

    if (!isOpen && returnFocus) menuToggle.focus();
  };

  menuToggle.addEventListener("click", () => {
    setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuState(false, true);
    }
  });

  document.addEventListener("click", (event) => {
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;
    if (!event.target.closest(".site-header")) setMenuState(false);
  });
}

const indicationLink = document.querySelector("#indication-link");
const formStatus = document.querySelector("#form-status");
if (indicationLink && formStatus) {
  if (config.indicationFormUrl) {
    indicationLink.href = config.indicationFormUrl;
    indicationLink.target = "_blank";
    indicationLink.rel = "noopener noreferrer";
  } else {
    indicationLink.addEventListener("click", (event) => event.preventDefault());
    indicationLink.setAttribute("aria-disabled", "true");
    formStatus.textContent = "Formulário ainda não configurado. Adicione a URL em config.js.";
  }
}

const pixButton = document.querySelector("#pix-button");
const pixFallback = document.querySelector("#pix-fallback");
const pixPanel = document.querySelector("#pix-panel");
const pixValue = document.querySelector("#pix-value");
const pixStatus = document.querySelector("#pix-status");
const copyPixButton = document.querySelector("#copy-pix");
if (pixButton && pixPanel && pixValue && pixStatus) {
  const whatsappUrl = config.contacts?.whatsapp || "";

  if (config.pixKey) {
    if (pixFallback) pixFallback.hidden = true;
    pixButton.hidden = false;

    pixButton.addEventListener("click", () => {
      pixValue.textContent = config.pixKey;
      pixPanel.hidden = false;
      pixStatus.textContent = "Chave Pix configurada. Confira os dados antes de realizar a doação.";
    });
    if (copyPixButton) {
      copyPixButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(config.pixKey);
          pixStatus.textContent = "Chave Pix copiada.";
        } catch {
          pixStatus.textContent = "Não foi possível copiar automaticamente. Selecione e copie a chave exibida.";
        }
      });
    }
  } else if (whatsappUrl && pixFallback) {
    pixButton.hidden = true;
    pixFallback.hidden = false;
    const whatsappMessage = encodeURIComponent("Olá! Quero gerar a chave PIX para doar.");
    pixFallback.href = `${whatsappUrl}${whatsappUrl.includes("?") ? "&" : "?"}text=${whatsappMessage}`;
    pixFallback.setAttribute("aria-label", "Gerar chave PIX pelo WhatsApp");
  } else {
    pixButton.hidden = true;
    pixPanel.hidden = true;
  }
}

const contactDefinitions = [
  { key: "instagram", label: "Instagram", color: "#fa3e43", icon: '<rect x="4" y="4" width="24" height="24" rx="6"/><circle cx="16" cy="16" r="5"/><path d="M23 9h.01"/>' },
  { key: "whatsapp", label: "WhatsApp", color: "#00c98a", icon: '<path d="M27 15a11 11 0 0 1-16 10L5 27l2-6A11 11 0 1 1 27 15Z"/><path d="M12 11c1 5 4 8 9 9l2-2-4-2-2 2c-2-1-3-2-4-4l2-2-2-4-1 1Z"/>' },
  { key: "facebook", label: "Facebook", color: "#0878f9", icon: '<path d="M18 28V17h4l1-5h-5V9c0-1.5.5-2 2-2h3V3h-4c-5 0-7 2-7 6v3H9v5h3v11"/>' },
  { key: "email", label: "E-mail", color: "#ddd", icon: '<rect x="3" y="6" width="26" height="20" rx="2"/><path d="m4 8 12 9L28 8"/>' }
];
const contactContainer = document.querySelector("#contact-options");
if (contactContainer) {
  for (const contact of contactDefinitions) {
    const value = config.contacts?.[contact.key] || "";
    const displayLabel = contact.key === "email" ? config.contacts?.emailName || contact.label : contact.label;
    const card = document.createElement(value ? "a" : "span");
    card.className = "contact-card";
    card.style.setProperty("--contact-color", contact.color);
    card.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${contact.icon}</svg><span>${displayLabel}</span>`;
    if (value) {
      card.href = contact.key === "email" ? `mailto:${value}` : value;
      if (contact.key !== "email") {
        card.target = "_blank";
        card.rel = "noopener noreferrer";
      }
      card.setAttribute("aria-label", contact.key === "email" ? `E-mail de ${displayLabel}: ${value}` : `${contact.label}: abrir contato`);
    } else {
      card.setAttribute("aria-disabled", "true");
      card.setAttribute("aria-label", `${contact.label}: contato ainda não configurado`);
      card.title = "Contato ainda não configurado";
    }
    contactContainer.append(card);
  }
}

const transparencyLink = document.querySelector("#transparency-link");
const transparencyStatus = document.querySelector("#transparency-status");
if (transparencyLink && transparencyStatus) {
  if (config.transparencyUrl) {
    transparencyLink.href = config.transparencyUrl;
    transparencyLink.hidden = false;
    transparencyStatus.hidden = true;
  } else {
    transparencyLink.hidden = true;
    transparencyStatus.hidden = false;
    transparencyStatus.textContent = "O portal estará disponível em breve.";
  }
}

const yearElement = document.querySelector("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}