process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js/app.js')
   .sass('resources/scss/app.scss', 'public/css/app.css');
