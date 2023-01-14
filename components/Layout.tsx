import { Spinner } from "@chakra-ui/react";
import { useSession } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import Head from "next/head";
import { useEffect } from "react";
import { useStore } from "../stores/useAppStore";
import supabase from "../utils/supabase";
import { Footer } from "./Footer";
import SettingsModal from "./SettingsModal";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: any }) {
  const session = useSession();

  const init = useStore((state) => state.init);

  const authorized = useStore((state) => state.authorized);
  const setAuthorized = useStore((state) => state.setAuthorized);

  const dataLoaded = useStore((state) => state.dataLoaded);
  const setDataLoaded = useStore((state) => state.setDataLoaded);

  useEffect(() => {
    if (!session) setAuthorized(false);
    else if (!dataLoaded) {
      setAuthorized(true);
      init().then((res) => setDataLoaded(res));
    }
  }, [session]);

  if (!dataLoaded && !authorized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner thickness="5px" speed="0.4s" color="rose.500" size="xl" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="h-screen w-screen bg-zinc-900 flex items-center justify-center">
        <div className="border border-zinc-800 rounded p-3 text-white bg-white box-shadow">
          <h1 className="text-xl text-zinc-800 text-center">i18n-hub</h1>
          <Auth
            redirectTo="http://localhost:3000/"
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabase}
            socialLayout="horizontal"
          />
        </div>
      </div>
    );
  }

  if (dataLoaded && authorized === true) {
    return (
      <>
        <Head>
          <title>i18n-hub</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="fixed h-screen w-screen bg-white flex items-center">
          <Sidebar />
          <div className="flex flex-col h-full grow">
            {children}
            <Footer />
          </div>
          <SettingsModal />
        </main>
      </>
    );
  }

  return null;
}
