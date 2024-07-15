<script lang="ts">
  type ModalProps = {
    // eslint-disable-next-line
    children: any;
    open: boolean;
  };

  const { children, open }: ModalProps = $props();
  let dialog: HTMLDialogElement;

  $effect(() => {
    if (open && dialog) {
      dialog.showModal();
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  });
</script>

<dialog bind:this={dialog}>
  {@render children()}
</dialog>

<style>
  dialog {
    border-radius: 16px;
  }
</style>
