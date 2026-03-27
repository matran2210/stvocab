/* eslint-disable jsdoc/require-jsdoc */
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm'

export class AbstractEntity<T> extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(entity: Partial<T>) {
    super()
    Object.assign(this, entity)
  }
}
