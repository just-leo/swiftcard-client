'use strict';

angular.module('app.components.version', [
  'app.components.version.interpolate-filter',
  'app.components.version.version-directive'
])

.value('version', '0.1');
