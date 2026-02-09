$(".list-group-item").click(function() {
              
            // Select all list items
            var listItems = $(".list-group-item");
              
            // Remove 'active' tag for all list items
            for (let i = 0; i < listItems.length; i++) {
                listItems[i].classList.remove("active");
            }
              
            // Add 'active' tag for currently selected item
            this.classList.add("active");
        });

// Make header solid after scrolling (global)
(function () {
  function initStickyHeaderSolid() {
    const header = document.getElementById("header-sticky");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 30) header.classList.add("nav-solid");
      else header.classList.remove("nav-solid");
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStickyHeaderSolid);
  } else {
    initStickyHeaderSolid();
  }
})();


(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    const sidebar = document.querySelector(".sidebar__area");
    const overlay = document.querySelector(".body-overlay");
    const openBtn = document.getElementById("sidebar-toggle");
    const closeBtn = document.getElementById("sidebar__close-btn");

    if (!sidebar || !overlay || !openBtn) return;

    function openSidebar() {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openSidebar();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeSidebar();
      });
    }

    overlay.addEventListener("click", closeSidebar);

    // Close on ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSidebar();
    });
  });
})();


$('#mobile-menu').meanmenu({
  meanMenuContainer: '.mobile-menu',
  meanScreenWidth: "991"
});

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header-sticky");
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) header.classList.add("header--solid");
    else header.classList.remove("header--solid");
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

// Solid header after scroll (global)
(function () {
  const header = document.getElementById("header-sticky");
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 10) header.classList.add("header--solid");
    else header.classList.remove("header--solid");
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

(function () {
  // Detect if page has a hero section with data-background
  const hasHero = document.querySelector('.page__title-area[data-background]');
  if (hasHero) document.body.classList.add('has-hero');
  else document.body.classList.add('no-hero');
})();


(function () {
  const hasHero = document.querySelector('.page__title-area[data-background]');
  if (hasHero) document.body.classList.add('has-hero');
})();

