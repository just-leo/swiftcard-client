'use strict';

angular.module('app.core.social-auth', [])
    .factory('authApi', ['api', function(api){
        return api.auth;
    }])
    .provider('SocialAuth', function(){
        var params = this.params = {};

        this.configure = function(params){
            angular.extend(this.params, params)
        }

        var allowedDomains = this.allowedDomains = '*'

        this.$get = ['authApi', '$q', '$window', function(authApi, $q, $window){

            var provider = {
                isEnabled: function() {
                    if(!allowedDomains || allowedDomains === '*') return true;
                    var domains = allowedDomains.split(/\s+/);
                    return domains.indexOf($window.location.hostname) > -1
                },
                init: function() {
                    if(!provider.isEnabled()) return;

                    $window.vkAsyncInit = function () {
                        VK.init(params.vk)
                    }

                    $window.fbAsyncInit = function () {
                        // Executed when the SDK is loaded
                        FB.init(params.fb);

                        // Now that we've initialized the JavaScript SDK, we call
                        // FB.getLoginStatus().  This function gets the state of the
                        // person visiting this page and can return one of three states to
                        // the callback you provide.  They can be:
                        //
                        // 1. Logged into your app ('connected')
                        // 2. Logged into Facebook, but not your app ('not_authorized')
                        // 3. Not logged into Facebook and can't tell if they are logged into
                        //    your app or not.
                        //
                        // These three cases are handled in the callback function.

                        //FB.getLoginStatus(function(response) {
                        //    if (response.status === 'connected') {
                        //        // Logged into your app and Facebook.
                        //    } else if (response.status === 'not_authorized') {
                        //        // The person is logged into Facebook, but not your app.
                        //    }
                        //})
                    }
                }
            };

            provider.FBlogin = function($event) {
                $event && $event.preventDefault();
                var deferred = $q.defer();

                if(!provider.isEnabled()) {
                    deferred.reject('provider disabled');
                    return deferred.promise;
                }

                FB.login(function(authReponse){
                    if(authReponse.authResponse){
                        //get Info
                        FB.api('/me', function(user) {
                            if (!user || user.error) {
                                deferred.reject()
                            } else {
                                authReponse.user = user;
                                authApi.fb(authReponse).then(
                                    function (response) {
                                        deferred.resolve(response);
                                    },
                                    function (errResponse) {
                                        deferred.reject()
                                    }
                                )
                            }
                        })
                    } else {
                        deferred.reject()
                    }
                }, {scope: 'public_profile, email'})

                return deferred.promise;
            }

            provider.VKlogin = function($event) {
                $event && $event.preventDefault();
                var deferred = $q.defer();

                if(!provider.isEnabled()) {
                    deferred.reject('provider disabled');
                    return deferred.promise;
                }

                VK.Auth.login(function(authResponse){
                    if (authResponse.session) {
                        if (authResponse.settings) {
                            /* Выбранные настройки доступа пользователя, если они были запрошены */
                        }

                        authApi.vk(authResponse).then(
                            function(response){
                                deferred.resolve(response);
                            },
                            function(errResponse) {
                                deferred.reject()
                            }
                        )
                    } else {
                        deferred.reject()
                    }
                    //VK.Auth.getLoginStatus(authInfo);

                },4194304)//4194304 (+email) http://vk.com/dev/permissions

                return deferred.promise;
            }

            provider.OKlogin = function($event) {
                $event && $event.preventDefault();
                var deferred = $q.defer();

                if(!provider.isEnabled()) {
                    deferred.reject('provider disabled');
                    return deferred.promise;
                }

                //ODKL.Oauth2($event.currentTarget, OKClientId, 'SET STATUS;VALUABLE ACCESS', 'http://api.ok.ru/blank.html' )
                ODKLogin(params.ok.OKClientId, 'VALUABLE ACCESS', params.ok.redirectUri,
                    function(params){
                        authApi.ok(params).then(
                            deferred.resolve,
                            function(errResponse) {
                                deferred.reject()
                            }
                        )
                    }
                )

                return deferred.promise;
            }

            function ODKLogin(clientId, scope, redirectUri, cb){
                window.OKCallback = function(paramStr) {
                    var data = {};
                    paramStr.split('&').forEach(function(part) {
                        var param = part.split('=');
                        data[param[0]] = param[1]
                    })
                    cb(data)
                }
                var url = ODKL.OAUTH2_CONF.main_url.replace( "{clientId}", clientId ).replace("{responseType}", "token").replace("{redirectUri}", encodeURIComponent(redirectUri)).replace("{scope}",  encodeURIComponent(scope));
                var w = window.open('','_blank', 'top='+ODKL.OAUTH2_CONF.tSmall+',left='+ODKL.OAUTH2_CONF.lSmall+',width='+ODKL.OAUTH2_CONF.wSmall+',height='+ODKL.OAUTH2_CONF.hSmall+',resizable=1');
                var t =
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'+
                    '<html lang="ru" xml:lang="ru" xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="content-type" content="text/html; charset=UTF-8" />'+
                    '<title>Одноклассники.ru</title>'+
                    '</head><body style="margin:0;padding:0;"><div style="width:100%;padding:17px 0;text-align:center;background-color:#F93;color:white;font:normal 14px/16px verdana">Происходит загрузка...</div>'+
                    '</body></html>';

                w.document.write(t);
                w.location.href=url;
            }

            return provider;
        }]
    })
    .run(['$ocLazyLoad', 'SocialAuth', function($ocLazyLoad, SocialAuth) {
        SocialAuth.init();
        $ocLazyLoad.load([
            '//vk.com/js/api/openapi.js',
            'https://connect.facebook.net/en_US/sdk.js',
            //'//connect.facebook.net/en_US/sdk/debug.js'
            //'http://api.odnoklassniki.ru/js/fapi5.js',
            //'http://cdn.connect.mail.ru/js/loader.js'
            //'http://ok.ru/oauth/resources.do?type=js'
        ])
    }])