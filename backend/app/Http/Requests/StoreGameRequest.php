<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:5000'],
            'image' => ['required', 'image', 'max:4096', 'mimes:jpg,jpeg,png,webp'],
            'tags' => ['sometimes', 'array', 'max:8'],
            'tags.*' => ['string', 'max:40'],
            'social_links' => ['sometimes', 'array', 'max:10'],
            'social_links.*.platform' => ['required', 'string', 'max:30'],
            'social_links.*.url' => ['required', 'url', 'max:2048'],
            'confirm_duplicate' => ['sometimes', 'boolean'],
        ];
    }
}
