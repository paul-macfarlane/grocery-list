<script lang="ts">
  type LinkButtonProps = {
    href: string;
    text: string;
    color: "primary" | "secondary";
  };
  const { href, text, color }: LinkButtonProps = $props();
</script>

<a class={`color-${color}`} {href}>{text}</a>

<style>
  a {
    text-decoration: inherit;
    color: inherit;

    border: 1px solid black;
    padding: 7px;
    border-radius: 4px;
  }

  .color-primary {
    background-color: var(--color-primary);
  }

  .color-secondary {
    background-color: var(--color-secondary);
  }

  a:hover,
  a:focus {
    outline: none;

    border: 2px solid black;
    padding: 6px;
  }

  @media only screen and (min-width: 640px) {
    a {
      border: 2px solid black;
      border-radius: 6px;
      padding: 10px;
    }

    a:hover,
    a:focus {
      border: 3px solid black;
      padding: 9px;
      outline: none;
    }
  }
</style>
