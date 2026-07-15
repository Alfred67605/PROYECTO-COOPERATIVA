<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Security headers to protect against common web vulnerabilities.
     *
     * - X-Frame-Options: Prevents clickjacking (CWE-1021)
     * - X-Content-Type-Options: Prevents MIME-type sniffing (CWE-16)
     * - Referrer-Policy: Controls referrer information leakage
     * - Permissions-Policy: Restricts browser feature access
     * - Strict-Transport-Security: Enforces HTTPS (when in production)
     * - X-XSS-Protection: Legacy XSS filter for older browsers
     * - Content-Security-Policy: Controls resource loading origins
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // HSTS only in production with HTTPS
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Cache-Control for API responses to prevent caching of sensitive data
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }
}
