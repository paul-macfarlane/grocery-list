<script lang="ts">
    const {data} = $props()
</script>

<h1>Welcome {data.user.firstName}!</h1>
<a href="/auth/logout">Logout</a>
