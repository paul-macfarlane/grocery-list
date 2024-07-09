import { redirect } from "@sveltejs/kit";
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_UI } from "$env/static/private";
import type { RequestHandler } from "./$types";
import { randomBytes } from "crypto";
import { GOOGLE_COOKIE_PATH, GOOGLE_CSRF_STATE_NAME } from "../types";

export const GET: RequestHandler = ({ cookies }) => {
  const state = randomBytes(16).toString("hex");
  cookies.set(GOOGLE_CSRF_STATE_NAME, state, {
    httpOnly: true,
    path: GOOGLE_COOKIE_PATH,
  });

  const scope =
    "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_UI}&scope=${scope}&state=${state}&access_type=offline`;

  redirect(302, authUrl);
};
