import { Injectable } from '@nestjs/common';
import { join } from 'node:path';
import process from 'node:process';
import { JsonFileRepository } from '../common/repositories/json-file.repository';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersRepository extends JsonFileRepository<Customer> {
  constructor() {
    super(join(process.cwd(), 'data', 'customers.json'));
  }
}
