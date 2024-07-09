import { getUserForSessionOrRedirect } from "$lib/services/users";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const user = await getUserForSessionOrRedirect(cookies);

  return {
    user,
    pathname: url.pathname,
  };
};
