"use client";

import React from "react";

type ContainerProps = React.PropsWithChildren<{
  className?: string;
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}>;

const maxByWidth: Record<NonNullable<ContainerProps["width"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  "3xl": "max-w-[96rem]",
  full: "max-w-full",
};

export default function Container({
  children,
  className = "",
  width = "xl",
}: ContainerProps) {
  const maxClass = maxByWidth[width];
  return (
    <div className={`${maxClass} w-full mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

