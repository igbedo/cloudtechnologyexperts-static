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
    const closeBtn = document.getElementById("sidebar__close-btn");

    if (!sidebar || !overlay || !openBtn) return;

    

    function closeSidebar() {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }



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




// ===== GUARANTEED MOBILE MENU TOGGLE =====
document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.querySelector(".sidebar__area");
  const overlay = document.querySelector(".body-overlay");
  const closeBtn = document.getElementById("sidebar__close-btn");

  if (!toggle || !sidebar || !overlay) return;

  const openMenu = () => {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-open");
  };

  const closeMenu = () => {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-open");
  };

  // Click + touch (iOS sometimes needs touchstart)
  toggle.addEventListener("click", openMenu);
  toggle.addEventListener("touchstart", (e) => { e.preventDefault(); openMenu(); }, { passive: false });

  overlay.addEventListener("click", closeMenu);
  closeBtn && closeBtn.addEventListener("click", closeMenu);
});


// ===== SINGLE, RELIABLE MOBILE SIDEBAR TOGGLE =====
document.addEventListener("DOMContentLoaded", () => {
  // Support BOTH ids (old + new), use whichever exists
  const btn =
    document.getElementById("cte-sidebar-toggle") ||
   

  const sidebar = document.querySelector(".sidebar__area");
  const overlay = document.querySelector(".body-overlay");
  const closeBtn = document.getElementById("sidebar__close-btn");

  if (!btn || !sidebar) return;

  const openMenu = (e) => {
    if (e) e.preventDefault();
    sidebar.classList.add("is-open");
    if (overlay) overlay.classList.add("is-open");
    document.body.classList.add("menu-open");
  };

  const closeMenu = (e) => {
    if (e) e.preventDefault();
    sidebar.classList.remove("is-open");
    if (overlay) overlay.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  // Click
  btn.addEventListener("click", openMenu);

  // iPhone portrait sometimes needs touchstart if something is weird
  btn.addEventListener(
    "touchstart",
    (e) => {
      openMenu(e);
    },
    { passive: false }
  );

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
});


/* ==========================
   CTE Overview Section
   ========================== */

.cte-overview-section {
  padding: 100px 0;
  background: #f8fafc;
}

.cte-section-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.cte-section-subtitle {
  font-size: 18px;
  color: #6c757d;
  max-width: 700px;
  margin: 0 auto;
}

/* Cards */
.cte-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  height: 100%;
  box-shadow: 0 15px 40px rgba(0,0,0,0.06);
  transition: 0.3s ease;
}

.cte-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

.cte-card-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 25px;
}

/* List Styling */
.cte-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cte-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.cte-list i {
  color: #f05023; /* your brand orange */
  margin-top: 3px;
  font-size: 18px;
}

/* Note */
.cte-note {
  margin-top: 20px;
  font-size: 14px;
  color: #6c757d;
}

/* Mobile */
@media (max-width: 767px){
  .cte-overview-section {
    padding: 70px 20px;
  }

  .cte-card {
    padding: 30px;
  }

  .cte-section-title {
    font-size: 26px;
  }
}
