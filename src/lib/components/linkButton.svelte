<script lang="ts">
    type LinkButtonProps = {
        href: string
        text: string
    }
    const {href, text}: LinkButtonProps = $props()
</script>

<a href={href}>{text}</a>

<style>
    a {
        text-decoration: inherit;
        color: inherit;
        background-color: gold;

        border: 1px solid black;
        padding: 7px;
        border-radius: 4px;
    }

    a:hover, a:focus {
        outline: none;

        border: 2px solid black;
        padding: 6px;
    }

    @media only screen and (min-width: 600px) {
        a {
            border: 2px solid black;
            border-radius: 6px;
            padding: 10px;
        }

        a:hover, a:focus {
            border: 3px solid black;
            padding: 9px;
            outline: none;
        }
    }
</style>