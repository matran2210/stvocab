import { Entity, Column, OneToMany } from 'typeorm';
import { Vocabulary } from './vocabulary.entity';
import { AbstractEntity } from './abtract.entity';

@Entity('categories')
export class Category extends AbstractEntity<Category> {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Vocabulary, vocab => vocab.category)
  vocabularies: Vocabulary[];
}