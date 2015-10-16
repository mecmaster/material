(function($) {
  ymaps.ready(function() {
    ymaps.geolocation.get({
      provider: 'yandex'
    }).then(function(result) {
      var map, _objectManager, _balloonContentLayout, _onPointHandler, _onMapBoundsChange;

      var total_points = $('#total_points'), view_last_month = $('#view_last_month');

      _balloonContentLayout = ymaps.templateLayoutFactory.createClass("<p>$[properties.data.address]<br>$[properties.data.description]<br>$[properties.data.spot_type]</p>");

      map = new ymaps.Map('map', {
        center: result.geoObjects.position,
        zoom: 7,
        behaviors: ['default', 'scrollZoom'],
        controls: ['fullscreenControl', 'geolocationControl', 'searchControl', 'typeSelector', 'zoomControl']
      });

      _objectManager = new ymaps.ObjectManager({
        clusterize: false,
        geoObjectOpenBalloonOnClick: false
      });

      map.geoObjects.add(_objectManager);

      _onPointHandler = function(e) {
        var id;
        id = e.get('objectId');
        _objectManager.objects.balloon.open(id);
      };

      _objectManager.objects.events.add('click', _onPointHandler, this);

      _onMapBoundsChange = function() {
        var rectangle = new ymaps.geometry.Rectangle(map.getBounds());
        rectangle.options.setParent(map.options);
        rectangle.setMap(map);

        var included = [], total_statistics = 0;

        _objectManager.objects.each(function(object) {
          if (rectangle.contains(object.geometry.coordinates)) {
            included.push(object);
          }
        });

        $.map(included, function(o) {
          total_statistics = total_statistics + o.properties.data.statistics
        });
        
        total_points.html(included.length);
        view_last_month.html(total_statistics);

        return true
      };

      map.events.add('boundschange', _onMapBoundsChange);

      $.ajax({
        type: 'GET',
        url: 'routers.json',
        dataType: 'json'
      }).done(function(res) {
        _objectManager.add(res);
        map.events.fire('boundschange');
      });

      _objectManager.objects.options.set({
        preset: 'islands#blueCircleDotIcon',
        hideIconOnBalloonOpen: false,
        balloonContentLayout: _balloonContentLayout,
        strokeWidth: 3,
        geodesic: true
      });

      return map;
    });
  });
})(jQuery);