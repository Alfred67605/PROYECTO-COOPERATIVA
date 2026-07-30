<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(array_unique(array_merge(
        [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'https://koyositasrl.org',
            'https://www.koyositasrl.org',
            'https://alfredo.inginformatica.dev',
        ],
        explode(',', env('FRONTEND_URL', ''))
    )))),

    'allowed_origins_patterns' => [
        '#^https?://.*\.koyositasrl\.org$#i',
        '#^https?://.*\.inginformatica\.dev$#i',
        '#^https?://koyositasrl\.org$#i',
    ],

    'allowed_headers' => [
        '*',
    ],

    'exposed_headers' => [],

    'max_age' => 7200,

    'supports_credentials' => true,

];
