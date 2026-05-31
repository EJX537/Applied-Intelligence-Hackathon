// Insforge backend client. Anon key is safe to ship in client code.
import { createClient } from '@insforge/sdk';
const INSFORGE_URL = 'https://axp58q2i.us-east.insforge.app';
const INSFORGE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTkzNzF9.JWU7NFZiO2nvb2EMenwKS0hvEN-svd0P4HuhRPCQLxw';
export const insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
});
