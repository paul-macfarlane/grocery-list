<script lang="ts">
  import IconLinkButton from "$lib/components/iconLinkButton.svelte";
  import IconButton from "$lib/components/iconButton.svelte";
  import addSvg from "$lib/assets/add.svg";
  import deleteSvg from "$lib/assets/delete.svg";
  import editSvg from "$lib/assets/edit.svg";

  let { data } = $props();
</script>

<header id="lists-header">
  <h2>Grocery Lists</h2>

  <div>
    <IconLinkButton href="/lists/new" alt="create new" src={addSvg} />
  </div>
</header>

<ul id="lists">
  {#each data.groceryLists as groceryList}
    <li class="list-card">
      <div>
        {groceryList.title} - {groceryList.itemsCount} item{groceryList.itemsCount !==
        1
          ? `s`
          : ``}
      </div>

      <div class="list-card-bottom">
        updated {groceryList.updatedAt.toLocaleDateString()}

        <div class="list-card-buttons">
          <IconLinkButton
            imageClass="icon"
            alt="edit list"
            href={`/lists/${groceryList.id}`}
            src={editSvg}
          />

          <form method="POST" action={`/lists/${groceryList.id}?/delete`}>
            <IconButton
              imageClass="icon"
              type="submit"
              alt="delete list"
              src={deleteSvg}
            />
          </form>
        </div>
      </div>
    </li>
  {/each}
</ul>

<style>
  #lists-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  ul {
    padding: 0;
  }

  li {
    list-style: none;
  }

  #lists {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .list-card {
    padding: 16px;
    border: 1px black solid;
    border-radius: 16px;
    width: 280px;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .list-card-bottom {
    font-size: 12px;
    align-self: start;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .list-card-buttons {
    display: flex;
    align-items: center;
  }

  :global {
    .icon {
      width: 24px !important;
      height: 24px !important;
    }
  }
</style>
