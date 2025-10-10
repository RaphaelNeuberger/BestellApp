// Beispiel: Dark Mode Toggle speichern
const toggleTheme = () => {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-theme") ? "dark" : "light"
  );
};

// Beim Laden: gespeichertes Theme anwenden
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
}
