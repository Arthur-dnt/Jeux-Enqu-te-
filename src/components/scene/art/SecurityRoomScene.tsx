import Svg, { Rect, Circle, Line, Polygon, Text as SvgText, G } from 'react-native-svg';

export function SecurityRoomScene() {
  return (
    <Svg viewBox="0 0 1000 700" width="100%" height="100%" accessibilityLabel="Poste de sécurité avec écrans de surveillance et documents">
      <Rect x={0} y={0} width={1000} height={700} fill="#171E2B" />
      <Rect x={0} y={0} width={1000} height={500} fill="#1E2736" />
      <Rect x={0} y={500} width={1000} height={200} fill="#262E3C" />
      {[540, 580, 620, 660].map((y) => (
        <Line key={`f${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="#2E3848" strokeWidth={1.5} />
      ))}
      <Rect x={0} y={494} width={1000} height={8} fill="#2A3547" />
      <Rect x={140} y={180} width={420} height={170} rx={8} fill="#141B28" stroke="#3B465E" strokeWidth={3} />
      {[0, 1].map((c) =>
        [0, 1].map((r) => (
          <G key={`mon${c}-${r}`}>
            <Rect x={158 + c * 200} y={196 + r * 78} width={182} height={64} rx={4} fill="#0D1420" stroke="#2E3848" strokeWidth={2} />
            <Rect x={166 + c * 200} y={204 + r * 78} width={166} height={48} rx={2} fill={c === 0 && r === 0 ? '#17324A' : '#12202E'} />
            <Line x1={172 + c * 200} y1={216 + r * 78} x2={326 + c * 200} y2={216 + r * 78} stroke={c === 0 && r === 0 ? '#2E5E86' : '#22344A'} strokeWidth={2} />
            <Line x1={172 + c * 200} y1={230 + r * 78} x2={326 + c * 200} y2={230 + r * 78} stroke="#1B2C40" strokeWidth={2} />
            <Line x1={172 + c * 200} y1={242 + r * 78} x2={326 + c * 200} y2={242 + r * 78} stroke="#1B2C40" strokeWidth={2} />
          </G>
        ))
      )}
      <Rect x={330} y={350} width={80} height={10} fill="#20293A" />
      <Rect x={250} y={360} width={240} height={130} fill="#33291F" />
      <Rect x={250} y={360} width={240} height={10} fill="#443627" />
      <Rect x={262} y={370} width={216} height={120} fill="#2B2219" />
      <Rect x={290} y={410} width={70} height={14} rx={3} fill="#D8D5C8" stroke="#8A94A8" strokeWidth={1} />
      <Circle cx={305} cy={417} r={7} fill="#5C6E86" />
      <SvgText x={322} y={422} fill="#3A4050" fontSize={11} fontWeight="bold">G-04</SvgText>
      <Rect x={560} y={250} width={290} height={310} fill="#33291F" />
      <Rect x={560} y={250} width={290} height={12} fill="#443627" />
      <Rect x={574} y={262} width={262} height={298} fill="#2B2219" />
      <G>
        <Rect x={596} y={262} width={212} height={78} rx={4} fill="#DCD8CB" stroke="#8A94A8" strokeWidth={1.5} />
        <SvgText x={608} y={280} fill="#26303F" fontSize={13} fontWeight="bold">APPELS INTERNES</SvgText>
        <Line x1={608} y1={290} x2={796} y2={290} stroke="#9AA3B2" strokeWidth={1.5} />
        <SvgText x={608} y={308} fill="#3A4050" fontSize={11}>21:10 → bureau dir. (14 min)</SvgText>
        <SvgText x={608} y={324} fill="#3A4050" fontSize={11}>fixe — combiné filaire</SvgText>
      </G>
      <G>
        <Rect x={596} y={358} width={212} height={82} rx={4} fill="#DCD8CB" stroke="#8A94A8" strokeWidth={1.5} />
        <SvgText x={608} y={376} fill="#26303F" fontSize={13} fontWeight="bold">JOURNAL OPÉRATIONS</SvgText>
        <Line x1={608} y1={386} x2={796} y2={386} stroke="#9AA3B2" strokeWidth={1.5} />
        <SvgText x={608} y={402} fill="#3A4050" fontSize={11}>21:08 caméra OFF — G-04</SvgText>
        <SvgText x={608} y={416} fill="#3A4050" fontSize={11}>21:11 alarme OFF — G-04</SvgText>
        <SvgText x={608} y={430} fill="#3A4050" fontSize={11}>21:20/21:21 ON — G-04</SvgText>
      </G>
      <G>
        <Rect x={596} y={456} width={212} height={82} rx={4} fill="#DCD8CB" stroke="#8A94A8" strokeWidth={1.5} />
        <SvgText x={608} y={474} fill="#26303F" fontSize={13} fontWeight="bold">JOURNAL D'ACCÈS</SvgText>
        <Line x1={608} y1={484} x2={796} y2={484} stroke="#9AA3B2" strokeWidth={1.5} />
        <SvgText x={608} y={500} fill="#3A4050" fontSize={11}>21:14 badge G-04 → galerie</SvgText>
        <SvgText x={608} y={514} fill="#3A4050" fontSize={11}>21:19 sortie galerie — G-04</SvgText>
      </G>
      <Rect x={860} y={230} width={110} height={280} rx={4} fill="#20293A" stroke="#3B465E" strokeWidth={3} />
      <Line x1={915} y1={230} x2={915} y2={510} stroke="#141B28" strokeWidth={4} />
      <Circle cx={905} cy={370} r={4} fill="#4A5570" />
      <Circle cx={925} cy={370} r={4} fill="#4A5570" />
      <Rect x={60} y={380} width={120} height={120} rx={4} fill="#20293A" stroke="#2E3848" strokeWidth={2} />
      <Rect x={72} y={392} width={96} height={70} rx={2} fill="#16202E" />
      <Circle cx={120} cy={427} r={10} fill="#A94747" opacity={0.85} />
    </Svg>
  );
}
