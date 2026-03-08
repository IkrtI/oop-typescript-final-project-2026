import { readFile, writeFile, rename } from "fs/promises";
import { BaseEntity } from "../entities/base.entity";

export class JsonFileRepository<T extends BaseEntity> {
  private data: T[] = [];
  private isLoaded = false;

  constructor(protected readonly filePath: string) {}

  private async loadFromFile(): Promise<void> {
    const content = await readFile(this.filePath, "utf-8");
    this.data = JSON.parse(content) as T[];
    this.isLoaded = true;
  }

  private writeQueue: Promise<void> = Promise.resolve();

  private async saveToFile(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const tmpPath = this.filePath + ".tmp";

      const jsonString = JSON.stringify(this.data, null, 2);

      await writeFile(tmpPath, jsonString, "utf-8");

      await rename(tmpPath, this.filePath);
    });
    await this.writeQueue;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.loadFromFile();
    }
  }

  async findAll(): Promise<T[]> {
    await this.ensureLoaded();
    return [...this.data];
  }

  async findById(id: string): Promise<T | null> {
    await this.ensureLoaded();

    return this.data.find((item) => item.id === id) ?? null;
  }

  async create(entity: T): Promise<T> {
    await this.ensureLoaded();

    this.data.push(entity);

    await this.saveToFile();

    return entity;
  }

  async update(id: string, updatedEntity: T): Promise<T | null> {
    await this.ensureLoaded();

    const index = this.data.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    this.data[index] = updatedEntity;

    await this.saveToFile();

    return updatedEntity;
  }

  async delete(id: string): Promise<T | null> {
    await this.ensureLoaded();

    const index = this.data.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    const deleted = this.data[index];

    this.data.splice(index, 1);

    await this.saveToFile();

    return deleted;
  }
}
