<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * GET /api/health
     *
     * Returns application health status.
     * Safe to call without authentication (used by Render health probes).
     * Never exposes credentials or internal paths.
     */
    public function index(): JsonResponse
    {
        $dbOk = false;
        $dbError = null;
        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Throwable $e) {
            $dbError = $e->getMessage();
        }

        return response()->json([
            'success'   => true,
            'message'   => 'TaskFlow API is healthy',
            'app'       => config('app.name'),
            'env'       => app()->environment(),
            'database'  => $dbOk ? 'connected' : 'unavailable',
            'database_error' => $dbError,
        ], $dbOk ? 200 : 503);
    }
}
