<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginAdminUserRequest;
use App\Http\Requests\LoginUserRequest;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Авторизация администратора
     * @param  LoginAdminUserRequest  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function loginAdmin(LoginAdminUserRequest $request)
    {
        $validated = $request->validated();

        if (!auth()->attempt($validated)) {
            throw ValidationException::withMessages(['login' => 'Invalid credentials']);
        }

        $user = auth()->user();
        $token = $user->createToken('token')->plainTextToken;
        return response()->json(compact('token', 'user'));
    }

    /**
     * Авторизация пользователя
     * @param  LoginUserRequest  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function login(LoginUserRequest $request)
    {
        $validated = $request->validated();

        $randomPassword = Str::password();
        User::create(['login' => $validated['login'], 'password' => Hash::make($randomPassword)]);

        if (!auth()->attempt(['login' => $validated['login'], 'password' => $randomPassword])) {
            throw ValidationException::withMessages(['email' => 'Invalid credentials']);
        }

        $user = auth()->user();

        $chat = Chat::create(['user_id' => $user->id]);

        $token = $user->createToken('token')->plainTextToken;
        return response()->json(compact('token', 'chat', 'user'));
    }
}
