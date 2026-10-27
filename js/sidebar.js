import { handleLayout } from '/js/onload.js';  // Import the function

// Fetch sidebar HTML dynamically and insert it into the page
document.addEventListener('DOMContentLoaded', function() {

fetch('/html/sidebar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;
        console.log('sidebar.html loaded?:\n\n', data);

        // After sidebar is loaded, add event listeners to the buttons
        const menuBtn = document.querySelector(".menu-btn");
        const sidebar = document.querySelector(".sidebar");

        // Function to open the sidebar
        function openSidebar() {
            sidebar.classList.add("open");

            setTimeout(() => {
                sidebar.classList.add("show-menu");
            }, 400);
        }

        // Function to close the sidebar
        function closeSidebar() {
            sidebar.classList.remove("show-menu");

            setTimeout(() => {
                sidebar.classList.remove("open");
            }, 500);
        }

        // Function to toggle the sidebar open/close
        function toggleSidebar() {
            if (sidebar.classList.contains("open")) {
                closeSidebar();  // If sidebar is open, close it
            } else {
                openSidebar();   // If sidebar is closed, open it
            }
        }

        // Add event listener to the same menu button to toggle sidebar
        menuBtn.addEventListener("click", toggleSidebar);

        // Handle menu click transitions
        document.querySelectorAll(".menu-link").forEach(link => {
            link.addEventListener("click", function(event) {
                event.preventDefault();
                const targetPage = this.getAttribute("href");

                document.querySelectorAll(".menu-link").forEach((item, index) => {
                    item.style.transform = "scaleY(0)";
                    item.style.opacity = "0";
                    item.style.transitionDelay = `${index * 0.2}s`;
                });

                setTimeout(() => {
                    sidebar.classList.remove("open");

                    setTimeout(() => {
                        window.location.href = targetPage;
                    }, 500);
                }, 800);
            });
        });

        // Logic to calculate the width of the sidebar dynamically for all screen sizes
        function adjustSidebarWidth() {
            let tickerWidth = document.querySelector(".Header-ticker")?.offsetWidth || 100;
            let sidebar = document.querySelector(".sidebar");
            console.log(sidebar); // Check if the sidebar element is correctly targeted

            if (sidebar) {
                //let sidebarWidth = `calc(100vw - ${tickerWidth}px)`;
                let sidebarWidth = "100vw";
                sidebar.style.width = sidebarWidth;
                document.querySelectorAll(".menu-item").forEach(item => {
                    item.style.width = sidebarWidth;
                });
            }
        }

        // Run function on page load and window resize
        menuBtn.addEventListener("click", adjustSidebarWidth);

        // Optional: window.addEventListener("resize", adjustSidebarWidth);
        // Optional: window.addEventListener("load", adjustSidebarWidth);

    })
    .catch(error => {
        console.error('Error loading sidebar:', error);
    });

    // Delay execution by 100ms
    setTimeout(() => {
        console.log("calling handlelayout function from sidebar.js")
        handleLayout();
    }, 100);

      
});
