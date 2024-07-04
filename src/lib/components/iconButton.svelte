<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";

  type IconButtonProps = {
    onclick?: MouseEventHandler<HTMLButtonElement>;
    alt: string;
    src: string;
    buttonClass?: string;
    type?: "button" | "submit" | "reset";
    imageClass?: string;
  };

  const { onclick, alt, src, buttonClass, type, imageClass }: IconButtonProps =
    $props();
</script>

<button {onclick} type={type ?? "button"} class={`icon-btn ${buttonClass}`}>
  <img class={`icon-btn-img ${imageClass}`} {alt} {src} />
</button>

<style>
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    padding: 0;
    height: min-content;
    width: min-content;
  }

  .icon-btn-img {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    transition: transform 0.3s ease;
  }

  .icon-btn-img:hover,
  .icon-btn:focus-within .icon-btn-img {
    transform: scale(1.1);
  }
</style>
