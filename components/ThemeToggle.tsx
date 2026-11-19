"use client";

export default function ThemeToggle() {
  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur(); // so the space bar does not press this button while typing
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.dataset.theme = current === "dark" ? "light" : "dark";
  }

  return (
    <button className="nb-btn" onClick={toggle}>
      Switch theme
    </button>
  );
}