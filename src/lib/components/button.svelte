<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";

  type ButtonProps = {
    color: "primary" | "secondary";
    onclick?: MouseEventHandler<HTMLButtonElement>;
    buttonClass?: string;
    // eslint-disable-next-line
    children: any;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  };
  const { color, onclick, buttonClass, children, type, disabled }: ButtonProps =
    $props();
</script>

<button
  {onclick}
  type={type ?? "button"}
  {disabled}
  class={`color-${color} ${buttonClass}`}
  >{@render children()}
</button>

<style>
  button {
    border: 2px solid black;
    border-radius: 6px;
    padding: 10px;
  }

  button:hover,
  button:focus {
    border: 3px solid black;
    padding: 9px;
    outline: none;
  }

  button:disabled {
    opacity: 0.8;
  }

  .color-primary {
    background-color: var(--color-primary);
  }

  .color-secondary {
    background-color: var(--color-secondary);
  }
</style>
