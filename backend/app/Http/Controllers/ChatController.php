<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Http\Requests\StoreChatRequest;
use App\Http\Requests\UpdateChatRequest;

class ChatController extends Controller
{
    /**
     * Установление статуса "Прочитано"
     * @param  Chat  $chat
     * @return \Illuminate\Http\Response
     */
    public function setReaded(Chat $chat)
    {
        $chat->update(['is_readed' => true]);
        return response()->noContent();
    }

    /**
     * Список всех чатов
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $chats = Chat::with(['user', 'lastMessage'])->has('lastMessage')->latest()->get()->sortByDesc(fn($chat) => $chat->lastMessage->create_at)->values();
        return response()->json(compact('chats'));
    }

    /**
     * Создание чата
     * @param  StoreChatRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreChatRequest $request)
    {
        $validated = $request->validated();
        Chat::create($validated);
        return response()->noContent();
    }

    /**
     * Получение чата со всеми сообщениями
     * @param  Chat  $chat
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Chat $chat)
    {
        if (auth()->user()->is_admin) {
            $chat->update(['is_readed' => true]);
        }

        return response()->json(['chat' => $chat->load(['messages' => fn ($q) => $q->with('user')->latest()])]);
    }

    /**
     * Редактирование чата
     * @param  UpdateChatRequest  $request
     * @param  Chat  $chat
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateChatRequest $request, Chat $chat)
    {
        $validated = $request->validated();
        $chat->update($validated);
        return response()->noContent();
    }

    /**
     * Удаления чата
     * @param  Chat  $chat
     * @return \Illuminate\Http\Response
     */
    public function destroy(Chat $chat)
    {
        $chat->delete();
        return response()->noContent();
    }
}
