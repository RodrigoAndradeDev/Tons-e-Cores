/**
 * Experiência interativa da primeira seção.
 * Logo -> histórias -> modal acessível.
 */
(() => {
  "use strict";

  const config = window.TONS_E_CORES_CONFIG || {};
  const allStories = Array.isArray(window.TONS_E_CORES_STORIES) ? window.TONS_E_CORES_STORIES : [];

  const stage = document.querySelector("[data-story-stage]");
  if (!stage) return;

  const logoTrigger = stage.querySelector("[data-logo-trigger]");
  const logoSlot = stage.querySelector("[data-logo-slot]");
  const gallery = stage.querySelector("#hero-stories");
  const closeGalleryButton = stage.querySelector("[data-stories-close]");
  const track = stage.querySelector("[data-carousel-track]");
  const controls = stage.querySelector("[data-carousel-controls]");
  const prevButton = stage.querySelector("[data-carousel-prev]");
  const nextButton = stage.querySelector("[data-carousel-next]");
  const pauseButton = stage.querySelector("[data-carousel-pause]");
  const dotsContainer = stage.querySelector("[data-carousel-dots]");
  const countElement = stage.querySelector("[data-carousel-count]");
  const statusElement = stage.querySelector("[data-carousel-status]");
  const desktopHint = stage.querySelector("[data-hero-hint-desktop]");
  const touchHint = stage.querySelector("[data-hero-hint-touch]");

  const dialog = document.querySelector("#story-dialog");
  const dialogClose = dialog?.querySelector("[data-story-close]");
  const dialogMedia = dialog?.querySelector("[data-story-media]");
  const dialogCover = dialog?.querySelector("[data-story-cover]");
  const dialogTitle = dialog?.querySelector("#story-dialog-title");
  const dialogSummary = dialog?.querySelector("[data-story-summary]");
  const dialogContent = dialog?.querySelector("[data-story-content]");

  if (!logoTrigger || !gallery || !track || !closeGalleryButton) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)");
  const compactLayout = window.matchMedia("(max-width: 1100px)");

  const AUTOPLAY_DELAY = 10000;
  const HIDE_DELAY = 180;
  const ICON_PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const ICON_NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>';
  const ICON_IMAGE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 4 4 2-2 5 5"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.4-2.9 8.1-7 10-4.1-1.9-7-5.6-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>';

  const stories = allStories.filter((story) => {
    if (!story || story.authorization !== true) return false;
    if (typeof story.id !== "string" || !story.id.trim()) return false;
    if (typeof story.name !== "string" || !story.name.trim()) return false;
    return Boolean(getCover(story));
  });

  const state = {
    index: 0,
    revealed: false,
    paused: false,
    autoTimer: 0,
    hideTimer: 0,
    focusGuard: false,
    opener: null
  };

  const slides = [];

  function getCover(story) {
    if (story?.cover?.src) return story.cover;
    if (Array.isArray(story?.photos)) {
      return story.photos.find((photo) => photo?.src) || null;
    }
    return null;
  }

  function getPhotos(story) {
    const coverSource = getCover(story)?.src;
    return (Array.isArray(story?.photos) ? story.photos : []).filter(
      (photo) => photo?.src && photo.src !== coverSource
    );
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function imageAlt(photo, story, position) {
    return photo?.alt || `Fotografia ${position} de ${story.name}.`;
  }

  /* ----------------------------------------------------------------------
     Logo oficial (quando configurada) ou wordmark existente como fallback
     ---------------------------------------------------------------------- */
  function setupBrandLogo() {
    if (!config.brandLogo || !logoSlot) return;

    const image = document.createElement("img");
    image.className = "hero-logo-image";
    image.alt = "";
    image.decoding = "async";
    image.loading = "eager";
    image.addEventListener("load", () => logoSlot.classList.add("has-image"));
    image.addEventListener("error", () => image.remove());
    image.src = config.brandLogo;
    logoSlot.append(image);
  }

  /* ----------------------------------------------------------------------
     Carrossel
     ---------------------------------------------------------------------- */
  function buildEmptyState() {
    const wrapper = document.createElement("div");
    wrapper.className = "hero-empty";

    const icon = document.createElement("span");
    icon.className = "hero-empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = ICON_IMAGE;

    const title = document.createElement("h3");
    title.textContent = "Histórias em breve";

    const text = document.createElement("p");
    text.textContent =
      "Este espaço está reservado para as pessoas e famílias que autorizarem a publicação de suas histórias.";

    const note = document.createElement("p");
    note.className = "hero-empty-note";
    note.textContent = "Nenhuma imagem ou relato é publicado sem autorização.";

    wrapper.append(icon, title, text, note);
    return wrapper;
  }

  function buildStoryCard(story, index) {
    const cover = getCover(story);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "hero-story-card";
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `Conhecer a história de ${story.name}`);

    const image = document.createElement("img");
    image.className = "hero-story-media";
    image.src = cover.src;
    image.alt = cover.alt || `Fotografia de ${story.name}.`;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";

    const shade = document.createElement("span");
    shade.className = "hero-story-shade";
    shade.setAttribute("aria-hidden", "true");

    const top = document.createElement("span");
    top.className = "hero-story-top";
    const counter = document.createElement("span");
    counter.className = "hero-story-index";
    counter.textContent = `${pad(index + 1)} / ${pad(stories.length)}`;
    top.append(counter);

    const body = document.createElement("span");
    body.className = "hero-story-body";

    const name = document.createElement("span");
    name.className = "hero-story-name";
    name.textContent = story.name;
    body.append(name);

    if (typeof story.summary === "string" && story.summary.trim()) {
      const summary = document.createElement("span");
      summary.className = "hero-story-summary";
      summary.textContent = story.summary.trim();
      body.append(summary);
    }

    const cta = document.createElement("span");
    cta.className = "hero-story-cta";
    const ctaLabel = document.createElement("span");
    ctaLabel.textContent = "Conhecer história";
    const arrow = document.createElement("span");
    arrow.className = "hero-story-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML = ICON_NEXT;
    cta.append(ctaLabel, arrow);
    body.append(cta);

    card.append(image, shade, top, body);
    card.addEventListener("click", () => openStory(story, card));
    return card;
  }

  function buildCarousel() {
    track.replaceChildren();
    slides.length = 0;

    if (dotsContainer) dotsContainer.replaceChildren();

    if (!stories.length) {
      track.append(buildEmptyState());
      if (controls) controls.hidden = true;
      if (statusElement) statusElement.textContent = "Ainda não há histórias publicadas.";
      return;
    }

    stories.forEach((story, index) => {
      const slide = document.createElement("div");
      slide.className = "hero-slide";
      slide.dataset.index = String(index);
      slide.setAttribute("aria-hidden", "true");
      slide.setAttribute("inert", "");
      slide.append(buildStoryCard(story, index));
      track.append(slide);
      slides.push(slide);
    });

    if (dotsContainer) {
      stories.forEach((story, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero-dot";
        dot.setAttribute("aria-label", `Ver história: ${story.name}`);
        dot.addEventListener("click", () => setActive(index, true));
        dotsContainer.append(dot);
      });
    }

    if (controls) controls.hidden = stories.length < 2;
    updatePauseButton();
    setActive(0);
  }

  function setActive(index, userInitiated = false) {
    if (!stories.length) return;

    const nextIndex = ((index % stories.length) + stories.length) % stories.length;
    state.index = nextIndex;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === nextIndex;
      slide.classList.toggle("is-active", active);
      slide.toggleAttribute("inert", !active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, dotIndex) => {
        if (dotIndex === nextIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    if (countElement) {
      countElement.textContent = `${pad(nextIndex + 1)} / ${pad(stories.length)}`;
    }

    if (statusElement) {
      statusElement.textContent = `${stories[nextIndex].name}. História ${nextIndex + 1} de ${stories.length}.`;
    }

    if (userInitiated) setPaused(true);
    else scheduleAutoplay();
  }

  function updatePauseButton() {
    if (!pauseButton) return;
    pauseButton.setAttribute("aria-pressed", String(state.paused));
    pauseButton.setAttribute(
      "aria-label",
      state.paused ? "Retomar troca automática de histórias" : "Pausar troca automática de histórias"
    );
    pauseButton.innerHTML = state.paused ? ICON_PLAY : ICON_PAUSE;
  }

  function clearAutoplay() {
    if (state.autoTimer) {
      window.clearTimeout(state.autoTimer);
      state.autoTimer = 0;
    }
  }

  function scheduleAutoplay() {
    clearAutoplay();
    if (!state.revealed || state.paused || stories.length < 2 || reducedMotion.matches) return;

    state.autoTimer = window.setTimeout(() => {
      state.autoTimer = 0;
      setActive(state.index + 1);
    }, AUTOPLAY_DELAY);
  }

  function setPaused(paused) {
    state.paused = paused;
    updatePauseButton();
    if (paused) clearAutoplay();
    else scheduleAutoplay();
  }

  /* ----------------------------------------------------------------------
     Estados de revelação (hover, toque, teclado)
     ---------------------------------------------------------------------- */
  function focusGallery() {
    if (!state.revealed) return;
    const activeCard = track.querySelector(".hero-slide.is-active .hero-story-card");
    const target = stories.length ? activeCard : closeGalleryButton;
    target?.focus();
  }

  function setRevealed(revealed, { moveFocus = false } = {}) {
    if (state.revealed === revealed) {
      if (revealed && moveFocus) focusGallery();
      return;
    }

    const hadGalleryFocus = gallery.contains(document.activeElement);

    state.revealed = revealed;
    state.focusGuard = revealed;
    stage.classList.toggle("is-revealed", revealed);
    logoTrigger.setAttribute("aria-expanded", String(revealed));
    logoTrigger.inert = revealed;
    gallery.inert = !revealed;
    gallery.setAttribute("aria-hidden", String(!revealed));

    if (revealed) {
      scheduleAutoplay();
      if (moveFocus) {
        window.requestAnimationFrame(() => {
          focusGallery();
          state.focusGuard = false;
        });
      } else {
        window.setTimeout(() => {
          state.focusGuard = false;
        }, 300);
      }
    } else {
      clearAutoplay();
      state.focusGuard = false;
      if (hadGalleryFocus) logoTrigger.focus();
    }
  }

  function scheduleHide() {
    if (state.hideTimer) window.clearTimeout(state.hideTimer);
    state.hideTimer = window.setTimeout(() => {
      state.hideTimer = 0;
      if (dialog?.open) return;
      if (stage.contains(document.activeElement)) return;
      if (stage.matches(":hover")) return;
      setRevealed(false);
    }, HIDE_DELAY);
  }

  function cancelHide() {
    if (state.hideTimer) {
      window.clearTimeout(state.hideTimer);
      state.hideTimer = 0;
    }
  }

  /* ----------------------------------------------------------------------
     Modal de história
     ---------------------------------------------------------------------- */
  function createSection(title, children) {
    const section = document.createElement("section");
    section.className = "story-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.append(heading, ...children);
    return section;
  }

  function createParagraphs(text) {
    const fragment = document.createDocumentFragment();
    String(text)
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = part;
        fragment.append(paragraph);
      });
    return fragment;
  }

  function createGallery(story) {
    const photos = getPhotos(story);
    const section = createSection("Galeria de fotografias", []);

    if (!photos.length) {
      const note = document.createElement("p");
      note.className = "story-note";
      note.textContent = "Outras fotografias desta história ainda não foram disponibilizadas.";
      section.append(note);
      return section;
    }

    let photoIndex = 0;

    const figure = document.createElement("figure");
    figure.className = "story-gallery-main";

    const mainImage = document.createElement("img");
    mainImage.loading = "eager";
    mainImage.decoding = "async";
    mainImage.alt = "";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "story-gallery-nav prev";
    previous.setAttribute("aria-label", "Fotografia anterior");
    previous.innerHTML = ICON_PREV;
    previous.hidden = photos.length < 2;

    const next = document.createElement("button");
    next.type = "button";
    next.className = "story-gallery-nav next";
    next.setAttribute("aria-label", "Próxima fotografia");
    next.innerHTML = ICON_NEXT;
    next.hidden = photos.length < 2;

    figure.append(mainImage, previous, next);

    const toolbar = document.createElement("div");
    toolbar.className = "story-gallery-toolbar";

    const counter = document.createElement("span");
    counter.className = "story-gallery-counter";
    counter.setAttribute("aria-hidden", "true");

    const enlarge = document.createElement("a");
    enlarge.className = "story-gallery-enlarge";
    enlarge.target = "_blank";
    enlarge.rel = "noopener noreferrer";
    enlarge.textContent = "Ampliar foto";
    const newTabNote = document.createElement("span");
    newTabNote.className = "sr-only";
    newTabNote.textContent = " (abre em nova aba)";
    enlarge.append(newTabNote);

    toolbar.append(counter, enlarge);

    const thumbs = document.createElement("div");
    thumbs.className = "story-gallery-thumbs";
    thumbs.setAttribute("role", "group");
    thumbs.setAttribute("aria-label", "Miniaturas da galeria");

    const thumbButtons = [];

    photos.forEach((photo, index) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "story-thumb";
      thumb.setAttribute("aria-label", `Ver fotografia ${index + 1}: ${imageAlt(photo, story, index + 1)}`);
      thumb.setAttribute("aria-current", "false");

      const thumbImage = document.createElement("img");
      thumbImage.src = photo.thumbnail || photo.src;
      thumbImage.alt = "";
      thumbImage.loading = "lazy";
      thumbImage.decoding = "async";
      thumb.append(thumbImage);

      thumb.addEventListener("click", () => showPhoto(index));
      thumbs.append(thumb);
      thumbButtons.push(thumb);
    });

    function showPhoto(index, moveThumbFocus = false) {
      photoIndex = ((index % photos.length) + photos.length) % photos.length;
      const photo = photos[photoIndex];

      mainImage.classList.add("is-loading");
      mainImage.onload = () => mainImage.classList.remove("is-loading");
      mainImage.onerror = () => mainImage.classList.remove("is-loading");
      mainImage.src = photo.src;
      mainImage.alt = imageAlt(photo, story, photoIndex + 1);

      counter.textContent = `${pad(photoIndex + 1)} / ${pad(photos.length)}`;
      enlarge.href = photo.src;
      enlarge.setAttribute(
        "aria-label",
        `Ampliar fotografia ${photoIndex + 1} de ${photos.length} (abre em nova aba): ${imageAlt(
          photo,
          story,
          photoIndex + 1
        )}`
      );

      thumbButtons.forEach((thumb, thumbIndex) => {
        thumb.setAttribute("aria-current", thumbIndex === photoIndex ? "true" : "false");
      });

      if (moveThumbFocus) thumbButtons[photoIndex]?.focus();
    }

    previous.addEventListener("click", () => showPhoto(photoIndex - 1));
    next.addEventListener("click", () => showPhoto(photoIndex + 1));
    thumbs.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPhoto(photoIndex - 1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showPhoto(photoIndex + 1, true);
      }
    });

    section.append(figure, toolbar);
    if (photos.length > 1) {
      section.append(thumbs);
      showPhoto(0);
    } else {
      showPhoto(0);
    }

    return section;
  }

  function createVideoSection(video, story) {
    const section = createSection("Depoimento em vídeo", []);

    if (!video?.src) {
      const note = document.createElement("p");
      note.className = "story-note";
      note.textContent = "O depoimento em vídeo desta história ainda não está disponível.";
      section.append(note);
      return section;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "story-video";

    const player = document.createElement("video");
    player.controls = true;
    player.preload = "none";
    player.playsInline = true;
    player.setAttribute("aria-label", video.alt || `Depoimento em vídeo de ${story.name}`);
    if (video.poster) player.poster = video.poster;

    const source = document.createElement("source");
    source.src = video.src;
    if (video.type) source.type = video.type;
    player.append(source);

    const tracks = Array.isArray(video.tracks) ? video.tracks : [];
    tracks
      .filter((track) => track?.src)
      .forEach((track, index) => {
        const trackElement = document.createElement("track");
        trackElement.kind = track.kind || "captions";
        trackElement.src = track.src;
        trackElement.srclang = track.language || "pt-BR";
        trackElement.label = track.label || "Português";
        if (track.default || index === 0) trackElement.default = true;
        player.append(trackElement);
      });

    const error = document.createElement("p");
    error.className = "story-video-error";
    error.setAttribute("role", "status");
    error.hidden = true;
    error.textContent =
      "Não foi possível carregar o depoimento em vídeo. Verifique a conexão ou tente novamente mais tarde.";

    const showError = () => {
      error.hidden = false;
      player.hidden = true;
    };

    player.addEventListener("error", showError);
    source.addEventListener("error", showError);

    wrapper.append(player, error);
    section.append(wrapper);

    if (video.caption) {
      const caption = document.createElement("p");
      caption.className = "story-note";
      caption.textContent = video.caption;
      section.append(caption);
    }

    return section;
  }

  function buildDialogContent(story) {
    if (!dialogContent) return;
    dialogContent.replaceChildren();

    if (typeof story.narrative === "string" && story.narrative.trim()) {
      const section = createSection("A história", []);
      section.append(createParagraphs(story.narrative));
      dialogContent.append(section);
    }

    if (typeof story.visitContext === "string" && story.visitContext.trim()) {
      const section = createSection("A visita", []);
      section.append(createParagraphs(story.visitContext));
      dialogContent.append(section);
    }

    dialogContent.append(createGallery(story));

    if (story.video) {
      dialogContent.append(createVideoSection(story.video, story));
    }

    const testimonials = (Array.isArray(story.testimonials) ? story.testimonials : [])
      .map((testimonial) => {
        if (typeof testimonial === "string") return { text: testimonial.trim(), author: "" };
        if (testimonial && typeof testimonial.text === "string") {
          return {
            text: testimonial.text.trim(),
            author: typeof testimonial.author === "string" ? testimonial.author.trim() : ""
          };
        }
        return null;
      })
      .filter((testimonial) => testimonial?.text);

    if (testimonials.length) {
      const section = createSection(testimonials.length > 1 ? "Depoimentos" : "Depoimento", []);
      testimonials.forEach((testimonial) => {
        const quote = document.createElement("blockquote");
        quote.className = "story-quote";
        const text = document.createElement("p");
        text.textContent = testimonial.text;
        quote.append(text);
        if (testimonial.author) {
          const author = document.createElement("cite");
          author.textContent = testimonial.author;
          quote.append(author);
        }
        section.append(quote);
      });
      dialogContent.append(section);
    }

    const authorized = document.createElement("p");
    authorized.className = "story-authorized";
    authorized.innerHTML = ICON_CHECK;
    authorized.append(document.createTextNode("Conteúdo publicado com autorização da pessoa ou família retratada."));
    dialogContent.append(authorized);
  }

  function openStory(story, opener) {
    if (!dialog || !dialogCover || !dialogContent || !dialogTitle || dialog.open) return;

    state.opener = opener;
    clearAutoplay();

    const cover = getCover(story);
    dialogCover.hidden = false;
    dialogCover.classList.remove("is-missing");
    dialogCover.onerror = () => {
      dialogCover.hidden = true;
      dialogMedia?.classList.add("is-missing");
    };
    dialogCover.alt = cover.alt || `Fotografia de ${story.name}.`;
    dialogCover.src = cover.src;

    dialogTitle.textContent = story.name;
    dialogSummary.textContent =
      typeof story.summary === "string" && story.summary.trim() ? story.summary.trim() : "";
    dialogSummary.hidden = !dialogSummary.textContent;

    if (dialogSummary.hidden) dialog.removeAttribute("aria-describedby");
    else dialog.setAttribute("aria-describedby", "story-dialog-summary");

    buildDialogContent(story);
    document.body.classList.add("has-dialog");

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");

    dialogClose?.focus();
  }

  function closeStory() {
    if (!dialog?.open) return;
    dialog.close();
  }

  function restoreScrollLock() {
    document.body.classList.remove("has-dialog");
  }

  /* ----------------------------------------------------------------------
     Eventos
     ---------------------------------------------------------------------- */
  stage.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse" || !hoverCapable.matches || compactLayout.matches) return;
    cancelHide();
    if (!state.revealed) setRevealed(true);
  });

  stage.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse" || compactLayout.matches) return;
    scheduleHide();
  });

  stage.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (state.focusGuard) return;
      if (!state.revealed || dialog?.open) return;
      if (stage.contains(document.activeElement)) return;
      if (stage.matches(":hover")) return;
      setRevealed(false);
    }, 0);
  });

  logoTrigger.addEventListener("click", (event) => {
    cancelHide();
    setRevealed(true, { moveFocus: event.detail === 0 });
  });

  closeGalleryButton.addEventListener("click", () => setRevealed(false));

  document.addEventListener("pointerdown", (event) => {
    if (!state.revealed || dialog?.open) return;
    if (stage.contains(event.target)) return;
    setRevealed(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !state.revealed || dialog?.open) return;
    event.preventDefault();
    setRevealed(false);
    logoTrigger.focus();
  });

  prevButton?.addEventListener("click", () => setActive(state.index - 1, true));
  nextButton?.addEventListener("click", () => setActive(state.index + 1, true));
  pauseButton?.addEventListener("click", () => setPaused(!state.paused));

  track.addEventListener("focusin", () => {
    if (stories.length > 1 && !state.paused) setPaused(true);
  });

  dialogClose?.addEventListener("click", closeStory);

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeStory();
  });

  dialog?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialog.querySelectorAll("a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex='-1'])")
    ).filter((element) => !element.closest("[hidden]") && element.getClientRects().length > 0);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  dialog?.addEventListener("close", () => {
    restoreScrollLock();

    dialog.querySelectorAll("video").forEach((video) => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* mídia ainda não carregada */
      }
      video.querySelectorAll("source").forEach((source) => source.remove());
      video.removeAttribute("src");
      video.load();
    });

    const opener = state.opener;
    state.opener = null;
    if (opener && document.contains(opener)) opener.focus();
    else logoTrigger.focus();

    if (dialogContent) dialogContent.replaceChildren();
    if (dialogCover) {
      dialogCover.hidden = true;
      dialogCover.removeAttribute("src");
      dialogCover.alt = "";
    }
    dialogMedia?.classList.remove("is-missing");

    if (state.revealed) scheduleAutoplay();
  });

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) clearAutoplay();
    else scheduleAutoplay();
  });

  compactLayout.addEventListener("change", updateHints);

  /* ----------------------------------------------------------------------
     Inicialização
     ---------------------------------------------------------------------- */
  function updateHints() {
    const hasStories = stories.length > 0;
    const action = compactLayout.matches ? "Clique" : "Passe o mouse";
    if (desktopHint) {
      desktopHint.textContent = hasStories
        ? `${action} para conhecer as histórias`
        : `${action} para saber mais`;
    }
    if (touchHint) {
      touchHint.textContent = hasStories
        ? "Toque para conhecer as histórias"
        : "Toque para saber mais";
    }
    logoTrigger.setAttribute(
      "aria-label",
      hasStories
        ? "Projeto Tons e Cores. Conhecer as histórias das famílias visitadas"
        : "Projeto Tons e Cores. Ver informações sobre as histórias do projeto"
    );
  }

  setupBrandLogo();
  updateHints();
  buildCarousel();
})();
