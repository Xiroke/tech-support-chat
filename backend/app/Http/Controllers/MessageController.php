<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Http\Requests\StoreMessageRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    /**
     * Создание сообщения
     * @param  StoreMessageRequest  $request
     * @param  Chat  $chat
     * @return \Illuminate\Http\Response
     */
    public function store(StoreMessageRequest $request, Chat $chat)
    {
        $validated = $request->validated();
        if (!empty($validated['image'])) {
            $file = $request->file('image');
            $randomName = Str::random(32).'.'.$file->getClientOriginalExtension();
            $validated['image'] = $request->file('image')->storeAs('/images', $randomName, 'public');
        }
        $message = Message::create($validated + ['user_id' => auth()->id(), 'chat_id' => $chat->id]);
        $chat->update(['is_readed' => false]);

        Redis::publish("chat:{$chat->id}", json_encode([
            'type'    => 'new_message',
            'chat_id' => $chat->id,
            'message' => $message->load('user'),
        ]));

        return response()->noContent();
    }

    /**
     * Удаление сообщения
     * @param  Message  $message
     * @param  Chat  $chat
     * @return \Illuminate\Http\Response
     */
    public function destroy(Message $message, Chat $chat)
    {
        $message->delete();
        return response()->noContent();
    }
}
