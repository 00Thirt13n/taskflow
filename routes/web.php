<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Single-Page Application Fallback)
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    $spaIndex = public_path('index.html');
    if (File::exists($spaIndex)) {
        return Response::file($spaIndex, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
    return view('welcome');
})->where('any', '^(?!api).*$');
