// Fix dichiarazioni moduli Next.js 15

declare module 'next/types.js' {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
}

declare module 'next/server.js' {
  export type NextRequest = any;
  export type NextResponse = any;
}

declare module 'next/navigation.js' {
  export function notFound(): never;
}

declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
}

declare module 'next/server' {
  export type NextRequest = Request & { nextUrl: URL; cookies: any };
  export const NextResponse: {
    json(body: any, init?: ResponseInit): Response;
    redirect(url: string | URL, status?: number): Response;
  };
}

declare module 'next/navigation' {
  export function notFound(): never;
  export function useSearchParams(): { get(key: string): string | null };
  export function useRouter(): { push(url: string): void; refresh(): void };
  export function usePathname(): string;
}
