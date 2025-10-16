// Fix: The original Highlight type had a recursive definition. This has been corrected by defining all properties directly in the interface, which resolves type errors across the application.
export interface Highlight {
  timestamp: string;
  title: string;
  description: string;
  feedback?: 'liked' | 'disliked';
}
