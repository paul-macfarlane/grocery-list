<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/button.svelte";
  import type { SubmitFunction } from "./$types";

  const { data } = $props();
  let errorMap = $state(new Map<string, string>());

  const submitFunction: SubmitFunction = () => {
    return async ({ result }) => {
      if (result.type === "success") {
        errorMap = new Map<string, string>();
      } else if (result.type === "error") {
        errorMap = new Map<string, string>().set(
          "form",
          "an unexpected error occurred",
        );
      } else if (result.type === "failure") {
        if (result.status === 400) {
          errorMap =
            result.data?.validationErrorMap ?? new Map<string, string>();
        } else if (result.status === 409) {
          errorMap = new Map<string, string>().set("username", "already taken");
        } else {
          errorMap = new Map<string, string>().set(
            "form",
            "an unexpected error occurred",
          );
        }
      }
    };
  };
</script>

<h2>My Profile</h2>

<form method="POST" use:enhance={submitFunction}>
  {#if !!errorMap.get("form")?.length}
    <div class="error">{errorMap.get("form")}</div>
  {/if}

  {#if !!errorMap.get("username")?.length}
    <div class="error">Username {errorMap.get("username")}</div>
  {/if}
  <div class="profile-form-attribute">
    <label for="username">Username</label>
    <input
      class="profile-form-input"
      id="username"
      name="username"
      type="text"
      placeholder="username"
      value={data.user.username}
      required
      minlength="8"
      maxlength="20"
    />
  </div>

  <div>
    <Button color="primary" type="submit">Save</Button>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  .error {
    font-size: 14px;
    color: red;
  }

  .profile-form-attribute {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .profile-form-input {
    padding: 4px;
    font-size: 14px;
  }
</style>
