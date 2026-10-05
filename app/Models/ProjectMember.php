<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ProjectMember extends Pivot
{
    protected $table = 'project_members';

    protected $fillable = [
        'project_id',
        'user_id',
        'role',
    ];
}
