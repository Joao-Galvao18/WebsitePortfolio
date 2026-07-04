/* ============================================================
   PORTFOLIO DATA — edit this one file to update the whole site.

   ►► Full step-by-step instructions are in SETUP.md ◄◄

   Quick map:
     curatedPosters → posters you hand-picked to show everyone
                      (saved posters are EMAILED to site.email)
     defaultLang → first-load language ("en" | "pt")
     i18n        → every interface string, in EN + PT
     site        → logo, portrait, email, social links
     projects[]  → the Projects page + home carousel (featured:true)
     gallery[]   → the Gallery page (canvas + calendar views)

   SWITCHING IMAGES: every image here is a picsum.photos PLACEHOLDER.
   Put your files in the img/ folder and change the path, e.g.
     image: "img/rebus-01.jpg"
   Add a `video:` field next to any `image` to play a muted loop
   (the image becomes the video's poster frame).
   COLOURS live in css/base.css (four tokens at the top).
   ============================================================ */

window.PORTFOLIO = {

  /* ---------- "Your Work" — email + curated posters ----------
     When someone saves a poster it is: (1) kept on THEIR device so
     they see it in Your Work, and (2) emailed to YOU — automatically,
     to the `email` in the site block below, via formsubmit.co.
     FIRST TIME ONLY: formsubmit.co sends you one "activate" email —
     click its link once and every poster after that reaches you.     */

  /* ---------- FEATURING VISITOR POSTERS ----------
     Posters YOU hand-pick to show on the Your Work page (everyone
     sees these; visitors also see their own device's posters).

     Every save emails you a "paste_into_curatedPosters" line —
     copy that whole line and paste it inside the brackets below.
     Add an optional  author: "Their Name"  to credit the maker
     (it shows on the card; otherwise the card says "Featured").
     Delete a line to unfeature it. Example:

       { name: "Sunrise", author: "Ana", date: "2026-05", ratio: "16:9",
         shapes: [{"type":"circle","x":0.5,"y":0.4,"size":0.12,"rot":0,"color":"blue"}] },
  */
  curatedPosters: [
  ],

  /* ---------- Language ----------
     defaultLang sets the first load; visitors can switch with the
     nav PT/EN toggle (their choice is remembered). Every string
     below has an `en` and `pt` form. Project/gallery text that
     should translate can use { en, pt } objects too (see notes).  */
  defaultLang: "en",

  i18n: {
    "nav.index":    { en: "Index",    pt: "Início" },
    "nav.projects": { en: "Projects", pt: "Projetos" },
    "nav.gallery":  { en: "Gallery",  pt: "Galeria" },
    "nav.about":    { en: "About",    pt: "Sobre" },
    "nav.work":     { en: "Your Work", pt: "O Teu Trabalho" },
    "menu.meta":    { en: "Designer & photographer — Coimbra, Portugal", pt: "Designer e fotógrafo — Coimbra, Portugal" },

    "home.tag": {
      en: "Independent designer & photographer working across typography, generative systems and image-making. Based in Coimbra, Portugal.",
      pt: "Designer e fotógrafo independente a trabalhar entre tipografia, sistemas generativos e a criação de imagem. Sediado em Coimbra, Portugal.",
    },
    "home.hint":     { en: "Drag, rotate & scale the shapes · click empty space to shuffle", pt: "Arrasta, roda e escala as formas · clica no espaço vazio para baralhar" },
    "home.save":     { en: "Save poster ↗", pt: "Guardar póster ↗" },
    "home.featured": { en: "Selected work", pt: "Trabalho selecionado" },
    "home.drag":     { en: "Drag to explore", pt: "Arrasta para explorar" },

    "modal.kicker":      { en: "Add to Your Work", pt: "Adicionar a O Teu Trabalho" },
    "modal.title":       { en: "Name your poster", pt: "Dá um nome ao teu póster" },
    "modal.placeholder": { en: "e.g. Composition No.1", pt: "ex. Composição N.º1" },
    "modal.error":       { en: "Please give your poster a name.", pt: "Dá um nome ao teu póster, por favor." },
    "modal.profanity":   { en: "Please choose a name without offensive language.", pt: "Escolhe um nome sem linguagem ofensiva, por favor." },
    "modal.failed":      { en: "Something went wrong. Please try again.", pt: "Algo correu mal. Tenta novamente." },
    "modal.submit":      { en: "Save poster", pt: "Guardar póster" },
    "modal.close":       { en: "Close", pt: "Fechar" },
    "modal.note":        { en: "Saved to your device — and sent to Guilherme, who may feature it.", pt: "Guardado no teu dispositivo — e enviado ao Guilherme, que o pode destacar." },
    "modal.saving":      { en: "Publishing…", pt: "A publicar…" },
    "modal.saved":       { en: "Saved! Opening Your Work…", pt: "Guardado! A abrir O Teu Trabalho…" },

    "work.kicker":   { en: "Poster studio", pt: "Estúdio de pósteres" },
    "work.title":    { en: "Your Work", pt: "O Teu Trabalho" },
    "work.empty":    { en: "No posters yet — be the first. Head to the home page and compose one.", pt: "Ainda não há pósteres — sê o primeiro. Vai à página inicial e compõe um." },
    "work.make":     { en: "Make yours", pt: "Faz o teu" },
    "work.scope":    { en: "Featured picks, plus the posters you've made on this device.", pt: "Seleção em destaque, mais os pósteres que fizeste neste dispositivo." },
    "work.featured": { en: "Featured", pt: "Destaque" },
    "work.yours":    { en: "Yours", pt: "Teu" },

    "projects.kicker": { en: "Index of work", pt: "Índice de trabalho" },
    "projects.title":  { en: "Projects", pt: "Projetos" },
    "projects.canvas": { en: "Canvas", pt: "Tela" },
    "projects.list":   { en: "List", pt: "Lista" },
    "projects.hint":   { en: "Drag the folders — double-click to open", pt: "Arrasta as pastas — duplo-clique para abrir" },
    "filter.All":         { en: "All", pt: "Todos" },
    "filter.Generative":  { en: "Generative", pt: "Generativo" },
    "filter.Spatial":     { en: "Spatial", pt: "Espacial" },
    "filter.Interactive": { en: "Interactive", pt: "Interativo" },
    "filter.Photography": { en: "Photography", pt: "Fotografia" },
    "filter.Typography":  { en: "Typography", pt: "Tipografia" },
    "filter.Identity":    { en: "Identity", pt: "Identidade" },
    "row.view":   { en: "View project", pt: "Ver projeto" },

    "project.back":     { en: "All projects", pt: "Todos os projetos" },
    "project.year":     { en: "Year", pt: "Ano" },
    "project.category": { en: "Category", pt: "Categoria" },
    "project.prev":     { en: "Previous", pt: "Anterior" },
    "project.next":     { en: "Next", pt: "Seguinte" },
    "project.notfound": { en: "That project doesn't exist.", pt: "Esse projeto não existe." },

    "gallery.kicker": { en: "Photography & studies", pt: "Fotografia e estudos" },
    "gallery.title":  { en: "Gallery", pt: "Galeria" },
    "gallery.canvas": { en: "Canvas", pt: "Tela" },
    "gallery.grid":   { en: "Grid", pt: "Grelha" },
    "gallery.hint":   { en: "Drag anywhere — it never ends", pt: "Arrasta para qualquer lado — não tem fim" },
    "lightbox.close": { en: "Close", pt: "Fechar" },

    "about.kicker":   { en: "About", pt: "Sobre" },
    "about.title1":   { en: "Design, type", pt: "Design, tipo" },
    "about.title2":   { en: "& light.", pt: "e luz." },
    "about.lead":     { en: "I make systems that draw, type that moves, and photographs that hold still.", pt: "Faço sistemas que desenham, tipografia que se move e fotografias que ficam quietas." },
    "about.p1": {
      en: "I'm Guilherme — a designer and photographer from Coimbra, Portugal, working between graphic design, typography, generative art and creative coding. My practice sits where rules meet accident: writing small systems, then photographing or printing what they couldn't have predicted.",
      pt: "Sou o Guilherme — designer e fotógrafo de Coimbra, Portugal, a trabalhar entre design gráfico, tipografia, arte generativa e programação criativa. A minha prática vive onde as regras encontram o acaso: escrever pequenos sistemas e depois fotografar ou imprimir aquilo que não conseguiam prever.",
    },
    "about.p2": {
      en: "Recent work spans exhibition design, interactive installations driven by cameras and microphones, generative typography engines, and editorial photography along the Atlantic coast. I'm currently completing a Master's in Design and Multimedia at the University of Coimbra.",
      pt: "O trabalho recente abrange design de exposições, instalações interativas comandadas por câmaras e microfones, motores de tipografia generativa e fotografia editorial ao longo da costa atlântica. Concluo atualmente o Mestrado em Design e Multimédia na Universidade de Coimbra.",
    },
    "about.services": { en: "Services", pt: "Serviços" },
    "svc.identity":   { en: "Identity systems", pt: "Sistemas de identidade" },
    "svc.type":       { en: "Typography & type design", pt: "Tipografia e desenho de tipos" },
    "svc.generative": { en: "Generative art & creative coding", pt: "Arte generativa e programação criativa" },
    "svc.install":    { en: "Interactive installations", pt: "Instalações interativas" },
    "svc.photo":      { en: "Photography", pt: "Fotografia" },
    "svc.web":        { en: "Web design", pt: "Web design" },
    "about.marquee":  { en: "Open for commissions — collaborations — prints —", pt: "Disponível para encomendas — colaborações — impressões —" },
    "about.contact":  { en: "Say olá.", pt: "Diz olá." },
    "contact.copy":   { en: "Copied to clipboard", pt: "Copiado para a área de transferência" },

    "footer.cta.home":  { en: "Let's make something|worth keeping", pt: "Vamos criar algo|que vale a pena guardar" },
    "footer.cta.work":  { en: "Or go straight|to the work", pt: "Ou vai direto|ao trabalho" },
  },

  site: {
    logo:      "img/logo.svg",  /* PLACEHOLDER mark — swap for your own logo file */
    portrait:  "https://picsum.photos/seed/gg-portrait/900/1200", /* PLACEHOLDER — your photo */
    email:     "joaogcosta11@gmail.com", /* saved posters are emailed here */
    cv:        "cv.pdf",        /* the nav CV button downloads this — overwrite cv.pdf with your own */
    instagram: "https://instagram.com",  /* your profile URL */
    behance:   "https://behance.net",    /* your profile URL */
  },

  /* ---------- ADDING A PROJECT ----------
     Copy any block below, paste it, change the values. Fields:
       slug        → short id used in the page URL (letters/dashes)
       title/year/category/description → shown everywhere
       image       → the COVER: thumbnail, carousel and the big
                     picture at the top of the project page
       featured    → true = appears in the home carousel (max 6)
       media       → OPTIONAL extra pictures/videos for the project
                     page, shown in a grid under the description.
                     Any amount works — the layout adapts. Each item:
                       { image: "img/x.jpg" }                          picture
                       { image: "img/x.jpg", caption: "..." }          + caption
                       { image: "img/poster.jpg", video: "video/x.mp4" }  looping video
     ---------------------------------------- */
  projects: [
    {
      slug: "rebus",
      title: "Rebus",
      year: "2025",
      category: "Generative",
      description: "Generative poetry engine turning Portuguese text into expressive skeleton-font typography.",
      image: "https://picsum.photos/seed/gg-rebus/1280/920",   /* PLACEHOLDER */
      featured: true,
      /* PLACEHOLDER extra media — swap for your files or delete */
      media: [
        { image: "https://picsum.photos/seed/gg-rebus-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-rebus-b/1000/750", caption: "Skeleton font, weight tests" },
        { image: "https://picsum.photos/seed/gg-rebus-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-rebus-d/1600/900", caption: "Poster output, A1 series" },
        { image: "https://picsum.photos/seed/gg-rebus-e/1000/750" },
        { image: "https://picsum.photos/seed/gg-rebus-f/1000/750" },
        { image: "https://picsum.photos/seed/gg-rebus-g/1600/900" }
      ]
    },
    {
      slug: "brdy",
      title: "BRDY — Neville Brody",
      year: "2026",
      category: "Spatial",
      description: "Exhibition design in five rooms, from punk deconstruction to digital legacy.",
      image: "https://picsum.photos/seed/gg-brdy/1280/920",    /* PLACEHOLDER */
      featured: true,
      /* PLACEHOLDER extra media — swap for your files or delete */
      media: [
        { image: "https://picsum.photos/seed/gg-brdy-a/1600/900", caption: "Room one — punk deconstruction" },
        { image: "https://picsum.photos/seed/gg-brdy-b/1000/750" },
        { image: "https://picsum.photos/seed/gg-brdy-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-brdy-d/1600/900" },
        { image: "https://picsum.photos/seed/gg-brdy-e/1000/750" },
        { image: "https://picsum.photos/seed/gg-brdy-f/1000/750", caption: "Room five — digital legacy" }
      ]
    },
    {
      slug: "draw-it-together",
      title: "Draw It Together",
      year: "2025",
      category: "Interactive",
      description: "Two-player cooperative drawing game with Arduino joystick and microphone controls.",
      image: "https://picsum.photos/seed/gg-dit/1280/920",     /* PLACEHOLDER */
      featured: true,
      media: [
        { image: "https://picsum.photos/seed/gg-dit-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-dit-b/1000/750", caption: "Joystick + mic control rig" },
        { image: "https://picsum.photos/seed/gg-dit-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-dit-d/1600/900" },
        { image: "https://picsum.photos/seed/gg-dit-e/1000/750" },
        { image: "https://picsum.photos/seed/gg-dit-f/1000/750" }
      ]
    },
    {
      slug: "patchbay",
      title: "Patchbay Generativo",
      year: "2026",
      category: "Generative",
      description: "Camera-driven audiovisual step sequencer with a generative modular rack.",
      image: "https://picsum.photos/seed/gg-patch/1280/920",   /* PLACEHOLDER */
      featured: true,
      media: [
        { image: "https://picsum.photos/seed/gg-patch-a/1600/900", caption: "The rack, live" },
        { image: "https://picsum.photos/seed/gg-patch-b/1000/750" },
        { image: "https://picsum.photos/seed/gg-patch-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-patch-d/1600/900" }
      ]
    },
    {
      slug: "litoral",
      title: "Litoral",
      year: "2025",
      category: "Photography",
      description: "Photographic series along the Portuguese Atlantic coast, shot over one winter.",
      image: "https://picsum.photos/seed/gg-litoral/1280/920", /* PLACEHOLDER */
      featured: true,
      media: [
        { image: "https://picsum.photos/seed/gg-litoral-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-litoral-b/1000/750" },
        { image: "https://picsum.photos/seed/gg-litoral-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-litoral-d/1600/900", caption: "Nazaré, January" },
        { image: "https://picsum.photos/seed/gg-litoral-e/1000/750" },
        { image: "https://picsum.photos/seed/gg-litoral-f/1000/750" },
        { image: "https://picsum.photos/seed/gg-litoral-g/1600/900" },
        { image: "https://picsum.photos/seed/gg-litoral-h/1600/900" }
      ]
    },
    {
      slug: "cables",
      title: "Generative Cables",
      year: "2024",
      category: "Generative",
      description: "Autonomous modular-synth patch panel driven by Perlin noise, FFT input and time of day.",
      image: "https://picsum.photos/seed/gg-cables/1280/920",  /* PLACEHOLDER */
      featured: false,
      media: [
        { image: "https://picsum.photos/seed/gg-cables-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-cables-b/1000/750" },
        { image: "https://picsum.photos/seed/gg-cables-c/1000/750" }
      ]
    },
    {
      slug: "lumiere",
      title: "Cinema Lumière",
      year: "2024",
      category: "Interactive",
      description: "Front-end cinema experience — programme, seat map and booking flow.",
      image: "https://picsum.photos/seed/gg-lumiere/1280/920", /* PLACEHOLDER */
      featured: false,
      media: [
        { image: "https://picsum.photos/seed/gg-lumiere-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-lumiere-b/1000/750", caption: "Seat map" },
        { image: "https://picsum.photos/seed/gg-lumiere-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-lumiere-d/1600/900" }
      ]
    },
    {
      slug: "aco",
      title: "Aço Specimen",
      year: "2025",
      category: "Typography",
      description: "Display type specimen exploring industrial letterforms and stencil cuts.",
      image: "https://picsum.photos/seed/gg-aco/1280/920",     /* PLACEHOLDER */
      featured: false,
      media: [
        { image: "https://picsum.photos/seed/gg-aco-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-aco-b/1000/750" },
        { image: "https://picsum.photos/seed/gg-aco-c/1000/750", caption: "Stencil cuts" },
        { image: "https://picsum.photos/seed/gg-aco-d/1600/900" },
        { image: "https://picsum.photos/seed/gg-aco-e/1600/900" }
      ]
    },
    {
      slug: "pedra-e-cal",
      title: "Pedra e Cal",
      year: "2024",
      category: "Photography",
      description: "Stone, lime and shadow — vernacular architecture of the Centro region.",
      image: "https://picsum.photos/seed/gg-pedra/1280/920",   /* PLACEHOLDER */
      featured: false,
      media: [
        { image: "https://picsum.photos/seed/gg-pedra-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-pedra-b/1000/750" },
        { image: "https://picsum.photos/seed/gg-pedra-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-pedra-d/1600/900" },
        { image: "https://picsum.photos/seed/gg-pedra-e/1000/750", caption: "Lime wall, midday" },
        { image: "https://picsum.photos/seed/gg-pedra-f/1000/750" },
        { image: "https://picsum.photos/seed/gg-pedra-g/1600/900" }
      ]
    },
    {
      slug: "norte-identity",
      title: "Norte Studio",
      year: "2024",
      category: "Identity",
      description: "Visual identity and stationery for an architecture studio in Porto.",
      image: "https://picsum.photos/seed/gg-norte/1280/920",   /* PLACEHOLDER */
      featured: false,
      media: [
        { image: "https://picsum.photos/seed/gg-norte-a/1600/900" },
        { image: "https://picsum.photos/seed/gg-norte-b/1000/750", caption: "Stationery set" },
        { image: "https://picsum.photos/seed/gg-norte-c/1000/750" },
        { image: "https://picsum.photos/seed/gg-norte-d/1600/900" }
      ]
    }
  ],

  /* Gallery — date format "YYYY-MM" drives the calendar grid view.
     size: "s" | "m" | "l" controls scale on the infinite canvas.
     Add `video: "video/clip.mp4"` to any item to make it a loop.  */
  gallery: [
    { src: "https://picsum.photos/seed/gal-01/900/1200",  date: "2026-05", alt: "Coastal rocks at dusk",        size: "l" },
    { src: "https://picsum.photos/seed/gal-02/1200/900",  date: "2026-05", alt: "Type tests on studio wall",    size: "m" },
    { src: "https://picsum.photos/seed/gal-03/1000/1000", date: "2026-04", alt: "Neon corridor study",          size: "s" },
    { src: "https://picsum.photos/seed/gal-04/1200/800",  date: "2026-04", alt: "Exhibition model, room three", size: "l" },
    { src: "https://picsum.photos/seed/gal-05/900/1200",  date: "2026-03", alt: "Portrait, north light",        size: "m" },
    { src: "https://picsum.photos/seed/gal-06/1100/900",  date: "2026-03", alt: "Generative plotter print",     size: "s" },
    { src: "https://picsum.photos/seed/gal-07/1200/900",  date: "2026-02", alt: "Atlantic horizon",             size: "l" },
    { src: "https://picsum.photos/seed/gal-08/900/1100",  date: "2026-01", alt: "Letterpress drawer",           size: "m" },
    { src: "https://picsum.photos/seed/gal-09/1000/1300", date: "2025-12", alt: "Fog over Leiria castle",       size: "m" },
    { src: "https://picsum.photos/seed/gal-10/1300/900",  date: "2025-11", alt: "Patchbay sequencer in use",    size: "l" },
    { src: "https://picsum.photos/seed/gal-11/1000/1000", date: "2025-11", alt: "Ink studies",                  size: "s" },
    { src: "https://picsum.photos/seed/gal-12/900/1200",  date: "2025-10", alt: "Market awnings, midday",       size: "m" },
    { src: "https://picsum.photos/seed/gal-13/1200/900",  date: "2025-09", alt: "Concrete stair detail",        size: "s" },
    { src: "https://picsum.photos/seed/gal-14/1100/1400", date: "2025-07", alt: "Festival poster paste-up",     size: "l" },
    { src: "https://picsum.photos/seed/gal-15/1200/850",  date: "2025-06", alt: "Dune grass, long lens",        size: "m" },
    { src: "https://picsum.photos/seed/gal-16/950/1200",  date: "2025-04", alt: "Studio desk, work in progress",size: "s" },
    { src: "https://picsum.photos/seed/gal-17/1200/900",  date: "2024-12", alt: "Winter swell at Nazaré",       size: "l" },
    { src: "https://picsum.photos/seed/gal-18/1000/1250", date: "2024-10", alt: "Azulejo facade, Porto",        size: "m" }
  ]
};
