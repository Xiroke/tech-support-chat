<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/admin/login', [AuthController::class, 'loginAdmin']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::resource('chats.messages', MessageController::class)->except(['index', 'show']);
    Route::get('/chats/{chat}', [ChatController::class, 'show']);
    Route::middleware('can:isAdmin,\App\Models\User')->group(function () {
        Route::resource('chats', ChatController::class)->except('show');
        Route::post('/chats/{chat}/read', [ChatController::class, 'setReaded']);
    });
});