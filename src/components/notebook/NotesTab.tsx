import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PersonalNote } from '@/types/save';
import { useNotebookStore } from '@/store/notebookStore';
import { colors, radius, spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export function NotesTab() {
  const notes = useNotebookStore((s) => s.notes);
  const createNote = useNotebookStore((s) => s.createNote);
  const updateNote = useNotebookStore((s) => s.updateNote);
  const deleteNote = useNotebookStore((s) => s.deleteNote);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId && !notes.some((n) => n.id === editingId)) setEditingId(null);
  }, [notes, editingId]);

  const editing = notes.find((n) => n.id === editingId) ?? null;

  return (
    <View style={styles.root}>
      <Button label="+ Nouvelle note" onPress={() => setEditingId(createNote())} />
      {editing ? (
        <View style={styles.editor}>
          <Field
            value={editing.title}
            onChangeText={(t) => updateNote(editing.id, { title: t })}
            placeholder="Titre"
          />
          <Field
            value={editing.body}
            onChangeText={(t) => updateNote(editing.id, { body: t })}
            placeholder="Écrivez librement : hypothèses, chronologies, questions…"
            multiline
            style={styles.editorBody}
          />
          <Text style={styles.saved}>Sauvegarde automatique · {new Date(editing.updatedAt).toLocaleString('fr-FR')}</Text>
          <View style={styles.editorActions}>
            <Button label="Fermer" variant="ghost" onPress={() => setEditingId(null)} style={styles.flex} />
            <Button
              label="Supprimer"
              variant="danger"
              onPress={() =>
                Alert.alert('Supprimer la note ?', 'Cette action est définitive.', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => deleteNote(editing.id) },
                ])
              }
              style={styles.flex}
            />
          </View>
        </View>
      ) : null}
      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        ListEmptyComponent={<Text style={styles.empty}>Aucune note. Créez votre premier bloc-notes.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.note} onPress={() => setEditingId(item.id)}>
            <View style={styles.noteHead}>
              <Text style={styles.noteTitle} numberOfLines={1}>{item.title || 'Sans titre'}</Text>
              <Text style={styles.noteDate}>{new Date(item.updatedAt).toLocaleDateString('fr-FR')}</Text>
            </View>
            <Text style={styles.noteBody} numberOfLines={2}>{item.body || '—'}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  editor: { marginTop: spacing.m, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.l, padding: spacing.m },
  editorBody: { marginTop: spacing.s, minHeight: 140 },
  saved: { color: colors.secondary, fontSize: 11, marginTop: spacing.s },
  editorActions: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.s },
  flex: { flex: 1 },
  empty: { color: colors.secondary, fontSize: 13, textAlign: 'center', marginTop: spacing.xl },
  note: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.m, padding: spacing.m, marginTop: spacing.s },
  noteHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { color: colors.text, fontWeight: '700', fontSize: 14, flex: 1, marginRight: spacing.s },
  noteDate: { color: colors.secondary, fontSize: 11 },
  noteBody: { color: colors.textDim, fontSize: 12, marginTop: 4 },
});
