<?php

namespace App\Http\Requests;

class StoreAttachmentRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg,webp,gif,svg,zip,txt,csv,json',
            ],
        ];
    }
}
