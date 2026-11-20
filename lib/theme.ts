// Switches between light and dark by changing data-theme on the page.
// Our CSS variables in globals.css already react to it.
export function toggleTheme() {
  const root = document.documentElement;
  const current =
    root.dataset.theme ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.dataset.theme = current === "dark" ? "light" : "dark";
}