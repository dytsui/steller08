declare namespace JSX { interface IntrinsicElements { [elemName: string]: any; } }
declare module 'react' {
  export type ReactNode = any;
  export type CSSProperties = Record<string, any>;
  export type PropsWithChildren<T = any> = T & { children?: any };
  export type HTMLAttributes<T = any> = Record<string, any>;
  export type ButtonHTMLAttributes<T = any> = Record<string, any>;
  export type RefObject<T = any> = { current: T | null };
  export type FormEvent<T = any> = any;
  export function createContext<T = any>(value: T): any;
  export function useContext<T = any>(value: any): T;
  export function useEffect(...args: any[]): any;
  export function useMemo(...args: any[]): any;
  export function useRef<T = any>(value?: T): { current: T };
  export function useState<T = any>(value?: T): [T, (value: any) => void];
}
declare module 'next' { export type Metadata = any; }
declare module 'next/link' { const Link: any; export default Link; }
declare module 'next/navigation' { export function useRouter(): any; export function useSearchParams(): any; export function usePathname(): any; export function redirect(url: string): any; }
declare module 'next/headers' { export function cookies(): Promise<any>; }
declare module 'next/server' { export type NextRequest = any; export const NextResponse: { json: (body: any, init?: any) => any; next: () => any; redirect: (url: any) => any; }; }
declare module '@opennextjs/cloudflare' { export function getCloudflareContext(): any; export function defineCloudflareConfig(config: any): any; }
declare module '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache' { const value: any; export default value; }
declare module '@mediapipe/tasks-vision' { export const FilesetResolver: any; export const PoseLandmarker: any; export type PoseLandmarkerResult = any; }
declare const Buffer: any; declare const process: any;
