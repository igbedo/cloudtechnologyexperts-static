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

