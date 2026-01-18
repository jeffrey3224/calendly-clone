"use client"

import {Mosaic} from "react-loading-indicators"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in pt-16">
      <Mosaic color={["#00a6f4"]} size="large" text="Loading..." textColor="black" />
    </div>
  )
}