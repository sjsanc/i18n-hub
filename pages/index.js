import { useEffect } from "react";
import styles from "../styles/Home.module.css";

const getKeys = async (e) => {
  const keys = await supabase.from("keys").select("*");
  console.log(keys);
};

export default function Home() {
  useEffect(() => {
    getKeys();
  }, []);

  return <div className={styles.container}>working</div>;
}
