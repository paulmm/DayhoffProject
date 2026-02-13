import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/((?!auth|api/auth|_next|fonts|favicon.ico|$).*)",
  ],
};
