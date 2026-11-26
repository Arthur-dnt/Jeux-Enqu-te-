import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { CaseDef, EvidenceCategory } from '@/types/case';
import { EVIDENCE_CATEGORY_LABELS } from '@/types/case';
import type { InvestigationSave } from '@/types/save';
import { colors, radius, spacing } from '@/theme';
import { Chip } from '@/components/ui/Chip';
import { visibleEvidence } from '@/features/investigation/discoveryService';

interface Props {
  caseData: CaseDef;
  save: InvestigationSave;
  onOpenEvidence: (evidenceId: string) => void;
}

type Filter = 'all' | EvidenceCategory;

export function EvidenceTab({ caseData, save, onOpenEvidence }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const discovered = useMemo(() => visibleEvidence(caseData, save), [caseData, save]);
  const filtered = useMemo(() => {
    let list = filter === 'all' ? discovered : discovered.filter((e) => e.category === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return list;
  }, [discovered, filter, query]);

  return (
    <View style={styles.root}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un indice…"
        placeholderTextColor={colors.secondary}
        style={styles.search}
      />
      <View style={styles.chips}>
        <Chip label="Tous" active={filter === 'all'} onPress={() => setFilter('all')} />
        {(Object.keys(EVIDENCE_CATEGORY_LABELS) as EvidenceCategory[])
          .filter((c) => discovered.some((e) => e.category === c))
          .map((c) => (
            <Chip key={c} label={EVIDENCE_CATEGORY_LABELS[c]} active={filter === c} onPress={() => setFilter(c)} />
          ))}
      </View>
      <Text style={styles.count}>
        {discovered.length} indice{discovered.length > 1 ? 's' : ''} découvert{discovered.length > 1 ? 's' : ''} sur {caseData.evidence.length}
      </Text>
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {discovered.length === 0
              ? 'Aucun indice découvert pour le moment. Examinez les scènes.'
              : 'Aucun indice ne correspond à ce filtre.'}
          </Text>
        }
        renderItem={({ item, index }) => (
          <Pressable style={styles.row} onPress={() => onOpenEvidence(item.id)}>
            <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {EVIDENCE_CATEGORY_LABELS[item.category]} · {caseData.scenes.find((s) => s.id === item.sceneId)?.name ?? ''}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.m,
    color: colors.text,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginBottom: spacing.s,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xs },
  count: { color: colors.secondary, fontSize: 12, marginBottom: spacing.s },
  empty: { color: colors.secondary, fontSize: 13, textAlign: 'center', marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  index: { color: colors.gold, fontSize: 12, fontWeight: '700', marginRight: spacing.m },
  rowBody: { flex: 1 },
  name: { color: colors.text, fontSize: 14, fontWeight: '600' },
  meta: { color: colors.secondary, fontSize: 11, marginTop: 2 },
});
