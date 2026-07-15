<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enforce strict model behavior in non-production environments
        // Detects N+1 queries, mass assignment violations, and accessing missing attributes
        Model::shouldBeStrict(! app()->isProduction());

        // Prevent silently discarding attributes not in $fillable
        Model::preventSilentlyDiscardingAttributes(! app()->isProduction());

        // Force HTTPS scheme in production
        if (app()->isProduction()) {
            URL::forceScheme('https');
        }

        // Configure Rate Limiters
        $this->configureRateLimiting();
    }

    /**
     * Configure rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // General API rate limiting: 60 requests per minute per user/IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Login rate limiting: 5 attempts per minute per IP
        // Protects against brute force attacks (CWE-307)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(
                $request->ip()
            )->response(function () {
                return response()->json([
                    'message' => 'Demasiados intentos de inicio de sesión. Intente en 1 minuto.',
                ], 429);
            });
        });
    }
}
