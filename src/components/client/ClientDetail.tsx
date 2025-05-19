
import React from "react";
import { ClientDetailContainer } from "./ClientDetailContainer";
import { Toaster } from "@/components/ui/toaster";

export function ClientDetail() {
  return (
    <>
      <ClientDetailContainer />
      <Toaster />
    </>
  );
}
