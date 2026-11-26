import Svg, { Rect, Circle, Line, Path, Polygon, Text as SvgText, G } from 'react-native-svg';

export function WorkshopScene() {
  return (
    <Svg viewBox="0 0 1000 700" width="100%" height="100%" accessibilityLabel="Atelier de restauration avec table de travail et échantillons de tissus">
      <Rect x={0} y={0} width={1000} height={700} fill="#1B2030" />
      <Rect x={0} y={0} width={1000} height={470} fill="#232B3C" />
      <Rect x={0} y={470} width={1000} height={230} fill="#2C2A26" />
      {[510, 550, 590, 630].map((y) => (
        <Line key={`f${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="#35322C" strokeWidth={1.5} />
      ))}
      <Rect x={0} y={464} width={1000} height={8} fill="#2E374A" />
      <Rect x={640} y={60} width={4} height={200} stroke="#3B465E" strokeWidth={4} fill="none" />
      <Rect x={640} y={60} width={4} height={10} fill="#C4A66A" />
      <Rect x={700} y={252} width={220} height={98} rx={6} fill="#3A3226" stroke="#54493A" strokeWidth={3} />
      {[
        '#2E4A78', '#3E5C8A', '#22364F', '#4A6FA5', '#1E2E44', '#5A78A0',
      ].map((c, i) => (
        <Rect key={`sw${i}`} x={712 + (i % 3) * 68} y={264 + Math.floor(i / 3) * 38} width={58} height={28} rx={3} fill={c} stroke="#0E1420" strokeWidth={1} />
      ))}
      <SvgText x={712} y={344} fill="#C4A66A" fontSize={13}>TISSUS — « coton bleu nuit »</SvgText>
      <Rect x={80} y={330} width={130} height={150} fill="#20293A" stroke="#3B465E" strokeWidth={3} />
      {[352, 400, 448].map((y) => (
        <Line key={`sh${y}`} x1={84} y1={y} x2={206} y2={y} stroke="#2E3848" strokeWidth={4} />
      ))}
      <G>
        <Rect x={92} y={386} width={44} height={14} rx={2} fill="#B5893E" />
        <Rect x={142} y={386} width={44} height={14} rx={2} fill="#A94747" opacity={0.8} />
        <Rect x={92} y={432} width={70} height={16} rx={2} fill="#5C6E86" />
      </G>
      <Rect x={220} y={350} width={400} height={130} fill="#4A3B28" />
      <Rect x={220} y={350} width={400} height={14} fill="#5C4A33" />
      <Rect x={240} y={480} width={26} height={190} fill="#3A2E20" />
      <Rect x={574} y={480} width={26} height={190} fill="#3A2E20" />
      <G>
        <Rect x={300} y={308} width={160} height={49} rx={4} fill="#DCD8CB" stroke="#8A94A8" strokeWidth={1.5} />
        <SvgText x={312} y={326} fill="#26303F" fontSize={13} fontWeight="bold">REGISTRE DE SORTIE</SvgText>
        <Line x1={312} y1={334} x2={448} y2={334} stroke="#9AA3B2" strokeWidth={1.5} />
        <SvgText x={312} y={348} fill="#3A4050" fontSize={11}>21:03 — M. Simon → sortie</SvgText>
      </G>
      <G>
        <Rect x={550} y={308} width={130} height={49} rx={4} fill="#D3CFc2" stroke="#8A94A8" strokeWidth={1.5} />
        <SvgText x={560} y={326} fill="#26303F" fontSize={12} fontWeight="bold">INVENTAIRE</SvgText>
        <Line x1={560} y1={334} x2={668} y2={334} stroke="#9AA3B2" strokeWidth={1.5} />
        <SvgText x={560} y={348} fill="#3A4050" fontSize={10}>arrêté au 12/11</SvgText>
      </G>
      <Rect x={270} y={392} width={120} height={36} rx={4} fill="#3E5C8A" />
      <Rect x={270} y={392} width={120} height={8} rx={4} fill="#5A78A0" />
      <Circle cx={430} cy={410} r={12} fill="#8A7A4E" />
      <Rect x={452} y={400} width={60} height={8} rx={3} fill="#9AA3B2" />
      <Rect x={452} y={414} width={44} height={8} rx={3} fill="#6C7686" />
      <Rect x={820} y={120} width={120} height={80} rx={4} fill="#161C28" stroke="#3B465E" strokeWidth={2} />
      <Circle cx={880} cy={160} r={24} fill="#232C3E" stroke="#4A5570" strokeWidth={2} />
      <Path d="M 866 160 L 894 160 M 880 146 L 880 174" stroke="#4A5570" strokeWidth={2} />
    </Svg>
  );
}
