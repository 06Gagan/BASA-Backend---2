// public/scripts/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const tabs = document.querySelectorAll(".nav-link");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      tabs.forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("show", "active");
      });
      tab.classList.add("active");
      const target = document.querySelector(tab.getAttribute("href"));
      if (target) {
        target.classList.add("show", "active");
      }
    });
  });

  // Automatically activate the first tab
  if (tabs.length) {
    tabs[0].click();
  }

  // Helper to set up "Edit" buttons that open modals & set form actions
  const setupEditButton = (btnClass, modalId, fieldMapping, formActionBase) => {
    const editButtons = document.querySelectorAll(btnClass);
    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modal = document.getElementById(modalId);
        const form = modal.querySelector("form");

        // Populate fields from data-* attributes
        fieldMapping.forEach(({ field, attribute }) => {
          const element = modal.querySelector(`#${field}`);
          if (element) {
            const val = button.getAttribute(attribute) || "";
            if (element.type === "checkbox") {
              element.checked = (val === "true" || val === "on");
            } else {
              element.value = val;
            }
          }
        });

        // ID => final form action => /admin/xxx/update/ID
        const id = button.getAttribute("data-id");
        form.action = `${formActionBase}/${id}`;

        // Show the modal (using Bootstrap + jQuery)
        $(`#${modalId}`).modal("show");
      });
    });
  };

  // Publications
  setupEditButton(
    ".edit-publication-btn",
    "editPublicationModal",
    [
      { field: "edit-publication-id", attribute: "data-id" },
      { field: "edit-publication-title", attribute: "data-title" },
      { field: "edit-publication-description", attribute: "data-description" },
      { field: "edit-publication-date", attribute: "data-publication_date" },
      { field: "edit-publication-link", attribute: "data-link" },
    ],
    "/admin/publications/update"
  );

  // News
  setupEditButton(
    ".edit-news-btn",
    "editNewsModal",
    [
      { field: "edit-news-id", attribute: "data-id" },
      { field: "edit-news-title", attribute: "data-title" },
      { field: "edit-news-content", attribute: "data-content" },
      { field: "edit-news-date", attribute: "data-date" },
      { field: "edit-news-link", attribute: "data-link" },
    ],
    "/admin/news/update"
  );

  // Projects
  setupEditButton(
    ".edit-project-btn",
    "editProjectModal",
    [
      { field: "edit-project-id", attribute: "data-id" },
      { field: "edit-project-title", attribute: "data-title" },
      { field: "edit-project-type", attribute: "data-type" },
      { field: "edit-project-category", attribute: "data-category" },
      { field: "edit-project-duration", attribute: "data-duration" },
      { field: "edit-project-agency", attribute: "data-agency" },
      { field: "edit-project-value", attribute: "data-value" },
    ],
    "/admin/projects/update"
  );
  

  // People
  setupEditButton(
    ".edit-person-btn",
    "editPersonModal",
    [
      { field: "edit-person-id", attribute: "data-id" },
      { field: "edit-person-name", attribute: "data-name" },
      { field: "edit-person-type", attribute: "data-type" },
      { field: "edit-person-category", attribute: "data-category" },
      { field: "edit-person-current_position", attribute: "data-current_position" },
      { field: "edit-person-thesis_supervised", attribute: "data-thesis_supervised" },
      { field: "edit-person-additional_info", attribute: "data-additional_info" },
    ],
    "/admin/people/update"
  );
});
