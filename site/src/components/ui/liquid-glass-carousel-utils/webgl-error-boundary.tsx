"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function WebGLFallback({
  message,
  className,
  items,
}: {
  message?: string;
  className?: string;
  items?: {src:string;title:string}[];
}) {
  if(items?.length)return <div tabIndex={0} role="region" aria-label="Galeria · Gallery · Galería" className={cn('flex h-full items-center gap-5 overflow-x-auto bg-bone p-6 text-ink',className)}>{items.map(item=><figure key={item.src} className="m-0 w-[min(75vw,380px)] shrink-0"><img src={item.src} alt={item.title} loading="lazy" decoding="async" className="h-[50svh] w-full object-cover"/><figcaption className="mt-4 text-sm">{item.title}</figcaption></figure>)}</div>;
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center p-8 text-center text-sm text-neutral-500",
        className,
      )}
    >
      {message}
    </div>
  );
}

type Props = { children: ReactNode; fallback: ReactNode };

export class WebGLErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("WebGLErrorBoundary", error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
