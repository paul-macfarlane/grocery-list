<script lang="ts">
  type IconButtonProps = {
    href: string;
    alt: string;
    src: string;
    linkClass?: string;
    imageClass?: string;
  };

  const { href, alt, src, linkClass, imageClass }: IconButtonProps = $props();
</script>

<a {href} class={`icon-btn ${linkClass}`}>
  <img class={`icon-btn-img ${imageClass}`} {alt} {src} />
</a>

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
