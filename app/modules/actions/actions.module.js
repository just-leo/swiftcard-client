angular
    .module('actions', [
        'ui.select',
        'ngSanitize',
        'ui-notification',
        'ngTable',
        'mgcrea.ngStrap.dropdown',
        'mgcrea.ngStrap.datepicker',
        'mgcrea.ngStrap.button',
        'cron-control'
    ])
    .config(function($sceProvider) {
        // Completely disable SCE.  For demonstration purposes only!
        // Do not use in new projects.
        $sceProvider.enabled(false);
    })