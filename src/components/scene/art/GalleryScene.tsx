import Svg, { Rect, Circle, Polygon, Line, Path, G } from 'react-native-svg';

export function GalleryScene() {
  return (
    <Svg viewBox="0 0 1000 700" width="100%" height="100%" accessibilityLabel="Galerie principale du musée, vitrine centrale vide">
      <Rect x={0} y={0} width={1000} height={700} fill="#1B2230" />
      <Rect x={0} y={0} width={1000} height={480} fill="#232B3B" />
      <Rect x={0} y={480} width={1000} height={220} fill="#2E2620" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Line key={`plank${i}`} x1={i * 180} y1={700} x2={i * 180 + 120} y2={480} stroke="#3A3027" strokeWidth={3} />
      ))}
      {[520, 560, 600, 640].map((y) => (
        <Line key={`floor${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="#332A22" strokeWidth={1.5} />
      ))}
      <Rect x={0} y={440} width={1000} height={40} fill="#2A3346" />
      <Rect x={0} y={440} width={1000} height={6} fill="#39445C" />
      {[80, 280, 640, 840].map((x) => (
        <G key={`frame${x}`}>
          <Rect x={x} y={140} width={130} height={200} fill="#161C28" stroke="#3B465E" strokeWidth={3} />
          <Rect x={x + 12} y={152} width={106} height={176} fill="#1E2635" />
        </G>
      ))}
      <Rect x={620} y={140} width={130} height={200} fill="#161C28" stroke="#3B465E" strokeWidth={3} />
      <Rect x={632} y={152} width={106} height={176} fill="#20293A" />
      <Circle cx={135} cy={112} r={38} fill="#12182B" stroke="#8A7A4E" strokeWidth={4} />
      <Line x1={135} y1={112} x2={135} y2={90} stroke="#C4A66A" strokeWidth={3} />
      <Line x1={135} y1={112} x2={152} y2={120} stroke="#C4A66A" strokeWidth={3} />
      <G>
        <Rect x={820} y={40} width={70} height={26} rx={6} fill="#20293A" stroke="#3B465E" strokeWidth={2} />
        <Circle cx={855} cy={80} r={22} fill="#0E1420" stroke="#4A5570" strokeWidth={3} />
        <Circle cx={855} cy={80} r={7} fill="#648B72" />
        <Line x1={855} y1={58} x2={855} y2={20} stroke="#3B465E" strokeWidth={4} />
        <Line x1={925} y1={20} x2={855} y2={20} stroke="#3B465E" strokeWidth={4} />
      </G>
      <Rect x={400} y={430} width={160} height={240} fill="#39322A" />
      <Rect x={400} y={430} width={160} height={12} fill="#4A4136" />
      <Rect x={412} y={442} width={136} height={228} fill="#2F2822" />
      <Rect x={392} y={284} width={176} height={150} fill="#2A3547" stroke="#8A94A8" strokeWidth={2} opacity={0.9} />
      <Polygon points="392,284 568,284 568,296 392,296" fill="#9AA6BC" opacity={0.35} />
      <Polygon points="392,284 404,284 404,434 392,434" fill="#9AA6BC" opacity={0.25} />
      <Rect x={452} y={376} width={96} height={20} rx={4} fill="#232C3E" stroke="#3B465E" strokeWidth={1.5} />
      <Circle cx={472} cy={384} r={2.5} fill="#3E5C8A" />
      <Circle cx={503} cy={380} r={2} fill="#2E4A78" />
      <Circle cx={527} cy={387} r={2.2} fill="#3E5C8A" />
      <Path d="M 500 382 q 6 -6 14 -3" stroke="#4A6FA5" strokeWidth={1.6} fill="none" />
      <Rect x={392} y={284} width={176} height={150} fill="none" stroke="#0E1420" strokeWidth={4} />
      <Rect x={388} y={462} width={38} height={40} rx={4} fill="#20293A" stroke="#4A5570" strokeWidth={2} />
      <Circle cx={407} cy={482} r={8} fill="#0E1420" stroke="#8A7A4E" strokeWidth={2} />
      <Rect x={528} y={462} width={40} height={40} rx={4} fill="#20293A" stroke="#4A5570" strokeWidth={2} opacity={0.9} />
      <Circle cx={542} cy={478} r={1.8} fill="#9AA3B2" opacity={0.7} />
      <Circle cx={553} cy={490} r={2} fill="#9AA3B2" opacity={0.5} />
      <Rect x={380} y={664} width={200} height={16} fill="#241E18" />
      <Rect x={0} y={0} width={1000} height={700} fill="none" />
    </Svg>
  );
}
