import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CategoryProgress = {
  id: string;
  name: string;
  remaining: number;
  total: number;
  color: string;
};

interface Props {
  categories: CategoryProgress[];
}

const CategoryProgressList: React.FC<Props> = ({ categories }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      {categories.map((category) => {
        const progress = category.total === 0 ? 0 : (category.total - category.remaining) / category.total;
        return (
          <View key={category.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{category.name}</Text>
              <Text style={styles.rowSubtitle}>
                ${category.remaining.toFixed(0)} of ${category.total.toFixed(0)}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: category.color
                  }
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 16
  },
  title: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600'
  },
  row: {
    gap: 8
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowTitle: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '500'
  },
  rowSubtitle: {
    color: '#a0aec0',
    fontSize: 13
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1f2933',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%'
  }
});

export type { CategoryProgress };
export default CategoryProgressList;
