function setActiveNav(item) {
    // Remove all active classes from the nav elements
    $(".nav.navbar-nav li").removeClass("active")

    // Add to the active page
    $("#"+item).addClass("active")
}
