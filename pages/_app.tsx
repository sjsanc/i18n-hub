import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useState } from "react";
import colors from "tailwindcss/colors";
import "../styles/globals.css";

const removeColors = () => {
  // @ts-ignore
  delete colors["lightBlue"];
  // @ts-ignore
  delete colors["warmGray"];
  // @ts-ignore
  delete colors["trueGray"];
  // @ts-ignore
  delete colors["coolGray"];
  // @ts-ignore
  delete colors["blueGray"];
};

removeColors();

export const theme = extendTheme({
  colors,
});

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
