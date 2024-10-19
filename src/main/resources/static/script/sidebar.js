window.addEventListener('load', function () {

    // Call the function when the page loads
    addShowClass();

        const sideItems = document.querySelectorAll('.sideItem');
        const activeIndex = localStorage.getItem('activeSideItem');

        if (activeIndex !== null) {
            sideItems[activeIndex].classList.add('activeSideIcon');
        }

});



// Function to add 'show' class to offcanvas on large screens
    function addShowClass() {
        var offcanvasElement = document.getElementById("offcanvasScrolling");
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
