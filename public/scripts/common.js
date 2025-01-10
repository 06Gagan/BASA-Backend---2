// Function to open the sidebar
function openNav() {
  const sidebar = document.getElementById("mySidebar");
  sidebar.style.width = "250px";

  // Ensure the research dropdown is closed when opening the sidebar on small screens
  if (window.innerWidth <= 768) {
    const dropdown = document.getElementById("researchDropdown");
    dropdown.style.display = "none"; // Ensure it's closed
  }

  // Add a click-outside listener only once the sidebar is open
  setTimeout(() => document.addEventListener("click", closeSidebarOnClickOutside), 0);
}

// Function to close the sidebar
function closeNav() {
  const sidebar = document.getElementById("mySidebar");
  sidebar.style.width = "0";

  // Remove the click-outside listener when the sidebar is closed
  document.removeEventListener("click", closeSidebarOnClickOutside);
}

// Function to close the sidebar if clicking outside of it
function closeSidebarOnClickOutside(event) {
  const sidebar = document.getElementById("mySidebar");
  const openBtn = document.querySelector(".openbtn");

  // Close sidebar only if the click is outside the sidebar and not on the open button
  if (!sidebar.contains(event.target) && event.target !== openBtn) {
    closeNav();
  }
}

// Prevent immediate closure when clicking the open button to open the sidebar
document.querySelector(".openbtn").addEventListener("click", function (event) {
  event.stopPropagation();
});

// Function to toggle the research dropdown visibility within the sidebar
function toggleResearchDropdown() {
  const dropdown = document.getElementById("researchDropdown");

  // Toggle between showing and hiding the dropdown content
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

// Automatically close the sidebar when resizing to a larger screen
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeNav();
  }
});

// Directly redirect to /login on pressing Ctrl + L
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "l") {
    window.location.href = "/login"; // Redirect to the login page
  }
});
