const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const form = document.querySelector(".contact-form");
const formNote = document.querySelector("[data-form-note]");

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent("New consultation request from Atlas Digital Automation website");
  const body = encodeURIComponent(
    `Name: ${data.get("name") || ""}\n` +
      `Email: ${data.get("email") || ""}\n` +
      `Phone: ${data.get("phone") || ""}\n` +
      `Service needed: ${data.get("service") || ""}\n\n` +
      `Message:\n${data.get("message") || ""}`
  );
  if (formNote) {
    formNote.textContent = "Opening your email app with the message addressed to Atlas Digital Automation.";
  }
  window.location.href = `mailto:info@atlasdigitalautomation.com?subject=${subject}&body=${body}`;
  form.reset();
});
