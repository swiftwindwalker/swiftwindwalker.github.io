// Function to handle social handle visibility and menu visibility based on orientation
export function handleLayout() {
    console.log("making social handle icons visible");
    const socialHandle = document.querySelector('.social-handle');
    if (socialHandle) socialHandle.style.display = 'flex';  // Show the social handle icons once the page has loaded
  
    console.log("making sidebar menu visible");
  
    // Media query for checking orientation (portrait)
    const portraitQuery = window.matchMedia("(orientation: portrait)");
  
    if (portraitQuery.matches) { // Check if the orientation is portrait
      // Ensure the elements exist before manipulating them
      const menuBtn = document.querySelector('.menu-btn');
      const sidebarMenuBtn = document.querySelector('.sidebar-menu-btn');
      const menuItems = document.querySelector('.menu-items');
      const navbarContainer = document.querySelector('.navbar-container');
      const sidebarContainer = document.querySelector('.sidebar-container');
  
  
  
      // Show the elements after the page has loaded
      if (menuBtn) menuBtn.style.display = 'block';
      if (sidebarMenuBtn) sidebarMenuBtn.style.display = 'block';
      if (menuItems) menuItems.style.display = 'block';
      if (navbarContainer) navbarContainer.style.display = 'none';
      if (sidebarContainer) sidebarContainer.style.display = 'block';
  
  
  
    } else { // If not portrait (landscape)
      const navbar = document.querySelector('.navbar');
      const navMenu = document.querySelector('.nav-menu');
      const menuBtn = document.querySelector('.menu-btn');
      const sidebarContainer = document.querySelector('.sidebar-container');
      const navbarContainer = document.querySelector('.navbar-container');
  
  
  
  
      if (navbar) navbar.style.opacity = '1';  // Show navbar if in landscape mode
      if (navMenu) navMenu.style.opacity = '1';  // Show navbar if in landscape mode
      if (menuBtn) menuBtn.style.display = 'none';
      if (sidebarContainer) sidebarContainer.style.display = 'none';
      if (navbarContainer) navbarContainer.style.display = 'block';
  
  
  
  
    }
  }
  
  // Run the function on page load
  window.onload = handleLayout;

  
  // Also run the function on window resize
  window.addEventListener('resize', handleLayout);  