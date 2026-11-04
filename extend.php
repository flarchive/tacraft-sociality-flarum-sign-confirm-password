<?php

namespace TacraftSociality\SignConfirmPassword;

use Flarum\Extend;

$slug = 'tacraft-sociality-sign-confirm-password';

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    new Extend\Locales(__DIR__.'/locale'),


    // Password strength indicator settings, editable from the extension page.
    (new Extend\Settings())
        ->default("$slug.weakColor", '#e5484d')
        ->default("$slug.mediumColor", '#f5a524')
        ->default("$slug.strongColor", '#30a46c')
        ->default("$slug.enableInputColor", false)
        ->default("$slug.enableInputBorderColor", true)
        ->default("$slug.enablePasswordToggle", true)
        ->serializeToForum("$slug.weakColor", "$slug.weakColor")
        ->serializeToForum("$slug.mediumColor", "$slug.mediumColor")
        ->serializeToForum("$slug.strongColor", "$slug.strongColor")
        ->serializeToForum("$slug.enableInputColor", "$slug.enableInputColor", 'boolval')
        ->serializeToForum("$slug.enableInputBorderColor", "$slug.enableInputBorderColor", 'boolval')
        ->serializeToForum("$slug.enablePasswordToggle", "$slug.enablePasswordToggle", 'boolval'),
];
