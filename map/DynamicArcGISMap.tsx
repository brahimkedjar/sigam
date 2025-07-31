import dynamic from 'next/dynamic';

const ArcGISMap = dynamic(() => import('./ArcGISMap'), {
  ssr: false, // disables server-side rendering, important for map libs
  loading: () => <p>Chargement de la carte...</p>,
});

export default ArcGISMap;
