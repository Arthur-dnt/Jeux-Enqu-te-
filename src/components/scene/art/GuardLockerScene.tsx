import Svg, { Rect, Circle, Line, Path, Polygon, Text as SvgText, G } from 'react-native-svg';

export function GuardLockerScene() {
  return (
    <Svg viewBox="0 0 1000 700" width="100%" height="100%" accessibilityLabel="Vestiaire du personnel avec casiers, veste et banc">
      <Rect x={0} y={0} width={1000} height={700} fill="#181F2C" />
      <Rect x={0} y={0} width={1000} height={500} fill="#1F2836" />
      <Rect x={0} y={500} width={1000} height={200} fill="#292E38" />
      {[540, 580, 620, 660].map((y) => (
        <Line key={`f${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="#313846" strokeWidth={1.5} />
      ))}
      <Rect x={0} y={494} width={1000} height={8} fill="#2A3547" />
      <Rect x={80} y={280} width={30} height={8} fill="#3B465E" />
      <Rect x={95} y={288} width={14} height={18} fill="#C4A66A" />
      <G>
        <Rect x={100} y={306} width={90} height={198} fill="#2E3A50" />
        <Rect x={118} y={306} width={54} height={60} fill="#3E5C8A" opacity={0.85} />
        <Rect x={112} y={366} width={66} height={120} fill="#252F42" />
        <Rect x={118} y={300} width={54} height={10} rx={4} fill="#3E5C8A" opacity={0.85} />
      </G>
      <G>
        <Rect x={300} y={168} width={160} height={238} rx={4} fill="#243045" stroke="#3B465E" strokeWidth={3} />
        <Rect x={308} y={176} width={144} height={222} fill="#1C2637" />
        <Line x1={380} y1={176} x2={380} y2={398} stroke="#141B28" strokeWidth={3} />
        <Circle cx={444} cy={290} r={6} fill="#C4A66A" />
        <SvgText x={318} y={200} fill="#C4A66A" fontSize={15} fontWeight="bold">04 — G-04</SvgText>
        <SvgText x={318} y={222} fill="#9AA3B2" fontSize={12}>ROUX É.</SvgText>
        <Rect x={316} y={240} width={128} height={150} fill="#161C28" />
        <Rect x={322} y={250} width={116} height={80} rx={3} fill="#2E3A50" />
        <Rect x={322} y={340} width={70} height={40} rx={2} fill="#DCD8CB" />
        <Line x1={330} y1={352} x2={384} y2={352} stroke="#8A94A8" strokeWidth={1.5} />
        <Line x1={330} y1={362} x2={384} y2={362} stroke="#8A94A8" strokeWidth={1.5} />
        <Line x1={330} y1={372} x2={372} y2={372} stroke="#8A94A8" strokeWidth={1.5} />
      </G>
      <G>
        <Rect x={520} y={168} width={160} height={238} rx={4} fill="#243045" stroke="#3B465E" strokeWidth={3} />
        <Rect x={528} y={176} width={144} height={222} fill="#1C2637" />
        <Line x1={600} y1={176} x2={600} y2={398} stroke="#141B28" strokeWidth={3} />
        <Circle cx={664} cy={290} r={6} fill="#4A5570" />
        <SvgText x={538} y={200} fill="#C4A66A" fontSize={15} fontWeight="bold">05</SvgText>
        <Rect x={536} y={240} width={128} height={150} fill="#161C28" />
        <Rect x={542} y={252} width={116} height={60} rx={2} fill="#DCD8CB" />
        <Line x1={550} y1={266} x2={650} y2={266} stroke="#8A94A8" strokeWidth={1.5} />
        <Line x1={550} y1={278} x2={650} y2={278} stroke="#8A94A8" strokeWidth={1.5} />
        <Line x1={550} y1={290} x2={636} y2={290} stroke="#A94747" strokeWidth={1.5} />
        <Rect x={542} y={322} width={54} height={60} rx={2} fill="#3E5C8A" opacity={0.5} />
      </G>
      <Rect x={200} y={560} width={640} height={26} fill="#4A3B28" />
      <Rect x={200} y={560} width={640} height={8} fill="#5C4A33" />
      <Rect x={216} y={586} width={18} height={90} fill="#3A2E20" />
      <Rect x={806} y={586} width={18} height={90} fill="#3A2E20" />
      <G>
        <Rect x={330} y={434} width={140} height={84} rx={8} fill="#2E4A78" stroke="#0E1420" strokeWidth={2} />
        <Rect x={330} y={434} width={140} height={20} rx={8} fill="#3E5C8A" />
        <Rect x={388} y={470} width={54} height={16} rx={3} fill="#22364F" />
        <Path d="M 402 470 L 414 458 L 426 470" stroke="#9AA3B2" strokeWidth={2} fill="none" />
      </G>
      <G>
        <Path d="M 760 434 q -18 10 -12 34 q 4 18 24 22 q 30 6 68 0 q 22 -4 22 -26 q 0 -22 -20 -30 q -40 -10 -82 0 z" fill="#DCD8CB" stroke="#8A94A8" strokeWidth={1.5} />
        <Line x1={768} y1={452} x2={856} y2={448} stroke="#9AA3B2" strokeWidth={1.2} />
        <Line x1={770} y1={464} x2={858} y2={460} stroke="#9AA3B2" strokeWidth={1.2} />
        <Line x1={772} y1={476} x2={852} y2={472} stroke="#8A94A8" strokeWidth={1.2} />
      </G>
      <Rect x={880} y={100} width={4} height={340} stroke="#3B465E" strokeWidth={4} />
    </Svg>
  );
}
