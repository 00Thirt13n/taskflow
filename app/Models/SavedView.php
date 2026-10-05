<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'filters',
        'view_mode',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'filters' => 'array',
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
