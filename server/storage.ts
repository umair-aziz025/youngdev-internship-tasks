import { InsertPasswordAnalysis, PasswordAnalysis } from '../shared/schema';

export interface IStorage {
  // Password analysis methods
  savePasswordAnalysis(analysis: InsertPasswordAnalysis): Promise<PasswordAnalysis>;
  getPasswordAnalyses(limit?: number): Promise<PasswordAnalysis[]>;
  deletePasswordAnalysis(id: number): Promise<boolean>;
}

// In-memory storage implementation
class MemStorage implements IStorage {
  private passwordAnalyses: Map<number, PasswordAnalysis> = new Map();
  private nextId = 1;

  async savePasswordAnalysis(analysis: InsertPasswordAnalysis): Promise<PasswordAnalysis> {
    const newAnalysis: PasswordAnalysis = {
      id: this.nextId++,
      ...analysis,
      feedback: analysis.feedback || null,
      createdAt: new Date(),
    };
    
    this.passwordAnalyses.set(newAnalysis.id, newAnalysis);
    return newAnalysis;
  }

  async getPasswordAnalyses(limit = 10): Promise<PasswordAnalysis[]> {
    const analyses = Array.from(this.passwordAnalyses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return analyses;
  }

  async deletePasswordAnalysis(id: number): Promise<boolean> {
    return this.passwordAnalyses.delete(id);
  }
}

export const storage = new MemStorage();