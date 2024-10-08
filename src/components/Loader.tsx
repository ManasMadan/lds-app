"use client";
import { useEffect } from "react";

export default function Loader() {
  useEffect(() => {
    async function getLoader() {
      const { infinity } = await import("ldrs");
      infinity.register();
    }
    getLoader();
  }, []);
  return <l-infinity color="coral"></l-infinity>;
}
