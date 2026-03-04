import { BaseEntity } from '../../common/entities/base.entity';
import { CustomerStatus } from '../enums/customer-status.enum';

export class Customer extends BaseEntity {
  fullName!: string;
  email!: string;
  phone!: string;
  address!: string;
  status!: CustomerStatus;
}
