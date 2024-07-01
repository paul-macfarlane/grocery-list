<script lang="ts">
    import type {MouseEventHandler} from "svelte/elements";

    type ButtonProps = {
        color: 'primary' | 'secondary'
        onclick?: MouseEventHandler<HTMLButtonElement>
        classNames?: string
        children: any // todo find a proper type for this
        type?: 'button' | 'submit' | 'reset'
    }
    const { color, onclick, classNames, children, type}: ButtonProps = $props()
</script>

<button {onclick} type={type ?? "button"} class={`color-${color} ${classNames}`}>{@render children()}</button>

<style>
    button {
        text-decoration: inherit;
        color: inherit;


        border: 1px solid black;
        padding: 7px;
        border-radius: 4px;
    }

    button:hover, button:focus {
        outline: none;

        border: 2px solid black;
        padding: 6px;
    }

    @media only screen and (min-width: 600px) {
        button {
            border: 2px solid black;
            border-radius: 6px;
            padding: 10px;
        }

        button:hover, button:focus {
            border: 3px solid black;
            padding: 9px;
            outline: none;
        }
    }

    .color-primary {
        background-color: var(--color-primary);
    }

    .color-secondary {
        background-color: var(--color-secondary);
    }
</style>