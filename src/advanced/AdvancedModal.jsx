import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';
import centroid from '@turf/centroid';

import SearchInput from '../search/SearchInput';

// Shorthand
const getCentroid = feature =>
  centroid(feature)?.geometry.coordinates.slice().reverse();

const AdvancedModal = props => {

  const mapRef = useRef();

  const [zoom, setZoom] = useState(props.config.defaultZoom);
  const [center, setCenter] = useState(getCentroid(props.feature));
  
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.leafletElement;

      map.pm.addControls({ 
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false 
      });
    }
  }, [mapRef.current]);

  const onOk = () => {
    const geojson = 
      mapRef.current.leafletElement.pm
        .getGeomanLayers()
        .map(l =>  l.toGeoJSON());

    if (geojson.length === 1) {
      props.onOk({
        type: 'Feature',
        geometry: geojson[0].geometry,
      });
    } else if (geojson.length > 1) {
      props.onOk({
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: geojson.map(g => g.geometry)
        }
      });
    } else {
      // TODO
    }
  }

  return ReactDOM.createPortal(
    <div className="r6o-geotagging-advanced-container">
      <div className="r6o-geotagging-advanced-modal" role="dialog">
        <header>
          <SearchInput 
            config={props.config}
            quote={props.quote}
            onSearch={props.onSearch} />

          <button onClick={onOk}>Ok</button>
          <button onClick={props.onCancel}>Cancel</button>
        </header>

        <main>
          <Map 
            ref={mapRef}
            zoom={zoom}
            preferCanvas={true}
            center={center}>

            <TileLayer
              url={props.config.tileUrl} />
          </Map>  
        </main>
      </div>
    </div>, document.body);

}

export default AdvancedModal;