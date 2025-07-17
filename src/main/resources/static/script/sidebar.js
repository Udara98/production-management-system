window.addEventListener('load', function () {
    // Add show class to sidebar container
    const sidebarContainer = document.getElementById('sidebarContainer');
    if (sidebarContainer) {
        sidebarContainer.classList.add('show');
    }

    // Handle active states for sidebar items
    const sideItems = document.querySelectorAll('.sideItem');
    const currentPath = window.location.pathname;
    
    sideItems.forEach((item, index) => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === currentPath) {
            item.classList.add('activeSideIcon');
            localStorage.setItem('activeSideItem', index);
        }
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('activeSideIcon')) {
                this.classList.add('hover');
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
});



// Function to add 'show' class to offcanvas on large screens
    function addShowClass() {
        var offcanvasElement = document.getElementById("offcanvasScrolling");
        if (!offcanvasElement) return;
        if (window.matchMedia("(min-width: 768px)").matches) {
          offcanvasElement.classList.add("show");
        } else {
          offcanvasElement.classList.remove("show");
        }
      }
  

      // Listen for window resize events and update the 'show' class
      window.addEventListener("resize", addShowClass);

    function toggleHoverLock(clickedItem) {
        // Toggle the 'locked' class on the clicked item
        clickedItem.classList.add('activeSideIcon');

        // Remove 'locked' class from all other items
        const sideItems = document.querySelectorAll('.sideItem');
        sideItems.forEach(function(item) {
            if (item !== clickedItem) {
                item.classList.remove('activeSideIcon');
            }
        });
           // Store the active item's index or ID in local storage
            const activeIndex = Array.from(sideItems).indexOf(clickedItem);
            localStorage.setItem('activeSideItem', activeIndex);
    }
