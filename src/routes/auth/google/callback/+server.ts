import { redirect, type RequestHandler } from "@sveltejs/kit";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_UI,
} from "$env/static/private";
import axios from "axios";
import { createUserSession } from "$lib/services/userSessions";
import type { GoogleUser } from "../../types";

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Code not found", { status: 400 });
  }

  const state = url.searchParams.get("state");
  if (state !== cookies.get("csrf_state")) {
    return new Response("Invalid CSRF token", { status: 400 });
  }

  cookies.delete("csrf_state", { httpOnly: true, path: "/auth/google" });

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_UI,
        grant_type: "authorization_code",
      },
    );
    const accessToken = tokenResponse.data.access_token;

    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const googleUser = userInfoResponse.data as GoogleUser;

    const userSession = await createUserSession({
      id: googleUser.id,
      authProvider: "google",
      email: googleUser.email,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      profilePicUrl: googleUser.picture,
    });
    cookies.set("sessionId", userSession.id, { httpOnly: true, path: "/" });
  } catch (error) {
    console.error(error);

    return new Response("Authentication failed", { status: 500 });
  }

  throw redirect(302, "/");
};
