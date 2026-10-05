<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'TaskFlow REST API',
        'status' => 'operational',
        'health' => '/api/health',
    ]);
});
